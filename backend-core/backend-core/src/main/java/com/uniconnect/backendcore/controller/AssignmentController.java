package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import com.uniconnect.backendcore.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import com.uniconnect.backendcore.dto.AutoGradeResponseDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DocumentService documentService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createAssignment(@RequestBody Assignment assignment, Authentication authentication) {
        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseInstance course = courseInstanceRepository.findById(assignment.getCourseInstance().getId()).orElse(null);
        if (course == null || !course.getProfessorId().equals(prof.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Nu sunteți titularul acestui curs."));
        }

        assignment.setCourseInstance(course);
        assignmentRepository.save(assignment);
        return ResponseEntity.ok(Map.of("message", "Tema a fost creată cu succes!"));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getAssignmentsForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentRepository.findByCourseInstance_IdOrderByDeadlineAsc(courseId));
    }

    @PostMapping("/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        Student student = studentRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (student == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) return ResponseEntity.notFound().build();

        if (submissionRepository.existsByAssignment_IdAndStudent_Id(assignmentId, student.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ai încărcat deja o rezolvare pentru această temă."));
        }

        try {
            String savedFileName = documentService.uploadFileOnly(file);

            AssignmentSubmission submission = new AssignmentSubmission();
            submission.setAssignment(assignment);
            submission.setStudent(student);
            submission.setFileName(savedFileName);
            submission.setOriginalFileName(file.getOriginalFilename());
            submissionRepository.save(submission);

            return ResponseEntity.ok(Map.of("message", "Rezolvarea a fost trimisă!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getSubmissions(@PathVariable Long assignmentId, Authentication authentication) {
        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) return ResponseEntity.notFound().build();

        if (!assignment.getCourseInstance().getProfessorId().equals(prof.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acces interzis."));
        }

        return ResponseEntity.ok(submissionRepository.findByAssignment_IdOrderBySubmissionDateDesc(assignmentId));
    }

    @GetMapping("/{assignmentId}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMySubmission(@PathVariable Long assignmentId, Authentication authentication) {
        Student student = studentRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (student == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return submissionRepository.findByAssignment_IdAndStudent_Id(assignmentId, student.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {

        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        AssignmentSubmission submission = submissionRepository.findById(submissionId).orElse(null);
        if (submission == null) return ResponseEntity.notFound().build();

        if (!submission.getAssignment().getCourseInstance().getProfessorId().equals(prof.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Nu aveți acces."));
        }

        Double grade = payload.get("grade") != null ? Double.valueOf(payload.get("grade").toString()) : null;
        String feedback = payload.get("feedback") != null ? payload.get("feedback").toString() : null;

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submissionRepository.save(submission);

        updateSeminarGrade(submission.getStudent().getId(), submission.getAssignment().getCourseInstance().getId());

        return ResponseEntity.ok(Map.of("message", "Notă salvată cu succes!"));
    }

    @PostMapping("/submissions/{submissionId}/auto-grade")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> autoGradeSubmission(@PathVariable Long submissionId, Authentication authentication) {
        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        AssignmentSubmission submission = submissionRepository.findById(submissionId).orElse(null);
        if (submission == null) return ResponseEntity.notFound().build();

        if (!submission.getAssignment().getCourseInstance().getProfessorId().equals(prof.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Nu aveți acces."));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String aiServiceUrl = "http://localhost:5001/grade-submission";

            Map<String, String> pythonPayload = Map.of(
                    "assignment_description", submission.getAssignment().getDescription() != null ? submission.getAssignment().getDescription() : "Fără cerință",
                    "file_name", submission.getFileName()
            );

            AutoGradeResponseDTO response = restTemplate.postForObject(aiServiceUrl, pythonPayload, AutoGradeResponseDTO.class);
            
            if (response == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Răspuns gol de la AI."));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Eroare la comunicarea cu AI: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{fileName}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<?> getDownloadUrl(@PathVariable String fileName) {
        try {
            String url = documentService.getFileUrl(fileName);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    private void updateSeminarGrade(Long studentId, Long courseInstanceId) {
        List<AssignmentSubmission> gradedSubmissions = submissionRepository
                .findByStudent_IdAndAssignment_CourseInstance_IdAndGradeIsNotNull(studentId, courseInstanceId);

        if (gradedSubmissions.isEmpty()) return;

        double sum = 0;
        for (AssignmentSubmission s : gradedSubmissions) {
            sum += s.getGrade();
        }
        double average = sum / gradedSubmissions.size();

        enrollmentRepository.findByStudent_IdAndCourseInstance_Id(studentId, courseInstanceId)
                .ifPresent(enrollment -> {
                    enrollment.setNotaSeminar(average);
                    enrollmentRepository.save(enrollment);
                });
    }
}
