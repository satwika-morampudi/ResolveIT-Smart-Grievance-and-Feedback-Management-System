package com.example.resolveit.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.resolveit.model.ComplaintHistory;
import com.example.resolveit.repository.ComplaintRepository;
import com.example.resolveit.repository.ComplaintHistoryRepository;
import com.example.resolveit.repository.UserRepository;

import java.time.LocalDateTime;

@Controller
public class AdminController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintHistoryRepository complaintHistoryRepository;

    @GetMapping("/admin")
    public String adminDashboard(
            @org.springframework.web.bind.annotation.CookieValue(name = "jwtToken", required = false) String token,
            Model model) {
        model.addAttribute("complaints", complaintRepository.findAll());
        model.addAttribute("users", userRepository.findAll());
        model.addAttribute("token", token);
        return "admin-dashboard";
    }

    @PostMapping("/updateStatus")
    public String updateStatus(@RequestParam int id,
            @RequestParam String status) {
        var complaint = complaintRepository.findById(id).orElse(null);
        if (complaint != null) {
            complaint.setStatus(status);
            if ("Resolved".equals(status)) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
            complaintRepository.save(complaint);

            // Log history entry
            String updatedBy = "Admin";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                updatedBy = auth.getName();
            }
            ComplaintHistory history = new ComplaintHistory();
            history.setComplaintId(id);
            history.setStatus(status);
            history.setNote("Status updated to " + status);
            history.setUpdatedBy(updatedBy);
            complaintHistoryRepository.save(history);
        }
        return "redirect:/admin";
    }

    @PostMapping("/admin/updateRole")
    public String updateRole(@RequestParam int userId,
            @RequestParam String role) {
        var user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setRole(role);
            userRepository.save(user);
        }
        return "redirect:/admin#users";
    }

    @GetMapping("/search")
    public String search(@RequestParam(required = false, defaultValue = "") String keyword, Model model) {
        if (keyword == null || keyword.isEmpty()) {
            model.addAttribute("complaints", complaintRepository.findAll());
        } else {
            model.addAttribute("complaints",
                    complaintRepository.findByTitleContaining(keyword));
        }
        model.addAttribute("users", userRepository.findAll());
        return "admin-dashboard";
    }

    @PostMapping("/assignStaff")
    public String assignStaff(@RequestParam int complaintId,
            @RequestParam int staffId) {
        var complaint = complaintRepository.findById(complaintId).orElse(null);
        if (complaint != null) {
            complaint.setAssignedStaff(staffId);
            complaintRepository.save(complaint);

            // Log assignment in history
            String updatedBy = "Admin";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                updatedBy = auth.getName();
            }
            ComplaintHistory history = new ComplaintHistory();
            history.setComplaintId(complaintId);
            history.setStatus(complaint.getStatus() != null ? complaint.getStatus() : "New");
            history.setNote("Staff assigned");
            history.setUpdatedBy(updatedBy);
            complaintHistoryRepository.save(history);
        }
        return "redirect:/admin";
    }
}
