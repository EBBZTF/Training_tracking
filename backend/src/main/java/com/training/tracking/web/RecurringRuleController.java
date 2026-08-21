package com.training.tracking.web;

import com.training.tracking.dto.CreateRecurringRuleRequest;
import com.training.tracking.dto.RecurringRuleDto;
import com.training.tracking.security.UserPrincipal;
import com.training.tracking.service.RecurringRuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Rules are created here; they are edited and ended through the occurrence they appear as in the
 * calendar (see {@link PlannedSessionController}, scope=future), which is how the UI presents them.
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
}
