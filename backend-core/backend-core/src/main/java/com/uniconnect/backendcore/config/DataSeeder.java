package com.uniconnect.backendcore.config;

import com.uniconnect.backendcore.model.Student;
import com.uniconnect.backendcore.model.User;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.repository.UserRepository;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDate;

@Configuration
public class DataSeeder {

    // ACEASTA ESTE PIESA LIPSĂ: Definim cutia poștală explicit
    @Bean
    public Queue testQueue() {
        return new Queue("test_queue", true);
    }

    // NOU: Declarăm și coada de întoarcere
    @Bean
    public Queue resultsQueue() {
        return new Queue("results_queue", true);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, StudentRepository studentRepository, RabbitTemplate rabbitTemplate) {
        return args -> {

            // 1. Trimitem mesajul de test către RabbitMQ (în coada "test_queue")

            // 2. Verificăm dacă există deja date pentru a nu insera duplicate la fiecare restart
            if (userRepository.count() == 0) {

                // Creăm entitatea de bază (Autentificarea)
                User user = new User();
                user.setEmail("student@uniconnect.com");
                user.setPassword("parola_hash_simulata");
                user.setRole("STUDENT");

                User savedUser = userRepository.save(user);

                // Creăm profilul de student și îl legăm de User
                Student student = new Student();
                student.setUser(savedUser);
                student.setFirstName("Alexandru-Vladimir");
                student.setLastName("Mitroi");
                student.setRegistrationNumber("MAT12345");
                student.setEnrollmentYear(2023);
                student.setStudyYear(3);
                student.setDateOfBirth(LocalDate.of(2004, 8, 19));
                student.setFundingType("BUGET");

                studentRepository.save(student);

                System.out.println("Datele de test pentru Alexandru-Vladimir au fost inserate cu succes!");
            }
        };
    }
}