package com.uniconnect.backendcore.dto;

import lombok.Data;

@Data
public class StudentResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String registrationNumber;
    private Integer studyYear;
    private String groupName;
}