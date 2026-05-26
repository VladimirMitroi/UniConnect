package com.uniconnect.backendcore.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class TestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;      // Numele dat de tine (ex: "Test 1")
    private String courseName; // Numele PDF-ului sursă
    private LocalDateTime createdAt;
    private boolean isReady = false;
}