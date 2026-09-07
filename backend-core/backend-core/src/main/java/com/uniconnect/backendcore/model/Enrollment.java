package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_instance_id"})
)
@Data
@NoArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_instance_id", nullable = false)
    private CourseInstance courseInstance;

    @Column(name = "nota_seminar")
    private Double notaSeminar;

    @Column(name = "nota_examen")
    private Double notaExamen;

    @Column(name = "nota_finala")
    private Double notaFinala;

    @Column(length = 20, nullable = false)
    private String status;

    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt = LocalDateTime.now();
}

