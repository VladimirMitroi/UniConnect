package com.uniconnect.backendcore.dto;

import lombok.Data;

@Data
public class ScheduleSlotRequestDTO {
    private Long courseInstanceId;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
    private String slotType;
}
