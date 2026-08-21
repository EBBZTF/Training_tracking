package com.training.tracking.service;

import com.training.tracking.domain.PlannedSession;
import com.training.tracking.domain.RecurringRule;
import com.training.tracking.domain.RecurringRuleException;
import com.training.tracking.domain.SessionType;
import com.training.tracking.dto.CreateRecurringRuleRequest;
import com.training.tracking.dto.RecurringRuleDto;
import com.training.tracking.repository.PlannedSessionRepository;
import com.training.tracking.repository.RecurringRuleExceptionRepository;
import com.training.tracking.repository.RecurringRuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Recurring rules and the occurrences they generate.
 *
 * <p>Occurrences are materialized into {@code planned_sessions} the first time a date range is
 * requested, rather than expanded on every read: that way status, notes and logging work on a
 * series occurrence exactly as on a one-off session, and no read path needs to know about rules.
 */
@Service
public class RecurringRuleService {

    private static final short ALL_WEEKDAYS = 127;
    private static final int MAX_INTERVAL_DAYS = 365;
    /** Upper bound for "every remaining date"; LocalDate.MAX overflows a Postgres DATE. */
    private static final LocalDate FAR_FUTURE = LocalDate.of(9999, 12, 31);

    private final RecurringRuleRepository ruleRepository;
    private final RecurringRuleExceptionRepository exceptionRepository;
    private final PlannedSessionRepository plannedSessionRepository;
    private final ScheduleRefs refs;

    public RecurringRuleService(RecurringRuleRepository ruleRepository,
                                RecurringRuleExceptionRepository exceptionRepository,
                                PlannedSessionRepository plannedSessionRepository,
                                ScheduleRefs refs) {
        this.ruleRepository = ruleRepository;
        this.exceptionRepository = exceptionRepository;
        this.plannedSessionRepository = plannedSessionRepository;
        this.refs = refs;
    }

