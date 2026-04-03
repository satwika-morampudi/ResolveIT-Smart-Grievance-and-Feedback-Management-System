import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import FileViewer from "../components/FileViewer";

const statusColors = {
  NEW: { bg: "#ebf8ff", color: "#2b6cb0", label: "New" },
  UNDER_REVIEW: { bg: "#fffaf0", color: "#c05621", label: "Under Review" },
  RESOLVED: { bg: "#f0fff4", color: "#276749", label: "Resolved" },
  ESCALATED: { bg: "#fff5f5", color: "#c53030", label: "Escalated" },
};
const urgencyColors = { LOW: "#48bb78", MEDIUM: "#ed8936", HIGH: "#e53e3e" };

export default function AdminComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [files, setFiles] = useState([]);
  const [updateForm, setUpdateForm] = useState({ status: "", comment: "" });
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { fetchComplaints(); }, []);

  useEffect(() => {
    let result = complaints;
    if (statusFilter !== "ALL") result = result.filter(c => c.status === statusFilter);
    if (search.trim()) result = result.filter(c =>
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      c.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [complaints, search, statusFilter]);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/api/complaints");
      setComplaints(res.data);
    } finally {
      setLoading(false);
    }
  };

  const openComplaint = async (c) => {
    setSelected(c);
    setUpdateForm({ status: c.status, comment: "" });
    setSuccessMsg("");
    const [tRes, fRes] = await Promise.all([
      API.get(`/api/complaints/${c.id}/timeline`),
      API.get(`/api/complaints/${c.id}/files`),
    ]);
    setTimeline(tRes.data);
    setFiles(fRes.data);
  };

  const handleUpdate = async () => {
    if (!updateForm.status || !updateForm.comment.trim()) {
      alert("Please select a status and add a comment.");
      return;
    }
    setUpdating(true);
    try {
      await API.patch(`/api/complaints/${selected.id}/status`, updateForm);
      setSuccessMsg("✅ Status updated successfully!");
      await fetchComplaints();
      const tRes = await API.get(`/api/complaints/${selected.id}/timeline`);
      setTimeline(tRes.data);
      setSelected(prev => ({ ...prev, status: updateForm.status }));
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleEscalate = async () => {
    const reason = prompt("Enter reason for escalation:");
    if (!reason) return;
    try {
      await API.post("/api/escalations", {
        complaintId: selected.id,
        reason: reason,
      });
      setSuccessMsg("⚡ Complaint escalated successfully!");
      await fetchComplaints();
      const tRes = await API.get(`/api/complaints/${selected.id}/timeline`);
      setTimeline(tRes.data);
      setSelected(prev => ({ ...prev, status: "ESCALATED" }));
    } catch {
      alert("Failed to escalate complaint.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
        <h1 style={styles.title}>All Complaints</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={styles.count}>{filtered.length} complaints</span>
          <button onClick={() => navigate("/escalations")} style={styles.escalationsBtn}>
            ⚡ View Escalations
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          placeholder="🔍 Search by subject, email, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.statusFilters}>
          {["ALL","NEW","UNDER_REVIEW","RESOLVED","ESCALATED"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                ...styles.filterBtn,
                background: statusFilter === s ? "#667eea" : "white",
                color: statusFilter === s ? "white" : "#555",
              }}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "48px" }}>📭</div>
          <p>No complaints found.</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {["#ID","Subject","Category","User","Urgency","Status","Assigned To","Date","Action"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const s = statusColors[c.status] || statusColors.NEW;
                return (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}><span style={styles.idBadge}>#{c.id}</span></td>
                    <td style={{ ...styles.td, fontWeight: "600", maxWidth: "160px" }}>{c.subject}</td>
                    <td style={styles.td}>{c.category}</td>
                    <td style={styles.td}>
                      {c.anonymous ? <span style={styles.anonTag}>🎭 Anon</span> : c.userEmail}
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: urgencyColors[c.urgency], fontWeight: "700", fontSize: "13px" }}>
                        {c.urgency}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontSize: "13px", color: c.assignedTo ? "#667eea" : "#ccc" }}>
                      {c.assignedTo || "Unassigned"}
                    </td>
                    <td style={{ ...styles.td, color: "#999", fontSize: "13px" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => openComplaint(c)} style={styles.viewBtn}>
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>#{selected.id} — {selected.subject}</h2>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
            </div>

            {/* Details Grid */}
            <div style={styles.detailGrid}>
              {[
                ["Category", selected.category],
                ["Urgency", selected.urgency],
                ["Submitted by", selected.anonymous ? "🎭 Anonymous" : selected.userEmail],
                ["Assigned to", selected.assignedTo || "Unassigned"],
              ].map(([label, val]) => (
                <div key={label} style={styles.detailItem}>
                  <span style={styles.detailLabel}>{label}</span>
                  <span style={{
                    ...styles.detailVal,
                    color: label === "Urgency" ? urgencyColors[val] : "#1a1a2e",
                    fontWeight: label === "Urgency" ? "700" : "500",
                  }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={styles.descBox}>
              <p style={styles.detailLabel}>Description</p>
              <p style={styles.descText}>{selected.description}</p>
            </div>

            {/* Files */}
           {/* ── ATTACHED FILES ── */}
<div style={styles.section}>
  <p style={styles.sectionTitle}>📎 Attached Files</p>
  <FileViewer complaintId={selected.id} />
</div>

            {successMsg && (
              <div style={styles.successMsg}>{successMsg}</div>
            )}

            {/* ── UPDATE STATUS ── */}
            <div style={styles.section}>
              <p style={styles.sectionTitle}>🔄 Update Status</p>
              <select
                value={updateForm.status}
                onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                style={{ ...styles.input, marginBottom: "10px" }}>
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </select>
              <textarea
                placeholder="Add a comment explaining this status change..."
                value={updateForm.comment}
                onChange={e => setUpdateForm({ ...updateForm, comment: e.target.value })}
                style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
                rows={3}
              />
              <button onClick={handleUpdate} disabled={updating} style={styles.primaryBtn}>
                {updating ? "Updating..." : "✅ Update Status"}
              </button>
            </div>

            {/* ── ESCALATE ── */}
            {selected.status !== "ESCALATED" && selected.status !== "RESOLVED" && (
              <div style={styles.section}>
                <p style={styles.sectionTitle}>⚡ Escalate Complaint</p>
                <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px", lineHeight: "1.5" }}>
                  Escalate this complaint to Super Admin if it requires urgent attention
                  or has been unresolved for too long.
                </p>
                <button onClick={handleEscalate} style={styles.escalateBtn}>
                  ⚡ Escalate This Complaint
                </button>
              </div>
            )}

            {/* Already escalated notice */}
            {selected.status === "ESCALATED" && (
              <div style={styles.escalatedNotice}>
                <span style={{ fontSize: "20px" }}>⚡</span>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", color: "#c53030" }}>
                    This complaint is escalated
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#e53e3e" }}>
                    It has been forwarded to Super Admin for urgent review.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/escalations")}
                  style={{ padding: "7px 14px", borderRadius: "8px", background: "#e53e3e", color: "white", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap" }}>
                  View Escalations
                </button>
              </div>
            )}

            {/* ── ASSIGN TO STAFF ── */}
            <div style={styles.section}>
              <p style={styles.sectionTitle}>👤 Assign to Staff</p>
              <AssignSection
                complaintId={selected.id}
                currentAssigned={selected.assignedTo}
                onAssigned={(email) => {
                  setSelected(prev => ({ ...prev, assignedTo: email }));
                  fetchComplaints();
                }}
              />
            </div>

            {/* ── NOTES & REPLIES ── */}
            <div style={styles.section}>
              <p style={styles.sectionTitle}>💬 Notes & Replies</p>
              <NotesSection complaintId={selected.id} />
            </div>

            {/* ── TIMELINE ── */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <p style={styles.sectionTitle}>📋 Activity Timeline</p>
              {timeline.length === 0 ? (
                <p style={{ color: "#999", fontSize: "13px" }}>No activity yet.</p>
              ) : (
                timeline.map((t, i) => (
                  <div key={t.id} style={styles.timelineItem}>
                    <div style={styles.dot} />
                    {i < timeline.length - 1 && <div style={styles.line} />}
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a2e" }}>
                        {t.status.replace("_", " ")}
                      </div>
                      <div style={{ color: "#555", fontSize: "13px" }}>{t.comment}</div>
                      <div style={{ color: "#999", fontSize: "12px" }}>
                        by {t.updatedBy} · {new Date(t.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ── ASSIGN SECTION ──
function AssignSection({ complaintId, currentAssigned, onAssigned }) {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(currentAssigned || "");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/complaints/staff")
      .then(r => { setStaffList(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    if (!selectedStaff) { setMsg("Please select a staff member."); return; }
    try {
      await API.patch(`/api/complaints/${complaintId}/assign`, { staffEmail: selectedStaff });
      setMsg(`✅ Assigned to ${selectedStaff}`);
      onAssigned(selectedStaff);
    } catch {
      setMsg("❌ Failed to assign.");
    }
  };

  if (loading) return <p style={{ fontSize: "13px", color: "#999" }}>Loading staff...</p>;

  return (
    <div>
      {currentAssigned && (
        <p style={{ fontSize: "13px", color: "#667eea", marginBottom: "10px", fontWeight: "600" }}>
          Currently assigned to: {currentAssigned}
        </p>
      )}
      {staffList.length === 0 ? (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "12px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#c53030" }}>
            No staff members found. Register a user with STAFF role first.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
            style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", background: "white" }}>
            <option value="">-- Select staff member --</option>
            {staffList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleAssign}
            style={{ padding: "10px 20px", borderRadius: "8px", background: "#48bb78", color: "white", border: "none", cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap" }}>
            Assign
          </button>
        </div>
      )}
      {msg && (
        <p style={{ fontSize: "13px", marginTop: "8px", color: msg.startsWith("✅") ? "#276749" : "#c53030", fontWeight: "600" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

// ── NOTES SECTION ──
function NotesSection({ complaintId }) {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ content: "", type: "PUBLIC" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    API.get(`/api/complaints/${complaintId}/notes`).then(r => setNotes(r.data));
  }, [complaintId]);

  const handleAdd = async () => {
    if (!form.content.trim()) { setMsg("Please write a note first."); return; }
    try {
      await API.post(`/api/complaints/${complaintId}/notes`, form);
      setMsg("✅ Note added!");
      setForm({ content: "", type: form.type });
      const r = await API.get(`/api/complaints/${complaintId}/notes`);
      setNotes(r.data);
    } catch {
      setMsg("❌ Failed to add note.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        {["PUBLIC", "INTERNAL"].map(t => (
          <button key={t} onClick={() => setForm({ ...form, type: t })}
            style={{
              padding: "6px 16px", borderRadius: "20px", cursor: "pointer",
              fontWeight: "600", fontSize: "13px", border: "none",
              background: form.type === t ? (t === "PUBLIC" ? "#48bb78" : "#ed8936") : "#f0f0f0",
              color: form.type === t ? "white" : "#555",
            }}>
            {t === "PUBLIC" ? "🌐 Public Reply" : "🔒 Internal Note"}
          </button>
        ))}
      </div>
      <p style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
        {form.type === "PUBLIC"
          ? "✅ User will see this reply in their My Complaints page"
          : "🔒 Only visible to admin and staff"}
      </p>
      <textarea
        placeholder={form.type === "PUBLIC" ? "Write a reply to the user..." : "Write an internal note..."}
        value={form.content}
        onChange={e => setForm({ ...form, content: e.target.value })}
        rows={3}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical", outline: "none", marginBottom: "8px" }}
      />
      <button onClick={handleAdd}
        style={{ padding: "8px 20px", borderRadius: "8px", background: "#667eea", color: "white", border: "none", cursor: "pointer", fontWeight: "600", marginBottom: "12px" }}>
        Add Note
      </button>
      {msg && (
        <p style={{ fontSize: "13px", marginBottom: "8px", color: msg.startsWith("✅") ? "#276749" : "#c53030", fontWeight: "600" }}>
          {msg}
        </p>
      )}
      {notes.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#999" }}>No notes yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notes.map(n => (
            <div key={n.id} style={{
              background: n.type === "INTERNAL" ? "#fffaf0" : "#f0fff4",
              border: `1px solid ${n.type === "INTERNAL" ? "#fbd38d" : "#9ae6b4"}`,
              borderRadius: "8px", padding: "12px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px",
                  background: n.type === "INTERNAL" ? "#fbd38d" : "#9ae6b4",
                  color: n.type === "INTERNAL" ? "#744210" : "#276749",
                }}>
                  {n.type === "INTERNAL" ? "🔒 Internal" : "🌐 Public"}
                </span>
                <span style={{ fontSize: "12px", color: "#999" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#333", lineHeight: "1.5" }}>
                {n.content}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                — {n.authorName || n.authorEmail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f7fafc", padding: "24px" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  back: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #cbd5e0", background: "white", cursor: "pointer" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1a1a2e", flex: 1 },
  count: { background: "#667eea", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  escalationsBtn: { padding: "8px 16px", borderRadius: "8px", background: "#e53e3e", color: "white", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  filters: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
  searchInput: { padding: "11px 16px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  statusFilters: { display: "flex", gap: "8px", flexWrap: "wrap" },
  filterBtn: { padding: "7px 14px", borderRadius: "20px", border: "1.5px solid #e2e8f0", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  empty: { textAlign: "center", padding: "60px", color: "#666" },
  tableWrap: { background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f7fafc" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#555", borderBottom: "1.5px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "12px 16px", fontSize: "14px", color: "#333" },
  idBadge: { background: "#ebf4ff", color: "#3182ce", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  anonTag: { color: "#667eea", fontSize: "13px", fontWeight: "600" },
  statusBadge: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  viewBtn: { padding: "6px 14px", borderRadius: "6px", background: "#667eea", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "white", borderRadius: "16px", padding: "28px", width: "90%", maxWidth: "620px", maxHeight: "88vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1a2e", flex: 1, paddingRight: "16px" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#666" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" },
  detailItem: { background: "#f7fafc", borderRadius: "8px", padding: "10px 14px" },
  detailLabel: { fontSize: "11px", color: "#999", marginBottom: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  detailVal: { fontSize: "14px", fontWeight: "500" },
  descBox: { background: "#f7fafc", borderRadius: "8px", padding: "14px", marginBottom: "16px" },
  descText: { margin: 0, fontSize: "14px", color: "#444", lineHeight: "1.6" },
  fileChip: { background: "#ebf4ff", color: "#3182ce", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" },
  successMsg: { background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "8px", padding: "10px 14px", color: "#276749", marginBottom: "14px", fontSize: "13px", fontWeight: "600" },
  section: { background: "#f7fafc", borderRadius: "12px", padding: "16px", marginBottom: "16px" },
  sectionTitle: { margin: "0 0 12px", fontSize: "15px", fontWeight: "700", color: "#1a1a2e" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  primaryBtn: { width: "100%", padding: "11px", borderRadius: "8px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "15px", fontWeight: "700", border: "none", cursor: "pointer" },
  escalateBtn: { width: "100%", padding: "11px", borderRadius: "8px", background: "#e53e3e", color: "white", fontSize: "15px", fontWeight: "700", border: "none", cursor: "pointer" },
  escalatedNotice: { display: "flex", alignItems: "center", gap: "12px", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  timelineItem: { display: "flex", gap: "16px", position: "relative", paddingBottom: "20px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%", background: "#667eea", flexShrink: 0, marginTop: "4px" },
  line: { position: "absolute", left: "5px", top: "16px", width: "2px", height: "100%", background: "#e2e8f0" },
};