package com.training.tracking.service;

import com.training.tracking.domain.RecurringRule;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RecurringRuleServiceTest {

    private static final short MO = 1;
    private static final short DO = 8;

    private static RecurringRule weekly(short weekdays, LocalDate start) {
        RecurringRule rule = new RecurringRule();
        rule.setPattern(RecurringRule.PATTERN_WEEKLY);
        rule.setWeekdays(weekdays);
        rule.setStartDate(start);
        return rule;
    }

    private static RecurringRule interval(short days, LocalDate start) {
        RecurringRule rule = new RecurringRule();
        rule.setPattern(RecurringRule.PATTERN_INTERVAL);
        rule.setIntervalDays(days);
        rule.setStartDate(start);
        return rule;
    }

    @Test
    void weeklyRuleHitsEveryRequestedWeekday() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 1));

        List<LocalDate> dates = RecurringRuleService.occurrences(
                rule, LocalDate.of(2026, 8, 24), LocalDate.of(2026, 8, 30));

        assertThat(dates).containsExactly(LocalDate.of(2026, 8, 24), LocalDate.of(2026, 8, 27));
    }

    @Test
    void weeklyRuleIsEmptyWhenNoWeekdayFallsInTheWindow() {
        RecurringRule rule = weekly(MO, LocalDate.of(2026, 8, 1));

        List<LocalDate> dates = RecurringRuleService.occurrences(
                rule, LocalDate.of(2026, 8, 25), LocalDate.of(2026, 8, 30));

        assertThat(dates).isEmpty();
    }

    @Test
    void intervalRuleCountsFromItsStartDate() {
        RecurringRule rule = interval((short) 3, LocalDate.of(2026, 8, 1));

        List<LocalDate> dates = RecurringRuleService.occurrences(
                rule, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 10));

        assertThat(dates).containsExactly(
                LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 4),
                LocalDate.of(2026, 8, 7), LocalDate.of(2026, 8, 10));
    }

    /** A window that starts mid-cycle must stay on the original phase, not restart at `from`. */
    @Test
    void intervalRuleKeepsItsPhaseInALaterWindow() {
        RecurringRule rule = interval((short) 3, LocalDate.of(2026, 8, 1));

        List<LocalDate> dates = RecurringRuleService.occurrences(
                rule, LocalDate.of(2026, 8, 20), LocalDate.of(2026, 8, 27));

        assertThat(dates).containsExactly(
                LocalDate.of(2026, 8, 22), LocalDate.of(2026, 8, 25));
    }

    @Test
    void intervalRuleIncludesAWindowStartThatIsExactlyOnCycle() {
        RecurringRule rule = interval((short) 7, LocalDate.of(2026, 8, 3));

        List<LocalDate> dates = RecurringRuleService.occurrences(
                rule, LocalDate.of(2026, 8, 17), LocalDate.of(2026, 8, 17));

        assertThat(dates).containsExactly(LocalDate.of(2026, 8, 17));
    }

    @Test
    void weekdayBitsFollowMondayFirstOrder() {
        assertThat(RecurringRuleService.weekdayBit(DayOfWeek.MONDAY)).isEqualTo(1);
        assertThat(RecurringRuleService.weekdayBit(DayOfWeek.THURSDAY)).isEqualTo(8);
        assertThat(RecurringRuleService.weekdayBit(DayOfWeek.SUNDAY)).isEqualTo(64);
    }

    @Test
    void movingAWeekdaySwapsOnlyThatDayInTheMask() {
        short mask = (short) (MO | DO);

        short moved = RecurringRuleService.moveWeekday(mask, DayOfWeek.MONDAY, DayOfWeek.TUESDAY);

        assertThat(moved).isEqualTo((short) (2 | DO));
    }

    @Test
    void movingAWeekdayOntoAnExistingOneCollapsesTheSeries() {
        short mask = (short) (MO | DO);

        short moved = RecurringRuleService.moveWeekday(mask, DayOfWeek.MONDAY, DayOfWeek.THURSDAY);

        assertThat(moved).isEqualTo(DO);
    }
}
