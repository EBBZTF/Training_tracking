package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePlannedSessionRequest(
        @NotBlank String date,
        String time,
        @NotNull Long sessionTypeId,
        String dayId,
        String notes
) {
}
