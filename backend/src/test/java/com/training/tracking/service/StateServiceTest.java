package com.training.tracking.service;

import com.training.tracking.domain.User;
import com.training.tracking.dto.BlockDto;
import com.training.tracking.dto.DayDto;
import com.training.tracking.dto.ExerciseDto;
import com.training.tracking.dto.PlanDto;
import com.training.tracking.dto.SessionDto;
import com.training.tracking.dto.StateDto;
import com.training.tracking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class StateServiceTest {

    @Autowired
    private StateService stateService;

    @Autowired
    private UserRepository userRepository;

    private Long userId;

    @BeforeEach
    void createUser() {
        User user = new User();
        user.setEmail("state-" + Instant.now().toEpochMilli() + "-" + System.nanoTime() + "@example.com");
        user.setPasswordHash("hash");
        user.setCreatedAt(Instant.now());
        userRepository.save(user);
        userId = user.getId();
    }

    private static ExerciseDto exercise(String id, String name) {
        return new ExerciseDto(id, name, "kg", false, 3, null, null, "8", "Notiz", "Anleitung");
    }

    private static DayDto day(String id, ExerciseDto... exercises) {
        return new DayDto(id, id.toUpperCase(), "morgens", "Plan " + id,
                List.of(new BlockDto("kraft", "Hauptblock", List.of(exercises))));
    }

    private static StateDto state(List<DayDto> days, List<SessionDto> logs) {
        return new StateDto(new PlanDto(List.of("Hüfte kreisen"), days), logs);
    }

    @Test
    void roundTripsAPlanWithItsLoggedValues() {
        SessionDto log = new SessionDto("2026-08-20", "mo",
                Map.of("ex1", Map.of("B", List.of("60", "62", ""))), List.of(true, false));
        stateService.saveState(userId, state(List.of(day("mo", exercise("ex1", "Kniebeuge"))), List.of(log)));

        StateDto loaded = stateService.getState(userId);

        assertThat(loaded.plan().warmup()).containsExactly("Hüfte kreisen");
        assertThat(loaded.plan().days()).hasSize(1);
        DayDto loadedDay = loaded.plan().days().get(0);
        assertThat(loadedDay.id()).isEqualTo("mo");
        assertThat(loadedDay.slot()).isEqualTo("morgens");
        assertThat(loadedDay.blocks().get(0).kind()).isEqualTo("kraft");
        assertThat(loadedDay.blocks().get(0).ex().get(0).name()).isEqualTo("Kniebeuge");

        assertThat(loaded.logs()).hasSize(1);
        SessionDto loadedLog = loaded.logs().get(0);
        assertThat(loadedLog.date()).isEqualTo("2026-08-20");
        assertThat(loadedLog.dayId()).isEqualTo("mo");
        // The trailing blank is not stored, so it does not come back.
        assertThat(loadedLog.vals().get("ex1").get("B")).containsExactly("60", "62");
        assertThat(loadedLog.warm()).containsExactly(true);
    }

    @Test
    void aBrandNewUserGetsAnEmptyPlanRatherThanNull() {
        StateDto loaded = stateService.getState(userId);

        assertThat(loaded.plan().days()).isEmpty();
        assertThat(loaded.plan().warmup()).isEmpty();
        assertThat(loaded.logs()).isEmpty();
    }

    /**
     * "Alle Pläne löschen" sends the emptied plan together with the logs that were already there.
     * That used to fail the sessions.day_id NOT NULL constraint and roll the whole save back.
     */
    @Test
    void deletingEveryPlanKeepsTheHistory() {
        SessionDto log = new SessionDto("2026-08-20", "mo",
                Map.of("ex1", Map.of("B", List.of("60"))), List.of(true));
        stateService.saveState(userId, state(List.of(day("mo", exercise("ex1", "Kniebeuge"))), List.of(log)));

        stateService.saveState(userId, state(List.of(), List.of(log)));

        StateDto loaded = stateService.getState(userId);
        assertThat(loaded.plan().days()).isEmpty();
        assertThat(loaded.logs()).hasSize(1);
        assertThat(loaded.logs().get(0).dayId()).isEqualTo("mo");
        // The exercise the values hung off is gone, so only the entry itself survives.
        assertThat(loaded.logs().get(0).vals()).isEmpty();
        assertThat(loaded.logs().get(0).warm()).containsExactly(true);
    }

    @Test
    void editingThePlanKeepsValuesAttachedToTheirExercise() {
        SessionDto log = new SessionDto("2026-08-20", "mo",
                Map.of("ex1", Map.of("B", List.of("60"))), List.of());
        stateService.saveState(userId, state(List.of(day("mo", exercise("ex1", "Kniebeuge"))), List.of(log)));

        // Same exercise id, renamed, plus a new sibling — the shape of a normal plan edit.
        stateService.saveState(userId, state(
                List.of(day("mo", exercise("ex1", "Frontkniebeuge"), exercise("ex2", "Rudern"))),
                List.of(log)));

        StateDto loaded = stateService.getState(userId);
        assertThat(loaded.plan().days().get(0).blocks().get(0).ex())
                .extracting(ExerciseDto::name)
                .containsExactly("Frontkniebeuge", "Rudern");
        assertThat(loaded.logs().get(0).vals().get("ex1").get("B")).containsExactly("60");
    }

    @Test
    void logsForAPlanThatNoLongerExistsAreStillReadable() {
        SessionDto orphan = new SessionDto("2026-08-20", "geloescht", Map.of(), List.of());
        stateService.saveState(userId, state(List.of(day("mo")), List.of(orphan)));

        StateDto loaded = stateService.getState(userId);
        assertThat(loaded.logs()).hasSize(1);
        assertThat(loaded.logs().get(0).dayId()).isEqualTo("geloescht");
    }

    @Test
    void rejectsTwoPlansSharingAnId() {
        assertThatThrownBy(() -> stateService.saveState(userId, state(List.of(day("mo"), day("mo")), List.of())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    /** Values are addressed by exercise id, so a reused id would bind them to the wrong exercise. */
    @Test
    void rejectsTwoExercisesSharingAnId() {
        StateDto ambiguous = state(
                List.of(day("mo", exercise("dup", "Kniebeuge")), day("di", exercise("dup", "Rudern"))),
                List.of());

        assertThatThrownBy(() -> stateService.saveState(userId, ambiguous))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void rejectsTwoLogsForTheSameDayAndDate() {
        SessionDto log = new SessionDto("2026-08-20", "mo", Map.of(), List.of());

        assertThatThrownBy(() -> stateService.saveState(userId, state(List.of(day("mo")), List.of(log, log))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void rejectsALoggedSideThatIsNotBLeftOrRight() {
        SessionDto log = new SessionDto("2026-08-20", "mo",
                Map.of("ex1", Map.of("X", List.of("60"))), List.of());
        StateDto bad = state(List.of(day("mo", exercise("ex1", "Kniebeuge"))), List.of(log));

        assertThatThrownBy(() -> stateService.saveState(userId, bad))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void oneUsersSaveLeavesAnotherUsersStateAlone() {
        User other = new User();
        other.setEmail("other-" + System.nanoTime() + "@example.com");
        other.setPasswordHash("hash");
        other.setCreatedAt(Instant.now());
        userRepository.save(other);

        stateService.saveState(userId, state(List.of(day("mo", exercise("mine", "Kniebeuge"))), List.of()));
        stateService.saveState(other.getId(), state(List.of(day("di", exercise("theirs", "Rudern"))), List.of()));

        assertThat(stateService.getState(userId).plan().days()).extracting(DayDto::id).containsExactly("mo");
        assertThat(stateService.getState(other.getId()).plan().days())
                .extracting(DayDto::id).containsExactly("di");
    }
}
