package com.uniconnect.backendcore.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserCreationDTO {
    private String email;
    private String password;
    private String role;

    private String firstName;
    private String lastName;

    private LocalDate dateOfBirth;
    private String registrationNumber;
    private Integer enrollmentYear;
    private Integer studyYear;
    private String series;
    private String groupName;
    private String fundingType;

    private String academicRank;
    private String department;
    private String officeHours;
}