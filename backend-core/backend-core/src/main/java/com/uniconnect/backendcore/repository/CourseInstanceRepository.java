package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.CourseInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseInstanceRepository extends JpaRepository<CourseInstance, Long> {

    List<CourseInstance> findByProfessorId(Long professorId);

    @Query("SELECT c FROM CourseInstance c WHERE c.isMandatory = true AND c.serie = :serie AND (c.grupa = :grupa OR c.grupa IS NULL OR c.grupa = '')")
    List<CourseInstance> findMandatoryCoursesForStudent(@Param("grupa") String grupa, @Param("serie") String serie);

    @Query("SELECT c FROM CourseInstance c WHERE NOT (c.isMandatory = true AND c.serie = :serie AND (c.grupa = :grupa OR c.grupa IS NULL OR c.grupa = ''))")
    List<CourseInstance> findAllAvailableToExplore(@Param("grupa") String grupa, @Param("serie") String serie);
}