package com.training.tracking.dto;

public record PlannedSessionDto(
        Long id,
        String date,
        String time,
        Long sessionTypeId,
        String dayId,
        String status,
        String notes
) {
}
