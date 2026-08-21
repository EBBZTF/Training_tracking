package com.training.tracking.service;

import com.training.tracking.domain.Block;
import com.training.tracking.domain.Day;
import com.training.tracking.domain.Exercise;
import com.training.tracking.domain.Session;
import com.training.tracking.domain.SessionValue;
import com.training.tracking.domain.SessionValueId;
import com.training.tracking.domain.SessionWarmup;
import com.training.tracking.domain.SessionWarmupId;
import com.training.tracking.domain.WarmupItem;
import com.training.tracking.dto.BlockDto;
import com.training.tracking.dto.DayDto;
import com.training.tracking.dto.ExerciseDto;
import com.training.tracking.dto.PlanDto;
import com.training.tracking.dto.SessionDto;
import com.training.tracking.dto.StateDto;
import com.training.tracking.repository.BlockRepository;
import com.training.tracking.repository.DayRepository;
import com.training.tracking.repository.ExerciseRepository;
import com.training.tracking.repository.SessionRepository;
import com.training.tracking.repository.SessionValueRepository;
import com.training.tracking.repository.SessionWarmupRepository;
import com.training.tracking.repository.WarmupItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * The whole state (plan + logs) for one user is saved as one blob, mirroring the frontend's
 * single persist() call. saveState wipes and re-inserts that user's rows rather than diffing —
 * the data volume per user is small.
 */
@Service
public class StateService {

    private final DayRepository dayRepository;
    private final BlockRepository blockRepository;
    private final ExerciseRepository exerciseRepository;
    private final WarmupItemRepository warmupItemRepository;
    private final SessionRepository sessionRepository;
    private final SessionWarmupRepository sessionWarmupRepository;
    private final SessionValueRepository sessionValueRepository;

    public StateService(DayRepository dayRepository,
                         BlockRepository blockRepository,
                         ExerciseRepository exerciseRepository,
                         WarmupItemRepository warmupItemRepository,
                         SessionRepository sessionRepository,
                         SessionWarmupRepository sessionWarmupRepository,
                         SessionValueRepository sessionValueRepository) {
        this.dayRepository = dayRepository;
        this.blockRepository = blockRepository;
        this.exerciseRepository = exerciseRepository;
        this.warmupItemRepository = warmupItemRepository;
        this.sessionRepository = sessionRepository;
        this.sessionWarmupRepository = sessionWarmupRepository;
        this.sessionValueRepository = sessionValueRepository;
    }

    @Transactional(readOnly = true)
    public StateDto getState(Long userId) {
        List<Day> days = dayRepository.findAllByUserIdOrderByPosition(userId);
        if (days.isEmpty()) {
            return new StateDto(null, List.of());
        }

        List<Block> blocks = blockRepository.findAllByUserIdOrderByPosition(userId);
        List<Exercise> exercises = exerciseRepository.findAllByBlock_UserIdOrderByPosition(userId);
        List<String> warmup = warmupItemRepository.findAllByUserIdOrderByPosition(userId).stream()
                .map(WarmupItem::getText)
                .toList();

        Map<Long, List<ExerciseDto>> exercisesByBlock = new LinkedHashMap<>();
        Map<Long, String> clientIdByExerciseId = new LinkedHashMap<>();
        for (Exercise ex : exercises) {
            exercisesByBlock.computeIfAbsent(ex.getBlock().getId(), k -> new ArrayList<>()).add(toDto(ex));
            clientIdByExerciseId.put(ex.getId(), ex.getClientId());
        }

        BlockDto hip = null;
        Map<Long, List<BlockDto>> blocksByDay = new LinkedHashMap<>();
        for (Block b : blocks) {
            BlockDto dto = new BlockDto(b.getKind(), b.getName(),
                    exercisesByBlock.getOrDefault(b.getId(), List.of()));
            if (b.isShared()) {
                hip = dto;
            } else {
                blocksByDay.computeIfAbsent(b.getDay().getId(), k -> new ArrayList<>()).add(dto);
            }
        }

        List<DayDto> dayDtos = days.stream()
                .map(d -> new DayDto(d.getDayKey(), d.getShortLabel(), d.getSlot(), d.getTitle(),
                        blocksByDay.getOrDefault(d.getId(), List.of())))
                .toList();

        return new StateDto(new PlanDto(warmup, hip, dayDtos), buildLogs(userId, clientIdByExerciseId));
    }

