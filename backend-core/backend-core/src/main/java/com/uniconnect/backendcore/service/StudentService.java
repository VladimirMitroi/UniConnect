package com.uniconnect.backendcore.service;

import com.uniconnect.backendcore.dto.StudentResponseDTO;
import com.uniconnect.backendcore.model.Student;
import com.uniconnect.backendcore.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentResponseDTO> getAllStudents() {
        List<Student> students = studentRepository.findAll();

        return students.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private StudentResponseDTO mapToDTO(Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();
        dto.setId(student.getId());
        dto.setEmail(student.getUser().getEmail());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setRegistrationNumber(student.getRegistrationNumber());
        dto.setStudyYear(student.getStudyYear());
        dto.setGroupName(student.getGroupName());
        return dto;
    }
}