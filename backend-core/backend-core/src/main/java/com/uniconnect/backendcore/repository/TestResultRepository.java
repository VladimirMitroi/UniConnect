package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    List<TestResult> findByCourseName(String courseName);

    @Query("SELECT r.courseName as course, AVG(r.score) as average FROM TestResult r GROUP BY r.courseName")
    List<Map<String, Object>> findAveragesPerCourse();

    @Query("SELECT r.courseName as course, AVG(r.score) as average FROM TestResult r WHERE r.courseName IN :courseNames GROUP BY r.courseName")
    List<Map<String, Object>> findAveragesByCourseNameIn(@org.springframework.data.repository.query.Param("courseNames") List<String> courseNames);
}