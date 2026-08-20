package com.training.tracking.dto;

import java.util.List;
import java.util.Map;

public record SessionDto(
        String date,
        String dayId,
        Map<String, Map<String, List<String>>> vals,
        List<Boolean> warm
) {
}
