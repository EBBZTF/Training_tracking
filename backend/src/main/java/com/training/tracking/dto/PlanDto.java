package com.training.tracking.dto;

import java.util.List;

public record PlanDto(
        List<String> warmup,
        BlockDto hip,
        List<DayDto> days
) {
}
