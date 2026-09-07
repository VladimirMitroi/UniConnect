package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByTestId(Long testId);

    @Query("SELECT q FROM Question q WHERE q.testId IN (" +
            "SELECT t.id FROM TestEntity t WHERE t.courseName = :name" +
            ")")
    List<Question> findByCourseName(@Param("name") String name);

    @Transactional
    void deleteByTestId(Long testId);

    @Query("SELECT q FROM Question q WHERE q.testId IN (" +
           "SELECT t.id FROM TestEntity t WHERE t.courseInstanceId = :courseId AND t.testType = 'OFFICIAL'" +
           ")")
    List<Question> findByCourseInstanceId(@Param("courseId") Long courseId);
}