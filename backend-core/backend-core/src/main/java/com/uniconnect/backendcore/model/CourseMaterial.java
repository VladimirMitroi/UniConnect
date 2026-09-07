package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_materials")
@Data
@NoArgsConstructor
public class CourseMaterial {

    public enum MaterialType {
        FILE,
        LINK,
        VIDEO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "course_instance_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CourseInstance courseInstance;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_section_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "courseInstance"})
    private CourseSection courseSection;

    @Column(name = "uploaded_by_professor_id")
    private Long uploadedByProfessorId;

    @Column(name = "uploaded_by_student_id")
    private Long uploadedByStudentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_type", length = 20, nullable = false)
    private MaterialType materialType = MaterialType.FILE;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(name = "file_name", length = 512, nullable = false)
    private String fileName;

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "content_type", length = 255)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(length = 1024)
    private String url;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

