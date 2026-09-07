package com.uniconnect.backendcore.controller;

import com.uniconnect.backendcore.model.DirectMessage;
import com.uniconnect.backendcore.model.User;
import com.uniconnect.backendcore.repository.DirectMessageRepository;
import com.uniconnect.backendcore.repository.UserRepository;
import com.uniconnect.backendcore.repository.StudentRepository;
import com.uniconnect.backendcore.repository.ProfessorRepository;
import com.uniconnect.backendcore.model.Student;
import com.uniconnect.backendcore.model.Professor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DirectMessageController {

    private final DirectMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;

    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload, Authentication auth) {
        User sender = userRepository.findByEmail(auth.getName()).orElse(null);
        if (sender == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        String content = payload.get("content").toString();

        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver == null) return ResponseEntity.badRequest().body("Receiver not found");

        DirectMessage msg = new DirectMessage();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(content);

        messageRepository.save(msg);
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/history/{otherUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getChatHistory(@PathVariable Long otherUserId, Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<DirectMessage> history = messageRepository.findChatHistory(currentUser.getId(), otherUserId);
        
        for (DirectMessage m : history) {
            if (m.getReceiver().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        }

        return ResponseEntity.ok(history);
    }

    @GetMapping("/contacts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getContacts(Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<User> contactedByMe = messageRepository.findUsersIContacted(currentUser.getId());
        List<User> contactedMe = messageRepository.findUsersWhoContactedMe(currentUser.getId());
        
        java.util.Set<User> activeConversationsSet = new java.util.HashSet<>(contactedByMe);
        activeConversationsSet.addAll(contactedMe);
        List<User> activeConversations = new java.util.ArrayList<>(activeConversationsSet);

        var contacts = activeConversations.stream().map(u -> Map.of(
                "id", u.getId(),
                "name", getNameForUser(u),
                "role", u.getRole(),
                "email", u.getEmail(),
                "unreadCount", messageRepository.countUnreadMessages(u.getId(), currentUser.getId())
        )).collect(Collectors.toList());

        return ResponseEntity.ok(contacts);
    }
    
    @GetMapping("/search-user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> searchUser(@RequestParam String query) {
        String lowerQuery = query.toLowerCase();
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(lowerQuery) || 
                             getNameForUser(u).toLowerCase().contains(lowerQuery))
                .limit(5)
                .collect(Collectors.toList());
                
        var results = users.stream().map(u -> Map.of(
                "id", u.getId(),
                "name", getNameForUser(u),
                "role", u.getRole(),
                "email", u.getEmail()
        )).collect(Collectors.toList());
        
        return ResponseEntity.ok(results);
    }

    private String getNameForUser(User u) {
        if ("ROLE_STUDENT".equals(u.getRole())) {
            Student s = studentRepository.findByUser_Email(u.getEmail()).orElse(null);
            return s != null ? s.getFirstName() + " " + s.getLastName() : u.getEmail();
        } else if ("ROLE_TEACHER".equals(u.getRole())) {
            Professor p = professorRepository.findByUser_Email(u.getEmail()).orElse(null);
            return p != null ? p.getFirstName() + " " + p.getLastName() : u.getEmail();
        }
        return u.getEmail();
    }
}
