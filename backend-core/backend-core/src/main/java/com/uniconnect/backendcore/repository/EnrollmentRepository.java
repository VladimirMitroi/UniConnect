package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByStudent_IdAndCourseInstance_Id(Long studentId, Long courseInstanceId);

    Optional<Enrollment> findByStudent_IdAndCourseInstance_Id(Long studentId, Long courseInstanceId);

    List<Enrollment> findByStudent_Id(Long studentId);

    List<Enrollment> findByCourseInstance_Id(Long courseInstanceId);
}

