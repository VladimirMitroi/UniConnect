package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.EnrollmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, Long> {

    // 1. Returnează doar o listă de ID-uri de cursuri la care studentul a fost acceptat
    @Query("SELECT e.courseInstanceId FROM EnrollmentRequest e WHERE e.studentId = :studentId AND e.status = :status")
    List<Long> findApprovedCourseIdsByStudentId(@Param("studentId") Long studentId, @Param("status") String status);

    // 2. MAGIA AICI: Face JOIN între Cereri și Cursuri ca să găsească doar cererile pentru cursurile acestui profesor
    @Query("SELECT e FROM EnrollmentRequest e JOIN CourseInstance c ON e.courseInstanceId = c.id WHERE c.professorId = :professorId AND e.status = 'PENDING'")
    List<EnrollmentRequest> findPendingRequestsForProfessor(@Param("professorId") Long professorId);
}