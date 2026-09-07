package com.uniconnect.backendcore.repository;

import com.uniconnect.backendcore.model.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    
    @Query("SELECT m FROM DirectMessage m WHERE (m.sender.id = :user1 AND m.receiver.id = :user2) OR (m.sender.id = :user2 AND m.receiver.id = :user1) ORDER BY m.timestamp ASC")
    List<DirectMessage> findChatHistory(@Param("user1") Long user1, @Param("user2") Long user2);

    @Query("SELECT DISTINCT m.receiver FROM DirectMessage m WHERE m.sender.id = :userId")
    List<com.uniconnect.backendcore.model.User> findUsersIContacted(@Param("userId") Long userId);

    @Query("SELECT DISTINCT m.sender FROM DirectMessage m WHERE m.receiver.id = :userId")
    List<com.uniconnect.backendcore.model.User> findUsersWhoContactedMe(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.isRead = false")
    int countUnreadMessages(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE DirectMessage m SET m.isRead = true WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.isRead = false")
    void markAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
