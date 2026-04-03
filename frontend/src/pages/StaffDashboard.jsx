import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const statusColors = {
  NEW: { bg: "#ebf8ff", color: "#2b6cb0", label: "New" },
  UNDER_REVIEW: { bg: "#fffaf0", color: "#c05621", label: "Under Review" },
  RESOLVED: { bg: "#f0fff4", color: "#276749", label: "Resolved" },
  ESCALATED: { bg: "#fff5f5", color: "#c53030", label: "Escalated" },
};
const urgencyColors = { LOW: "#48bb78", MEDIUM: "#ed8936", HIGH: "#e53e3e" };

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [updateForm, setUpdateForm] = useState({ status: "NEW", comment: "" });
  const [noteForm, setNoteForm] = useState({ content: "", type: "INTERNAL" });
  const [msg, setMsg] = useState("");

  const handleLogout = () => { logout(); navigate("/login"); };

  const loadAssigned = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/complaints/assigned");
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "assigned") loadAssigned();
    if (view === "all") loadAll();
  }, [view]);

  const openComplaint = async (c) => {
    setSelected(c);
    setUpdateForm({ status: c.status, comment: "" });
    setMsg("");
    try {
      const [tRes, nRes] = await Promise.all([
        API.get(`/api/complaints/${c.id}/timeline`),
        API.get(`/api/complaints/${c.id}/notes`),
      ]);
      setTimeline(tRes.data);
      setNotes(nRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.comment.trim()) {
      setMsg("❌ Please add a comment.");
      return;
    }
    try {
      await API.patch(`/api/complaints/${selected.id}/status`, updateForm);
      setMsg("✅ Status updated successfully!");
      setSelected(prev => ({ ...prev, status: updateForm.status }));
      const tRes = await API.get(`/api/complaints/${selected.id}/timeline`);
      setTimeline(tRes.data);
      if (view === "assigned") loadAssigned();
      else loadAll();
    } catch {
      setMsg("❌ Failed to update status.");
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.content.trim()) {
      setMsg("❌ Please write a note first.");
      return;
    }
    try {
      await API.post(`/api/complaints/${selected.id}/notes`, noteForm);
      setMsg("✅ Note added successfully!");
      setNoteForm({ content: "", type: noteForm.type });
      const nRes = await API.get(`/api/complaints/${selected.id}/notes`);
      setNotes(nRes.data);
    } catch {
      setMsg("❌ Failed to add note.");
    }
  };

  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <span style={{ fontSize: "22px" }}>👨‍💼</span>
        <h1 style={styles.headerTitle}>Staff Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.roleBadge}>STAFF</span>
          <span style={styles.emailText}>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* ── NAV BAR ── */}
      <div style={styles.navbar}>
        {[
          { key: "home", label: "🏠 Home" },
          { key: "assigned", label: "📥 Assigned to Me" },
          { key: "all", label: "📋 All Complaints" },
        ].map(item => (
          <button key={item.key}
            onClick={() => setView(item.key)}
            style={{
              ...styles.navItem,
              color: view === item.key ? "#667eea" : "#666",
              borderBottom: view === item.key ? "3px solid #667eea" : "3px solid transparent",
            }}>
            {item.label}
          </button>
        ))}
        <button
          onClick={() => navigate("/submit-complaint")}
          style={{ ...styles.navItem, color: "#666", borderBottom: "3px solid transparent" }}>
          ✏️ Submit Complaint
        </button>
        <button
          onClick={() => navigate("/my-complaints")}
          style={{ ...styles.navItem, color: "#666", borderBottom: "3px solid transparent" }}>
          📁 My Complaints
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.body}>

        {/* HOME VIEW */}
        {view === "home" && (
          <div>
            <h2 style={styles.pageTitle}>Welcome, {user?.email} 👋</h2>
            <div style={styles.cardGrid}>
              {[
                {
                  icon: "📥", title: "Assigned to Me",
                  desc: "View all complaints assigned to you by admin",
                  color: "#667eea", action: () => setView("assigned"),
                },
                {
                  icon: "📋", title: "All Complaints",
                  desc: "View all complaints and update their status",
                  color: "#48bb78", action: () => setView("all"),
                },
                {
                  icon: "✏️", title: "Submit Complaint",
                  desc: "Submit a new complaint or grievance",
                  color: "#ed8936", action: () => navigate("/submit-complaint"),
                },
                {
                  icon: "📁", title: "My Complaints",
                  desc: "View complaints you have submitted",
                  color: "#9f7aea", action: () => navigate("/my-complaints"),
                },
              ].map(card => (
                <div key={card.title} style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}>
                  <div style={styles.cardEmoji}>{card.icon}</div>
                  <h3 style={styles.cardTitle}>{card.title}</h3>
                  <p style={styles.cardDesc}>{card.desc}</p>
                  <button onClick={card.action}
                    style={{ ...styles.cardButton, background: card.color }}>
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSIGNED / ALL COMPLAINTS VIEW */}
        {(view === "assigned" || view === "all") && (
          <div>
            <h2 style={styles.pageTitle}>
              {view === "assigned" ? "📥 Assigned to Me" : "📋 All Complaints"}
            </h2>

            {loading && <p style={{ color: "#666" }}>Loading complaints...</p>}

            {!loading && complaints.length === 0 && (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                <p style={{ color: "#666", margin: 0 }}>
                  {view === "assigned"
                    ? "No complaints assigned to you yet. Ask admin to assign some."
                    : "No complaints found."}
                </p>
              </div>
            )}

            {!loading && complaints.length > 0 && (
              <div style={styles.complaintList}>
                {complaints.map(c => {
                  const st = statusColors[c.status] || statusColors.NEW;
                  return (
                    <div key={c.id} style={styles.complaintRow}>
                      <div style={styles.rowTop}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={styles.idTag}>#{c.id}</span>
                          <span style={styles.subjectText}>{c.subject}</span>
                        </div>
                        <span style={{ ...styles.statusPill, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={styles.rowMeta}>
                        <span>📁 {c.category}</span>
                        <span style={{ color: urgencyColors[c.urgency], fontWeight: "600" }}>
                          ⚡ {c.urgency}
                        </span>
                        <span>🕒 {new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.assignedTo && (
                          <span style={{ color: "#48bb78", fontWeight: "600" }}>
                            👤 {c.assignedTo}
                          </span>
                        )}
                      </div>
                      <p style={styles.rowDesc}>
                        {c.description?.substring(0, 120)}...
                      </p>
                      <button onClick={() => openComplaint(c)} style={styles.manageBtn}>
                        Manage →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MANAGE MODAL ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => { setSelected(null); setMsg(""); }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={styles.modalTop}>
              <h2 style={styles.modalHeading}>
                #{selected.id} — {selected.subject}
              </h2>
              <button onClick={() => { setSelected(null); setMsg(""); }}
                style={styles.closeX}>✕</button>
            </div>

            {/* Info Cards */}
            <div style={styles.infoGrid}>
              {[
                ["Category", selected.category],
                ["Urgency", selected.urgency],
                ["Submitted by", selected.anonymous ? "🎭 Anonymous" : selected.userEmail],
                ["Current Status", statusColors[selected.status]?.label || selected.status],
              ].map(([label, val]) => (
                <div key={label} style={styles.infoBox}>
                  <div style={styles.infoLabel}>{label}</div>
                  <div style={{
                    ...styles.infoVal,
                    color: label === "Urgency" ? urgencyColors[val] : "#1a1a2e",
                    fontWeight: label === "Urgency" ? "700" : "500",
                  }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={styles.descSection}>
              <div style={styles.infoLabel}>Description</div>
              <p style={{ margin: 0, fontSize: "14px", color: "#444", lineHeight: "1.6" }}>
                {selected.description}
              </p>
            </div>

            {/* Message banner */}
            {msg && (
              <div style={{
                padding: "10px 14px", borderRadius: "8px", marginBottom: "14px",
                background: msg.startsWith("✅") ? "#f0fff4" : "#fff5f5",
                border: `1px solid ${msg.startsWith("✅") ? "#9ae6b4" : "#fed7d7"}`,
                color: msg.startsWith("✅") ? "#276749" : "#c53030",
                fontWeight: "600", fontSize: "13px",
              }}>
                {msg}
              </div>
            )}

            {/* ── SECTION 1: Update Status ── */}
            <div style={styles.section}>
              <p style={styles.sectionHeading}>🔄 Update Status</p>
              <select
                value={updateForm.status}
                onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                style={{ ...styles.inputField, marginBottom: "10px" }}>
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <textarea
                placeholder="Add a comment explaining the status change..."
                value={updateForm.comment}
                onChange={e => setUpdateForm({ ...updateForm, comment: e.target.value })}
                rows={3}
                style={{ ...styles.inputField, resize: "vertical", fontFamily: "inherit" }}
              />
              <button onClick={handleUpdate} style={styles.blueBtn}>
                Update Status
              </button>
            </div>

            {/* ── SECTION 2: Add Note ── */}
            <div style={styles.section}>
              <p style={styles.sectionHeading}>💬 Add Note / Reply</p>

              {/* Toggle internal / public */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                {[
                  { val: "INTERNAL", label: "🔒 Internal Note", color: "#ed8936" },
                  { val: "PUBLIC", label: "🌐 Public Reply", color: "#48bb78" },
                ].map(opt => (
                  <button key={opt.val}
                    onClick={() => setNoteForm({ ...noteForm, type: opt.val })}
                    style={{
                      padding: "6px 14px", borderRadius: "20px", border: "none",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px",
                      background: noteForm.type === opt.val ? opt.color : "#f0f0f0",
                      color: noteForm.type === opt.val ? "white" : "#555",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px" }}>
                {noteForm.type === "INTERNAL"
                  ? "🔒 Only visible to admin and staff"
                  : "🌐 User will see this reply in their My Complaints page"}
              </p>

              <textarea
                placeholder={noteForm.type === "INTERNAL"
                  ? "Write an internal note for admin/staff..."
                  : "Write a reply that the user will see..."}
                value={noteForm.content}
                onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                rows={3}
                style={{ ...styles.inputField, resize: "vertical", fontFamily: "inherit" }}
              />
              <button onClick={handleAddNote} style={styles.greenBtn}>
                Add Note
              </button>
            </div>

            {/* ── SECTION 3: Existing Notes ── */}
            {notes.length > 0 && (
              <div style={styles.section}>
                <p style={styles.sectionHeading}>📝 Notes ({notes.length})</p>
                {notes.map(n => (
                  <div key={n.id} style={{
                    borderRadius: "8px", padding: "10px 12px", marginBottom: "8px",
                    background: n.type === "INTERNAL" ? "#fffaf0" : "#f0fff4",
                    border: `1px solid ${n.type === "INTERNAL" ? "#fbd38d" : "#9ae6b4"}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: "700", padding: "2px 8px",
                        borderRadius: "10px",
                        background: n.type === "INTERNAL" ? "#fbd38d" : "#9ae6b4",
                        color: n.type === "INTERNAL" ? "#744210" : "#276749",
                      }}>
                        {n.type === "INTERNAL" ? "🔒 Internal" : "🌐 Public"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#999" }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#333" }}>
                      {n.content}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>
                      — {n.authorName || n.authorEmail}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION 4: Timeline ── */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <p style={styles.sectionHeading}>📋 Activity Timeline</p>
              {timeline.length === 0 ? (
                <p style={{ color: "#999", fontSize: "13px" }}>No activity yet.</p>
              ) : (
                timeline.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", gap: "12px", marginBottom: "16px", position: "relative" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#667eea", flexShrink: 0, marginTop: "4px" }} />
                    {i < timeline.length - 1 && (
                      <div style={{ position: "absolute", left: "4px", top: "14px", width: "2px", height: "calc(100% + 4px)", background: "#e2e8f0" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#1a1a2e" }}>
                        {t.status.replace("_", " ")}
                      </div>
                      <div style={{ fontSize: "13px", color: "#555" }}>{t.comment}</div>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        {new Date(t.updatedAt).toLocaleString()}
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

const styles = {
  page: { minHeight: "100vh", background: "#f7fafc" },
  header: { background: "#2d3748", padding: "14px 28px", display: "flex", alignItems: "center", gap: "12px" },
  headerTitle: { margin: 0, fontSize: "20px", color: "white", flex: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  roleBadge: { background: "#48bb78", color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  emailText: { color: "#aaa", fontSize: "14px" },
  logoutBtn: { padding: "7px 14px", borderRadius: "8px", border: "1.5px solid #e53e3e", background: "transparent", color: "#e53e3e", cursor: "pointer", fontWeight: "600" },
  navbar: { background: "white", padding: "0 28px", display: "flex", gap: "4px", borderBottom: "1px solid #e2e8f0", overflowX: "auto" },
  navItem: { padding: "14px 18px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap" },
  body: { padding: "28px" },
  pageTitle: { margin: "0 0 20px", fontSize: "20px", fontWeight: "700", color: "#1a1a2e" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardEmoji: { fontSize: "32px", marginBottom: "12px" },
  cardTitle: { margin: "0 0 8px", fontSize: "17px", fontWeight: "700", color: "#1a1a2e" },
  cardDesc: { margin: "0 0 20px", color: "#666", fontSize: "13px", lineHeight: "1.5" },
  cardButton: { padding: "9px 20px", borderRadius: "8px", color: "white", border: "none", cursor: "pointer", fontWeight: "600" },
  emptyBox: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  complaintList: { display: "flex", flexDirection: "column", gap: "14px", maxWidth: "860px" },
  complaintRow: { background: "white", borderRadius: "12px", padding: "18px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  idTag: { background: "#ebf4ff", color: "#3182ce", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  subjectText: { fontWeight: "700", fontSize: "15px", color: "#1a1a2e" },
  statusPill: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  rowMeta: { display: "flex", gap: "14px", fontSize: "13px", color: "#666", marginBottom: "8px", flexWrap: "wrap" },
  rowDesc: { color: "#555", fontSize: "13px", lineHeight: "1.5", margin: "0 0 12px" },
  manageBtn: { padding: "7px 16px", borderRadius: "8px", background: "#667eea", color: "white", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "580px", maxHeight: "90vh", overflowY: "auto" },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  modalHeading: { margin: 0, fontSize: "17px", fontWeight: "700", color: "#1a1a2e", flex: 1, paddingRight: "12px" },
  closeX: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#666" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" },
  infoBox: { background: "#f7fafc", borderRadius: "8px", padding: "10px 12px" },
  infoLabel: { fontSize: "11px", color: "#999", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" },
  infoVal: { fontSize: "14px" },
  descSection: { background: "#f7fafc", borderRadius: "8px", padding: "12px", marginBottom: "14px" },
  section: { background: "#f7fafc", borderRadius: "10px", padding: "14px", marginBottom: "14px" },
  sectionHeading: { margin: "0 0 10px", fontSize: "14px", fontWeight: "700", color: "#1a1a2e" },
  inputField: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box", display: "block" },
  blueBtn: { width: "100%", padding: "10px", borderRadius: "8px", background: "#667eea", color: "white", fontSize: "14px", fontWeight: "700", border: "none", cursor: "pointer", marginTop: "10px" },
  greenBtn: { width: "100%", padding: "10px", borderRadius: "8px", background: "#48bb78", color: "white", fontSize: "14px", fontWeight: "700", border: "none", cursor: "pointer", marginTop: "10px" },
};