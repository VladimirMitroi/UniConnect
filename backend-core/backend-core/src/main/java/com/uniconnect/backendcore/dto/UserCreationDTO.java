package com.uniconnect.backendcore.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserCreationDTO {
    // Autentificare
    private String email;
    private String password;
    private String role;

    // Date Comune Profil
    private String firstName;
    private String lastName;

    // ======= STRICT STUDENT =======
    private LocalDate dateOfBirth;        // Adăugat
    private String registrationNumber;
    private Integer enrollmentYear;       // Adăugat
    private Integer studyYear;
    private String series;
    private String groupName;
    private String fundingType;

    // ======= STRICT PROFESOR =======
    private String academicRank;
    private String department;
    private String officeHours;           // Adăugat
}