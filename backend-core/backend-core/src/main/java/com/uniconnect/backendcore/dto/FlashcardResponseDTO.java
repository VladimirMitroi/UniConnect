package com.uniconnect.backendcore.dto;

import lombok.Data;
import java.util.List;

@Data
public class FlashcardResponseDTO {
    private List<FlashcardDTO> flashcards;

    @Data
    public static class FlashcardDTO {
        private String concept;
        private String definition;
    }
}
