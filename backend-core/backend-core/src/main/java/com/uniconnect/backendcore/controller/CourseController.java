package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.CourseInstance;
import com.uniconnect.backendcore.model.EnrollmentRequest;
import com.uniconnect.backendcore.repository.CourseInstanceRepository;
import com.uniconnect.backendcore.repository.EnrollmentRequestRepository;
import com.uniconnect.backendcore.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Asigură-te că ai CORS configurat pentru React
public class CourseController {

    // 1. Dependența ta existentă
    private final DocumentService documentService;

    // 2. Noile dependențe pentru gestiunea cursurilor și înscrierilor
    private final CourseInstanceRepository courseInstanceRepository;
    private final EnrollmentRequestRepository enrollmentRequestRepository;

    // ==========================================
    // ENDPOINT-UL TĂU EXISTENT (NEATINS)
    // ==========================================
    @PostMapping("/upload")
    public ResponseEntity<?> uploadCourse(@RequestParam("file") MultipartFile file) {
        try {
            // DocumentService va salva fișierul și va striga automat în RabbitMQ!
            String savedFileName = documentService.uploadDocument(file);

            return ResponseEntity.ok(Map.of(
                    "message", "Curs primit, salvat în MinIO și trimis spre procesare AI!",
                    "fileName", savedFileName
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Eroare la procesarea fișierului: " + e.getMessage());
        }
    }

    // ==========================================
    // NOILE ENDPOINT-URI PENTRU LOGICA ACADEMICĂ
    // ==========================================

    // 1. Cursurile la care este înscris un student (Obligatorii din oficiu + Opționale aprobate)
    @GetMapping("/student/my-courses")
    public ResponseEntity<List<CourseInstance>> getStudentCourses(
            @RequestParam String grupa,
            @RequestParam String serie,
            @RequestParam Long studentId) {

        // Luăm cursurile obligatorii specifice grupei și seriei sale
        List<CourseInstance> courses = courseInstanceRepository.findByGrupaAndSerieAndIsMandatoryTrue(grupa, serie);

        // Luăm ID-urile cursurilor unde a cerut acces și a fost aprobat (APPROVED)
        List<Long> approvedCourseIds = enrollmentRequestRepository.findApprovedCourseIdsByStudentId(studentId, "APPROVED");

        // Dacă are cursuri opționale aprobate, le aducem din DB și le adăugăm în listă
        if (!approvedCourseIds.isEmpty()) {
            List<CourseInstance> approvedCourses = courseInstanceRepository.findAllById(approvedCourseIds);
            courses.addAll(approvedCourses);
        }

        return ResponseEntity.ok(courses);
    }

    // 2. Pagina de explorare: Toate cursurile din facultate la care studentul NU aparține din oficiu
    @GetMapping("/student/explore")
    public ResponseEntity<List<CourseInstance>> exploreCatalog(@RequestParam String grupa) {
        return ResponseEntity.ok(courseInstanceRepository.findAllAvailableToExplore(grupa));
    }

    // 3. Studentul trimite o solicitare de înscriere la un curs opțional/altă grupă
    @PostMapping("/student/request-access")
    public ResponseEntity<Map<String, String>> requestAccess(@RequestBody EnrollmentRequest request) {
        request.setStatus("PENDING"); // Forțăm statusul inițial în așteptare
        enrollmentRequestRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Solicitarea a fost trimisă profesorului titular!"));
    }

    // 4. Profesorul își vizualizează cererile în așteptare (PENDING) pentru cursurile sale
    @GetMapping("/professor/requests")
    public ResponseEntity<List<EnrollmentRequest>> getProfessorRequests(@RequestParam Long professorId) {
        return ResponseEntity.ok(enrollmentRequestRepository.findPendingRequestsForProfessor(professorId));
    }

    // 5. Profesorul aprobă sau respinge o cerere (status: APPROVED sau REJECTED)
    @PutMapping("/professor/respond-request/{requestId}")
    public ResponseEntity<Map<String, String>> respondToRequest(
            @PathVariable Long requestId,
            @RequestParam String status) {

        return enrollmentRequestRepository.findById(requestId)
                .map(req -> {
                    req.setStatus(status);
                    enrollmentRequestRepository.save(req);
                    return ResponseEntity.ok(Map.of("message", "Solicitare actualizată cu succes: " + status));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}