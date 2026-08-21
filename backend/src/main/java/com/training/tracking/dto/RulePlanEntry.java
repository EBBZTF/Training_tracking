package com.training.tracking.dto;

/**
 * One plan slot of a series. For {@code planMode=weekday} the position is the weekday index
 * (Mo=0 … So=6); for {@code planMode=rotation} the cycle order is the order of the list itself and
 * the position is what the server assigned.
 */
public record RulePlanEntry(
        Integer position,
        String dayId
) {
}
