package com.uniconnect.backendcore.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class TestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String courseName;
    private LocalDateTime createdAt;
    private boolean isReady = false;

    @Column(name = "course_instance_id")
    private Long courseInstanceId;

    @Column(name = "test_type", length = 20)
    private String testType = "OFFICIAL";

    @Column(name = "owner_student_id")
    private Long ownerStudentId;

    @Column(name = "owner_professor_id")
    private Long ownerProfessorId;

    @Column(name = "weight", columnDefinition = "integer default 0")
    private Integer weight = 0;

    @Column(name = "deadline")
    private LocalDateTime deadline;
}