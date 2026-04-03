package com.resolveit.backend.repository;

import com.resolveit.backend.entity.MediaUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaUploadRepository extends JpaRepository<MediaUpload, Long> {
    List<MediaUpload> findByComplaintId(Long complaintId);
}