package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class EnrollmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseInstanceId;
    private String courseName;

    private Long studentId;
    private String studentName;
    private String studentGrupa;

    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime createdAt = LocalDateTime.now();
}