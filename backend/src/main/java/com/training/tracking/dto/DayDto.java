package com.training.tracking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DayDto(
        @NotBlank @Size(max = 16) String id,
        @JsonProperty("short") @NotBlank @Size(max = 32) String shortLabel,
        @NotNull @Pattern(regexp = "morgens|nachmittags", message = "must be morgens or nachmittags")
        String slot,
        @NotBlank @Size(max = 255) String title,
        List<@Valid BlockDto> blocks
) {
}
