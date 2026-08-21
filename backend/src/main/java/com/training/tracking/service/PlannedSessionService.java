package com.training.tracking.service;

import com.training.tracking.domain.Day;
import com.training.tracking.domain.PlannedSession;
import com.training.tracking.domain.SessionType;
import com.training.tracking.dto.CreatePlannedSessionRequest;
import com.training.tracking.dto.PlannedSessionDto;
import com.training.tracking.dto.RescheduleRequest;
import com.training.tracking.dto.UpdatePlannedSessionRequest;
import com.training.tracking.dto.UpdateStatusRequest;
import com.training.tracking.repository.DayRepository;
import com.training.tracking.repository.PlannedSessionRepository;
import com.training.tracking.repository.SessionTypeRepository;
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

    private final PlannedSessionRepository plannedSessionRepository;
    private final SessionTypeRepository sessionTypeRepository;
    private final DayRepository dayRepository;

    public PlannedSessionService(PlannedSessionRepository plannedSessionRepository,
                                  SessionTypeRepository sessionTypeRepository,
                                  DayRepository dayRepository) {
        this.plannedSessionRepository = plannedSessionRepository;
        this.sessionTypeRepository = sessionTypeRepository;
        this.dayRepository = dayRepository;
    }

    @Transactional(readOnly = true)
    public List<PlannedSessionDto> listByRange(Long userId, LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must not be after to");
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
        session.setScheduledDate(parseDate(request.date()));
        session.setScheduledTime(parseTime(request.time()));
        session.setSessionType(resolveSessionType(userId, request.sessionTypeId()));
        session.setDay(resolveDay(userId, request.dayId()));
        session.setNotes(request.notes());
        session.setStatus("planned");
        session.setCreatedAt(Instant.now());
        plannedSessionRepository.save(session);
        return toDto(session);
    }

    @Transactional
    public PlannedSessionDto update(Long userId, Long id, UpdatePlannedSessionRequest request) {
        PlannedSession session = findOwned(userId, id);
        session.setSessionType(resolveSessionType(userId, request.sessionTypeId()));
        session.setDay(resolveDay(userId, request.dayId()));
        session.setNotes(request.notes());
        plannedSessionRepository.save(session);
        return toDto(session);
    }

    @Transactional
    public PlannedSessionDto reschedule(Long userId, Long id, RescheduleRequest request) {
        PlannedSession session = findOwned(userId, id);
        session.setScheduledDate(parseDate(request.date()));
        session.setScheduledTime(parseTime(request.time()));
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
    public void delete(Long userId, Long id) {
        plannedSessionRepository.delete(findOwned(userId, id));
    }

    private PlannedSession findOwned(Long userId, Long id) {
        return plannedSessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "planned session not found"));
    }

    private SessionType resolveSessionType(Long userId, Long sessionTypeId) {
        SessionType type = sessionTypeRepository.findById(sessionTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "session type not found"));
        if (type.getUserId() != null && !type.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "session type not found");
        }
        return type;
    }

    private Day resolveDay(Long userId, String dayId) {
        if (dayId == null || dayId.isBlank()) {
            return null;
        }
        return dayRepository.findByUserIdAndDayKey(userId, dayId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown day id"));
    }

    private static LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (java.time.format.DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid date");
        }
    }

    private static LocalTime parseTime(String time) {
        if (time == null || time.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(time);
        } catch (java.time.format.DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid time");
        }
    }

    private static PlannedSessionDto toDto(PlannedSession session) {
        return new PlannedSessionDto(
                session.getId(),
                session.getScheduledDate().toString(),
                session.getScheduledTime() == null ? null : session.getScheduledTime().toString(),
                session.getSessionType().getId(),
                session.getDay() == null ? null : session.getDay().getDayKey(),
                session.getStatus(),
                session.getNotes());
    }
}
