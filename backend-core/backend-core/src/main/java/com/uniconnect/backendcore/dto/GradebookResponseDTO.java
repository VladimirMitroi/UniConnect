package com.uniconnect.backendcore.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class GradebookResponseDTO {
    private List<GradebookItemDTO> items = new ArrayList<>();
    private List<GradebookStudentDTO> students = new ArrayList<>();
}
