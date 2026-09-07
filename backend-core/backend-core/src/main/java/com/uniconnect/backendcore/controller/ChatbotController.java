package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.ChatRequestDTO;
import com.uniconnect.backendcore.dto.ChatResponseDTO;
import com.uniconnect.backendcore.model.CourseMaterial;
import com.uniconnect.backendcore.repository.CourseMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChatbotController {

    private final CourseMaterialRepository courseMaterialRepository;

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponseDTO> chatWithCourse(@PathVariable Long courseId, @RequestBody ChatRequestDTO request) {
        try {
            List<CourseMaterial> materials = courseMaterialRepository.findByCourseInstance_IdOrderByCreatedAtDesc(courseId);
            
            List<String> fileNames = materials.stream()
                    .filter(m -> m.getMaterialType() == CourseMaterial.MaterialType.FILE)
                    .map(CourseMaterial::getFileName)
                    .filter(name -> {
                        if (name == null) return false;
                        String lowerName = name.toLowerCase();
                        return lowerName.endsWith(".pdf") || 
                               lowerName.endsWith(".docx") || 
                               lowerName.endsWith(".txt") || 
                               lowerName.endsWith(".pptx");
                    })
                    .collect(Collectors.toList());

            System.out.println("[ChatbotController] Found " + materials.size() + " materials for course " + courseId);
            System.out.println("[ChatbotController] Selected " + fileNames.size() + " compatible files: " + fileNames);

            RestTemplate restTemplate = new RestTemplate();
            String aiServiceUrl = "http://localhost:5001/chat";

            Map<String, Object> pythonPayload = new HashMap<>();
            pythonPayload.put("message", request.getMessage());
            pythonPayload.put("fileNames", fileNames);

            ChatResponseDTO response = restTemplate.postForObject(aiServiceUrl, pythonPayload, ChatResponseDTO.class);

            if (response == null || response.getResponse() == null) {
                return ResponseEntity.internalServerError().body(new ChatResponseDTO("AI-ul nu a răspuns."));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ChatResponseDTO("Eroare de comunicare cu AI: " + e.getMessage()));
        }
    }
}
