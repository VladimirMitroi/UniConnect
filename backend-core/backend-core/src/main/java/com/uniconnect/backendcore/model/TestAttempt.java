package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts")
@Data
@NoArgsConstructor
public class TestAttempt {

    public enum TestAttemptStatus {
        IN_PROGRESS,
        SUBMITTED,
        EXPIRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    private TestEntity test;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private TestAttemptStatus status;

    @Column(name = "score")
    private Double score;

    @Column(name = "violations_count", columnDefinition = "integer default 0")
    private Integer violationsCount = 0;
}

