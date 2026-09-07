package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, String> {
}
