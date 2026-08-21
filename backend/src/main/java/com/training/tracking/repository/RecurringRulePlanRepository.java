package com.training.tracking.repository;

import com.training.tracking.domain.RecurringRulePlan;
import com.training.tracking.domain.RecurringRulePlanId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringRulePlanRepository
        extends JpaRepository<RecurringRulePlan, RecurringRulePlanId> {

    /** In cycle order for a rotation; in weekday order for a weekday assignment. */
    List<RecurringRulePlan> findAllByIdRuleIdOrderByIdPositionAsc(Long ruleId);

    void deleteAllByIdRuleId(Long ruleId);
}
