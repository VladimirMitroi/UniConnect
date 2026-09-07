package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.GradebookItemDTO;
import com.uniconnect.backendcore.dto.GradebookResponseDTO;
import com.uniconnect.backendcore.dto.GradebookStudentDTO;
import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/gradebook")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class GradebookController {

    private final CourseInstanceRepository courseInstanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TestRepository testRepository;
    private final AssignmentRepository assignmentRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final StudentRepository studentRepository;

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<GradebookResponseDTO> getCourseGradebook(@PathVariable Long courseId) {
        
        GradebookResponseDTO response = new GradebookResponseDTO();
        
        List<TestEntity> tests = testRepository.findByCourseInstanceIdAndTestType(courseId, "OFFICIAL");
        List<Assignment> assignments = assignmentRepository.findByCourseInstance_IdOrderByDeadlineAsc(courseId);
        
        for (TestEntity t : tests) {
            response.getItems().add(new GradebookItemDTO(t.getId(), t.getTitle(), t.getWeight(), "TEST"));
        }
        for (Assignment a : assignments) {
            response.getItems().add(new GradebookItemDTO(a.getId(), a.getTitle(), a.getWeight(), "ASSIGNMENT"));
        }
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourseInstance_Id(courseId);
        
        for (Enrollment e : enrollments) {
            Student student = e.getStudent();
            GradebookStudentDTO stuDTO = new GradebookStudentDTO();
            stuDTO.setStudentId(student.getId());
            stuDTO.setFirstName(student.getFirstName());
            stuDTO.setLastName(student.getLastName());
            
            double sumWeightedGrades = 0;
            int sumWeights = 0;
            
            for (TestEntity t : tests) {
                String key = "TEST_" + t.getId();
                double score = 0.0;
                
                List<TestAttempt> attempts = testAttemptRepository.findByStudent_IdAndTest_Id(student.getId(), t.getId());
                for (TestAttempt att : attempts) {
                    if (att.getStatus() == TestAttempt.TestAttemptStatus.SUBMITTED && att.getScore() != null) {
                        score = Math.max(score, att.getScore());
                    }
                }
                stuDTO.getGrades().put(key, score);
                
                if (t.getWeight() != null && t.getWeight() > 0) {
                    sumWeightedGrades += (score * t.getWeight());
                    sumWeights += t.getWeight();
                }
            }
            
            for (Assignment a : assignments) {
                String key = "ASSIGNMENT_" + a.getId();
                double score = 0.0;
                
                Optional<AssignmentSubmission> subOpt = assignmentSubmissionRepository.findByAssignment_IdAndStudent_Id(a.getId(), student.getId());
                if (subOpt.isPresent() && subOpt.get().getGrade() != null) {
                    score = subOpt.get().getGrade();
                }
                stuDTO.getGrades().put(key, score);
                
                if (a.getWeight() != null && a.getWeight() > 0) {
                    sumWeightedGrades += (score * a.getWeight());
                    sumWeights += a.getWeight();
                }
            }
            
            if (sumWeights > 0) {
                stuDTO.setFinalGrade((double) Math.round((sumWeightedGrades / sumWeights) * 100) / 100);
            } else {
                stuDTO.setFinalGrade(0.0);
            }
            
            response.getStudents().add(stuDTO);
        }
        
        response.getStudents().sort(Comparator.comparing(GradebookStudentDTO::getLastName).thenComparing(GradebookStudentDTO::getFirstName));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentGradebook(@PathVariable Long studentId, @PathVariable Long courseId, Authentication auth) {
        
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();
        
        GradebookStudentDTO stuDTO = new GradebookStudentDTO();
        stuDTO.setStudentId(student.getId());
        stuDTO.setFirstName(student.getFirstName());
        stuDTO.setLastName(student.getLastName());
        
        List<TestEntity> tests = testRepository.findByCourseInstanceIdAndTestType(courseId, "OFFICIAL");
        List<Assignment> assignments = assignmentRepository.findByCourseInstance_IdOrderByDeadlineAsc(courseId);
        
        double sumWeightedGrades = 0;
        int sumWeights = 0;
        
        for (TestEntity t : tests) {
            String key = "TEST_" + t.getId();
            double score = 0.0;
            List<TestAttempt> attempts = testAttemptRepository.findByStudent_IdAndTest_Id(student.getId(), t.getId());
            for (TestAttempt att : attempts) {
                if (att.getStatus() == TestAttempt.TestAttemptStatus.SUBMITTED && att.getScore() != null) {
                    score = Math.max(score, att.getScore());
                }
            }
            stuDTO.getGrades().put(key, score);
            
            if (t.getWeight() != null && t.getWeight() > 0) {
                sumWeightedGrades += (score * t.getWeight());
                sumWeights += t.getWeight();
            }
        }
        
        for (Assignment a : assignments) {
            String key = "ASSIGNMENT_" + a.getId();
            double score = 0.0;
            Optional<AssignmentSubmission> subOpt = assignmentSubmissionRepository.findByAssignment_IdAndStudent_Id(a.getId(), student.getId());
            if (subOpt.isPresent() && subOpt.get().getGrade() != null) {
                score = subOpt.get().getGrade();
            }
            stuDTO.getGrades().put(key, score);
            
            if (a.getWeight() != null && a.getWeight() > 0) {
                sumWeightedGrades += (score * a.getWeight());
                sumWeights += a.getWeight();
            }
        }
        
        if (sumWeights > 0) {
            stuDTO.setFinalGrade((double) Math.round((sumWeightedGrades / sumWeights) * 100) / 100);
        } else {
            stuDTO.setFinalGrade(0.0);
        }
        
        List<GradebookItemDTO> items = new ArrayList<>();
        for (TestEntity t : tests) {
            items.add(new GradebookItemDTO(t.getId(), t.getTitle(), t.getWeight(), "TEST"));
        }
        for (Assignment a : assignments) {
            items.add(new GradebookItemDTO(a.getId(), a.getTitle(), a.getWeight(), "ASSIGNMENT"));
        }
        
        return ResponseEntity.ok(Map.of(
            "student", stuDTO,
            "items", items
        ));
    }
    
    @PutMapping("/course/{courseId}/weights")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateWeights(@PathVariable Long courseId, @RequestBody Map<String, Map<String, Integer>> payload) {
        
        Map<String, Integer> testWeights = payload.get("tests");
        Map<String, Integer> assignmentWeights = payload.get("assignments");
        
        if (testWeights != null) {
            for (Map.Entry<String, Integer> entry : testWeights.entrySet()) {
                Long testId = Long.parseLong(entry.getKey());
                testRepository.findById(testId).ifPresent(t -> {
                    if (t.getCourseInstanceId() != null && t.getCourseInstanceId().equals(courseId)) {
                        t.setWeight(entry.getValue());
                        testRepository.save(t);
                    }
                });
            }
        }
        
        if (assignmentWeights != null) {
            for (Map.Entry<String, Integer> entry : assignmentWeights.entrySet()) {
                Long assignmentId = Long.parseLong(entry.getKey());
                assignmentRepository.findById(assignmentId).ifPresent(a -> {
                    if (a.getCourseInstance().getId().equals(courseId)) {
                        a.setWeight(entry.getValue());
                        assignmentRepository.save(a);
                    }
                });
            }
        }
        
        return ResponseEntity.ok(Map.of("message", "Ponderile au fost actualizate cu succes!"));
    }
}
