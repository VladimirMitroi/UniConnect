package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CourseFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
}