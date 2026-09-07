package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.Announcement;
import com.uniconnect.backendcore.model.CourseInstance;
import com.uniconnect.backendcore.repository.AnnouncementRepository;
import com.uniconnect.backendcore.repository.CourseInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final CourseInstanceRepository courseInstanceRepository;


    @GetMapping("/global")
    public ResponseEntity<List<Announcement>> getGlobalAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findByCourseInstanceIsNullOrderByPostedAtDesc());
    }

    @PostMapping("/global")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createGlobalAnnouncement(@RequestBody Map<String, String> payload, Authentication auth) {
        String title = payload.get("title");
        String content = payload.get("content");
        
        if (title == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Titlul și conținutul sunt obligatorii."));
        }

        Announcement a = new Announcement();
        a.setTitle(title);
        a.setContent(content);
        a.setPostedAt(LocalDateTime.now());
        a.setAuthorName("Universitate (Admin)");
        
        announcementRepository.save(a);
        return ResponseEntity.ok(Map.of("message", "Anunț global publicat cu succes."));
    }


    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Announcement>> getCourseAnnouncements(@PathVariable Long courseId) {
        return ResponseEntity.ok(announcementRepository.findByCourseInstance_IdOrderByPostedAtDesc(courseId));
    }

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createCourseAnnouncement(@PathVariable Long courseId, @RequestBody Map<String, String> payload, Authentication auth) {
        CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.notFound().build();
        }

        String title = payload.get("title");
        String content = payload.get("content");
        
        if (title == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Titlul și conținutul sunt obligatorii."));
        }

        Announcement a = new Announcement();
        a.setTitle(title);
        a.setContent(content);
        a.setPostedAt(LocalDateTime.now());
        a.setAuthorName("Prof. " + course.getProfessorName());
        a.setCourseInstance(course);

        announcementRepository.save(a);
        return ResponseEntity.ok(Map.of("message", "Anunț curs publicat cu succes."));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        Optional<Announcement> opt = announcementRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        announcementRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Anunț șters cu succes."));
    }
}
