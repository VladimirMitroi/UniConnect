package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final DocumentService documentService; // Injectăm serviciul de documente

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCourse(@RequestParam("file") MultipartFile file) {
        try {
            // DocumentService va salva fișierul și va striga automat în RabbitMQ!
            String savedFileName = documentService.uploadDocument(file);

            return ResponseEntity.ok(Map.of(
                    "message", "Curs primit, salvat în MinIO și trimis spre procesare AI!",
                    "fileName", savedFileName
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Eroare la procesarea fișierului: " + e.getMessage());
        }
    }
}