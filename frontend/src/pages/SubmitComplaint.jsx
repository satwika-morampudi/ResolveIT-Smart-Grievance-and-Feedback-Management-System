import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "", category: "General",
    description: "", urgency: "MEDIUM", anonymous: false,
  });
  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(f => f.size <= 10 * 1024 * 1024);
    if (valid.length !== selected.length) {
      setError("Some files exceed 10MB and were removed.");
    }
    setFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(form)],
        { type: "application/json" }));
      files.forEach(f => formData.append("files", f));

      const res = await API.post("/api/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(`Complaint #${res.data.id} submitted successfully!`);
      setTimeout(() => navigate("/my-complaints"), 2000);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = { LOW: "#48bb78", MEDIUM: "#ed8936", HIGH: "#e53e3e" };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type === "application/pdf") return "📄";
    return "📎";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
        <h1 style={styles.title}>Submit Complaint</h1>
      </div>

      <div style={styles.card}>
        {success && <div style={styles.successBox}>{success}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Public / Anonymous toggle */}
          <div style={styles.typeRow}>
            {[false, true].map((anon) => (
              <button key={String(anon)} type="button"
                onClick={() => setForm({...form, anonymous: anon})}
                style={{...styles.typeBtn,
                  ...(form.anonymous === anon ? styles.typeBtnActive : {})}}>
                {anon ? "🎭 Anonymous" : "🌐 Public"}
              </button>
            ))}
          </div>
          {form.anonymous && (
            <p style={styles.anonNote}>Your identity will be hidden from admins.</p>
          )}

          {/* Subject */}
          <div style={styles.field}>
            <label style={styles.label}>Subject *</label>
            <input name="subject" value={form.subject} onChange={handleChange}
              style={styles.input} placeholder="Brief title of your complaint" required />
          </div>

          {/* Category */}
          <div style={styles.field}>
            <label style={styles.label}>Category *</label>
            <select name="category" value={form.category}
              onChange={handleChange} style={styles.input}>
              {["General","Infrastructure","Service","Staff Behavior",
                "Billing","Technical Issue","Other"].map(c =>
                <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <textarea name="description" value={form.description}
              onChange={handleChange} style={styles.textarea}
              placeholder="Describe your complaint in detail..." required rows={5} />
          </div>

          {/* Urgency */}
          <div style={styles.field}>
            <label style={styles.label}>Urgency</label>
            <div style={styles.urgencyRow}>
              {["LOW","MEDIUM","HIGH"].map(u => (
                <button key={u} type="button"
                  onClick={() => setForm({...form, urgency: u})}
                  style={{...styles.urgencyBtn,
                    background: form.urgency === u ? urgencyColors[u] : "white",
                    color: form.urgency === u ? "white" : urgencyColors[u],
                    border: `2px solid ${urgencyColors[u]}`}}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div style={styles.field}>
            <label style={styles.label}>Supporting Evidence (Optional)</label>
            <div style={styles.uploadBox}
              onClick={() => document.getElementById("fileInput").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files);
                setFiles(prev => [...prev, ...dropped]);
              }}>
              <div style={styles.uploadIcon}>📎</div>
              <p style={styles.uploadText}>
                Click to upload or drag & drop files here
              </p>
              <p style={styles.uploadHint}>
                Images, PDFs, documents — max 10MB each
              </p>
              <input id="fileInput" type="file" multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
                style={{ display: "none" }} />
            </div>

            {/* File Preview List */}
            {files.length > 0 && (
              <div style={styles.fileList}>
                {files.map((file, i) => (
                  <div key={i} style={styles.fileItem}>
                    <span style={styles.fileIcon}>{getFileIcon(file)}</span>
                    <div style={styles.fileInfo}>
                      <span style={styles.fileName}>{file.name}</span>
                      <span style={styles.fileSize}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    {file.type.startsWith("image/") && (
                      <img src={URL.createObjectURL(file)}
                        alt="preview"
                        style={styles.imgPreview} />
                    )}
                    <button type="button" onClick={() => removeFile(i)}
                      style={styles.removeBtn}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Submitting..." : `Submit Complaint${files.length > 0 ? ` with ${files.length} file(s)` : ""}`}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f7fafc", padding: "24px" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" },
  back: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #cbd5e0", background: "white", cursor: "pointer", fontSize: "14px" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1a1a2e" },
  card: { background: "white", borderRadius: "16px", padding: "32px", maxWidth: "640px", margin: "0 auto", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  successBox: { background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "8px", padding: "12px 16px", color: "#276749", marginBottom: "20px", fontWeight: "600" },
  errorBox: { background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "12px 16px", color: "#c53030", marginBottom: "20px" },
  typeRow: { display: "flex", gap: "12px", marginBottom: "16px" },
  typeBtn: { flex: 1, padding: "10px", borderRadius: "8px", border: "2px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#666" },
  typeBtnActive: { border: "2px solid #667eea", background: "#ebf4ff", color: "#667eea" },
  anonNote: { color: "#667eea", fontSize: "13px", marginBottom: "16px", background: "#ebf4ff", padding: "8px 12px", borderRadius: "6px" },
  field: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#333" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "15px", boxSizing: "border-box", outline: "none" },
  textarea: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "15px", boxSizing: "border-box", outline: "none", resize: "vertical", fontFamily: "inherit" },
  urgencyRow: { display: "flex", gap: "12px" },
  urgencyBtn: { flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700" },
  uploadBox: { border: "2px dashed #cbd5e0", borderRadius: "12px", padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", background: "#fafafa" },
  uploadIcon: { fontSize: "32px", marginBottom: "8px" },
  uploadText: { margin: "0 0 4px", fontWeight: "600", color: "#4a5568", fontSize: "15px" },
  uploadHint: { margin: 0, color: "#999", fontSize: "13px" },
  fileList: { marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" },
  fileItem: { display: "flex", alignItems: "center", gap: "10px", background: "#f7fafc", borderRadius: "8px", padding: "10px 12px", border: "1px solid #e2e8f0" },
  fileIcon: { fontSize: "20px", flexShrink: 0 },
  fileInfo: { flex: 1, display: "flex", flexDirection: "column" },
  fileName: { fontSize: "13px", fontWeight: "600", color: "#2d3748" },
  fileSize: { fontSize: "11px", color: "#999" },
  imgPreview: { width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" },
  removeBtn: { background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontSize: "16px", fontWeight: "700", padding: "4px 8px" },
  submitBtn: { width: "100%", padding: "14px", borderRadius: "8px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "16px", fontWeight: "700", border: "none", cursor: "pointer", marginTop: "8px" },
};