package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.Question;
import com.uniconnect.backendcore.repository.QuestionRepository;
import com.uniconnect.backendcore.repository.TestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final TestRepository testRepository;

    public QuestionController(QuestionRepository questionRepository, TestRepository testRepository) {
        this.questionRepository = questionRepository;
        this.testRepository = testRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionRepository.findAll();
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        return questionRepository.findById(id)
                .map(question -> {
                    questionRepository.delete(question);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter-by-test")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Question>> getQuestionsByTest(@RequestParam Long testId) {
        return ResponseEntity.ok(questionRepository.findByTestId(testId));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Question>> getCourseQuestionBank(@PathVariable Long courseId) {
        return ResponseEntity.ok(questionRepository.findByCourseInstanceId(courseId));
    }

    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<String>> getCourseNames() {
        return ResponseEntity.ok(testRepository.findDistinctReadyCourseNames());
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<Question>> filterByCourseName(@RequestParam("name") String name) {
        return ResponseEntity.ok(questionRepository.findByCourseName(name));
    }
}