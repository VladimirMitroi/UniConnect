package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.Question;
import com.uniconnect.backendcore.repository.QuestionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Endpoint pentru a extrage toate grilele din baza de date
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionRepository.findAll();
        return ResponseEntity.ok(questions);
    }

    // Endpoint pentru actualizarea unei grile
    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question updatedQuestion) {
        return questionRepository.findById(id)
                .map(existingQuestion -> {
                    existingQuestion.setText(updatedQuestion.getText());
                    existingQuestion.setOptions(updatedQuestion.getOptions());
                    existingQuestion.setCorrectAnswers(updatedQuestion.getCorrectAnswers());

                    Question savedQuestion = questionRepository.save(existingQuestion);
                    return ResponseEntity.ok(savedQuestion);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint pentru ștergerea unei grile
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        return questionRepository.findById(id)
                .map(question -> {
                    questionRepository.delete(question);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter-by-test")
    public ResponseEntity<List<Question>> getQuestionsByTest(@RequestParam Long testId) {
        return ResponseEntity.ok(questionRepository.findByTestId(testId));
    }
}