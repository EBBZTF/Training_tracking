package com.training.tracking.dto;

public record SessionTypeDto(
        Long id,
        String label,
        String color,
        String icon,
        boolean custom
) {
}
