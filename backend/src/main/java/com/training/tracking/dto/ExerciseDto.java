package com.training.tracking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ExerciseDto(
        String id,
        String name,
        String type,
        boolean uni,
        Integer sets,
        Integer setsL,
        Integer setsR,
        String reps,
        String note,
        String desc
) {
}
