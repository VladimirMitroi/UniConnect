package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    
    boolean existsByAssignment_IdAndStudent_Id(Long assignmentId, Long studentId);
    
    Optional<AssignmentSubmission> findByAssignment_IdAndStudent_Id(Long assignmentId, Long studentId);

    List<AssignmentSubmission> findByAssignment_IdOrderBySubmissionDateDesc(Long assignmentId);
    
    List<AssignmentSubmission> findByStudent_IdAndAssignment_CourseInstance_IdAndGradeIsNotNull(Long studentId, Long courseInstanceId);
}
