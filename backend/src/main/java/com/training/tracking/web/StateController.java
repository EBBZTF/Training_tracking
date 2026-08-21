package com.training.tracking.web;

import com.training.tracking.dto.StateDto;
import com.training.tracking.security.UserPrincipal;
import com.training.tracking.service.StateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/state")
public class StateController {

    private final StateService stateService;

    public StateController(StateService stateService) {
        this.stateService = stateService;
    }

    @GetMapping
    public StateDto getState(@AuthenticationPrincipal UserPrincipal principal) {
        return stateService.getState(principal.id());
    }

    @PutMapping
    public ResponseEntity<Void> putState(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestBody StateDto state) {
        stateService.saveState(principal.id(), state);
        return ResponseEntity.noContent().build();
    }
}
