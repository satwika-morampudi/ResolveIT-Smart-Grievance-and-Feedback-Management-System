package com.resolveit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Data
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @Column(length = 2000)
    private String content;

    private String type; // INTERNAL or PUBLIC

    private LocalDateTime createdAt = LocalDateTime.now();
}