    private List<SessionDto> buildLogs(Long userId, Map<Long, String> clientIdByExerciseId) {
        List<Session> sessions = sessionRepository.findAllByUserId(userId);
        if (sessions.isEmpty()) {
            return List.of();
        }

        Map<Long, List<Integer>> warmupBySession = new LinkedHashMap<>();
        for (SessionWarmup sw : sessionWarmupRepository.findAllBySession_UserId(userId)) {
            warmupBySession.computeIfAbsent(sw.getId().getSessionId(), k -> new ArrayList<>())
                    .add(sw.getId().getPosition());
        }

        Map<Long, List<SessionValue>> valuesBySession = new LinkedHashMap<>();
        for (SessionValue sv : sessionValueRepository.findAllBySession_UserId(userId)) {
            valuesBySession.computeIfAbsent(sv.getId().getSessionId(), k -> new ArrayList<>()).add(sv);
        }

        List<SessionDto> result = new ArrayList<>();
        for (Session s : sessions) {
            List<Integer> checked = warmupBySession.getOrDefault(s.getId(), List.of());
            int maxPos = checked.stream().mapToInt(Integer::intValue).max().orElse(-1);
            List<Boolean> warm = new ArrayList<>();
            for (int i = 0; i <= maxPos; i++) {
                warm.add(false);
            }
            checked.forEach(pos -> warm.set(pos, true));

            Map<String, Map<String, List<String>>> vals = new LinkedHashMap<>();
            for (SessionValue sv : valuesBySession.getOrDefault(s.getId(), List.of())) {
                String clientId = clientIdByExerciseId.get(sv.getId().getExerciseId());
                if (clientId == null) {
                    continue; // exercise no longer exists in the current plan
                }
                Map<String, List<String>> bySide = vals.computeIfAbsent(clientId, k -> new LinkedHashMap<>());
                List<String> setValues = bySide.computeIfAbsent(sv.getId().getSide(), k -> new ArrayList<>());
                int idx = sv.getId().getSetIndex();
                while (setValues.size() <= idx) {
                    setValues.add("");
                }
                setValues.set(idx, sv.getValue());
            }

            result.add(new SessionDto(s.getSessionDate().toString(), s.getDay().getDayKey(), vals, warm));
        }
        return result;
    }

    private ExerciseDto toDto(Exercise e) {
        return new ExerciseDto(e.getClientId(), e.getName(), e.getType(), e.isUni(),
                e.getSets(), e.getSetsL(), e.getSetsR(), e.getReps(), e.getNote(), e.getDescription());
    }

    @Transactional
    public void saveState(Long userId, StateDto state) {
        sessionRepository.deleteAllInBatch(sessionRepository.findAllByUserId(userId));
        exerciseRepository.deleteAllInBatch(exerciseRepository.findAllByBlock_UserIdOrderByPosition(userId));
        blockRepository.deleteAllInBatch(blockRepository.findAllByUserIdOrderByPosition(userId));
        dayRepository.deleteAllInBatch(dayRepository.findAllByUserIdOrderByPosition(userId));
        warmupItemRepository.deleteAllInBatch(warmupItemRepository.findAllByUserIdOrderByPosition(userId));

        if (state.plan() == null) {
            return;
        }
        PlanDto plan = state.plan();

        warmupItemRepository.saveAllAndFlush(toWarmupItems(userId, plan.warmup()));

        List<DayDto> dayDtos = plan.days() == null ? List.of() : plan.days();
        List<Day> days = new ArrayList<>();
        for (int i = 0; i < dayDtos.size(); i++) {
            days.add(toDay(userId, dayDtos.get(i), i));
        }
        dayRepository.saveAllAndFlush(days);
        Map<String, Day> dayByKey = days.stream().collect(Collectors.toMap(Day::getDayKey, x -> x));

        List<Block> blocks = new ArrayList<>();
        List<List<ExerciseDto>> exercisesPerBlock = new ArrayList<>();
        if (plan.hip() != null) {
            Block hipBlock = new Block();
            hipBlock.setUserId(userId);
            hipBlock.setShared(true);
            hipBlock.setKind(plan.hip().kind());
            hipBlock.setName(plan.hip().name());
            hipBlock.setPosition(0);
            blocks.add(hipBlock);
            exercisesPerBlock.add(plan.hip().ex() == null ? List.of() : plan.hip().ex());
        }
        for (DayDto d : dayDtos) {
            Day day = dayByKey.get(d.id());
            List<BlockDto> dayBlocks = d.blocks() == null ? List.of() : d.blocks();
            for (int i = 0; i < dayBlocks.size(); i++) {
                BlockDto bDto = dayBlocks.get(i);
                Block block = new Block();
                block.setUserId(userId);
                block.setDay(day);
                block.setShared(false);
                block.setKind(bDto.kind());
                block.setName(bDto.name());
                block.setPosition(i);
                blocks.add(block);
                exercisesPerBlock.add(bDto.ex() == null ? List.of() : bDto.ex());
            }
        }
        blockRepository.saveAllAndFlush(blocks);

        List<Exercise> exercises = new ArrayList<>();
        for (int bi = 0; bi < blocks.size(); bi++) {
            Block block = blocks.get(bi);
            List<ExerciseDto> exDtos = exercisesPerBlock.get(bi);
            for (int i = 0; i < exDtos.size(); i++) {
                exercises.add(toExercise(exDtos.get(i), block, i));
            }
        }
        exerciseRepository.saveAllAndFlush(exercises);
        Map<String, Exercise> exerciseByClientId = exercises.stream()
                .collect(Collectors.toMap(Exercise::getClientId, x -> x, (a, b) -> a));

        List<SessionDto> logDtos = state.logs() == null ? List.of() : state.logs();
        List<Session> sessions = new ArrayList<>();
        for (SessionDto logDto : logDtos) {
            Session session = new Session();
            session.setUserId(userId);
            session.setSessionDate(LocalDate.parse(logDto.date()));
            session.setDay(dayByKey.get(logDto.dayId()));
            sessions.add(session);
        }
        sessionRepository.saveAllAndFlush(sessions);

        List<SessionWarmup> sessionWarmups = new ArrayList<>();
        List<SessionValue> sessionValues = new ArrayList<>();
        for (int i = 0; i < logDtos.size(); i++) {
            collectWarmups(logDtos.get(i), sessions.get(i), sessionWarmups);
            collectValues(logDtos.get(i), sessions.get(i), exerciseByClientId, sessionValues);
        }
        sessionWarmupRepository.saveAllAndFlush(sessionWarmups);
        sessionValueRepository.saveAllAndFlush(sessionValues);
    }

