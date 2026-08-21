package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;

public record RescheduleRequest(
        @NotBlank String date,
        String time,
        /** 'one' (default) or 'future'; only meaningful for an occurrence of a series. */
        String scope
) {
}
