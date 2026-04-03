package com.resolveit.backend.controller;

import com.resolveit.backend.dto.*;
import com.resolveit.backend.service.EscalationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/escalations")
@CrossOrigin(origins = "http://localhost:5173")
public class EscalationController {

    private final EscalationService escalationService;

    public EscalationController(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    // Escalate a complaint manually
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','SUPER_ADMIN')")
    public ResponseEntity<EscalationResponse> escalate(
            @RequestBody EscalationRequest req,
            Authentication auth) {
        return ResponseEntity.ok(escalationService.escalate(req, auth.getName()));
    }

    // Get all escalations
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<EscalationResponse>> getAllEscalations() {
        return ResponseEntity.ok(escalationService.getAllEscalations());
    }

    // Get escalations for a specific complaint
    @GetMapping("/complaint/{id}")
    public ResponseEntity<List<EscalationResponse>> getComplaintEscalations(
            @PathVariable Long id) {
        return ResponseEntity.ok(escalationService.getComplaintEscalations(id));
    }

    // Resolve an escalation
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<EscalationResponse> resolve(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(escalationService.resolveEscalation(id, auth.getName()));
    }
}