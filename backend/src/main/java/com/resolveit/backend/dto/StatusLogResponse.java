package com.resolveit.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StatusLogResponse {
    private Long id;
    private String status;
    private String comment;
    private String updatedBy;
    private LocalDateTime updatedAt;
}