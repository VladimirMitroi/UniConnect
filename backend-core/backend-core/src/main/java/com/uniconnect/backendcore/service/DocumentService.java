package com.uniconnect.backendcore.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class DocumentService {

    private final MinioClient minioClient;
    private final RabbitTemplate rabbitTemplate; // NOU: Unealta pentru RabbitMQ

    @Value("${minio.bucket-name}")
    private String bucketName;

    // Injectăm ambele dependențe prin constructor
    public DocumentService(MinioClient minioClient, RabbitTemplate rabbitTemplate) {
        this.minioClient = minioClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    public String uploadDocument(MultipartFile file) throws Exception {
        // 1. Generăm un ID unic
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // 2. Salvăm fizic în MinIO
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        }

        // 3. NOU: Anunțăm microserviciul Python că are de lucru!
        // Trimitem ca mesaj exact numele fișierului pe care tocmai l-am salvat
        rabbitTemplate.convertAndSend("course_exchange", "course_routing_key", fileName);
        System.out.println(">>> [RabbitMQ] Am notificat Python să proceseze: " + fileName);

        return fileName;
    }
}