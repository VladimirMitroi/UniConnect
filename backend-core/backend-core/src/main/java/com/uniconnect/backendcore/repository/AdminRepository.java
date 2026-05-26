package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {
}