package com.training.tracking.web;

import com.training.tracking.dto.CreateRecurringRuleRequest;
import com.training.tracking.dto.RecurringRuleDto;
import com.training.tracking.dto.UpdateRecurringRuleRequest;
import com.training.tracking.security.UserPrincipal;
import com.training.tracking.service.RecurringRuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Rules are created and redefined here. Everyday edits still go through the occurrence a rule
 * appears as in the calendar (see {@link PlannedSessionController}, scope=future); this endpoint is
 * for the parts an occurrence cannot express — the rhythm itself, and which plan each date gets.
 */
@RestController
@RequestMapping("/api/recurring-rules")
public class RecurringRuleController {

    private final RecurringRuleService recurringRuleService;

    public RecurringRuleController(RecurringRuleService recurringRuleService) {
        this.recurringRuleService = recurringRuleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecurringRuleDto create(@AuthenticationPrincipal UserPrincipal principal,
                                    @Valid @RequestBody CreateRecurringRuleRequest request) {
        return recurringRuleService.create(principal.id(), request);
    }

    @GetMapping("/{id}")
    public RecurringRuleDto get(@AuthenticationPrincipal UserPrincipal principal,
                                 @PathVariable Long id) {
        return recurringRuleService.find(principal.id(), id);
    }

    @PutMapping("/{id}")
    public RecurringRuleDto update(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long id,
                                    @Valid @RequestBody UpdateRecurringRuleRequest request) {
        return recurringRuleService.update(principal.id(), id, request);
    }
}
