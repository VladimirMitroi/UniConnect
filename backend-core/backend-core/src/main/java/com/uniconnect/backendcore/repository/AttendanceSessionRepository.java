package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByUniqueCode(String uniqueCode);
    List<AttendanceSession> findByCourseInstance_Id(Long courseInstanceId);
    Optional<AttendanceSession> findByCourseSection_Id(Long courseSectionId);
}
