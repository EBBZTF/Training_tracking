package com.training.tracking.dto;

import java.util.List;

/** What a series is, apart from where it starts — shared by creating one and redefining one. */
public interface RecurringRuleDefinition {

    Long sessionTypeId();

    /** The pinned plan, for {@code planMode=fixed}. */
    String dayId();

    String time();

    String notes();

    /** 'weekly' with a weekday bitmask, or 'interval' with a day count. */
    String pattern();

    Integer weekdays();

    Integer intervalDays();

    String endDate();

    /** 'fixed' (the default), 'weekday' or 'rotation'. */
    String planMode();

    /** The plans for 'weekday' and 'rotation'; ignored by 'fixed'. */
    List<RulePlanEntry> plans();
}
