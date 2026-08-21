package com.training.tracking.service;

import com.training.tracking.domain.RecurringRule;
import com.training.tracking.domain.RecurringRulePlan;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
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
        rule.setPlanMode(RecurringRule.PLAN_FIXED);
        return rule;
    }

    /** Plan rows in the order they were listed, which is cycle order for a rotation. */
    private static List<RecurringRulePlan> plans(RecurringRule rule, String... dayKeys) {
        List<RecurringRulePlan> rows = new ArrayList<>();
        for (short i = 0; i < dayKeys.length; i++) {
            rows.add(new RecurringRulePlan(rule, i, dayKeys[i]));
        }
        return rows;
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

    @Test
    void slotIndexCountsTheWeeklyDatesBeforeIt() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3)); // ein Montag

        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 8, 3))).isZero();
        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 8, 6))).isEqualTo(1);
        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 8, 10))).isEqualTo(2);
        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 9, 3))).isEqualTo(9);
    }

    /** A date the rule does not fall on still has to report the index the next one will take. */
    @Test
    void slotIndexCountsTheIntervalDatesBeforeIt() {
        RecurringRule rule = interval((short) 3, LocalDate.of(2026, 8, 1));

        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 8, 1))).isZero();
        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 8, 4))).isEqualTo(1);
        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 8, 5))).isEqualTo(2);
        assertThat(RecurringRuleService.slotIndex(rule, LocalDate.of(2026, 7, 20))).isZero();
    }

    @Test
    void aRotationAdvancesOneStepPerDateAndWrapsAround() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setPlanMode(RecurringRule.PLAN_ROTATION);
        List<RecurringRulePlan> cycle = plans(rule, "beine", "push", "pull");

        assertThat(RecurringRuleService.resolvePlan(rule, cycle, LocalDate.of(2026, 8, 3))).isEqualTo("beine");
        assertThat(RecurringRuleService.resolvePlan(rule, cycle, LocalDate.of(2026, 8, 6))).isEqualTo("push");
        assertThat(RecurringRuleService.resolvePlan(rule, cycle, LocalDate.of(2026, 8, 10))).isEqualTo("pull");
        assertThat(RecurringRuleService.resolvePlan(rule, cycle, LocalDate.of(2026, 8, 13))).isEqualTo("beine");
    }

    /**
     * The step is a pure function of the rule and the date, so a skipped or deleted occurrence
     * cannot silently reshuffle the dates after it — that only happens when the user asks for it,
     * by way of a re-anchored rotation offset.
     */
    @Test
    void aRotationStepDependsOnlyOnTheRuleAndTheDate() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setPlanMode(RecurringRule.PLAN_ROTATION);

        assertThat(RecurringRuleService.rotationStep(rule, LocalDate.of(2026, 8, 10), 3)).isEqualTo(2);
        assertThat(RecurringRuleService.rotationStep(rule, LocalDate.of(2026, 8, 10), 3)).isEqualTo(2);
    }

    /** What a split series carries: the new half starts mid-cycle instead of at its first plan. */
    @Test
    void theRotationOffsetShiftsWhereTheCycleStarts() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setPlanMode(RecurringRule.PLAN_ROTATION);
        rule.setRotationOffset((short) 2);
        List<RecurringRulePlan> cycle = plans(rule, "beine", "push", "pull");

        assertThat(RecurringRuleService.resolvePlan(rule, cycle, LocalDate.of(2026, 8, 3))).isEqualTo("pull");
        assertThat(RecurringRuleService.resolvePlan(rule, cycle, LocalDate.of(2026, 8, 6))).isEqualTo("beine");
    }

    @Test
    void aWeekdayAssignmentGivesEachDayItsOwnPlan() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setPlanMode(RecurringRule.PLAN_WEEKDAY);
        List<RecurringRulePlan> byWeekday = List.of(
                new RecurringRulePlan(rule, (short) 0, "beine"),
                new RecurringRulePlan(rule, (short) 3, "arme"));

        assertThat(RecurringRuleService.resolvePlan(rule, byWeekday, LocalDate.of(2026, 8, 3))).isEqualTo("beine");
        assertThat(RecurringRuleService.resolvePlan(rule, byWeekday, LocalDate.of(2026, 8, 6))).isEqualTo("arme");
        assertThat(RecurringRuleService.resolvePlan(rule, byWeekday, LocalDate.of(2026, 8, 10))).isEqualTo("beine");
    }

    /** A scheduled weekday nobody assigned a plan to still gets its session, just without one. */
    @Test
    void aWeekdayWithoutAPlanGeneratesAnOccurrenceWithoutOne() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setPlanMode(RecurringRule.PLAN_WEEKDAY);
        List<RecurringRulePlan> byWeekday = List.of(new RecurringRulePlan(rule, (short) 0, "beine"));

        assertThat(RecurringRuleService.resolvePlan(rule, byWeekday, LocalDate.of(2026, 8, 6))).isNull();
    }

    @Test
    void aFixedRuleKeepsItsPinnedPlanOnEveryDate() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setDayKey("ganzkoerper");

        assertThat(RecurringRuleService.resolvePlan(rule, List.of(), LocalDate.of(2026, 8, 3)))
                .isEqualTo("ganzkoerper");
        assertThat(RecurringRuleService.resolvePlan(rule, List.of(), LocalDate.of(2026, 8, 6)))
                .isEqualTo("ganzkoerper");
    }

    @Test
    void theNextDateOfAWeeklyRuleIsItsNextSelectedWeekday() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));

        assertThat(RecurringRuleService.nextOccurrenceAfter(rule, LocalDate.of(2026, 8, 3)))
                .isEqualTo(LocalDate.of(2026, 8, 6));
        assertThat(RecurringRuleService.nextOccurrenceAfter(rule, LocalDate.of(2026, 8, 6)))
                .isEqualTo(LocalDate.of(2026, 8, 10));
    }

    @Test
    void theNextDateOfAnIntervalRuleIsOneStepOn() {
        RecurringRule rule = interval((short) 3, LocalDate.of(2026, 8, 1));

        assertThat(RecurringRuleService.nextOccurrenceAfter(rule, LocalDate.of(2026, 8, 4)))
                .isEqualTo(LocalDate.of(2026, 8, 7));
    }

    /** Nothing left to carry a missed plan over to, so a shift has to be a no-op. */
    @Test
    void thereIsNoNextDateOnceTheSeriesHasEnded() {
        RecurringRule rule = weekly((short) (MO | DO), LocalDate.of(2026, 8, 3));
        rule.setEndDate(LocalDate.of(2026, 8, 7));

        assertThat(RecurringRuleService.nextOccurrenceAfter(rule, LocalDate.of(2026, 8, 6))).isNull();
    }

    /** A rule that ends before it starts would not survive the database, let alone generate a date. */
    @Test
    void splittingASeriesPastItsEndKeepsTheNewHalfValid() {
        LocalDate from = LocalDate.of(2026, 8, 24);

        assertThat(RecurringRuleService.endDateAfterSplit(LocalDate.of(2026, 8, 9), from))
                .isEqualTo(from);
        assertThat(RecurringRuleService.endDateAfterSplit(LocalDate.of(2026, 9, 30), from))
                .isEqualTo(LocalDate.of(2026, 9, 30));
        assertThat(RecurringRuleService.endDateAfterSplit(null, from)).isNull();
    }

    /** Splitting an already-ended half must not hand it back the dates its successor now covers. */
    @Test
    void splittingASeriesNeverExtendsTheHalfBeforeIt() {
        LocalDate lastDayBefore = LocalDate.of(2026, 8, 23);

        assertThat(RecurringRuleService.earlierOf(LocalDate.of(2026, 8, 9), lastDayBefore))
                .isEqualTo(LocalDate.of(2026, 8, 9));
        assertThat(RecurringRuleService.earlierOf(LocalDate.of(2026, 9, 30), lastDayBefore))
                .isEqualTo(lastDayBefore);
        assertThat(RecurringRuleService.earlierOf(null, lastDayBefore)).isEqualTo(lastDayBefore);
    }
}
