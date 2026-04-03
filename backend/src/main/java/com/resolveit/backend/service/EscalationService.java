package com.resolveit.backend.service;

import com.resolveit.backend.dto.*;
import com.resolveit.backend.entity.*;
import com.resolveit.backend.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EscalationService {

    private final EscalationRepository escalationRepo;
    private final ComplaintRepository complaintRepo;
    private final UserRepository userRepo;
    private final StatusLogRepository statusLogRepo;

    public EscalationService(EscalationRepository escalationRepo,
                              ComplaintRepository complaintRepo,
                              UserRepository userRepo,
                              StatusLogRepository statusLogRepo) {
        this.escalationRepo = escalationRepo;
        this.complaintRepo = complaintRepo;
        this.userRepo = userRepo;
        this.statusLogRepo = statusLogRepo;
    }

    // Manual escalation by admin or staff
    public EscalationResponse escalate(EscalationRequest req, String escalatedByEmail) {
        Complaint complaint = complaintRepo.findById(req.getComplaintId())
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User escalatedBy = userRepo.findByEmail(escalatedByEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find a super admin to escalate to
        User superAdmin = userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.SUPER_ADMIN)
                .findFirst()
                .orElse(escalatedBy);

        // Update complaint status to ESCALATED
        complaint.setStatus("ESCALATED");
        complaint.setUpdatedAt(LocalDateTime.now());
        complaintRepo.save(complaint);

        // Add status log
        StatusLog log = new StatusLog();
        log.setComplaint(complaint);
        log.setStatus("ESCALATED");
        log.setComment("Escalated: " + req.getReason());
        log.setUpdatedBy(escalatedBy);
        statusLogRepo.save(log);

        // Create escalation record
        Escalation escalation = new Escalation();
        escalation.setComplaint(complaint);
        escalation.setEscalatedBy(escalatedBy);
        escalation.setEscalatedTo(superAdmin);
        escalation.setReason(req.getReason());
        escalation.setAutoEscalated(false);
        escalationRepo.save(escalation);

        return toResponse(escalation);
    }

    // Get all escalations
    public List<EscalationResponse> getAllEscalations() {
        return escalationRepo.findAllByOrderByEscalatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Get escalations for a specific complaint
    public List<EscalationResponse> getComplaintEscalations(Long complaintId) {
        return escalationRepo.findByComplaintId(complaintId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Mark escalation as resolved
    public EscalationResponse resolveEscalation(Long escalationId, String adminEmail) {
        Escalation escalation = escalationRepo.findById(escalationId)
                .orElseThrow(() -> new RuntimeException("Escalation not found"));
        User admin = userRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        escalation.setResolved(true);
        escalationRepo.save(escalation);

        // Update complaint status back to UNDER_REVIEW
        Complaint c = escalation.getComplaint();
        c.setStatus("UNDER_REVIEW");
        c.setUpdatedAt(LocalDateTime.now());
        complaintRepo.save(c);

        StatusLog log = new StatusLog();
        log.setComplaint(c);
        log.setStatus("UNDER_REVIEW");
        log.setComment("Escalation resolved by " + admin.getEmail());
        log.setUpdatedBy(admin);
        statusLogRepo.save(log);

        return toResponse(escalation);
    }

    // Auto-escalate complaints unresolved for more than 3 days
    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void autoEscalateOldComplaints() {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);

        List<Complaint> oldComplaints = complaintRepo.findAll().stream()
                .filter(c -> !c.getStatus().equals("RESOLVED"))
                .filter(c -> !c.getStatus().equals("ESCALATED"))
                .filter(c -> c.getCreatedAt().isBefore(threeDaysAgo))
                .filter(c -> !escalationRepo.existsByComplaintId(c.getId()))
                .collect(Collectors.toList());

        User systemUser = userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.SUPER_ADMIN)
                .findFirst().orElse(null);

        if (systemUser == null) return;

        for (Complaint c : oldComplaints) {
            c.setStatus("ESCALATED");
            c.setUpdatedAt(LocalDateTime.now());
            complaintRepo.save(c);

            StatusLog log = new StatusLog();
            log.setComplaint(c);
            log.setStatus("ESCALATED");
            log.setComment("Auto-escalated: complaint unresolved for more than 3 days.");
            log.setUpdatedBy(systemUser);
            statusLogRepo.save(log);

            Escalation escalation = new Escalation();
            escalation.setComplaint(c);
            escalation.setEscalatedBy(systemUser);
            escalation.setEscalatedTo(systemUser);
            escalation.setReason("Auto-escalated: unresolved for more than 3 days");
            escalation.setAutoEscalated(true);
            escalationRepo.save(escalation);
        }

        System.out.println("Auto-escalation ran. Escalated " + oldComplaints.size() + " complaints.");
    }

    private EscalationResponse toResponse(Escalation e) {
        EscalationResponse r = new EscalationResponse();
        r.setId(e.getId());
        r.setComplaintId(e.getComplaint().getId());
        r.setComplaintSubject(e.getComplaint().getSubject());
        r.setReason(e.getReason());
        r.setEscalatedBy(e.getEscalatedBy().getEmail());
        r.setEscalatedTo(e.getEscalatedTo().getEmail());
        r.setResolved(e.isResolved());
        r.setAutoEscalated(e.isAutoEscalated());
        r.setEscalatedAt(e.getEscalatedAt());
        return r;
    }
}