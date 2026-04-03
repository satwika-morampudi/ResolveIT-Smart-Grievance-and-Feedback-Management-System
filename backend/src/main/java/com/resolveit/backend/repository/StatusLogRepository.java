package com.resolveit.backend.repository;

import com.resolveit.backend.entity.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StatusLogRepository extends JpaRepository<StatusLog, Long> {
    List<StatusLog> findByComplaintIdOrderByUpdatedAtDesc(Long complaintId);
}