package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateStatusRequest(
        @NotBlank String status,
        /** 'hold' (default) or 'shift'; only meaningful when skipping an occurrence of a rotation. */
        String rotation
) {
}
