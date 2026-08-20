package com.training.tracking.dto;

import java.util.List;

public record StateDto(
        PlanDto plan,
        List<SessionDto> logs
) {
}
