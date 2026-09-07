package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseInstance_IdOrderByDeadlineAsc(Long courseInstanceId);
}
