package com.training.tracking.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePlannedSessionRequest(
        @NotNull Long sessionTypeId,
        String dayId,
        String notes
) {
}
