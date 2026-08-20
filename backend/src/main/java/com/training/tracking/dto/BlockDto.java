package com.training.tracking.dto;

import java.util.List;

public record BlockDto(
        String kind,
        String name,
        List<ExerciseDto> ex
) {
}
