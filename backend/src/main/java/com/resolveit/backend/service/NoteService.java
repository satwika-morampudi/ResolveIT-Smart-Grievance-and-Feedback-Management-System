package com.resolveit.backend.service;

import com.resolveit.backend.dto.*;
import com.resolveit.backend.entity.*;
import com.resolveit.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepo;
    private final ComplaintRepository complaintRepo;
    private final UserRepository userRepo;

    public NoteService(NoteRepository noteRepo,
                       ComplaintRepository complaintRepo,
                       UserRepository userRepo) {
        this.noteRepo = noteRepo;
        this.complaintRepo = complaintRepo;
        this.userRepo = userRepo;
    }

    public NoteResponse addNote(Long complaintId, NoteRequest req, String authorEmail) {
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User author = userRepo.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Note note = new Note();
        note.setComplaint(complaint);
        note.setAuthor(author);
        note.setContent(req.getContent());
        note.setType(req.getType().toUpperCase());
        noteRepo.save(note);

        return toResponse(note);
    }

    // Get all notes for a complaint (admin/staff see both)
    public List<NoteResponse> getNotes(Long complaintId) {
        return noteRepo.findByComplaintIdOrderByCreatedAtDesc(complaintId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Get only PUBLIC notes (for users)
    public List<NoteResponse> getPublicNotes(Long complaintId) {
        return noteRepo.findByComplaintIdAndTypeOrderByCreatedAtDesc(complaintId, "PUBLIC")
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private NoteResponse toResponse(Note n) {
        NoteResponse r = new NoteResponse();
        r.setId(n.getId());
        r.setContent(n.getContent());
        r.setType(n.getType());
        r.setAuthorEmail(n.getAuthor().getEmail());
        r.setAuthorName(n.getAuthor().getName());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}