    private List<WarmupItem> toWarmupItems(Long userId, List<String> warmup) {
        List<String> texts = warmup == null ? List.of() : warmup;
        List<WarmupItem> items = new ArrayList<>();
        for (int i = 0; i < texts.size(); i++) {
            WarmupItem item = new WarmupItem();
            item.setUserId(userId);
            item.setPosition(i);
            item.setText(texts.get(i));
            items.add(item);
        }
        return items;
    }

    private Day toDay(Long userId, DayDto d, int position) {
        Day day = new Day();
        day.setUserId(userId);
        day.setDayKey(d.id());
        day.setShortLabel(d.shortLabel());
        day.setSlot(d.slot());
        day.setTitle(d.title());
        day.setPosition(position);
        return day;
    }

    private Exercise toExercise(ExerciseDto ex, Block block, int position) {
        Exercise entity = new Exercise();
        entity.setClientId(ex.id());
        entity.setBlock(block);
        entity.setName(ex.name());
        entity.setType(ex.type());
        entity.setUni(ex.uni());
        entity.setSets(ex.sets());
        entity.setSetsL(ex.setsL());
        entity.setSetsR(ex.setsR());
        entity.setReps(ex.reps());
        entity.setNote(ex.note());
        entity.setDescription(ex.desc());
        entity.setPosition(position);
        return entity;
    }

    private void collectWarmups(SessionDto logDto, Session session, List<SessionWarmup> out) {
        List<Boolean> warm = logDto.warm() == null ? List.of() : logDto.warm();
        for (int pos = 0; pos < warm.size(); pos++) {
            if (Boolean.TRUE.equals(warm.get(pos))) {
                SessionWarmup sw = new SessionWarmup();
                sw.setId(new SessionWarmupId(session.getId(), pos));
                sw.setSession(session);
                out.add(sw);
            }
        }
    }

    private void collectValues(SessionDto logDto, Session session, Map<String, Exercise> exerciseByClientId,
                                List<SessionValue> out) {
        Map<String, Map<String, List<String>>> vals = logDto.vals() == null ? Map.of() : logDto.vals();
        for (Map.Entry<String, Map<String, List<String>>> exEntry : vals.entrySet()) {
            Exercise exercise = exerciseByClientId.get(exEntry.getKey());
            if (exercise == null) {
                continue; // exercise no longer exists in the submitted plan
            }
            for (Map.Entry<String, List<String>> sideEntry : exEntry.getValue().entrySet()) {
                List<String> setValues = sideEntry.getValue();
                for (int setIdx = 0; setIdx < setValues.size(); setIdx++) {
                    String value = setValues.get(setIdx);
                    if (value == null || value.isEmpty()) {
                        continue;
                    }
                    SessionValue sv = new SessionValue();
                    sv.setId(new SessionValueId(session.getId(), exercise.getId(), sideEntry.getKey(), setIdx));
                    sv.setSession(session);
                    sv.setExercise(exercise);
                    sv.setValue(value);
                    out.add(sv);
                }
            }
        }
    }
}
