package com.uniconnect.backendcore.service;

import com.uniconnect.backendcore.dto.AuthRequest;
import com.uniconnect.backendcore.dto.AuthResponse;
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

    public AuthResponse authenticate(AuthRequest request) {
        // 1. Verificăm dacă email-ul și parola se potrivesc
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Dacă a trecut de pasul 1, înseamnă că datele sunt corecte. Căutăm userul în DB.
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // 3. Generăm token-ul pentru el
        var jwtToken = jwtService.generateToken(user);

        // 4. Îl returnăm către React
        return new AuthResponse(jwtToken);
    }
}