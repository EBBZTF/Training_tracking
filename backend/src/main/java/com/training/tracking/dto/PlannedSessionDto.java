package com.training.tracking.dto;

public record PlannedSessionDto(
        Long id,
        String date,
        String time,
        Long sessionTypeId,
        String dayId,
        String status,
        String notes,
        /** Set when this session is an occurrence of a series; drives the scope prompt in the UI. */
        Long ruleId
) {
}
