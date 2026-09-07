package com.uniconnect.backendcore.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_slots")
@Data
@NoArgsConstructor
public class ScheduleSlot {

    public enum AcademicDayOfWeek {
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY
    }

    public enum SlotType {
        LECTURE,
        SEMINAR
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_instance_id", nullable = false)
    private CourseInstance courseInstance;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", length = 16, nullable = false)
    private AcademicDayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "room", length = 64, nullable = false)
    private String room;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_type", length = 16)
    private SlotType slotType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

