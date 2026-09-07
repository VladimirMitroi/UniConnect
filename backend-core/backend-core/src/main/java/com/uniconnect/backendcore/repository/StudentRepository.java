package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRegistrationNumber(String registrationNumber);

    Optional<Student> findByUser_Email(String email);

    List<Student> findBySeriesAndGroupName(String series, String groupName);
    List<Student> findBySeries(String series);
}