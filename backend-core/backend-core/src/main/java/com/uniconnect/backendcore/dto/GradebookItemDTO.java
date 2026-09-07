package com.uniconnect.backendcore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradebookItemDTO {
    private Long id;
    private String title;
    private Integer weight;
    private String type;
}
