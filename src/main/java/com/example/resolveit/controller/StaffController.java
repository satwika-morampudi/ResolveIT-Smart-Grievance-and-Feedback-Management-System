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
public class StaffController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintHistoryRepository complaintHistoryRepository;

    @GetMapping("/staff-dashboard")
    public String staffDashboard(
            @RequestParam(required = false) Integer staffId,
            @org.springframework.web.bind.annotation.CookieValue(name = "jwtToken", required = false) String token,
            Model model) {

        // If staffId is missing, try to get it from the logged-in user context
        if (staffId == null || staffId <= 0) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                String email = auth.getName();
                com.example.resolveit.model.User user = userRepository.findByEmail(email);
                if (user != null) {
                    staffId = user.getId();
                }
            }
        }

        // Show only complaints assigned to this staff member
        if (staffId != null && staffId > 0) {
            model.addAttribute("complaints", complaintRepository.findByAssignedStaff(staffId));
            model.addAttribute("staffId", staffId);
            var staff = userRepository.findById(staffId).orElse(null);
            if (staff != null) {
                model.addAttribute("staffName", staff.getName());
            }
        } else {
            model.addAttribute("complaints", java.util.Collections.emptyList());
            model.addAttribute("staffId", 0);
        }
        model.addAttribute("token", token);
        return "staff-dashboard";
    }

    @PostMapping("/staff/updateStatus")
    public String updateStatus(@RequestParam int id,
            @RequestParam String status,
            @RequestParam(required = false) Integer staffId) {
        var complaint = complaintRepository.findById(id).orElse(null);
        if (complaint != null) {
            complaint.setStatus(status);
            if ("Resolved".equals(status)) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
            complaintRepository.save(complaint);

            // Log history entry
            String updatedBy = "Staff";
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
        String redirect = "/staff-dashboard";
        if (staffId != null) {
            redirect += "?staffId=" + staffId;
        }
        return "redirect:" + redirect;
    }
}
