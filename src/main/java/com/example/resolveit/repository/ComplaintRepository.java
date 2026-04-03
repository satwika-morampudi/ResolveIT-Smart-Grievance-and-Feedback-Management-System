package com.example.resolveit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.resolveit.model.Complaint;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {

    List<Complaint> findByUserId(int userId);

    List<Complaint> findByAssignedStaff(int staffId);

    List<Complaint> findByStatus(String status);

    List<Complaint> findByTitleContaining(String keyword);
}
