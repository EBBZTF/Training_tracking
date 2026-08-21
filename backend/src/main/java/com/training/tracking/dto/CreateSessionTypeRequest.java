package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSessionTypeRequest(
        @NotBlank @Size(max = 64) String label,
        String color,
        String icon
) {
}
