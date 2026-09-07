package com.uniconnect.backendcore.dto;

import lombok.Data;

@Data
public class AutoGradeResponseDTO {
    private Double suggestedGrade;
    private String feedback;
}
