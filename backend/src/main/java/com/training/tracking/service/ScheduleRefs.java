package com.training.tracking.service;

import com.training.tracking.domain.SessionType;
import com.training.tracking.repository.DayRepository;
import com.training.tracking.repository.SessionTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;

/** Lookups and parsing shared by planned sessions and recurring rules. */
@Component
public class ScheduleRefs {

    private final SessionTypeRepository sessionTypeRepository;
    private final DayRepository dayRepository;

    public ScheduleRefs(SessionTypeRepository sessionTypeRepository, DayRepository dayRepository) {
        this.sessionTypeRepository = sessionTypeRepository;
        this.dayRepository = dayRepository;
    }

    /** A global default type, or one owned by this user; anything else reads as not found. */
    public SessionType sessionType(Long userId, Long sessionTypeId) {
        SessionType type = sessionTypeRepository.findById(sessionTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "session type not found"));
        if (type.getUserId() != null && !type.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "session type not found");
        }
        return type;
    }

    /** Validates that the plan exists right now, and returns the key to store. Null stays null. */
    public String dayKey(Long userId, String dayId) {
        if (dayId == null || dayId.isBlank()) {
            return null;
        }
        if (dayRepository.findByUserIdAndDayKey(userId, dayId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown day id");
        }
        return dayId;
    }

    public static LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid date");
        }
    }

    public static LocalDate parseOptionalDate(String date) {
        return date == null || date.isBlank() ? null : parseDate(date);
    }

    public static LocalTime parseTime(String time) {
        if (time == null || time.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(time);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid time");
        }
    }
}
