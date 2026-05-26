package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.dto.AuthRequest;
import com.uniconnect.backendcore.dto.AuthResponse;
import com.uniconnect.backendcore.dto.RegisterRequest; // Asigură-te că ai creat această clasă anterior
import com.uniconnect.backendcore.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    // ACEASTA E METODA CARE ÎȚI LIPSEA SAU NU ERA SALVATĂ:
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }
}