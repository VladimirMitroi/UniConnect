package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.CourseMaterial;
import com.uniconnect.backendcore.model.TestEntity;
import com.uniconnect.backendcore.repository.CourseInstanceRepository;
import com.uniconnect.backendcore.repository.CourseMaterialRepository;
import com.uniconnect.backendcore.repository.QuestionRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.repository.TestRepository;
import com.uniconnect.backendcore.service.DocumentService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import com.uniconnect.backendcore.dto.PodcastResponseDTO;
import java.util.Map;
import java.util.HashMap;

import java.time.LocalDateTime;
import java.util.List;

import com.uniconnect.backendcore.repository.ProfessorRepository;
import com.uniconnect.backendcore.model.Professor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import java.util.Collections;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final RabbitTemplate rabbitTemplate;
    private final CourseMaterialRepository courseMaterialRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final QuestionRepository questionRepository;
    private final TestRepository testRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<String> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "courseInstanceId", required = false) Long courseInstanceId,
            Authentication auth
    ) {
        try {
            Professor professor = professorRepository.findByUser_Email(auth.getName()).orElse(null);
            String fileName = documentService.uploadDocument(file);

            CourseMaterial material = new CourseMaterial();
            material.setFileName(fileName);
            material.setTitle(file.getOriginalFilename() != null ? file.getOriginalFilename() : fileName);
            material.setOriginalFileName(file.getOriginalFilename());
            material.setContentType(file.getContentType());
            material.setSizeBytes(file.getSize());
            material.setMaterialType(CourseMaterial.MaterialType.FILE);

            if (courseInstanceId != null) {
                courseInstanceRepository.findById(courseInstanceId).ifPresent(material::setCourseInstance);
            }
            if (professor != null) {
                material.setUploadedByProfessorId(professor.getId());
            }

            courseMaterialRepository.save(material);

            return ResponseEntity.ok("Fișier încărcat cu succes în bibliotecă!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Eroare la încărcare: " + e.getMessage());
        }
    }

    @GetMapping("/files")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<CourseMaterial>> getUploadedFiles(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        List<CourseMaterial> allFiles = courseMaterialRepository.findAll();
        
        if (isAdmin) {
            return ResponseEntity.ok(allFiles);
        }
        
        Professor professor = professorRepository.findByUser_Email(auth.getName()).orElse(null);
        if (professor == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        Long profId = professor.getId();
        
        List<CourseMaterial> filtered = allFiles.stream()
            .filter(m -> {
                boolean isPodcast = m.getTitle() != null && m.getTitle().startsWith("🎙️ Podcast AI:");
                if (isPodcast) return false;
                
                if (m.getUploadedByProfessorId() != null && m.getUploadedByProfessorId().equals(profId)) {
                    return true;
                }
                
                if (m.getCourseInstance() != null && m.getCourseInstance().getProfessorId() != null && m.getCourseInstance().getProfessorId().equals(profId)) {
                    return true;
                }
                
                return false;
            })
            .toList();
            
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<String> generateTest(
            @RequestParam("fileName") String fileName,
            @RequestParam("testTitle") String testTitle,
            @RequestParam(value = "numQuestions", defaultValue = "3") int numQuestions,
            @RequestParam(value = "questionType", defaultValue = "single") String questionType,
            @RequestParam(value = "courseInstanceId", required = false) Long courseInstanceId,
            Authentication auth) {
        try {
            Professor professor = professorRepository.findByUser_Email(auth.getName()).orElse(null);

            TestEntity newTest = new TestEntity();
            newTest.setTitle(testTitle);
            newTest.setCourseName(fileName);
            newTest.setCreatedAt(LocalDateTime.now());
            newTest.setCourseInstanceId(courseInstanceId);
            if (professor != null) {
                newTest.setOwnerProfessorId(professor.getId());
            }
            newTest = testRepository.save(newTest);

            String rabbitMessage = String.format(
                    "{\"fileName\":\"%s\", \"numQuestions\":%d, \"questionType\":\"%s\", \"testId\":%d}",
                    fileName, numQuestions, questionType, newTest.getId()
            );

            rabbitTemplate.convertAndSend("course_queue", rabbitMessage);
            return ResponseEntity.ok("Testul '" + testTitle + "' se generează...");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Eroare: " + e.getMessage());
        }
    }

    @PostMapping("/generate-practice")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> generatePracticeTest(
            @RequestParam("fileName") String fileName,
            @RequestParam("testTitle") String testTitle,
            @RequestParam(value = "numQuestions", defaultValue = "3") int numQuestions,
            @RequestParam(value = "questionType", defaultValue = "mix") String questionType,
            @RequestParam("courseInstanceId") Long courseInstanceId,
            org.springframework.security.core.Authentication auth) {
        try {
            com.uniconnect.backendcore.model.Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
            if (student == null) return ResponseEntity.status(403).body("Acces interzis.");

            TestEntity newTest = new TestEntity();
            newTest.setTitle(testTitle + " (Antrenament)");
            newTest.setCourseName(fileName);
            newTest.setCreatedAt(LocalDateTime.now());
            newTest.setCourseInstanceId(courseInstanceId);
            newTest.setTestType("PRACTICE");
            newTest.setOwnerStudentId(student.getId());
            newTest = testRepository.save(newTest);

            String rabbitMessage = String.format(
                    "{\"fileName\":\"%s\", \"numQuestions\":%d, \"questionType\":\"%s\", \"testId\":%d}",
                    fileName, numQuestions, questionType, newTest.getId()
            );

            rabbitTemplate.convertAndSend("course_queue", rabbitMessage);
            return ResponseEntity.ok("Testul tău de antrenament se generează...");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Eroare: " + e.getMessage());
        }
    }

    @DeleteMapping("/test/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteTest(@PathVariable Long id) {
        questionRepository.deleteByTestId(id);
        testRepository.deleteById(id);
        return ResponseEntity.ok("Test șters cu succes.");
    }

    @GetMapping("/tests")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<TestEntity>> getAllTests(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        List<TestEntity> allTests = testRepository.findByIsReadyTrueAndTestTypeOrderByCreatedAtDesc("OFFICIAL");
        
        if (isAdmin) {
            return ResponseEntity.ok(allTests);
        }
        
        Professor professor = professorRepository.findByUser_Email(auth.getName()).orElse(null);
        if (professor == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        Long profId = professor.getId();
        List<Long> myCourseInstanceIds = courseInstanceRepository.findByProfessorId(profId)
                .stream()
                .map(com.uniconnect.backendcore.model.CourseInstance::getId)
                .toList();
                
        List<TestEntity> filtered = allTests.stream()
            .filter(test -> {
                 if (test.getOwnerProfessorId() != null && test.getOwnerProfessorId().equals(profId)) {
                     return true;
                 }
                 if (test.getCourseInstanceId() != null && myCourseInstanceIds.contains(test.getCourseInstanceId())) {
                     return true;
                 }
                 return false;
            })
            .toList();
            
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/podcast")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> generatePodcast(
            @RequestParam("fileName") String fileName,
            @RequestParam("courseInstanceId") Long courseInstanceId,
            @RequestParam(value = "sectionId", required = false) String sectionIdStr,
            org.springframework.security.core.Authentication auth) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String aiServiceUrl = "http://localhost:5001/generate-podcast";

            Map<String, String> pythonPayload = new HashMap<>();
            pythonPayload.put("file_name", fileName);

            PodcastResponseDTO response = restTemplate.postForObject(aiServiceUrl, pythonPayload, PodcastResponseDTO.class);
            if (response == null || response.getPodcastFileName() == null) {
                return ResponseEntity.badRequest().body("Eroare la generarea podcast-ului.");
            }

            String cleanName = fileName;
            if (cleanName != null && cleanName.length() > 37 && cleanName.charAt(36) == '_') {
                cleanName = cleanName.substring(37);
            }

            CourseMaterial podcastMat = new CourseMaterial();
            podcastMat.setFileName(response.getPodcastFileName());
            podcastMat.setTitle("🎙️ Podcast AI: " + cleanName);
            
            if (sectionIdStr != null && !sectionIdStr.equals("null") && !sectionIdStr.isEmpty()) {
                com.uniconnect.backendcore.model.CourseSection section = new com.uniconnect.backendcore.model.CourseSection();
                section.setId(Long.valueOf(sectionIdStr));
                podcastMat.setCourseSection(section);
            }

            podcastMat.setCourseInstance(courseInstanceRepository.findById(courseInstanceId).orElse(null));
            podcastMat.setCreatedAt(LocalDateTime.now());
            podcastMat.setMaterialType(CourseMaterial.MaterialType.FILE);
            
            if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
                com.uniconnect.backendcore.model.Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
                if (student != null) {
                    podcastMat.setUploadedByStudentId(student.getId());
                }
            }
            
            String url = documentService.getFileUrl(response.getPodcastFileName());
            podcastMat.setUrl(url);

            courseMaterialRepository.save(podcastMat);

            return ResponseEntity.ok(Map.of("message", "Podcast generat cu succes!", "fileName", response.getPodcastFileName()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare: " + e.getMessage());
        }
    }
}