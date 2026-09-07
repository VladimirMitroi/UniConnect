package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.Enrollment;
import com.uniconnect.backendcore.model.CourseInstance;
import com.uniconnect.backendcore.model.CourseMaterial;
import com.uniconnect.backendcore.model.CourseSection;
import com.uniconnect.backendcore.model.EnrollmentRequest;
import com.uniconnect.backendcore.repository.CourseInstanceRepository;
import com.uniconnect.backendcore.repository.CourseMaterialRepository;
import com.uniconnect.backendcore.repository.CourseSectionRepository;
import com.uniconnect.backendcore.repository.EnrollmentRepository;
import com.uniconnect.backendcore.repository.EnrollmentRequestRepository;
import com.uniconnect.backendcore.repository.MaterialProgressRepository;
import com.uniconnect.backendcore.repository.ProfessorRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.model.Professor;
import com.uniconnect.backendcore.model.MaterialProgress;
import com.uniconnect.backendcore.model.Student;
import com.uniconnect.backendcore.model.Professor;
import com.uniconnect.backendcore.service.DocumentService;
import com.uniconnect.backendcore.service.GlobalSettingService;
import com.uniconnect.backendcore.service.CourseSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final DocumentService documentService;
    private final GlobalSettingService globalSettingService;
    private final CourseSectionService courseSectionService;

    private final CourseInstanceRepository courseInstanceRepository;
    private final EnrollmentRequestRepository enrollmentRequestRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final MaterialProgressRepository materialProgressRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadCourse(@RequestParam("file") MultipartFile file) {
        try {
            String savedFileName = documentService.uploadDocument(file);

            return ResponseEntity.ok(Map.of(
                    "message", "Curs primit, salvat în MinIO și trimis spre procesare AI!",
                    "fileName", savedFileName
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Eroare la procesarea fișierului: " + e.getMessage());
        }
    }


    @GetMapping("/student/my-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseInstance>> getStudentCourses(
            @RequestParam String grupa,
            @RequestParam String serie,
            @RequestParam Long studentId) {

        var student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        List<CourseInstance> mandatoryCourses = courseInstanceRepository.findMandatoryCoursesForStudent(grupa, serie);
        List<CourseInstance> courses = new ArrayList<>(mandatoryCourses);
        Set<Long> includedCourseIds = new HashSet<>();

        for (CourseInstance c : mandatoryCourses) {
            includedCourseIds.add(c.getId());
            ensureEnrollment(student.getId(), c.getId());
        }

        List<Long> approvedCourseIds = enrollmentRequestRepository.findApprovedCourseIdsByStudentId(studentId, "APPROVED");

        if (!approvedCourseIds.isEmpty()) {
            List<CourseInstance> approvedCourses = courseInstanceRepository.findAllById(approvedCourseIds);
            for (CourseInstance c : approvedCourses) {
                if (includedCourseIds.add(c.getId())) {
                    ensureEnrollment(student.getId(), c.getId());
                    courses.add(c);
                }
            }
        }

        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}/materials")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<CourseMaterial>> getCourseMaterials(@PathVariable Long courseId) {
        if (!courseInstanceRepository.existsById(courseId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(courseMaterialRepository.findByCourseInstance_IdOrderByCreatedAtDesc(courseId));
    }

    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCourseStudents(@PathVariable Long courseId) {
        CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();

        Set<Student> students = new HashSet<>();

        if (course.isMandatory() && course.getSerie() != null) {
            if (course.getGrupa() != null && !course.getGrupa().isEmpty()) {
                students.addAll(studentRepository.findBySeriesAndGroupName(course.getSerie(), course.getGrupa()));
            } else {
                students.addAll(studentRepository.findBySeries(course.getSerie()));
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseInstance_Id(courseId);
        for (Enrollment e : enrollments) {
            students.add(e.getStudent());
        }

        List<Map<String, String>> result = students.stream().map(s -> {
            Map<String, String> dto = new HashMap<>();
            dto.put("id", s.getId().toString());
            dto.put("firstName", s.getFirstName());
            dto.put("lastName", s.getLastName());
            dto.put("email", s.getUser() != null ? s.getUser().getEmail() : "");
            dto.put("series", s.getSeries() != null ? s.getSeries() : "-");
            dto.put("groupName", s.getGroupName() != null ? s.getGroupName() : "-");
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }


    @PostMapping("/{courseId}/generate-weeks")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> generateWeeks(@PathVariable Long courseId) {
        CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();

        List<CourseSection> sections = courseSectionService.generateWeeksForCourse(course);

        return ResponseEntity.ok(Map.of("message", "Au fost generate " + sections.size() + " săptămâni cu succes!", "sections", sections));
    }

    @GetMapping("/{courseId}/structure")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCourseStructure(@PathVariable Long courseId, Authentication auth) {
        boolean isStudent = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        
        List<CourseSection> sections = isStudent 
            ? courseSectionRepository.findByCourseInstance_IdAndIsVisibleTrueOrderByOrderIndexAsc(courseId)
            : courseSectionRepository.findByCourseInstance_IdOrderByOrderIndexAsc(courseId);

        List<CourseMaterial> materials = courseMaterialRepository.findByCourseInstance_IdOrderByCreatedAtDesc(courseId);

        Long currentStudentId = null;
        if (isStudent) {
            Student s = studentRepository.findByUser_Email(auth.getName()).orElse(null);
            if (s != null) {
                currentStudentId = s.getId();
            }
        }

        final Long studentIdToMatch = currentStudentId;
        materials = materials.stream().filter(m -> 
            m.getUploadedByStudentId() == null || 
            (isStudent && m.getUploadedByStudentId().equals(studentIdToMatch))
        ).collect(Collectors.toList());

        for (CourseMaterial m : materials) {
            if (m.getFileName() != null) {
                try {
                    m.setUrl(documentService.getFileUrl(m.getFileName()));
                } catch (Exception e) {
                    System.err.println("Eroare generare URL pentru " + m.getFileName() + ": " + e.getMessage());
                }
            }
        }

        List<CourseMaterial> generalMaterials = new ArrayList<>();
        Map<Long, List<CourseMaterial>> sectionMaterials = new HashMap<>();

        for (CourseMaterial m : materials) {
            if (m.getCourseSection() == null) {
                generalMaterials.add(m);
            } else {
                sectionMaterials.computeIfAbsent(m.getCourseSection().getId(), k -> new ArrayList<>()).add(m);
            }
        }

        List<Map<String, Object>> sectionsDto = new ArrayList<>();
        for (CourseSection s : sections) {
            sectionsDto.add(Map.of(
                "id", s.getId(),
                "title", s.getTitle(),
                "description", s.getDescription() != null ? s.getDescription() : "",
                "isVisible", s.isVisible(),
                "materials", sectionMaterials.getOrDefault(s.getId(), new ArrayList<>())
            ));
        }

        return ResponseEntity.ok(Map.of(
            "generalMaterials", generalMaterials,
            "sections", sectionsDto
        ));
    }

    @PutMapping("/sections/{sectionId}/visibility")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> toggleSectionVisibility(@PathVariable Long sectionId, @RequestParam boolean isVisible) {
        return courseSectionRepository.findById(sectionId).map(s -> {
            s.setVisible(isVisible);
            courseSectionRepository.save(s);
            return ResponseEntity.ok(Map.of("message", "Vizibilitate actualizată."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/materials/{materialId}/section")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> assignMaterialToSection(
            @PathVariable Long materialId, 
            @RequestParam(required = false) Long sectionId) {
            
        CourseMaterial material = courseMaterialRepository.findById(materialId).orElse(null);
        if (material == null) return ResponseEntity.notFound().build();

        if (sectionId == null) {
            material.setCourseSection(null);
        } else {
            CourseSection section = courseSectionRepository.findById(sectionId).orElse(null);
            if (section == null) return ResponseEntity.notFound().build();
            material.setCourseSection(section);
        }

        courseMaterialRepository.save(material);
        return ResponseEntity.ok(Map.of("message", "Material mutat cu succes."));
    }

    @PostMapping("/{courseId}/materials/upload")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> uploadMaterialToCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        
        try {
            CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
            if (course == null) return ResponseEntity.notFound().build();

            CourseSection section = null;
            if (sectionId != null) {
                section = courseSectionRepository.findById(sectionId).orElse(null);
                if (section == null) return ResponseEntity.notFound().build();
            }

            Professor prof = professorRepository.findByUser_Email(auth.getName()).orElse(null);

            String savedFileName = documentService.uploadFileOnly(file);
            String url = documentService.getFileUrl(savedFileName);

            CourseMaterial material = new CourseMaterial();
            material.setCourseInstance(course);
            material.setCourseSection(section);
            if (prof != null) material.setUploadedByProfessorId(prof.getId());
            material.setTitle(file.getOriginalFilename());
            material.setFileName(savedFileName);
            material.setOriginalFileName(file.getOriginalFilename());
            material.setContentType(file.getContentType());
            material.setSizeBytes(file.getSize());
            material.setUrl(url);
            material.setMaterialType(CourseMaterial.MaterialType.FILE);

            courseMaterialRepository.save(material);

            return ResponseEntity.ok(Map.of("message", "Material încărcat cu succes!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Eroare la upload: " + e.getMessage()));
        }
    }

    @DeleteMapping("/materials/{materialId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long materialId) {
        CourseMaterial material = courseMaterialRepository.findById(materialId).orElse(null);
        if (material == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            materialProgressRepository.deleteByMaterial_Id(materialId);

            if (material.getFileName() != null) {
                documentService.deleteFile(material.getFileName());
            }

            courseMaterialRepository.delete(material);

            return ResponseEntity.ok(Map.of("message", "Material sters cu succes!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Eroare la stergere: " + e.getMessage()));
        }
    }

    @GetMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<CourseInstance> getCourse(@PathVariable Long courseId) {
        return courseInstanceRepository.findById(courseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/explore")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseInstance>> exploreCatalog(
            @RequestParam String grupa,
            @RequestParam(required = false) String serie,
            @RequestParam(required = false) Long studentId) {
        String effectiveSerie = serie != null ? serie : "A"; 
        List<CourseInstance> availableCourses = courseInstanceRepository.findAllAvailableToExplore(grupa, effectiveSerie);
        
        if (studentId != null) {
            List<Long> enrolledCourseIds = enrollmentRepository.findByStudent_Id(studentId)
                    .stream()
                    .map(e -> e.getCourseInstance().getId())
                    .collect(java.util.stream.Collectors.toList());
                    
            availableCourses = availableCourses.stream()
                    .filter(c -> !enrolledCourseIds.contains(c.getId()))
                    .collect(java.util.stream.Collectors.toList());
        }

        return ResponseEntity.ok(availableCourses);
    }

    @PostMapping("/student/request-access")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> requestAccess(@RequestBody EnrollmentRequest request) {
        request.setStatus("PENDING");
        enrollmentRequestRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Solicitarea a fost trimisă profesorului titular!"));
    }

    @GetMapping("/student/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Long>> getMyRequestedCourseIds(@RequestParam Long studentId) {
        List<EnrollmentRequest> requests = enrollmentRequestRepository.findByStudentId(studentId);
        List<Long> requestedCourseIds = requests.stream()
                .filter(req -> "PENDING".equalsIgnoreCase(req.getStatus()))
                .map(EnrollmentRequest::getCourseInstanceId)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(requestedCourseIds);
    }

    @GetMapping("/professor/list")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<CourseInstance>> getProfessorCourses(@RequestParam Long professorId) {
        return ResponseEntity.ok(courseInstanceRepository.findByProfessorId(professorId));
    }

    @GetMapping("/professor/requests")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getProfessorRequests(
            @RequestParam Long professorId,
            Authentication authentication) {

        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null || !prof.getId().equals(professorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Nu ai acces la cererile altui profesor.");
        }

        return ResponseEntity.ok(enrollmentRequestRepository.findPendingRequestsForProfessor(professorId));
    }

    @PutMapping("/professor/respond-request/{requestId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> respondToRequest(
            @PathVariable Long requestId,
            @RequestParam String status,
            Authentication authentication) {

        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return enrollmentRequestRepository.findById(requestId)
                .map(req -> {
                    CourseInstance course = courseInstanceRepository.findById(req.getCourseInstanceId()).orElse(null);
                    if (course == null || !course.getProfessorId().equals(prof.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Cererea nu aparține unui curs pe care îl predați."));
                    }

                    req.setStatus(status);
                    enrollmentRequestRepository.save(req);

                    if ("APPROVED".equalsIgnoreCase(status)) {
                        ensureEnrollment(req.getStudentId(), req.getCourseInstanceId());
                    }

                    return ResponseEntity.ok(Map.of("message", "Solicitare actualizată cu succes: " + status));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void ensureEnrollment(Long studentId, Long courseInstanceId) {
        if (enrollmentRepository.existsByStudent_IdAndCourseInstance_Id(studentId, courseInstanceId)) {
            return;
        }

        var student = studentRepository.findById(studentId).orElse(null);
        var course = courseInstanceRepository.findById(courseInstanceId).orElse(null);
        if (student == null || course == null) {
            return;
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourseInstance(course);
        enrollment.setStatus("ACTIVE");
        enrollmentRepository.save(enrollment);
    }


    @PostMapping("/materials/{materialId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> markMaterialComplete(@PathVariable Long materialId, Authentication auth) {
        Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (materialProgressRepository.existsByStudent_IdAndMaterial_Id(student.getId(), materialId)) {
            return ResponseEntity.ok(Map.of("message", "Deja marcat ca finalizat."));
        }

        CourseMaterial material = courseMaterialRepository.findById(materialId).orElse(null);
        if (material == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Material invalid."));
        }

        MaterialProgress progress = new MaterialProgress();
        progress.setStudent(student);
        progress.setMaterial(material);
        progress.setCompletedAt(LocalDateTime.now());
        materialProgressRepository.save(progress);

        return ResponseEntity.ok(Map.of("message", "Material marcat ca finalizat cu succes."));
    }

    @GetMapping("/{courseId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getCourseProgress(@PathVariable Long courseId, Authentication auth) {
        Student student = studentRepository.findByUser_Email(auth.getName()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<MaterialProgress> progressList = materialProgressRepository.findByStudent_IdAndMaterial_CourseInstance_Id(student.getId(), courseId);
        List<Long> completedMaterialIds = new ArrayList<>();
        for (MaterialProgress p : progressList) {
            completedMaterialIds.add(p.getMaterial().getId());
        }

        return ResponseEntity.ok(completedMaterialIds);
    }

    @PutMapping("/{courseId}/image")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateCourseImage(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        
        CourseInstance course = courseInstanceRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();
        
        Professor prof = professorRepository.findByUser_Email(authentication.getName()).orElse(null);
        if (prof == null || !course.getProfessorId().equals(prof.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Nu ai permisiunea să editezi acest curs."));
        }
        
        String imageUrl = payload.get("imageUrl");
        course.setImageUrl(imageUrl);
        courseInstanceRepository.save(course);
        
        return ResponseEntity.ok(Map.of("message", "Imaginea cursului a fost actualizată."));
    }
}