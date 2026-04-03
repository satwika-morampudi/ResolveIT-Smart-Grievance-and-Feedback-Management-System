package com.resolveit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalations")
@Data
public class Escalation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @ManyToOne
    @JoinColumn(name = "escalated_by")
    private User escalatedBy;

    @ManyToOne
    @JoinColumn(name = "escalated_to")
    private User escalatedTo;

    private String reason;
    private boolean isResolved = false;
    private boolean isAutoEscalated = false;

    private LocalDateTime escalatedAt = LocalDateTime.now();
}