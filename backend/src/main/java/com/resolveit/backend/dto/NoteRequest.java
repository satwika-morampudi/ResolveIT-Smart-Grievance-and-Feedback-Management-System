package com.resolveit.backend.dto;

import lombok.Data;

@Data
public class NoteRequest {
    private String content;
    private String type; // INTERNAL or PUBLIC
}