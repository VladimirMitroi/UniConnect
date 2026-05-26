package com.uniconnect.backendcore.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniconnect.backendcore.dto.GeneratedQuestionDTO;
import com.uniconnect.backendcore.model.Question;
import com.uniconnect.backendcore.repository.QuestionRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizResultListener {

    // 1. Îl instanțiem noi direct, în loc să așteptăm să ni-l dea Spring Boot
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final QuestionRepository questionRepository;

    // 2. Am scos ObjectMapper din constructor! Spring nu va mai crăpa aici.
    public QuizResultListener(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @RabbitListener(queues = "results_queue")
    public void receiveQuizResult(String jsonResult) {
        System.out.println("\n🎉 [JAVA] Am primit grilele de la AI! Încep parsarea și salvarea...");

        try {
            // Curățăm textul de formatarea markdown (```json ... ```)
            String cleanJson = jsonResult.replaceAll("```json", "").replaceAll("```", "").trim();

            // Transformăm textul JSON într-o listă de obiecte DTO
            List<GeneratedQuestionDTO> dtos = objectMapper.readValue(cleanJson, new TypeReference<List<GeneratedQuestionDTO>>() {});

            // Convertim și salvăm în DB
            for (GeneratedQuestionDTO dto : dtos) {
                Question question = new Question();
                question.setText(dto.getQuestion());
                question.setOptions(dto.getOptions());
                question.setCorrectAnswers(dto.getCorrectAnswers());
                question.setCourseName(dto.getCourseName());

                questionRepository.save(question);
            }

            System.out.println("✅ [JAVA] Succes! Am salvat " + dtos.size() + " întrebări în tabelul PostgreSQL!\n");

        } catch (Exception e) {
            System.err.println("❌ [JAVA] Eroare la procesarea JSON-ului: " + e.getMessage());
            System.err.println("JSON-ul primit a fost: \n" + jsonResult);
        }
    }
}