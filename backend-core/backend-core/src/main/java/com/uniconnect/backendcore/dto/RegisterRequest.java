package com.uniconnect.backendcore.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String role; // Aici primim "ROLE_TEACHER" sau "ROLE_STUDENT"
}