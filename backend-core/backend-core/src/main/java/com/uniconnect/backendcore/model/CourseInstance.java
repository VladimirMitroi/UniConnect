package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Data
public class CourseInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Long professorId;
    private String professorName;

    private String serie;
    private String grupa;
    private Integer semestru;

    @JsonProperty("isMandatory")
    private boolean isMandatory;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;
}