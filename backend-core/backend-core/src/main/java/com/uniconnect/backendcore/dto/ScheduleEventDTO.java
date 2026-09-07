package com.uniconnect.backendcore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleEventDTO {
    private Long id;
    private Long courseInstanceId;
    private String courseName;
    private String professorName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
    private String slotType;
}
