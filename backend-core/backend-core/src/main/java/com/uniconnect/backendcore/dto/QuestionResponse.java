package com.uniconnect.backendcore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionResponse {
    private Long id;
    private String courseName;

    private String text;

    private List<String> options;

    private List<String> correctAnswers;

    private String type;
}