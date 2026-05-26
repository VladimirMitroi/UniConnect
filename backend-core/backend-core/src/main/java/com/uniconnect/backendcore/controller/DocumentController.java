package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.CourseFile;
import com.uniconnect.backendcore.model.TestEntity;
import com.uniconnect.backendcore.repository.CourseFileRepository;
import com.uniconnect.backendcore.repository.QuestionRepository;
import com.uniconnect.backendcore.repository.TestRepository;
import com.uniconnect.backendcore.service.DocumentService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final RabbitTemplate rabbitTemplate;
    private final CourseFileRepository courseFileRepository;

    // 1. Aici este declarată
    private final QuestionRepository questionRepository;
    private final TestRepository testRepository;

    // 2. Aici este CONSTRUCTORUL. Trebuie să le primească pe toate 4 ca parametri!
    public DocumentController(DocumentService documentService,
                              RabbitTemplate rabbitTemplate,
                              CourseFileRepository courseFileRepository,
                              QuestionRepository questionRepository,
                              TestRepository testRepository) {

        this.documentService = documentService;
        this.rabbitTemplate = rabbitTemplate;
        this.courseFileRepository = courseFileRepository;

        // 3. Aici este "inițializată" (adică rezolvă eroarea ta)
        this.questionRepository = questionRepository;
        this.testRepository= testRepository;
    }

    // 1. DOAR UPLOAD (Nu mai generează nimic)
    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = documentService.uploadDocument(file);

            // Salvăm numele în baza de date ca să știm că există
            CourseFile courseFile = new CourseFile();
            courseFile.setFileName(fileName);
            courseFileRepository.save(courseFile);

            return ResponseEntity.ok("Fișier încărcat cu succes în bibliotecă!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Eroare la încărcare: " + e.getMessage());
        }
    }

    // 2. ADUCE LISTA DE PDF-URI PENTRU DROPDOWN-UL DIN REACT
    @GetMapping("/files")
    public ResponseEntity<List<CourseFile>> getUploadedFiles() {
        return ResponseEntity.ok(courseFileRepository.findAll());
    }

    // 3. BUTONUL "GENEREAZĂ TEST"
    @PostMapping("/generate")
    public ResponseEntity<String> generateTest(
            @RequestParam("fileName") String fileName,
            @RequestParam("testTitle") String testTitle, // NOU
            @RequestParam(value = "numQuestions", defaultValue = "3") int numQuestions,
            @RequestParam(value = "questionType", defaultValue = "single") String questionType) {
        try {
            // 1. Salvăm testul în bază pentru a genera un ID
            TestEntity newTest = new TestEntity();
            newTest.setTitle(testTitle);
            newTest.setCourseName(fileName);
            newTest.setCreatedAt(LocalDateTime.now());
            newTest = testRepository.save(newTest);

            // 2. Trimitem ID-ul testului către Python
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

    // RUTA NOUĂ PENTRU ȘTERGERE
    @DeleteMapping("/test/{id}")
    public ResponseEntity<?> deleteTest(@PathVariable Long id) {
        questionRepository.deleteByTestId(id); // Trebuie să adaugi metoda asta în QuestionRepository
        testRepository.deleteById(id);
        return ResponseEntity.ok("Test șters cu succes.");
    }
}