package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "global_settings")
@Data
@NoArgsConstructor
public class GlobalSetting {

    @Id
    @Column(name = "setting_key", nullable = false, unique = true)
    private String key;

    @Column(name = "setting_value", length = 2048)
    private String value;

    @Column(name = "description")
    private String description;
}
