package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.TestResult;
import com.uniconnect.backendcore.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class TestResultController {

    private final TestResultRepository repository;

    @PostMapping("/save")
    public ResponseEntity<?> saveResult(@RequestBody TestResult result, Authentication auth) {
        result.setStudentEmail(auth.getName()); // Setăm automat email-ul celui logat
        result.setDate(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(result));
    }

    @GetMapping("/averages")
    public List<Map<String, Object>> getAverages() {
        return repository.findAveragesPerCourse();
    }

    @GetMapping("/course/{name}")
    public List<TestResult> getCourseResults(@PathVariable String name) {
        return repository.findByCourseName(name);
    }
}