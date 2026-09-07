package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    List<FlashcardDeck> findByCourseInstanceIdAndStudentIdOrderByCreatedAtDesc(Long courseInstanceId, Long studentId);
}
