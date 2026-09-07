package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.UserCreationDTO;
import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import com.uniconnect.backendcore.service.CourseSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final CourseInstanceRepository courseInstanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminRepository adminRepository;
    private final CourseSectionService courseSectionService;

    @PostMapping("/users/create")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createUser(@RequestBody UserCreationDTO dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email-ul există deja!"));
        }

        User newUser = new User();
        newUser.setEmail(dto.getEmail());
        newUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        newUser.setRole(dto.getRole());
        User savedUser = userRepository.save(newUser);

        if ("ROLE_STUDENT".equals(dto.getRole())) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setFirstName(dto.getFirstName());
            student.setLastName(dto.getLastName());
            student.setDateOfBirth(dto.getDateOfBirth());
            student.setEnrollmentYear(dto.getEnrollmentYear());

            String matricol = (dto.getRegistrationNumber() != null && !dto.getRegistrationNumber().trim().isEmpty())
                    ? dto.getRegistrationNumber()
                    : "MAT-" + System.currentTimeMillis();
            student.setRegistrationNumber(matricol);

            student.setStudyYear(dto.getStudyYear());
            student.setSeries(dto.getSeries());
            student.setGroupName(dto.getGroupName());
            student.setFundingType(dto.getFundingType());

            studentRepository.save(student);

        } else if ("ROLE_TEACHER".equals(dto.getRole())) {
            Professor prof = new Professor();
            prof.setUser(savedUser);
            prof.setFirstName(dto.getFirstName());
            prof.setLastName(dto.getLastName());
            prof.setAcademicRank(dto.getAcademicRank());
            prof.setDepartment(dto.getDepartment());
            prof.setOfficeHours(dto.getOfficeHours());

            professorRepository.save(prof);

        } else if ("ROLE_ADMIN".equals(dto.getRole())) {
            Admin admin = new Admin();
            admin.setUser(savedUser);
            admin.setFirstName(dto.getFirstName());
            admin.setLastName(dto.getLastName());

            adminRepository.save(admin);
        }

        return ResponseEntity.ok(Map.of("message", "Utilizator creat cu succes!"));
    }

    @PostMapping("/courses/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourseInstance(@RequestBody CourseInstance course) {
        if (course.getProfessorId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ID-ul profesorului este obligatoriu!"));
        }
        
        var profOpt = professorRepository.findById(course.getProfessorId());
        if (profOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Profesorul cu ID-ul " + course.getProfessorId() + " nu există în baza de date!"));
        }
        
        Professor prof = profOpt.get();
        String title = prof.getAcademicRank() != null ? prof.getAcademicRank() + " " : "";
        course.setProfessorName(title + prof.getLastName() + " " + prof.getFirstName());

        CourseInstance savedCourse = courseInstanceRepository.save(course);
        courseSectionService.generateWeeksForCourse(savedCourse);
        return ResponseEntity.ok(Map.of("message", "Curs creat și structura de săptămâni a fost generată cu succes!", "course", savedCourse));
    }
}