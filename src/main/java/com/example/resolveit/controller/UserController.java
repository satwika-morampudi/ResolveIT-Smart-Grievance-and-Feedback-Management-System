package com.example.resolveit.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.resolveit.repository.ComplaintRepository;

@Controller
public class UserController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping("/my-complaints")
    public String myComplaints(
            @RequestParam int userId,
            @org.springframework.web.bind.annotation.CookieValue(name = "jwtToken", required = false) String token,
            Model model) {

        model.addAttribute("complaints",
                complaintRepository.findByUserId(userId));
        model.addAttribute("userId", userId);
        model.addAttribute("token", token);

        return "my-complaints";
    }
}
