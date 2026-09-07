package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.MaterialProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialProgressRepository extends JpaRepository<MaterialProgress, Long> {
    boolean existsByStudent_IdAndMaterial_Id(Long studentId, Long materialId);
    List<MaterialProgress> findByStudent_IdAndMaterial_CourseInstance_Id(Long studentId, Long courseInstanceId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByMaterial_Id(Long materialId);
}
