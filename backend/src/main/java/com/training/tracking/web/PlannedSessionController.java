package com.training.tracking.web;

import com.training.tracking.dto.CreatePlannedSessionRequest;
import com.training.tracking.dto.PlannedSessionDto;
import com.training.tracking.dto.RescheduleRequest;
import com.training.tracking.dto.UpdatePlannedSessionRequest;
import com.training.tracking.dto.UpdateStatusRequest;
import com.training.tracking.security.UserPrincipal;
import com.training.tracking.service.PlannedSessionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/planned-sessions")
public class PlannedSessionController {

    private final PlannedSessionService plannedSessionService;

    public PlannedSessionController(PlannedSessionService plannedSessionService) {
        this.plannedSessionService = plannedSessionService;
    }

    @GetMapping
    public List<PlannedSessionDto> list(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return plannedSessionService.listByRange(principal.id(), from, to);
    }

    @GetMapping("/{id}")
    public PlannedSessionDto getOne(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return plannedSessionService.getOne(principal.id(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlannedSessionDto create(@AuthenticationPrincipal UserPrincipal principal,
                                     @Valid @RequestBody CreatePlannedSessionRequest request) {
        return plannedSessionService.create(principal.id(), request);
    }

    @PutMapping("/{id}")
    public PlannedSessionDto update(@AuthenticationPrincipal UserPrincipal principal,
                                     @PathVariable Long id,
                                     @Valid @RequestBody UpdatePlannedSessionRequest request) {
        return plannedSessionService.update(principal.id(), id, request);
    }

    @PutMapping("/{id}/schedule")
    public PlannedSessionDto reschedule(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long id,
                                         @Valid @RequestBody RescheduleRequest request) {
        return plannedSessionService.reschedule(principal.id(), id, request);
    }

    @PutMapping("/{id}/status")
    public PlannedSessionDto updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long id,
                                           @Valid @RequestBody UpdateStatusRequest request) {
        return plannedSessionService.updateStatus(principal.id(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        plannedSessionService.delete(principal.id(), id);
        return ResponseEntity.noContent().build();
    }
}
