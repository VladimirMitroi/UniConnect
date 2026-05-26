package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Aduce toate întrebările unui test anume
    List<Question> findByTestId(Long testId);

    // Șterge toate întrebările unui test (folosit la butonul de Delete din Dashboard)
    @Transactional
    void deleteByTestId(Long testId);
}