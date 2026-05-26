package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.CourseFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {
}