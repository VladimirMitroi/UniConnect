package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.TestResult;
import com.uniconnect.backendcore.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.uniconnect.backendcore.repository.ProfessorRepository;
import com.uniconnect.backendcore.repository.CourseInstanceRepository;
import com.uniconnect.backendcore.repository.TestRepository;
import com.uniconnect.backendcore.model.Professor;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class TestResultController {

    private final TestResultRepository repository;
    private final ProfessorRepository professorRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final TestRepository testRepository;

    @PostMapping("/save")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> saveResult(@RequestBody TestResult result, Authentication auth) {
        result.setStudentEmail(auth.getName());
        result.setDate(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(result));
    }

    @GetMapping("/averages")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public List<Map<String, Object>> getAverages(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            return repository.findAveragesPerCourse();
        }
        
        Professor professor = professorRepository.findByUser_Email(auth.getName()).orElse(null);
        if (professor == null) {
            return Collections.emptyList();
        }
        
        Set<String> courseNames = courseInstanceRepository.findByProfessorId(professor.getId())
                .stream()
                .map(com.uniconnect.backendcore.model.CourseInstance::getName)
                .collect(Collectors.toSet());
                
        testRepository.findByOwnerProfessorId(professor.getId())
                .forEach(test -> {
                    if (test.getCourseName() != null) {
                        courseNames.add(test.getCourseName());
                    }
                });
                
        if (courseNames.isEmpty()) {
            return Collections.emptyList();
        }
        
        return repository.findAveragesByCourseNameIn(new ArrayList<>(courseNames));
    }

    @GetMapping("/course/{name}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public List<TestResult> getCourseResults(@PathVariable String name) {
        return repository.findByCourseName(name);
    }
}