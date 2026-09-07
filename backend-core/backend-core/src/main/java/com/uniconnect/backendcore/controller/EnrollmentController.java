package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.EnrollmentResponseDTO;
import com.uniconnect.backendcore.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponseDTO>> byStudent(@PathVariable Long studentId) {
        var enrollments = enrollmentRepository.findByStudent_Id(studentId);
        List<EnrollmentResponseDTO> result = enrollments.stream()
                .map(e -> EnrollmentResponseDTO.builder()
                        .id(e.getId())
                        .courseInstanceId(e.getCourseInstance().getId())
                        .courseName(e.getCourseInstance().getName())
                        .professorName(e.getCourseInstance().getProfessorName())
                        .notaSeminar(e.getNotaSeminar())
                        .notaExamen(e.getNotaExamen())
                        .notaFinala(e.getNotaFinala())
                        .status(e.getStatus())
                        .build())
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponseDTO> byStudentAndCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId
    ) {
        return enrollmentRepository.findByStudent_IdAndCourseInstance_Id(studentId, courseId)
                .map(e -> EnrollmentResponseDTO.builder()
                        .id(e.getId())
                        .courseInstanceId(e.getCourseInstance().getId())
                        .courseName(e.getCourseInstance().getName())
                        .professorName(e.getCourseInstance().getProfessorName())
                        .notaSeminar(e.getNotaSeminar())
                        .notaExamen(e.getNotaExamen())
                        .notaFinala(e.getNotaFinala())
                        .status(e.getStatus())
                        .build())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
