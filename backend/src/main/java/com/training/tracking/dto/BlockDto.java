package com.training.tracking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BlockDto(
        @NotNull @Pattern(regexp = "huefte|skill|kraft|explosiv|core|ausdauer",
                message = "must be a known block kind")
        String kind,
        /** May be blank: the editor lets a block be renamed to nothing without blocking the save. */
        @NotNull @Size(max = 255) String name,
        List<@Valid ExerciseDto> ex
) {
}
