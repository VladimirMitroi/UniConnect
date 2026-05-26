package com.uniconnect.backendcore.config;

import com.uniconnect.backendcore.model.*;
import com.uniconnect.backendcore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // Verificăm dacă baza de date este goală, ca să nu duplicăm la fiecare restart
        if (userRepository.count() == 0) {
            System.out.println("⏳ [Seeder] Baza de date este goală. Generăm utilizatorii din terminal...");

            // ==========================================
            // 1. ADMIN
            // ==========================================
            User adminUser = new User();
            adminUser.setEmail("admin@uniconnect.ro");
            adminUser.setPassword(passwordEncoder.encode("parola123")); // Criptare reală generată aici
            adminUser.setRole("ROLE_ADMIN");
            userRepository.save(adminUser);

            Admin admin = new Admin();
            admin.setUser(adminUser);
            admin.setFirstName("Super");
            admin.setLastName("Administrator");
            adminRepository.save(admin);

            // ==========================================
            // 2. PROFESOR
            // ==========================================
            User profUser = new User();
            profUser.setEmail("profesor@uniconnect.ro");
            profUser.setPassword(passwordEncoder.encode("parola123"));
            profUser.setRole("ROLE_TEACHER");
            userRepository.save(profUser);

            Professor prof = new Professor();
            prof.setUser(profUser);
            prof.setFirstName("Ion");
            prof.setLastName("Popescu");
            prof.setAcademicRank("Profesor");
            prof.setDepartment("Cibernetică Economică");
            prof.setOfficeHours("Luni 14:00 - 16:00");
            professorRepository.save(prof);

            // ==========================================
            // 3. STUDENT
            // ==========================================
            User studentUser = new User();
            studentUser.setEmail("student@uniconnect.ro");
            studentUser.setPassword(passwordEncoder.encode("parola123"));
            studentUser.setRole("ROLE_STUDENT");
            userRepository.save(studentUser);

            Student student = new Student();
            student.setUser(studentUser);
            student.setFirstName("Alexandru Vladimir");
            student.setLastName("Mitroi");
            student.setRegistrationNumber("MAT-1045");
            student.setEnrollmentYear(2023);
            student.setStudyYear(3);
            student.setSeries("A");
            student.setGroupName("1045");
            student.setFundingType("BUGET");
            student.setDateOfBirth(LocalDate.of(2003, 5, 15));
            studentRepository.save(student);

            System.out.println("✅ [Seeder] Utilizatorii (Admin, Profesor, Student) au fost generați cu succes!");
        } else {
            System.out.println("⚡ [Seeder] Utilizatorii există deja. Trecem mai departe.");
        }
    }
}