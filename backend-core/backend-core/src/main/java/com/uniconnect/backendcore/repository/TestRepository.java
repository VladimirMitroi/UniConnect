package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestRepository extends JpaRepository<TestEntity, Long> {
    List<TestEntity> findAllByOrderByCreatedAtDesc();
}
