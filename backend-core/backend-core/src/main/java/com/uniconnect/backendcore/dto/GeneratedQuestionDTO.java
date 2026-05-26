package com.uniconnect.backendcore.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeneratedQuestionDTO {
    private String question;
    private List<String> options;
    private List<String> correctAnswers;
    private String type; // NOU: Pentru single/multiple
    private Long testId; // NOU: Înlocuiește courseName
}