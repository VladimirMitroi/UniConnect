package com.uniconnect.backendcore.service;

import com.uniconnect.backendcore.dto.AuthRequest;
import com.uniconnect.backendcore.dto.AuthResponse;
import com.uniconnect.backendcore.dto.RegisterRequest; // Asigură-te că ai importat asta
import com.uniconnect.backendcore.model.User;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Metoda veche de Login
    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }

    // --- ADAUGĂ ACEASTĂ METODĂ NOUĂ AICI ---
    public AuthResponse register(RegisterRequest request) {
        // 1. Creăm un cont nou
        var user = new User();
        user.setEmail(request.getEmail());

        // 2. CRIPTĂM PAROLA! (Asta e cea mai importantă parte)
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 3. Setăm rolul (Profesor sau Student)
        user.setRole(request.getRole());

        // 4. Salvăm în PostgreSQL
        userRepository.save(user);

        // 5. Generăm o legitimație (token) ca să fie deja logat
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}