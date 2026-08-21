package com.training.tracking.dto;

import java.util.List;

public record RecurringRuleDto(
        Long id,
        Long sessionTypeId,
        String dayId,
        String time,
        String notes,
        String pattern,
        Integer weekdays,
        Integer intervalDays,
        String startDate,
        String endDate,
        String planMode,
        List<RulePlanEntry> plans
) {
}
