package com.training.tracking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PlanDto(
        List<@Size(max = 500) String> warmup,
        List<@Valid DayDto> days
) {
}
