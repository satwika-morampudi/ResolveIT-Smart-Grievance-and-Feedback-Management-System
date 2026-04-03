package com.resolveit.backend.dto;

import lombok.Data;

@Data
public class ComplaintRequest {
    private String subject;
    private String category;
    private String description;
    private String urgency;
    private boolean anonymous;
}