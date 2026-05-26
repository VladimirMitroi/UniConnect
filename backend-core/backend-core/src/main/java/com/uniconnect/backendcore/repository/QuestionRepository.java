package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT DISTINCT q.courseName FROM Question q")
    List<String> findDistinctCourseNames();

    List<Question> findByCourseName(String courseName);

    @Transactional
    void deleteByTestId(Long testId);
}