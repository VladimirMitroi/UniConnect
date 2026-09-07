package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/start")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> payload) {
        Long courseInstanceId = Long.parseLong(payload.get("courseInstanceId").toString());
        Long courseSectionId = Long.parseLong(payload.get("courseSectionId").toString());
        int validityMinutes = Integer.parseInt(payload.getOrDefault("validityMinutes", "10").toString());

        CourseInstance course = courseInstanceRepository.findById(courseInstanceId).orElse(null);
        CourseSection section = courseSectionRepository.findById(courseSectionId).orElse(null);

        if (course == null || section == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Curs sau secțiune invalidă"));
        }

        String code = String.format("%06d", new Random().nextInt(999999));
        
        while (attendanceSessionRepository.findByUniqueCode(code).isPresent()) {
            code = String.format("%06d", new Random().nextInt(999999));
        }

        AttendanceSession session = attendanceSessionRepository.findByCourseSection_Id(courseSectionId).orElse(new AttendanceSession());
        session.setCourseInstance(course);
        session.setCourseSection(section);
        session.setUniqueCode(code);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(validityMinutes));

        attendanceSessionRepository.save(session);

        return ResponseEntity.ok(Map.of(
            "message", "Sesiune pornită cu succes",
            "uniqueCode", code,
            "expiresAt", session.getExpiresAt().toString()
        ));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, String> payload, Authentication auth) {
        String code = payload.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cod invalid."));
        }

        AttendanceSession session = attendanceSessionRepository.findByUniqueCode(code).orElse(null);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Codul nu a fost găsit sau sesiunea este invalidă."));
        }

        if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Acest cod a expirat. Sesiunea de prezențe s-a încheiat."));
        }

        Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (attendanceRecordRepository.existsByAttendanceSession_IdAndStudent_Id(session.getId(), student.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ți-ai înregistrat deja prezența pentru acest seminar!"));
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setAttendanceSession(session);
        record.setStudent(student);
        record.setScanTime(LocalDateTime.now());
        attendanceRecordRepository.save(record);

        return ResponseEntity.ok(Map.of(
            "message", "Prezență înregistrată cu succes!",
            "courseName", session.getCourseInstance().getName(),
            "sectionTitle", session.getCourseSection().getTitle()
        ));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getAttendanceReport(@PathVariable Long courseId) {
        List<AttendanceSession> sessions = attendanceSessionRepository.findByCourseInstance_Id(courseId);
        List<Map<String, Object>> report = new ArrayList<>();

        for (AttendanceSession session : sessions) {
            List<AttendanceRecord> records = attendanceRecordRepository.findByAttendanceSession_Id(session.getId());
            Map<String, Object> sessionMap = new HashMap<>();
            sessionMap.put("sessionId", session.getId());
            sessionMap.put("sectionTitle", session.getCourseSection().getTitle());
            sessionMap.put("expiresAt", session.getExpiresAt().toString());
            sessionMap.put("isActive", LocalDateTime.now().isBefore(session.getExpiresAt()));
            sessionMap.put("uniqueCode", session.getUniqueCode());
            sessionMap.put("attendeeCount", records.size());
            
            List<Map<String, String>> attendees = new ArrayList<>();
            for (AttendanceRecord r : records) {
                attendees.add(Map.of(
                    "name", r.getStudent().getLastName() + " " + r.getStudent().getFirstName(),
                    "scanTime", r.getScanTime().toString()
                ));
            }
            sessionMap.put("attendees", attendees);
            report.add(sessionMap);
        }

        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/active/{sectionId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getActiveSession(@PathVariable Long sectionId) {
        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findByCourseSection_Id(sectionId);
        if (sessionOpt.isPresent()) {
            AttendanceSession session = sessionOpt.get();
            List<AttendanceRecord> records = attendanceRecordRepository.findByAttendanceSession_Id(session.getId());
            return ResponseEntity.ok(Map.of(
                "sessionId", session.getId(),
                "uniqueCode", session.getUniqueCode(),
                "expiresAt", session.getExpiresAt().toString(),
                "isActive", LocalDateTime.now().isBefore(session.getExpiresAt()),
                "attendeeCount", records.size()
            ));
        }
        return ResponseEntity.ok(null);
    }
}
