package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
public class Student {

    @Id
    @Column(name = "user_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "registration_number", unique = true, nullable = false)
    private String registrationNumber;

    @Column(name = "enrollment_year")
    private Integer enrollmentYear;

    @Column(name = "study_year")
    private Integer studyYear;

    @Column(length = 10)
    private String series;

    @Column(name = "group_name", length = 20)
    private String groupName;

    @Column(name = "funding_type", length = 50)
    private String fundingType;
}