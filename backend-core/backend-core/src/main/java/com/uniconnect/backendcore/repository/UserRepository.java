package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA va scrie automat interogarea SQL (SELECT * FROM users WHERE email = ?)
    Optional<User> findByEmail(String email);
}
