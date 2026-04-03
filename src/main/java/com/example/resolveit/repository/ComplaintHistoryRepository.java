package com.example.resolveit.repository;

import com.example.resolveit.model.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Integer> {
    List<ComplaintHistory> findByComplaintIdOrderByUpdatedAtDesc(int complaintId);
}
