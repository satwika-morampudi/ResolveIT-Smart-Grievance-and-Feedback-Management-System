package com.resolveit.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComplaintResponse {
    private Long id;
    private String subject;
    private String category;
    private String description;
    private String urgency;
    private String status;
    private boolean anonymous;
    private String userEmail;
    private String assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}