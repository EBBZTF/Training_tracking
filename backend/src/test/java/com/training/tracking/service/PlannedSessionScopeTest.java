package com.training.tracking.service;

import com.training.tracking.service.PlannedSessionService.Rotation;
import com.training.tracking.service.PlannedSessionService.Scope;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The scope and rotation query parameters decide whether an edit hits one occurrence or the rest of
 * a series, so an unrecognised value must never quietly fall through to the narrower meaning.
 */
class PlannedSessionScopeTest {

    @Test
    void anAbsentScopeMeansThisOccurrenceOnly() {
        assertThat(Scope.of(null)).isEqualTo(Scope.ONE);
        assertThat(Scope.of("")).isEqualTo(Scope.ONE);
        assertThat(Scope.of("  ")).isEqualTo(Scope.ONE);
        assertThat(Scope.of("one")).isEqualTo(Scope.ONE);
    }

    @Test
    void futureMeansThisOccurrenceAndEveryLaterOne() {
        assertThat(Scope.of("future")).isEqualTo(Scope.FUTURE);
    }

    @Test
    void anythingElseIsRejectedRatherThanTreatedAsOne() {
        assertThatThrownBy(() -> Scope.of("all"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void theScopeIsCaseSensitive() {
        assertThatThrownBy(() -> Scope.of("FUTURE")).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void anAbsentRotationOptionLeavesTheCycleWhereItIs() {
        assertThat(Rotation.of(null)).isEqualTo(Rotation.HOLD);
        assertThat(Rotation.of("")).isEqualTo(Rotation.HOLD);
        assertThat(Rotation.of("hold")).isEqualTo(Rotation.HOLD);
    }

    @Test
    void shiftCarriesTheMissedPlanToTheNextDate() {
        assertThat(Rotation.of("shift")).isEqualTo(Rotation.SHIFT);
    }

    @Test
    void anUnknownRotationOptionIsRejectedRatherThanIgnored() {
        assertThatThrownBy(() -> Rotation.of("move"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }
}
