package com.resolveit.backend.repository;

import com.resolveit.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
    List<Note> findByComplaintIdAndTypeOrderByCreatedAtDesc(Long complaintId, String type);
}