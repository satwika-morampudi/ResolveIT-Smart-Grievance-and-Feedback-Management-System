package com.resolveit.backend.dto;

import lombok.Data;

@Data
public class EscalationRequest {
    private Long complaintId;
    private String reason;
}