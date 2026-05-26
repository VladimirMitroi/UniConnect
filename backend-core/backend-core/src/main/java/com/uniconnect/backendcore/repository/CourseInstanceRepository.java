package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.CourseInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseInstanceRepository extends JpaRepository<CourseInstance, Long> {

    // Pentru Profesori: aduce doar cursurile asignate lor
    List<CourseInstance> findByProfessorId(Long professorId);

    // Pentru Studenți: Cursurile Obligatorii din oficiu pe baza grupei și seriei
    List<CourseInstance> findByGrupaAndSerieAndIsMandatoryTrue(String grupa, String serie);

    // Pentru Pagina de Explorare: Toate cursurile la care studentul NU aparține din oficiu
    @Query("SELECT c FROM CourseInstance c WHERE c.grupa != :grupa OR c.isMandatory = false")
    List<CourseInstance> findAllAvailableToExplore(@Param("grupa") String grupa);
}