package com.example.resolveit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.resolveit.repository.ComplaintHistoryRepository;
import com.example.resolveit.repository.ComplaintRepository;

@Controller
public class PageController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.resolveit.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private ComplaintRepository complaintRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private ComplaintHistoryRepository complaintHistoryRepository;

    @GetMapping("/")
    public String home() {
        return "home";
    }

    @GetMapping("/home.html")
    public String homeHtml() {
        return "home";
    }

    @GetMapping("/login.html")
    public String loginHtml() {
        return "login";
    }

    @GetMapping("/register.html")
    public String registerHtml() {
        return "register";
    }

    @GetMapping("/complaint.html")
    public String complaintHtml(@RequestParam(required = false) Integer user, org.springframework.ui.Model model) {
        if (user != null) {
            com.example.resolveit.model.User u = userRepository.findById(user).orElse(null);
            model.addAttribute("user", u);
            model.addAttribute("userId", user);
        }
        return "complaint";
    }

    @GetMapping("/success.html")
    public String successHtml() {
        return "success";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @GetMapping("/complaint")
    public String complaintPage(@RequestParam(required = false) Integer user, org.springframework.ui.Model model) {
        if (user != null) {
            com.example.resolveit.model.User u = userRepository.findById(user).orElse(null);
            model.addAttribute("user", u);
            model.addAttribute("userId", user);
        }
        return "complaint";
    }

    @GetMapping("/complaint/{id}")
    public String complaintDetails(@PathVariable int id,
            @RequestParam(required = false) Integer userId,
            Model model) {
        var complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return "redirect:/";
        }
        var history = complaintHistoryRepository.findByComplaintIdOrderByUpdatedAtDesc(id);
        // Reverse so oldest first (timeline top-to-bottom)
        java.util.Collections.reverse(history);
        model.addAttribute("complaint", complaint);
        model.addAttribute("history", history);

        // Determine dynamic back URL based on authenticated role
        String backUrl = "/my-complaints?userId=" + (userId != null ? userId : complaint.getUserId());
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            com.example.resolveit.model.User currentUser = userRepository.findByEmail(auth.getName());
            if (currentUser != null) {
                if ("ADMIN".equals(currentUser.getRole())) {
                    backUrl = "/admin";
                } else if ("STAFF".equals(currentUser.getRole())) {
                    backUrl = "/staff-dashboard";
                } else {
                    backUrl = "/my-complaints?userId=" + currentUser.getId();
                }
            }
        }
        model.addAttribute("backUrl", backUrl);
        model.addAttribute("userId", userId != null ? userId : complaint.getUserId());
        return "complaint-details";
    }
}