package com.resolveit.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteResponse {
    private Long id;
    private String content;
    private String type;
    private String authorEmail;
    private String authorName;
    private LocalDateTime createdAt;
}