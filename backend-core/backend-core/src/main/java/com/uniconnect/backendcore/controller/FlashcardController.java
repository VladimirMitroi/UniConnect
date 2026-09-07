package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.FlashcardResponseDTO;
import com.uniconnect.backendcore.model.FlashcardDeck;
import com.uniconnect.backendcore.model.FlashcardItem;
import com.uniconnect.backendcore.model.Student;
import com.uniconnect.backendcore.repository.FlashcardDeckRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FlashcardController {

    private final FlashcardDeckRepository flashcardDeckRepository;
    private final StudentRepository studentRepository;

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<FlashcardDeck>> getDecks(@PathVariable Long courseId, org.springframework.security.core.Authentication auth) {
        Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
        if (student == null) return ResponseEntity.status(403).build();

        List<FlashcardDeck> decks = flashcardDeckRepository.findByCourseInstanceIdAndStudentIdOrderByCreatedAtDesc(courseId, student.getId());
        return ResponseEntity.ok(decks);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> generateDeck(
            @RequestParam("courseId") Long courseId,
            @RequestParam("fileName") String fileName,
            @RequestParam("title") String title,
            org.springframework.security.core.Authentication auth) {
        try {
            Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
            if (student == null) return ResponseEntity.status(403).body("Acces interzis");

            RestTemplate restTemplate = new RestTemplate();
            String aiServiceUrl = "http://localhost:5001/flashcards";

            Map<String, Object> pythonPayload = new HashMap<>();
            pythonPayload.put("message", "");
            pythonPayload.put("fileNames", List.of(fileName));

            FlashcardResponseDTO response = restTemplate.postForObject(aiServiceUrl, pythonPayload, FlashcardResponseDTO.class);

            if (response == null || response.getFlashcards() == null || response.getFlashcards().isEmpty()) {
                return ResponseEntity.badRequest().body("AI-ul nu a putut genera flashcards din acest document.");
            }

            FlashcardDeck deck = new FlashcardDeck();
            deck.setTitle(title);
            deck.setCourseInstanceId(courseId);
            deck.setStudentId(student.getId());
            deck.setCreatedAt(LocalDateTime.now());

            for (FlashcardResponseDTO.FlashcardDTO dto : response.getFlashcards()) {
                FlashcardItem item = new FlashcardItem();
                item.setConcept(dto.getConcept());
                item.setDefinition(dto.getDefinition());
                item.setDeck(deck);
                deck.getCards().add(item);
            }

            flashcardDeckRepository.save(deck);

            return ResponseEntity.ok(deck);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare de comunicare cu AI: " + e.getMessage());
        }
    }
}
