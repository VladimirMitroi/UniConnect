package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByCourseInstanceIsNullOrderByPostedAtDesc();
    List<Announcement> findByCourseInstance_IdOrderByPostedAtDesc(Long courseId);
}
