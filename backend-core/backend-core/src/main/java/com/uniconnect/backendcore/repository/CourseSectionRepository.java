package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {
    List<CourseSection> findByCourseInstance_IdOrderByOrderIndexAsc(Long courseInstanceId);
    
    List<CourseSection> findByCourseInstance_IdAndIsVisibleTrueOrderByOrderIndexAsc(Long courseInstanceId);
}
