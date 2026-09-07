package com.uniconnect.backendcore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long userId;
    private String email;
    private String role;
    private String name;
    private Long studentId;
    private String series;
    private String groupName;
    private String firstName;
    private String lastName;
    private java.time.LocalDate dateOfBirth;
    private String registrationNumber;
    private Integer enrollmentYear;
    private Integer studyYear;
    private String fundingType;

    private Long professorId;
    private String academicRank;
    private String department;
    private String officeHours;
}
