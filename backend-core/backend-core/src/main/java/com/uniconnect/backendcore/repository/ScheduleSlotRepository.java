package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.ScheduleSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {

    List<ScheduleSlot> findByCourseInstance_Id(Long courseInstanceId);
}

