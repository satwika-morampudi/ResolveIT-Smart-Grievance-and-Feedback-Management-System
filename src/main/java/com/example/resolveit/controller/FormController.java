package com.example.resolveit.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.resolveit.model.Complaint;
import com.example.resolveit.model.ComplaintHistory;
import com.example.resolveit.model.User;
import com.example.resolveit.repository.ComplaintHistoryRepository;
import com.example.resolveit.repository.ComplaintRepository;
import com.example.resolveit.repository.UserRepository;

@Controller
@RequestMapping("/form")
public class FormController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintHistoryRepository complaintHistoryRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // ── Submit Complaint ──────────────────────────────────────────────────
    @PostMapping("/complaint")
    public String handleComplaint(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String urgency,
            @RequestParam(required = false, defaultValue = "Low") String priority,
            @RequestParam(required = false) String visibility,
            @RequestParam(required = false, defaultValue = "0") int userId,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) MultipartFile attachment) {

        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setCategory(category);
        complaint.setUrgency(urgency);
        complaint.setPriority(priority);
        complaint.setStatus("New");
        complaint.setVisibility(visibility != null ? visibility : "Public");
        complaint.setUserId(userId);
        complaint.setUserName(userName);
        complaint.setCreatedAt(LocalDateTime.now());

        // ── Handle file upload ──────────────────────────────────────────
        if (attachment != null && !attachment.isEmpty()) {
            try {
                Path uploadPath = Paths.get(uploadDir);
                Files.createDirectories(uploadPath);

                String originalName = attachment.getOriginalFilename();
                String extension = "";
                if (originalName != null && originalName.contains(".")) {
                    extension = originalName.substring(originalName.lastIndexOf("."));
                }
                String savedName = UUID.randomUUID().toString() + extension;

                Path filePath = uploadPath.resolve(savedName);
                Files.copy(attachment.getInputStream(), filePath);

                complaint.setAttachmentPath(uploadDir + File.separator + savedName);

            } catch (IOException e) {
                System.err.println("File upload failed: " + e.getMessage());
            }
        }

        Complaint saved = complaintRepository.save(complaint);

        // Save initial history entry
        ComplaintHistory history = new ComplaintHistory();
        history.setComplaintId(saved.getId());
        history.setStatus("New");
        history.setNote("Complaint submitted");
        history.setUpdatedBy(userName != null ? userName : "User");
        complaintHistoryRepository.save(history);

        return "redirect:/success.html?userId=" + userId;
    }
}
