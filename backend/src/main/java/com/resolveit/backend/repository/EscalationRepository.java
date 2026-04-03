package com.resolveit.backend.repository;

import com.resolveit.backend.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    List<Escalation> findAllByOrderByEscalatedAtDesc();
    List<Escalation> findByComplaintId(Long complaintId);
    boolean existsByComplaintId(Long complaintId);
}