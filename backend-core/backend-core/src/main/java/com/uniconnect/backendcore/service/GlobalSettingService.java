package com.uniconnect.backendcore.service;

import com.uniconnect.backendcore.model.GlobalSetting;
import com.uniconnect.backendcore.repository.GlobalSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GlobalSettingService {

    private final GlobalSettingRepository repository;

    @PostConstruct
    public void initDefaultSettings() {
        createIfMissing("academic_start_date", "2024-10-01", "Data de început a semestrului (ex: 2024-10-01)");
        createIfMissing("academic_weeks", "14", "Numărul de săptămâni ale semestrului (ex: 14)");
        createIfMissing("academic_holidays", "", "Zile/Săptămâni de vacanță (ex: 2024-12-23:2025-01-05)");
        createIfMissing("active_semester", "1", "Semestrul activ (1 sau 2)");
        createIfMissing("enrollment_open", "true", "True dacă studenții pot trimite cereri de înscriere, false altfel");
        createIfMissing("max_upload_size_mb", "20", "Dimensiunea maximă a fișierelor încărcate (în MB)");
        createIfMissing("allowed_file_types", "pdf,doc,docx,zip,rar,jpg,png", "Extensii fișiere permise, separate prin virgulă");
        createIfMissing("maintenance_banner", "", "Text pentru bannerul global de deasupra paginilor. Lasă gol pentru a ascunde.");
    }

    private void createIfMissing(String key, String defaultValue, String description) {
        if (!repository.existsById(key)) {
            GlobalSetting setting = new GlobalSetting();
            setting.setKey(key);
            setting.setValue(defaultValue);
            setting.setDescription(description);
            repository.save(setting);
        }
    }

    public List<GlobalSetting> getAllSettings() {
        return repository.findAll();
    }

    public GlobalSetting getSetting(String key) {
        return repository.findById(key).orElse(null);
    }

    public String getSettingValue(String key, String fallback) {
        return repository.findById(key).map(GlobalSetting::getValue).orElse(fallback);
    }

    public void updateSetting(String key, String value) {
        GlobalSetting setting = repository.findById(key).orElse(new GlobalSetting());
        setting.setKey(key);
        setting.setValue(value);
        repository.save(setting);
    }

    public Map<String, String> getPublicSettings() {
        List<GlobalSetting> settings = repository.findAll();
        return settings.stream()
                .filter(s -> s.getKey().equals("maintenance_banner") ||
                             s.getKey().equals("enrollment_open") ||
                             s.getKey().equals("active_semester") ||
                             s.getKey().equals("max_upload_size_mb") ||
                             s.getKey().equals("academic_start_date") ||
                             s.getKey().equals("academic_weeks") ||
                             s.getKey().equals("academic_holidays"))
                .collect(Collectors.toMap(GlobalSetting::getKey, GlobalSetting::getValue));
    }
}
