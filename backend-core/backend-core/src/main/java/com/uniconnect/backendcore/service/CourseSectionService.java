package com.uniconnect.backendcore.service;

import com.uniconnect.backendcore.model.CourseInstance;
import com.uniconnect.backendcore.model.CourseSection;
import com.uniconnect.backendcore.repository.CourseSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseSectionService {

    private final CourseSectionRepository courseSectionRepository;
    private final GlobalSettingService globalSettingService;

    public List<CourseSection> generateWeeksForCourse(CourseInstance course) {
        String startDateStr = globalSettingService.getSettingValue("academic_start_date", java.time.LocalDate.now().toString());
        int weeks = Integer.parseInt(globalSettingService.getSettingValue("academic_weeks", "14"));
        String holidaysStr = globalSettingService.getSettingValue("academic_holidays", "");

        java.time.LocalDate startDate = java.time.LocalDate.parse(startDateStr);
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("d MMM");

        List<java.time.LocalDate[]> holidayPeriods = new ArrayList<>();
        if (!holidaysStr.isEmpty()) {
            for (String range : holidaysStr.split(",")) {
                String[] parts = range.split(":");
                if (parts.length == 2) {
                    holidayPeriods.add(new java.time.LocalDate[]{java.time.LocalDate.parse(parts[0]), java.time.LocalDate.parse(parts[1])});
                }
            }
        }

        List<CourseSection> sections = new ArrayList<>();
        int generatedWeeks = 0;
        
        while (generatedWeeks < weeks) {
            java.time.LocalDate endDate = startDate.plusDays(6);
            
            boolean isHoliday = false;
            for (java.time.LocalDate[] period : holidayPeriods) {
                if (!startDate.isAfter(period[1]) && !endDate.isBefore(period[0])) {
                    isHoliday = true;
                    break;
                }
            }

            if (!isHoliday) {
                generatedWeeks++;
                CourseSection section = new CourseSection();
                section.setCourseInstance(course);
                section.setOrderIndex(generatedWeeks);
                section.setTitle("Săptămâna " + generatedWeeks + " (" + startDate.format(formatter) + " - " + endDate.format(formatter) + ")");
                section.setVisible(true);
                sections.add(courseSectionRepository.save(section));
            }
            
            startDate = startDate.plusDays(7);
        }
        return sections;
    }
}
