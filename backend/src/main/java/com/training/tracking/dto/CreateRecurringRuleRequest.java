package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateRecurringRuleRequest(
        @NotNull Long sessionTypeId,
        String dayId,
        String time,
        String notes,
        /** 'weekly' with a weekday bitmask, or 'interval' with a day count. */
        @NotBlank String pattern,
        Integer weekdays,
        Integer intervalDays,
        @NotBlank String startDate,
        String endDate
) {
}
