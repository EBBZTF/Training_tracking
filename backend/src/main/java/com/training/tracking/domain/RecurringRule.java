package com.training.tracking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/** A repeating training slot; occurrences are materialized into {@link PlannedSession} rows on read. */
@Entity
@Table(name = "recurring_rules")
public class RecurringRule {

    public static final String PATTERN_WEEKLY = "weekly";
    public static final String PATTERN_INTERVAL = "interval";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_type_id", nullable = false)
    private SessionType sessionType;

    /** Client-facing id of the pinned workout plan, or null when the series carries no plan. */
    @Column(name = "day_key", length = 16)
    private String dayKey;

    @Column(name = "scheduled_time")
    private LocalTime scheduledTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** 'weekly' | 'interval'; DB CHECK enforces valid values and which of the two fields below is set. */
    @Column(nullable = false, length = 16)
    private String pattern;

    /** Bitmask, Mo=1 … So=64, set for 'weekly'. */
    @Column
    private Short weekdays;

    @Column(name = "interval_days")
    private Short intervalDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** Null means open-ended. */
    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }

    public String getDayKey() { return dayKey; }
    public void setDayKey(String dayKey) { this.dayKey = dayKey; }

    public LocalTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPattern() { return pattern; }
    public void setPattern(String pattern) { this.pattern = pattern; }

    public Short getWeekdays() { return weekdays; }
    public void setWeekdays(Short weekdays) { this.weekdays = weekdays; }

    public Short getIntervalDays() { return intervalDays; }
    public void setIntervalDays(Short intervalDays) { this.intervalDays = intervalDays; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
