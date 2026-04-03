package com.resolveit.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EscalationResponse {
    private Long id;
    private Long complaintId;
    private String complaintSubject;
    private String reason;
    private String escalatedBy;
    private String escalatedTo;
    private boolean resolved;
    private boolean autoEscalated;
    private LocalDateTime escalatedAt;
}