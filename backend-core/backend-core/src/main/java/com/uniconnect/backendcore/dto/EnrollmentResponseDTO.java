package com.uniconnect.backendcore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponseDTO {
    private Long id;
    private Long courseInstanceId;
    private String courseName;
    private String professorName;
    private Double notaSeminar;
    private Double notaExamen;
    private Double notaFinala;
    private String status;
}
