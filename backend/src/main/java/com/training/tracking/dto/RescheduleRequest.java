package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;

public record RescheduleRequest(
        @NotBlank String date,
        String time
) {
}
