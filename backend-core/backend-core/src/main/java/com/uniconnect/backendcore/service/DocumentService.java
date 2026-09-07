package com.uniconnect.backendcore.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;

@Service
public class DocumentService {

    private final MinioClient minioClient;
    private final RabbitTemplate rabbitTemplate;
    private final GlobalSettingService globalSettingService;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public DocumentService(MinioClient minioClient, RabbitTemplate rabbitTemplate, GlobalSettingService globalSettingService) {
        this.minioClient = minioClient;
        this.rabbitTemplate = rabbitTemplate;
        this.globalSettingService = globalSettingService;
    }

    private void validateFileSize(MultipartFile file) throws Exception {
        long maxUploadSizeMb = Long.parseLong(globalSettingService.getSettingValue("max_upload_size_mb", "20"));
        long maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;
        if (file.getSize() > maxUploadSizeBytes) {
            throw new Exception("Fișierul depășește limita maximă admisă de " + maxUploadSizeMb + " MB. (Dimensiune actuală: " + (file.getSize() / 1024 / 1024) + " MB)");
        }
    }

    public String uploadDocument(MultipartFile file) throws Exception {
        validateFileSize(file);
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

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

        rabbitTemplate.convertAndSend("course_exchange", "course_routing_key", fileName);
        System.out.println(">>> [RabbitMQ] Am notificat Python să proceseze: " + fileName);

        return fileName;
    }

    public String uploadFileOnly(MultipartFile file) throws Exception {
        validateFileSize(file);
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

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
        return fileName;
    }

    public String getFileUrl(String fileName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(fileName)
                        .expiry(1, TimeUnit.HOURS)
                        .build()
        );
    }

    public void deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                    io.minio.RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            System.err.println("Eroare la stergerea fisierului din MinIO: " + e.getMessage());
        }
    }
}