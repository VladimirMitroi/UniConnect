package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.TestAttempt;
import com.uniconnect.backendcore.model.TestAttempt.TestAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Optional<TestAttempt> findByStudent_IdAndTest_IdAndStatus(Long studentId, Long testId, TestAttemptStatus status);

    Optional<TestAttempt> findFirstByStudent_IdAndTest_IdAndStatusOrderByStartedAtDesc(
            Long studentId,
            Long testId,
            TestAttemptStatus status
    );

    List<TestAttempt> findByStudent_IdAndTest_Id(Long studentId, Long testId);

    boolean existsByStudent_IdAndTest_IdAndStatusIn(Long studentId, Long testId, List<TestAttemptStatus> statuses);
}

