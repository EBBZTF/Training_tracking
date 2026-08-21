package com.training.tracking.service;

import com.training.tracking.domain.PlannedSession;
import com.training.tracking.dto.CreatePlannedSessionRequest;
import com.training.tracking.dto.PlannedSessionDto;
import com.training.tracking.dto.RescheduleRequest;
import com.training.tracking.dto.UpdatePlannedSessionRequest;
import com.training.tracking.dto.UpdateStatusRequest;
import com.training.tracking.repository.PlannedSessionRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Service
public class PlannedSessionService {

    private static final Set<String> VALID_STATUSES = Set.of("planned", "done", "skipped");

    /** Widest window a client may ask for, so a stray range cannot materialize years of occurrences. */
    private static final long MAX_RANGE_DAYS = 366;

    private final PlannedSessionRepository plannedSessionRepository;
    private final RecurringRuleService recurringRuleService;
    private final ScheduleRefs refs;

    public PlannedSessionService(PlannedSessionRepository plannedSessionRepository,
                                  RecurringRuleService recurringRuleService,
                                  ScheduleRefs refs) {
        this.plannedSessionRepository = plannedSessionRepository;
        this.recurringRuleService = recurringRuleService;
        this.refs = refs;
    }

    /** Scope of an edit that lands on an occurrence of a series. */
    public enum Scope {
        ONE, FUTURE;

        static Scope of(String raw) {
            if (raw == null || raw.isBlank() || "one".equals(raw)) {
                return ONE;
            }
            if ("future".equals(raw)) {
                return FUTURE;
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "scope must be one or future");
        }
    }

    @Transactional
    public List<PlannedSessionDto> listByRange(Long userId, LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must not be after to");
        }
        if (from.plusDays(MAX_RANGE_DAYS).isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "range must not exceed " + MAX_RANGE_DAYS + " days");
        }
        try {
            recurringRuleService.materialize(userId, from, to);
        } catch (DataIntegrityViolationException e) {
            // A concurrent request materialized the same window first; its rows are the ones we read.
        }
        return plannedSessionRepository
                .findAllByUserIdAndScheduledDateBetweenOrderByScheduledDateAscScheduledTimeAsc(userId, from, to)
                .stream()
                .map(PlannedSessionService::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlannedSessionDto getOne(Long userId, Long id) {
        return toDto(findOwned(userId, id));
    }

    @Transactional
    public PlannedSessionDto create(Long userId, CreatePlannedSessionRequest request) {
        PlannedSession session = new PlannedSession();
        session.setUserId(userId);
        session.setScheduledDate(ScheduleRefs.parseDate(request.date()));
        session.setScheduledTime(ScheduleRefs.parseTime(request.time()));
        session.setSessionType(refs.sessionType(userId, request.sessionTypeId()));
        session.setDayKey(refs.dayKey(userId, request.dayId()));
        session.setNotes(request.notes());
        session.setStatus("planned");
        session.setCreatedAt(Instant.now());
        plannedSessionRepository.save(session);
        return toDto(session);
    }

    /** Null means the change applied to the whole rest of the series — the client must reload the range. */
    @Transactional
    public PlannedSessionDto update(Long userId, Long id, UpdatePlannedSessionRequest request) {
        PlannedSession session = findOwned(userId, id);
        var type = refs.sessionType(userId, request.sessionTypeId());
        String dayKey = refs.dayKey(userId, request.dayId());

        if (appliesToSeries(session, request.scope())) {
            recurringRuleService.updateSeries(session, type, dayKey, request.notes());
            return null;
        }
        detachIfSeries(session);
        session.setSessionType(type);
        session.setDayKey(dayKey);
        session.setNotes(request.notes());
        plannedSessionRepository.save(session);
        return toDto(session);
    }

    /** Null means the whole rest of the series moved — the client must reload the range. */
    @Transactional
    public PlannedSessionDto reschedule(Long userId, Long id, RescheduleRequest request) {
        PlannedSession session = findOwned(userId, id);
        LocalDate date = ScheduleRefs.parseDate(request.date());
        LocalTime time = ScheduleRefs.parseTime(request.time());

        if (appliesToSeries(session, request.scope())) {
            recurringRuleService.rescheduleSeries(session, date, time);
            return null;
        }
        detachIfSeries(session);
        session.setScheduledDate(date);
        session.setScheduledTime(time);
        plannedSessionRepository.save(session);
        return toDto(session);
    }

    @Transactional
    public PlannedSessionDto updateStatus(Long userId, Long id, UpdateStatusRequest request) {
        if (!VALID_STATUSES.contains(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be one of " + VALID_STATUSES);
        }
        PlannedSession session = findOwned(userId, id);
        session.setStatus(request.status());
        plannedSessionRepository.save(session);
        return toDto(session);
    }

    @Transactional
    public void delete(Long userId, Long id, String scope) {
        PlannedSession session = findOwned(userId, id);
        if (appliesToSeries(session, scope)) {
            recurringRuleService.endSeriesAt(session);
            return;
        }
        if (session.getRule() != null) {
            recurringRuleService.deleteOccurrence(session);
            return;
        }
        plannedSessionRepository.delete(session);
    }

    private static boolean appliesToSeries(PlannedSession session, String scope) {
        return session.getRule() != null && Scope.of(scope) == Scope.FUTURE;
    }

    /** Editing a single occurrence takes it out of the series, so the series never restores it. */
    private void detachIfSeries(PlannedSession session) {
        if (session.getRule() != null) {
            recurringRuleService.detachOccurrence(session);
        }
    }

    private PlannedSession findOwned(Long userId, Long id) {
        return plannedSessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "planned session not found"));
    }

    private static PlannedSessionDto toDto(PlannedSession session) {
        return new PlannedSessionDto(
                session.getId(),
                session.getScheduledDate().toString(),
                session.getScheduledTime() == null ? null : session.getScheduledTime().toString(),
                session.getSessionType().getId(),
                session.getDayKey(),
                session.getStatus(),
                session.getNotes(),
                session.getRule() == null ? null : session.getRule().getId());
    }
}
