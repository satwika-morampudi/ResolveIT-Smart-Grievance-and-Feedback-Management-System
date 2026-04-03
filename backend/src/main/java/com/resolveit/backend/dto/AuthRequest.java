package com.resolveit.backend.dto;
import lombok.Data;

@Data
public class AuthRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "USER", "STAFF", "ADMIN", "SUPER_ADMIN"
}