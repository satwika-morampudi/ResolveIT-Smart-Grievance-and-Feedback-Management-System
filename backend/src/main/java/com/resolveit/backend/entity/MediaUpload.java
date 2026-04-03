package com.resolveit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "media_uploads")
@Data
public class MediaUpload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    private String fileName;
    private String filePath;
    private String fileType;
    private LocalDateTime uploadedAt = LocalDateTime.now();
}