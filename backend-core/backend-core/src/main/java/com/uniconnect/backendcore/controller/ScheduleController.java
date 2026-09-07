package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.ScheduleEventDTO;
import com.uniconnect.backendcore.model.CourseInstance;
import com.uniconnect.backendcore.model.ScheduleSlot;
import com.uniconnect.backendcore.repository.CourseInstanceRepository;
import com.uniconnect.backendcore.repository.EnrollmentRepository;
import com.uniconnect.backendcore.repository.ScheduleSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ScheduleEventDTO>> studentSchedule(@RequestParam Long studentId) {
        var enrollments = enrollmentRepository.findByStudent_Id(studentId);
        Set<Long> courseIds = new HashSet<>();
        for (var e : enrollments) {
            courseIds.add(e.getCourseInstance().getId());
        }
        return ResponseEntity.ok(buildEventsForCourses(courseIds));
    }

    @GetMapping("/professor")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ScheduleEventDTO>> professorSchedule(@RequestParam Long professorId) {
        List<CourseInstance> courses = courseInstanceRepository.findByProfessorId(professorId);
        Set<Long> courseIds = new HashSet<>();
        for (CourseInstance c : courses) {
            courseIds.add(c.getId());
        }
        return ResponseEntity.ok(buildEventsForCourses(courseIds));
    }

    private List<ScheduleEventDTO> buildEventsForCourses(Set<Long> courseIds) {
        List<ScheduleEventDTO> events = new ArrayList<>();
        for (Long courseId : courseIds) {
            CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
            if (course == null) {
                continue;
            }
            List<ScheduleSlot> slots = scheduleSlotRepository.findByCourseInstance_Id(courseId);
            for (ScheduleSlot slot : slots) {
                events.add(ScheduleEventDTO.builder()
                        .id(slot.getId())
                        .courseInstanceId(courseId)
                        .courseName(course.getName())
                        .professorName(course.getProfessorName())
                        .dayOfWeek(slot.getDayOfWeek().name())
                        .startTime(slot.getStartTime().toString())
                        .endTime(slot.getEndTime().toString())
                        .room(slot.getRoom())
                        .slotType(slot.getSlotType() != null ? slot.getSlotType().name() : null)
                        .build());
            }
        }
        return events;
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScheduleEventDTO>> courseSchedule(@PathVariable Long courseId) {
        CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.badRequest().build();
        
        List<ScheduleSlot> slots = scheduleSlotRepository.findByCourseInstance_Id(courseId);
        List<ScheduleEventDTO> events = new ArrayList<>();
        for (ScheduleSlot slot : slots) {
            events.add(ScheduleEventDTO.builder()
                    .id(slot.getId())
                    .courseInstanceId(courseId)
                    .courseName(course.getName())
                    .professorName(course.getProfessorName())
                    .dayOfWeek(slot.getDayOfWeek().name())
                    .startTime(slot.getStartTime().toString())
                    .endTime(slot.getEndTime().toString())
                    .room(slot.getRoom())
                    .slotType(slot.getSlotType() != null ? slot.getSlotType().name() : null)
                    .build());
        }
        return ResponseEntity.ok(events);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> addScheduleSlot(@RequestBody com.uniconnect.backendcore.dto.ScheduleSlotRequestDTO request) {
        CourseInstance course = courseInstanceRepository.findById(request.getCourseInstanceId()).orElse(null);
        if (course == null) return ResponseEntity.badRequest().body("Course not found");

        ScheduleSlot slot = new ScheduleSlot();
        slot.setCourseInstance(course);
        slot.setDayOfWeek(ScheduleSlot.AcademicDayOfWeek.valueOf(request.getDayOfWeek()));
        slot.setStartTime(LocalTime.parse(request.getStartTime()));
        slot.setEndTime(LocalTime.parse(request.getEndTime()));
        slot.setRoom(request.getRoom());
        if (request.getSlotType() != null) {
            slot.setSlotType(ScheduleSlot.SlotType.valueOf(request.getSlotType()));
        }
        
        scheduleSlotRepository.save(slot);
        return ResponseEntity.ok("Slot added");
    }

    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteScheduleSlot(@PathVariable Long slotId) {
        if (!scheduleSlotRepository.existsById(slotId)) {
            return ResponseEntity.badRequest().body("Slot not found");
        }
        scheduleSlotRepository.deleteById(slotId);
        return ResponseEntity.ok("Slot deleted");
    }
}
