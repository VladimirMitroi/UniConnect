package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.EnrollmentRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.repository.TestAttemptRepository;
import com.uniconnect.backendcore.repository.TestRepository;
import com.uniconnect.backendcore.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestAttemptController {

    private final StudentRepository studentRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestRepository testRepository;
    private final TestResultRepository testResultRepository;
    private final EnrollmentRepository enrollmentRepository;

    private static final Duration DEFAULT_TEST_DURATION = Duration.ofMinutes(30);

    @PostMapping("/{testId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> startTest(
            @PathVariable Long testId,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String studentEmail = authentication.getName();

        Student student = studentRepository.findByUser_Email(studentEmail).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        TestEntity test = testRepository.findById(testId).orElse(null);
        if (test == null) {
            return ResponseEntity.notFound().build();
        }
        if (!test.isReady()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Testul nu este încă pregătit.");
        }

        if (test.getCourseInstanceId() != null) {
            boolean enrolled = enrollmentRepository.existsByStudent_IdAndCourseInstance_Id(
                    student.getId(), test.getCourseInstanceId());
            if (!enrolled) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Nu ești înscris la cursul acestui test.");
            }
        }

        if (!"PRACTICE".equals(test.getTestType())) {
            boolean alreadyTaken = testAttemptRepository.existsByStudent_IdAndTest_IdAndStatusIn(
                    student.getId(), testId,
                    List.of(TestAttempt.TestAttemptStatus.SUBMITTED, TestAttempt.TestAttemptStatus.EXPIRED));
            if (alreadyTaken) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Ai susținut deja acest test. Testele oficiale pot fi susținute o singură dată.");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        var existingAttemptOpt = testAttemptRepository.findFirstByStudent_IdAndTest_IdAndStatusOrderByStartedAtDesc(
                student.getId(),
                testId,
                TestAttempt.TestAttemptStatus.IN_PROGRESS);

        if (existingAttemptOpt.isPresent()) {
            TestAttempt existingAttempt = existingAttemptOpt.get();
            if (now.isBefore(existingAttempt.getExpiresAt())) {
                return ResponseEntity.ok(buildAttemptPayload(existingAttempt));
            }

            existingAttempt.setStatus(TestAttempt.TestAttemptStatus.EXPIRED);
            testAttemptRepository.save(existingAttempt);
        }

        LocalDateTime expiresAt = now.plus(DEFAULT_TEST_DURATION);
        TestAttempt attempt = new TestAttempt();
        attempt.setStudent(student);
        attempt.setTest(test);
        attempt.setStartedAt(now);
        attempt.setExpiresAt(expiresAt);
        attempt.setStatus(TestAttempt.TestAttemptStatus.IN_PROGRESS);

        TestAttempt saved = testAttemptRepository.save(attempt);
        return ResponseEntity.ok(buildAttemptPayload(saved));
    }

    @PostMapping("/{testId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitTest(
            @PathVariable Long testId,
            @RequestBody SubmitTestRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String studentEmail = authentication.getName();

        Student student = studentRepository.findByUser_Email(studentEmail).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        TestEntity test = testRepository.findById(testId).orElse(null);
        if (test == null) {
            return ResponseEntity.notFound().build();
        }

        if (test.getCourseInstanceId() != null) {
            boolean enrolled = enrollmentRepository.existsByStudent_IdAndCourseInstance_Id(
                    student.getId(), test.getCourseInstanceId());
            if (!enrolled) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Nu ești înscris la cursul acestui test.");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        var attemptOpt = testAttemptRepository.findFirstByStudent_IdAndTest_IdAndStatusOrderByStartedAtDesc(
                student.getId(),
                testId,
                TestAttempt.TestAttemptStatus.IN_PROGRESS);

        if (attemptOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nu există un attempt activ pentru acest test.");
        }

        TestAttempt attempt = attemptOpt.get();
        if (now.isAfter(attempt.getExpiresAt())) {
            attempt.setStatus(TestAttempt.TestAttemptStatus.EXPIRED);
            testAttemptRepository.save(attempt);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Timpul pentru test a expirat.");
        }

        attempt.setSubmittedAt(now);
        attempt.setStatus(TestAttempt.TestAttemptStatus.SUBMITTED);
        attempt.setScore(request.getScore());
        attempt.setViolationsCount(request.getViolationsCount() != null ? request.getViolationsCount() : 0);
        TestAttempt saved = testAttemptRepository.save(attempt);

        TestResult result = new TestResult();
        result.setStudentEmail(studentEmail);
        result.setCourseName(test.getCourseName());
        result.setScore(request.getScore());
        result.setViolationsCount(request.getViolationsCount() != null ? request.getViolationsCount() : 0);
        result.setDate(LocalDateTime.now());
        testResultRepository.save(result);

        return ResponseEntity.ok(buildAttemptPayload(saved));
    }

    private static AttemptPayload buildAttemptPayload(TestAttempt attempt) {
        long expiresAtEpochMillis = attempt.getExpiresAt()
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
        return AttemptPayload.builder()
                .id(attempt.getId())
                .testId(attempt.getTest().getId())
                .status(attempt.getStatus().name())
                .expiresAt(attempt.getExpiresAt().toString())
                .expiresAtEpochMillis(expiresAtEpochMillis)
                .build();
    }

    @GetMapping("/student/available")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getAvailableTests(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Student student = studentRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Long> enrolledCourseIds = enrollmentRepository.findByStudent_Id(student.getId())
                .stream()
                .map(e -> e.getCourseInstance().getId())
                .toList();

        if (enrolledCourseIds.isEmpty()) {
            enrolledCourseIds = List.of(-1L);
        }

        return ResponseEntity.ok(testRepository.findAvailableForStudent(enrolledCourseIds, student.getId()));
    }

    @Data
    public static class SubmitTestRequest {
        private Double score;
        private Integer violationsCount;
    }

    @lombok.Data
    @lombok.Builder
    public static class AttemptPayload {
        private Long id;
        private Long testId;
        private String status;
        private String expiresAt;
        private Long expiresAtEpochMillis;
    }
}
