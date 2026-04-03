package com.resolveit.backend.repository;

import com.resolveit.backend.entity.Complaint;
import com.resolveit.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByAssignedToOrderByCreatedAtDesc(User assignedTo);
}