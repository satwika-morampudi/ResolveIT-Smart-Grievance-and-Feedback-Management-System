package com.resolveit.backend.controller;

import com.resolveit.backend.dto.*;
import com.resolveit.backend.entity.MediaUpload;
import com.resolveit.backend.repository.MediaUploadRepository;
import com.resolveit.backend.repository.ComplaintRepository;
import com.resolveit.backend.service.ComplaintService;
import com.resolveit.backend.service.FileStorageService;
import com.resolveit.backend.service.NoteService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final FileStorageService fileStorageService;
    private final MediaUploadRepository mediaUploadRepo;
    private final ComplaintRepository complaintRepo;
    private final NoteService noteService;

    public ComplaintController(ComplaintService complaintService,
                                FileStorageService fileStorageService,
                                MediaUploadRepository mediaUploadRepo,
                                ComplaintRepository complaintRepo,
                                NoteService noteService) {
        this.complaintService = complaintService;
        this.fileStorageService = fileStorageService;
        this.mediaUploadRepo = mediaUploadRepo;
        this.complaintRepo = complaintRepo;
        this.noteService = noteService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> submit(
            @RequestPart("data") ComplaintRequest req,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) {

        ComplaintResponse response = complaintService.submit(req, auth.getName());

        if (files != null && !files.isEmpty()) {
            var complaint = complaintRepo.findById(response.getId()).orElseThrow();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String savedName = fileStorageService.saveFile(file);
                    MediaUpload media = new MediaUpload();
                    media.setComplaint(complaint);
                    media.setFileName(file.getOriginalFilename());
                    media.setFilePath(savedName);
                    media.setFileType(file.getContentType());
                    mediaUploadRepo.save(media);
                }
            }
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> myComplaints(Authentication auth) {
        return ResponseEntity.ok(complaintService.getMyComplaints(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','SUPER_ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> allComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<StatusLogResponse>> timeline(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getTimeline(id));
    }

    @GetMapping("/{id}/files")
    public ResponseEntity<List<String>> getFiles(@PathVariable Long id) {
        List<String> fileNames = mediaUploadRepo.findByComplaintId(id)
                .stream().map(MediaUpload::getFileName).toList();
        return ResponseEntity.ok(fileNames);
    }

    @GetMapping("/file/{fileName:.+}")
public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
    try {
        byte[] data = fileStorageService.loadFile(fileName);
        String contentType = "application/octet-stream";
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (fileName.endsWith(".png")) contentType = "image/png";
        else if (fileName.endsWith(".pdf")) contentType = "application/pdf";
        else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) contentType = "application/msword";
        else if (fileName.endsWith(".txt")) contentType = "text/plain";

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                .header("Access-Control-Allow-Origin", "http://localhost:5173")
                .body(data);
    } catch (Exception e) {
        return ResponseEntity.notFound().build();
    }
}

@GetMapping("/files/complaint/{id}")
public ResponseEntity<?> getComplaintFiles(@PathVariable Long id) {
    var files = mediaUploadRepo.findByComplaintId(id);
    var result = files.stream().map(f -> {
        java.util.Map<String, String> map = new java.util.HashMap<>();
        map.put("id", String.valueOf(f.getId()));
        map.put("fileName", f.getFileName());
        map.put("filePath", f.getFilePath());
        map.put("fileType", f.getFileType());
        return map;
    }).collect(java.util.stream.Collectors.toList());
    return ResponseEntity.ok(result);
}

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','SUPER_ADMIN')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(complaintService.updateStatus(
                id, body.get("status"), body.get("comment"), auth.getName()));
    }

    // Assign complaint to staff
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ComplaintResponse> assign(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(complaintService.assignTo(
                id, body.get("staffEmail"), auth.getName()));
    }

    // Get all staff emails for assignment dropdown
    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<String>> getStaff() {
        return ResponseEntity.ok(complaintService.getAllStaff());
    }

    // Add note (INTERNAL or PUBLIC)
    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','SUPER_ADMIN')")
    public ResponseEntity<NoteResponse> addNote(
            @PathVariable Long id,
            @RequestBody NoteRequest req,
            Authentication auth) {
        return ResponseEntity.ok(noteService.addNote(id, req, auth.getName()));
    }

    // Get all notes (admin/staff)
    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','SUPER_ADMIN')")
    public ResponseEntity<List<NoteResponse>> getNotes(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNotes(id));
    }

    // Get public notes only (for users)
    @GetMapping("/{id}/notes/public")
    public ResponseEntity<List<NoteResponse>> getPublicNotes(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getPublicNotes(id));
    }
    @GetMapping("/assigned")
@PreAuthorize("hasAnyRole('STAFF')")
public ResponseEntity<List<ComplaintResponse>> assignedToMe(Authentication auth) {
    return ResponseEntity.ok(complaintService.getAssignedComplaints(auth.getName()));
}
}