package com.uniconnect.backendcore.service;

import com.uniconnect.backendcore.dto.AuthRequest;
import com.uniconnect.backendcore.dto.AuthResponse;
import com.uniconnect.backendcore.dto.RegisterRequest;
import com.uniconnect.backendcore.model.Admin;
import com.uniconnect.backendcore.model.Professor;
import com.uniconnect.backendcore.model.Student;
import com.uniconnect.backendcore.model.User;
import com.uniconnect.backendcore.repository.AdminRepository;
import com.uniconnect.backendcore.repository.ProfessorRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.repository.UserRepository;
import com.uniconnect.backendcore.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    // ADAUGĂM REPOSITORY-URILE PENTRU A ADUCE NUMELE DIN BAZA DE DATE
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final AdminRepository adminRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // --- METODA ACTUALIZATĂ DE LOGIN ---
    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        // Extragem Numele Complet în funcție de Rol
        String fullName = "Utilizator"; // Nume default de siguranță

        if ("ROLE_STUDENT".equals(user.getRole())) {
            Student student = studentRepository.findById(user.getId()).orElse(null);
            if (student != null) {
                fullName = student.getFirstName() + " " + student.getLastName();
            }
        } else if ("ROLE_TEACHER".equals(user.getRole())) {
            Professor prof = professorRepository.findById(user.getId()).orElse(null);
            if (prof != null) {
                fullName = prof.getFirstName() + " " + prof.getLastName();
            }
        } else if ("ROLE_ADMIN".equals(user.getRole())) {
            Admin admin = adminRepository.findById(user.getId()).orElse(null);
            if (admin != null) {
                fullName = admin.getFirstName() + " " + admin.getLastName();
            } else {
                fullName = "Administrator Sistem";
            }
        }

        var jwtToken = jwtService.generateToken(user);

        // Folosim noul AuthResponse cu toate cele 3 variabile!
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .name(fullName)
                .build();
    }

    // --- METODA ACTUALIZATĂ DE REGISTER ---
    public AuthResponse register(RegisterRequest request) {
        var user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .name(request.getEmail()) // La un register simplu punem email-ul temporar
                .build();
    }
}