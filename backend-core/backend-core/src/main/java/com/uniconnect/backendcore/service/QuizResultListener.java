package com.uniconnect.backendcore.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniconnect.backendcore.dto.GeneratedQuestionDTO;
import com.uniconnect.backendcore.model.Question;
import com.uniconnect.backendcore.repository.QuestionRepository;
import com.uniconnect.backendcore.repository.TestRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizResultListener {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final QuestionRepository questionRepository;

    private final TestRepository testRepository;

    public QuizResultListener(QuestionRepository questionRepository, TestRepository testRepository) {
        this.questionRepository = questionRepository;
        this.testRepository = testRepository;
    }

    @RabbitListener(queues = "results_queue")
    public void receiveQuizResult(String jsonResult) {
        System.out.println("\n[JAVA] Am primit grilele de la AI! Încep parsarea și salvarea...");

        try {
            String cleanJson = jsonResult.replaceAll("```json", "").replaceAll("```", "").trim();

            List<GeneratedQuestionDTO> dtos = objectMapper.readValue(cleanJson, new TypeReference<List<GeneratedQuestionDTO>>() {});

            for (GeneratedQuestionDTO dto : dtos) {
                Question question = new Question();
                question.setText(dto.getQuestion());
                question.setOptions(dto.getOptions());
                question.setCorrectAnswers(dto.getCorrectAnswers());

                question.setType(dto.getType());
                question.setTestId(dto.getTestId());

                questionRepository.save(question);
            }

            Long testId = dtos.get(0).getTestId();
            testRepository.findById(testId).ifPresent(test -> {
                test.setReady(true);
                testRepository.save(test);
            });

            System.out.println("[JAVA] Succes! Am salvat " + dtos.size() + " întrebări în tabelul PostgreSQL!\n");

        } catch (Exception e) {
            System.err.println("[JAVA] Eroare la procesarea JSON-ului: " + e.getMessage());
            System.err.println("JSON-ul primit a fost: \n" + jsonResult);
        }
    }
}