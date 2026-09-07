package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.GlobalSetting;
import com.uniconnect.backendcore.service.GlobalSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class GlobalSettingController {

    private final GlobalSettingService settingService;

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        return ResponseEntity.ok(settingService.getPublicSettings());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GlobalSetting>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping("/admin/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        if (value == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valoarea nu poate fi null"));
        }
        settingService.updateSetting(key, value);
        return ResponseEntity.ok(Map.of("message", "Setare actualizată cu succes!"));
    }
}
