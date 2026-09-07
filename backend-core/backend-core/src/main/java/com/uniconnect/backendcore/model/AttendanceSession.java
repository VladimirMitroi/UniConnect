package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class AttendanceSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_instance_id", nullable = false)
    private CourseInstance courseInstance;

    @ManyToOne
    @JoinColumn(name = "course_section_id", nullable = false)
    private CourseSection courseSection;

    @Column(nullable = false, unique = true)
    private String uniqueCode;

    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
