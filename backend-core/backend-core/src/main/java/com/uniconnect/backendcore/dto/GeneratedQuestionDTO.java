package com.uniconnect.backendcore.dto;

import lombok.Data;
import java.util.List;

@Data
public class GeneratedQuestionDTO {
    // Numele variabilelor trebuie să fie exact ca "cheile" din JSON-ul primit de la Gemini
    private String question;
    private List<String> options;

    // --- MODIFICAT: Acum este o listă ---
    private List<String> correctAnswers;

    // --- NOU: Pentru a ști dacă e cu un răspuns sau cu mai multe ---
    private String type;

    private String courseName;
}