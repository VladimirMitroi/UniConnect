package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CourseInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;          // ex: Cibernetica Sistemelor Economice, Serii de Timp
    private Long professorId;     // ID-ul profesorului titular
    private String professorName;

    private String serie;         // ex: A, B, C
    private String grupa;         // ex: 1045, 1083
    private Integer semestru;     // ex: 1, 2
    private boolean isMandatory;  // true = din oficiu pentru grupa respectivă, false = opțional/liber ales
}