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
}
