package com.training.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record SessionDto(
        @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "must be an ISO date") String date,
        @NotBlank @Size(max = 16) String dayId,
        /** Exercise client id -> side ('B' | 'L' | 'R') -> value per set index. */
        Map<String, Map<String, List<String>>> vals,
        List<Boolean> warm
) {
}
