package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Redefines a series from {@code from} onwards (default: today). Occurrences before that date keep
 * the definition they were generated with, which is what "ab hier" means everywhere else too.
 */
public record UpdateRecurringRuleRequest(
        @NotNull Long sessionTypeId,
        String dayId,
        String time,
        String notes,
        @NotBlank String pattern,
        Integer weekdays,
        Integer intervalDays,
        String from,
        String endDate,
        String planMode,
        List<RulePlanEntry> plans
) implements RecurringRuleDefinition {
}
