package com.training.tracking.web;

import com.training.tracking.dto.CreateSessionTypeRequest;
import com.training.tracking.dto.SessionTypeDto;
import com.training.tracking.security.UserPrincipal;
import com.training.tracking.service.SessionTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/session-types")
public class SessionTypeController {

    private final SessionTypeService sessionTypeService;

    public SessionTypeController(SessionTypeService sessionTypeService) {
        this.sessionTypeService = sessionTypeService;
    }

    @GetMapping
    public List<SessionTypeDto> listTypes(@AuthenticationPrincipal UserPrincipal principal) {
        return sessionTypeService.listTypes(principal.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionTypeDto createType(@AuthenticationPrincipal UserPrincipal principal,
                                      @Valid @RequestBody CreateSessionTypeRequest request) {
        return sessionTypeService.createCustomType(principal.id(), request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteType(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long id) {
        sessionTypeService.deleteCustomType(principal.id(), id);
        return ResponseEntity.noContent().build();
    }
}
