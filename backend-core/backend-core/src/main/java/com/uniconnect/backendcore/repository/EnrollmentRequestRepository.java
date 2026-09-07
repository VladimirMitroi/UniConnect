package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.EnrollmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, Long> {

    @Query("SELECT e.courseInstanceId FROM EnrollmentRequest e WHERE e.studentId = :studentId AND e.status = :status")
    List<Long> findApprovedCourseIdsByStudentId(@Param("studentId") Long studentId, @Param("status") String status);

    @Query("SELECT e FROM EnrollmentRequest e JOIN CourseInstance c ON e.courseInstanceId = c.id WHERE c.professorId = :professorId AND e.status = 'PENDING'")
    List<EnrollmentRequest> findPendingRequestsForProfessor(@Param("professorId") Long professorId);

    List<EnrollmentRequest> findByStudentId(Long studentId);
}