    @Transactional
    public RecurringRuleDto create(Long userId, CreateRecurringRuleRequest request) {
        RecurringRule rule = new RecurringRule();
        rule.setUserId(userId);
        rule.setSessionType(refs.sessionType(userId, request.sessionTypeId()));
        rule.setDayKey(refs.dayKey(userId, request.dayId()));
        rule.setScheduledTime(ScheduleRefs.parseTime(request.time()));
        rule.setNotes(request.notes());
        rule.setStartDate(ScheduleRefs.parseDate(request.startDate()));
        rule.setEndDate(ScheduleRefs.parseOptionalDate(request.endDate()));
        applyPattern(rule, request.pattern(), request.weekdays(), request.intervalDays());
        if (rule.getEndDate() != null && rule.getEndDate().isBefore(rule.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endDate must not be before startDate");
        }
        rule.setCreatedAt(Instant.now());
        ruleRepository.save(rule);
        return toDto(rule);
    }

    /**
     * Writes any occurrence in [from, to] that does not exist yet. Runs in its own transaction so a
     * concurrent request materializing the same window cannot poison the caller's read.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void materialize(Long userId, LocalDate from, LocalDate to) {
        List<RecurringRule> rules = ruleRepository.findActiveInRange(userId, from, to);
        List<PlannedSession> created = new ArrayList<>();
        for (RecurringRule rule : rules) {
            LocalDate windowStart = max(from, rule.getStartDate());
            LocalDate windowEnd = rule.getEndDate() == null ? to : min(to, rule.getEndDate());
            if (windowStart.isAfter(windowEnd)) {
                continue;
            }
            Set<LocalDate> taken = new HashSet<>(
                    exceptionRepository.findExcludedDates(rule.getId(), windowStart, windowEnd));
            plannedSessionRepository
                    .findAllByRule_IdAndOccurrenceDateBetween(rule.getId(), windowStart, windowEnd)
                    .forEach(s -> taken.add(s.getOccurrenceDate()));
            for (LocalDate date : occurrences(rule, windowStart, windowEnd)) {
                if (taken.add(date)) {
                    created.add(newOccurrence(rule, date));
                }
            }
        }
        if (!created.isEmpty()) {
            plannedSessionRepository.saveAllAndFlush(created);
        }
    }

    /** Keeps one occurrence out of the series for good; the row itself lives on as a one-off. */
    @Transactional
    public void detachOccurrence(PlannedSession occurrence) {
        excludeDate(occurrence);
        occurrence.setRule(null);
    }

    /** Deletes one occurrence and stops the series from generating that date again. */
    @Transactional
    public void deleteOccurrence(PlannedSession occurrence) {
        excludeDate(occurrence);
        plannedSessionRepository.delete(occurrence);
    }

    /** Moves this occurrence and every later one: the series is split and re-anchored. */
    @Transactional
    public void rescheduleSeries(PlannedSession occurrence, LocalDate newDate, LocalTime newTime) {
        LocalDate occurrenceDate = occurrence.getOccurrenceDate();
        RecurringRule tail = splitAt(occurrence.getRule(), occurrenceDate);
        tail.setScheduledTime(newTime);
        if (RecurringRule.PATTERN_WEEKLY.equals(tail.getPattern())) {
            tail.setWeekdays(moveWeekday(tail.getWeekdays(),
                    occurrenceDate.getDayOfWeek(), newDate.getDayOfWeek()));
        }
        tail.setStartDate(newDate);
        if (tail.getEndDate() != null && tail.getEndDate().isBefore(newDate)) {
            tail.setEndDate(newDate);
        }
        ruleRepository.save(tail);
    }

    /** Changes activity, plan and note on this occurrence and every later one. */
    @Transactional
    public void updateSeries(PlannedSession occurrence, SessionType type, String dayKey, String notes) {
        RecurringRule tail = splitAt(occurrence.getRule(), occurrence.getOccurrenceDate());
        tail.setSessionType(type);
        tail.setDayKey(dayKey);
        tail.setNotes(notes);
        ruleRepository.save(tail);
    }

    /** Ends the series just before this occurrence and drops every later planned occurrence. */
    @Transactional
    public void endSeriesAt(PlannedSession occurrence) {
        RecurringRule rule = occurrence.getRule();
        LocalDate from = occurrence.getOccurrenceDate();
        dropPlannedFrom(rule, from);
        if (from.isAfter(rule.getStartDate())) {
            rule.setEndDate(from.minusDays(1));
            ruleRepository.save(rule);
        } else {
            // Nothing of the series predates this occurrence, so the whole rule goes. Occurrences
            // already logged keep their row; the FK drops their rule_id.
            ruleRepository.delete(rule);
        }
    }

    public long countBySessionTypeId(Long sessionTypeId) {
        return ruleRepository.countBySessionTypeId(sessionTypeId);
    }

    /**
     * Splits the series at this occurrence and returns the part to mutate: a fresh rule covering
     * this date onwards, so occurrences already generated before it keep the old pattern. When
     * nothing precedes the occurrence there is nothing to preserve and the original rule is
     * returned unchanged.
     */
    private RecurringRule splitAt(RecurringRule rule, LocalDate from) {
        dropPlannedFrom(rule, from);
        if (!from.isAfter(rule.getStartDate())) {
            return rule;
        }

        RecurringRule tail = new RecurringRule();
        tail.setUserId(rule.getUserId());
        tail.setSessionType(rule.getSessionType());
        tail.setDayKey(rule.getDayKey());
        tail.setScheduledTime(rule.getScheduledTime());
        tail.setNotes(rule.getNotes());
        tail.setPattern(rule.getPattern());
        tail.setWeekdays(rule.getWeekdays());
        tail.setIntervalDays(rule.getIntervalDays());
        tail.setStartDate(from);
        tail.setEndDate(rule.getEndDate());
        tail.setCreatedAt(Instant.now());
        ruleRepository.saveAndFlush(tail);

        // Skipped dates from here on belong to the new half of the series.
        List<LocalDate> moved = exceptionRepository.findExcludedDates(rule.getId(), from, FAR_FUTURE);
        for (LocalDate date : moved) {
            exceptionRepository.delete(new RecurringRuleException(rule, date));
            exceptionRepository.save(new RecurringRuleException(tail, date));
        }

        rule.setEndDate(from.minusDays(1));
        ruleRepository.save(rule);
        return tail;
    }

    /** Removes still-planned occurrences from `from` onwards; done and skipped ones stay as history. */
    private void dropPlannedFrom(RecurringRule rule, LocalDate from) {
        List<PlannedSession> stale = plannedSessionRepository
                .findAllByRule_IdAndOccurrenceDateGreaterThanEqual(rule.getId(), from).stream()
                .filter(s -> PlannedSession.STATUS_PLANNED.equals(s.getStatus()))
                .toList();
        if (!stale.isEmpty()) {
            plannedSessionRepository.deleteAllInBatch(stale);
        }
    }

    private void excludeDate(PlannedSession occurrence) {
        exceptionRepository.save(
                new RecurringRuleException(occurrence.getRule(), occurrence.getOccurrenceDate()));
    }

    private PlannedSession newOccurrence(RecurringRule rule, LocalDate date) {
        PlannedSession session = new PlannedSession();
        session.setUserId(rule.getUserId());
        session.setScheduledDate(date);
        session.setScheduledTime(rule.getScheduledTime());
        session.setSessionType(rule.getSessionType());
        session.setDayKey(rule.getDayKey());
        session.setNotes(rule.getNotes());
        session.setStatus(PlannedSession.STATUS_PLANNED);
        session.setRule(rule);
        session.setOccurrenceDate(date);
        session.setCreatedAt(Instant.now());
        return session;
    }

    private void applyPattern(RecurringRule rule, String pattern, Integer weekdays, Integer intervalDays) {
        if (RecurringRule.PATTERN_WEEKLY.equals(pattern)) {
            if (weekdays == null || weekdays < 1 || weekdays > ALL_WEEKDAYS) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "weekly pattern needs a weekdays bitmask between 1 and " + ALL_WEEKDAYS);
            }
            rule.setPattern(RecurringRule.PATTERN_WEEKLY);
            rule.setWeekdays(weekdays.shortValue());
            rule.setIntervalDays(null);
        } else if (RecurringRule.PATTERN_INTERVAL.equals(pattern)) {
            if (intervalDays == null || intervalDays < 1 || intervalDays > MAX_INTERVAL_DAYS) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "interval pattern needs intervalDays between 1 and " + MAX_INTERVAL_DAYS);
            }
            rule.setPattern(RecurringRule.PATTERN_INTERVAL);
            rule.setIntervalDays(intervalDays.shortValue());
            rule.setWeekdays(null);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pattern must be weekly or interval");
        }
    }

    /** The dates a rule falls on inside [from, to]; both bounds already clamped to the rule's window. */
    static List<LocalDate> occurrences(RecurringRule rule, LocalDate from, LocalDate to) {
        List<LocalDate> dates = new ArrayList<>();
        if (RecurringRule.PATTERN_WEEKLY.equals(rule.getPattern())) {
            short mask = rule.getWeekdays();
            for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
                if ((mask & weekdayBit(d.getDayOfWeek())) != 0) {
                    dates.add(d);
                }
            }
            return dates;
        }
        int step = rule.getIntervalDays();
        long gap = ChronoUnit.DAYS.between(rule.getStartDate(), from);
        long skipped = gap <= 0 ? 0 : (gap + step - 1) / step;
        for (LocalDate d = rule.getStartDate().plusDays(skipped * step); !d.isAfter(to); d = d.plusDays(step)) {
            dates.add(d);
        }
        return dates;
    }

    /** Mo=1, Di=2, Mi=4, Do=8, Fr=16, Sa=32, So=64 — matches the mask the client sends. */
    static int weekdayBit(DayOfWeek day) {
        return 1 << (day.getValue() - 1);
    }

    static short moveWeekday(short mask, DayOfWeek from, DayOfWeek to) {
        return (short) ((mask & ~weekdayBit(from)) | weekdayBit(to));
    }

    private static LocalDate max(LocalDate a, LocalDate b) {
        return a.isAfter(b) ? a : b;
    }

    private static LocalDate min(LocalDate a, LocalDate b) {
        return a.isBefore(b) ? a : b;
    }

    private static RecurringRuleDto toDto(RecurringRule rule) {
        return new RecurringRuleDto(
                rule.getId(),
                rule.getSessionType().getId(),
                rule.getDayKey(),
                rule.getScheduledTime() == null ? null : rule.getScheduledTime().toString(),
                rule.getNotes(),
                rule.getPattern(),
                rule.getWeekdays() == null ? null : (int) rule.getWeekdays(),
                rule.getIntervalDays() == null ? null : (int) rule.getIntervalDays(),
                rule.getStartDate().toString(),
                rule.getEndDate() == null ? null : rule.getEndDate().toString());
    }
}
