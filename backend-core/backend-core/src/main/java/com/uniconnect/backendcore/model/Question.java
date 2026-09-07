package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long testId;

    @Column(columnDefinition = "TEXT")
    private String text;
    @ElementCollection
    private List<String> options;
    @ElementCollection
    private List<String> correctAnswers;
    private String type;
}