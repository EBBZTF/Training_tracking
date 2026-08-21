package com.training.tracking.repository;

import com.training.tracking.domain.RecurringRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringRuleRepository extends JpaRepository<RecurringRule, Long> {

    /** Rules whose active window overlaps [from, to]. */
    @Query("""
            SELECT r FROM RecurringRule r
            WHERE r.userId = :userId
              AND r.startDate <= :to
              AND (r.endDate IS NULL OR r.endDate >= :from)
            ORDER BY r.id ASC
            """)
    List<RecurringRule> findActiveInRange(@Param("userId") Long userId,
                                          @Param("from") LocalDate from,
                                          @Param("to") LocalDate to);

    long countBySessionTypeId(Long sessionTypeId);
}
