package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.UserCreationDTO;
import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/users/create")
    @Transactional
    public ResponseEntity<?> createUser(@RequestBody UserCreationDTO dto) {

        // 0. Verificăm dacă email-ul există deja (și ne oprim aici dacă există)
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email-ul există deja!"));
        }

        // 1. Creăm entitatea de Login (User) - Acum variabila savedUser ia naștere!
        User newUser = new User();
        newUser.setEmail(dto.getEmail());
        newUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        newUser.setRole(dto.getRole());
        User savedUser = userRepository.save(newUser);

        // 2. Creăm Profilul specific în funcție de Rol (Folosind savedUser-ul de mai sus)
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
            // MUTAT AICI! Acum recunoaște savedUser fără probleme.
            Admin admin = new Admin();
            admin.setUser(savedUser);
            admin.setFirstName(dto.getFirstName());
            admin.setLastName(dto.getLastName());

            adminRepository.save(admin);
        }

        return ResponseEntity.ok(Map.of("message", "Utilizator creat cu succes!"));
    }

    @PostMapping("/courses/create")
    public ResponseEntity<?> createCourseInstance(@RequestBody CourseInstance course) {
        CourseInstance savedCourse = courseInstanceRepository.save(course);
        return ResponseEntity.ok(Map.of("message", "Curs creat și asignat cu succes!", "course", savedCourse));
    }
}