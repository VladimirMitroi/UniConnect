package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    // Pentru catalogul detaliat al unui curs
    List<TestResult> findByCourseName(String courseName);

    // Pentru mediile pe cursuri (Folosim o proiecție sub formă de Map)
    @Query("SELECT r.courseName as course, AVG(r.score) as average FROM TestResult r GROUP BY r.courseName")
    List<Map<String, Object>> findAveragesPerCourse();
}