package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.TestEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestRepository extends JpaRepository<TestEntity, Long> {
    List<TestEntity> findAllByTestTypeOrderByCreatedAtDesc(String testType);
    
    List<TestEntity> findByIsReadyTrueAndTestTypeOrderByCreatedAtDesc(String testType);
    
    List<TestEntity> findByOwnerProfessorId(Long ownerProfessorId);
    
    List<TestEntity> findByCourseInstanceIdAndTestType(Long courseInstanceId, String testType);

    @Query("SELECT DISTINCT t.courseName FROM TestEntity t WHERE t.isReady = true AND t.testType = 'OFFICIAL' AND t.courseName IS NOT NULL")
    List<String> findDistinctReadyCourseNames();

    @Query("SELECT t FROM TestEntity t WHERE t.isReady = true AND " +
           "( (t.testType = 'OFFICIAL' AND (t.courseInstanceId IS NULL OR t.courseInstanceId IN :enrolledCourseIds) " +
           "   AND NOT EXISTS (SELECT 1 FROM TestAttempt a WHERE a.test = t AND a.student.id = :studentId AND a.status IN ('SUBMITTED', 'EXPIRED')) ) " +
           "  OR (t.testType = 'PRACTICE' AND t.ownerStudentId = :studentId) ) " +
           "ORDER BY t.createdAt DESC")
    List<TestEntity> findAvailableForStudent(@Param("enrolledCourseIds") List<Long> enrolledCourseIds, @Param("studentId") Long studentId);
}
