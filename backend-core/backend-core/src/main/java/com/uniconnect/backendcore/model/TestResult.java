package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;
    private String courseName;
    private Double score;
    private LocalDateTime date;

    @Column(name = "violations_count", columnDefinition = "integer default 0")
    private Integer violationsCount = 0;
}