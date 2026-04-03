package com.resolveit.backend.service;

import com.resolveit.backend.dto.*;
import com.resolveit.backend.entity.*;
import com.resolveit.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepo;
    private final StatusLogRepository statusLogRepo;
    private final UserRepository userRepo;

    public ComplaintService(ComplaintRepository complaintRepo,
                            StatusLogRepository statusLogRepo,
                            UserRepository userRepo) {
        this.complaintRepo = complaintRepo;
        this.statusLogRepo = statusLogRepo;
        this.userRepo = userRepo;
    }

    public ComplaintResponse submit(ComplaintRequest req, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint c = new Complaint();
        c.setUser(user);
        c.setAnonymous(req.isAnonymous());
        c.setSubject(req.getSubject());
        c.setCategory(req.getCategory());
        c.setDescription(req.getDescription());
        c.setUrgency(req.getUrgency());
        c.setStatus("NEW");
        complaintRepo.save(c);

        StatusLog log = new StatusLog();
        log.setComplaint(c);
        log.setStatus("NEW");
        log.setComment("Complaint submitted successfully.");
        log.setUpdatedBy(user);
        statusLogRepo.save(log);

        return toResponse(c);
    }

    public List<ComplaintResponse> getMyComplaints(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return complaintRepo.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<StatusLogResponse> getTimeline(Long complaintId) {
        return statusLogRepo.findByComplaintIdOrderByUpdatedAtDesc(complaintId)
                .stream().map(this::toLogResponse).collect(Collectors.toList());
    }

    public ComplaintResponse updateStatus(Long complaintId, String newStatus,
                                          String comment, String adminEmail) {
        Complaint c = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User admin = userRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        c.setStatus(newStatus);
        c.setUpdatedAt(LocalDateTime.now());
        complaintRepo.save(c);

        StatusLog log = new StatusLog();
        log.setComplaint(c);
        log.setStatus(newStatus);
        log.setComment(comment);
        log.setUpdatedBy(admin);
        statusLogRepo.save(log);

        return toResponse(c);
    }

    // Assign complaint to a staff member
    public ComplaintResponse assignTo(Long complaintId, String staffEmail, String adminEmail) {
        Complaint c = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User staff = userRepo.findByEmail(staffEmail)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        User admin = userRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        c.setAssignedTo(staff);
        c.setUpdatedAt(LocalDateTime.now());
        complaintRepo.save(c);

        StatusLog log = new StatusLog();
        log.setComplaint(c);
        log.setStatus(c.getStatus());
        log.setComment("Assigned to " + staff.getEmail() + " by " + admin.getEmail());
        log.setUpdatedBy(admin);
        statusLogRepo.save(log);

        return toResponse(c);
    }

    // Get all staff users
    public List<String> getAllStaff() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STAFF)
                .map(User::getEmail)
                .collect(Collectors.toList());
    }

    private ComplaintResponse toResponse(Complaint c) {
        ComplaintResponse r = new ComplaintResponse();
        r.setId(c.getId());
        r.setSubject(c.getSubject());
        r.setCategory(c.getCategory());
        r.setDescription(c.getDescription());
        r.setUrgency(c.getUrgency());
        r.setStatus(c.getStatus());
        r.setAnonymous(c.isAnonymous());
        r.setUserEmail(c.isAnonymous() ? "Anonymous" : c.getUser().getEmail());
        r.setAssignedTo(c.getAssignedTo() != null ? c.getAssignedTo().getEmail() : null);
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    private StatusLogResponse toLogResponse(StatusLog l) {
        StatusLogResponse r = new StatusLogResponse();
        r.setId(l.getId());
        r.setStatus(l.getStatus());
        r.setComment(l.getComment());
        r.setUpdatedBy(l.getUpdatedBy().getEmail());
        r.setUpdatedAt(l.getUpdatedAt());
        return r;
    }
    public List<ComplaintResponse> getAssignedComplaints(String staffEmail) {
    User staff = userRepo.findByEmail(staffEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
    return complaintRepo.findByAssignedToOrderByCreatedAtDesc(staff)
            .stream().map(this::toResponse).collect(Collectors.toList());
}
}