package com.training.tracking.repository;

import com.training.tracking.domain.RecurringRuleException;
import com.training.tracking.domain.RecurringRuleExceptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringRuleExceptionRepository
        extends JpaRepository<RecurringRuleException, RecurringRuleExceptionId> {

    @Query("""
            SELECT e.id.excludedDate FROM RecurringRuleException e
            WHERE e.id.ruleId = :ruleId AND e.id.excludedDate BETWEEN :from AND :to
            """)
    List<LocalDate> findExcludedDates(@Param("ruleId") Long ruleId,
                                       @Param("from") LocalDate from,
                                       @Param("to") LocalDate to);
}
