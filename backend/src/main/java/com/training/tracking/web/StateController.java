package com.training.tracking.web;

import com.training.tracking.dto.StateDto;
import com.training.tracking.service.StateService;
import org.springframework.http.ResponseEntity;
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
    public StateDto getState() {
        return stateService.getState();
    }

    @PutMapping
    public ResponseEntity<Void> putState(@RequestBody StateDto state) {
        stateService.saveState(state);
        return ResponseEntity.noContent().build();
    }
}
