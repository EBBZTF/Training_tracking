package com.training.tracking.repository;

import com.training.tracking.domain.PlannedSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PlannedSessionRepository extends JpaRepository<PlannedSession, Long> {
    List<PlannedSession> findAllByUserIdAndScheduledDateBetweenOrderByScheduledDateAscScheduledTimeAsc(
            Long userId, LocalDate from, LocalDate to);

    Optional<PlannedSession> findByIdAndUserId(Long id, Long userId);

    long countBySessionTypeId(Long sessionTypeId);

    /** Occurrences a rule has already materialized in this window, keyed by their original date. */
    List<PlannedSession> findAllByRule_IdAndOccurrenceDateBetween(Long ruleId, LocalDate from, LocalDate to);

    List<PlannedSession> findAllByRule_IdAndOccurrenceDateGreaterThanEqual(Long ruleId, LocalDate from);
}
