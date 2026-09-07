package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.EventDTO;
import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CalendarController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final TestRepository testRepository;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EventDTO>> getStudentCalendar(@PathVariable Long studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent_Id(studentId);
        List<Long> enrolledCourseIds = enrollments.stream()
                .map(e -> e.getCourseInstance().getId())
                .collect(Collectors.toList());

        List<EventDTO> events = new ArrayList<>();

        if (enrolledCourseIds.isEmpty()) {
            return ResponseEntity.ok(events);
        }

        for (Long courseId : enrolledCourseIds) {
            CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
            if (course == null) continue;

            List<Assignment> assignments = assignmentRepository.findByCourseInstance_IdOrderByDeadlineAsc(courseId);
            for (Assignment a : assignments) {
                if (a.getDeadline() != null) {
                    events.add(new EventDTO(
                        a.getId(),
                        a.getTitle(),
                        "ASSIGNMENT",
                        a.getDeadline(),
                        course.getId(),
                        course.getName()
                    ));
                }
            }

            List<TestEntity> tests = testRepository.findByCourseInstanceIdAndTestType(courseId, "OFFICIAL");
            for (TestEntity t : tests) {
                if (t.getDeadline() != null) {
                    events.add(new EventDTO(
                        t.getId(),
                        t.getTitle(),
                        "TEST",
                        t.getDeadline(),
                        course.getId(),
                        course.getName()
                    ));
                }
            }
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<EventDTO>> getTeacherCalendar(@PathVariable Long teacherId) {
        List<CourseInstance> courses = courseInstanceRepository.findByProfessorId(teacherId);
        List<EventDTO> events = new ArrayList<>();

        for (CourseInstance course : courses) {
            List<Assignment> assignments = assignmentRepository.findByCourseInstance_IdOrderByDeadlineAsc(course.getId());
            for (Assignment a : assignments) {
                if (a.getDeadline() != null) {
                    events.add(new EventDTO(
                        a.getId(),
                        a.getTitle(),
                        "ASSIGNMENT",
                        a.getDeadline(),
                        course.getId(),
                        course.getName()
                    ));
                }
            }

            List<TestEntity> tests = testRepository.findByCourseInstanceIdAndTestType(course.getId(), "OFFICIAL");
            for (TestEntity t : tests) {
                if (t.getDeadline() != null) {
                    events.add(new EventDTO(
                        t.getId(),
                        t.getTitle(),
                        "TEST",
                        t.getDeadline(),
                        course.getId(),
                        course.getName()
                    ));
                }
            }
        }

        return ResponseEntity.ok(events);
    }
}
