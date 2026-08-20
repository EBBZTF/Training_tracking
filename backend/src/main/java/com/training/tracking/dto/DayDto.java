package com.training.tracking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DayDto(
        String id,
        @JsonProperty("short") String shortLabel,
        String slot,
        String title,
        List<BlockDto> blocks
) {
}
