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

    // Modificat din 'questionText' în 'text' pentru a se potrivi cu React (q.text)
    private String text;

    // Modificat din optionA, optionB etc. într-o listă pentru a se potrivi cu React (q.options.map)
    private List<String> options;

    // Modificat pentru a suporta mai multe răspunsuri corecte
    private List<String> correctAnswers;

    // Noul câmp hibrid
    private String type;
}