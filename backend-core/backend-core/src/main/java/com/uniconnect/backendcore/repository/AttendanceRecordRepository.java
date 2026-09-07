package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    boolean existsByAttendanceSession_IdAndStudent_Id(Long sessionId, Long studentId);
    List<AttendanceRecord> findByAttendanceSession_Id(Long sessionId);
    List<AttendanceRecord> findByAttendanceSession_CourseInstance_Id(Long courseInstanceId);
}
