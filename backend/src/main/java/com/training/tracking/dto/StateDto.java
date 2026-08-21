package com.training.tracking.dto;

import jakarta.validation.Valid;

import java.util.List;

public record StateDto(
        @Valid PlanDto plan,
        List<@Valid SessionDto> logs
) {
}
