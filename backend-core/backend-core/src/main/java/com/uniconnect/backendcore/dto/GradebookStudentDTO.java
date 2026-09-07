package com.uniconnect.backendcore.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
public class GradebookStudentDTO {
    private Long studentId;
    private String firstName;
    private String lastName;
    
    private Map<String, Double> grades = new HashMap<>();
    
    private Double finalGrade;
}
