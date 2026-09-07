package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.ProfileResponse;
import com.uniconnect.backendcore.model.User;
import com.uniconnect.backendcore.repository.AdminRepository;
import com.uniconnect.backendcore.repository.ProfessorRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.uniconnect.backendcore.dto.ChangePasswordRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthProfileController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String displayName = "Utilizator";
        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole());

        if ("ROLE_STUDENT".equals(user.getRole())) {
            var student = studentRepository.findById(user.getId()).orElse(null);
            if (student != null) {
                builder.studentId(student.getId())
                       .series(student.getSeries())
                       .groupName(student.getGroupName())
                       .firstName(student.getFirstName())
                       .lastName(student.getLastName())
                       .dateOfBirth(student.getDateOfBirth())
                       .registrationNumber(student.getRegistrationNumber())
                       .enrollmentYear(student.getEnrollmentYear())
                       .studyYear(student.getStudyYear())
                       .fundingType(student.getFundingType());
                displayName = student.getFirstName() + " " + student.getLastName();
            }
        } else if ("ROLE_TEACHER".equals(user.getRole())) {
            var prof = professorRepository.findById(user.getId()).orElse(null);
            if (prof != null) {
                builder.professorId(prof.getId())
                       .firstName(prof.getFirstName())
                       .lastName(prof.getLastName())
                       .academicRank(prof.getAcademicRank())
                       .department(prof.getDepartment())
                       .officeHours(prof.getOfficeHours());
                displayName = prof.getFirstName() + " " + prof.getLastName();
            }
        } else if ("ROLE_ADMIN".equals(user.getRole())) {
            var admin = adminRepository.findById(user.getId()).orElse(null);
            if (admin != null) {
                builder.firstName(admin.getFirstName())
                       .lastName(admin.getLastName());
                displayName = admin.getFirstName() + " " + admin.getLastName();
            } else {
                displayName = "Administrator Sistem";
            }
        }

        return ResponseEntity.ok(builder.name(displayName).build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Parola curentă este incorectă."));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Parola a fost schimbată cu succes."));
    }
}
