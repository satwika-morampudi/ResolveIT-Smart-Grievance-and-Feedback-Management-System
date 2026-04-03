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

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/complaints/my")
      .then(res => setComplaints(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const viewTimeline = async (c) => {
    setSelected(c);
    setTimeline([]);
    setPublicNotes([]);
    try {
      const [tRes, nRes] = await Promise.all([
        API.get(`/api/complaints/${c.id}/timeline`),
        API.get(`/api/complaints/${c.id}/notes/public`),
      ]);
      setTimeline(tRes.data);
      setPublicNotes(nRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
        <h1 style={styles.title}>My Complaints</h1>
        <button onClick={() => navigate("/submit-complaint")} style={styles.newBtn}>
          + New Complaint
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>Loading...</p>
      ) : complaints.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "48px" }}>📭</div>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            No complaints submitted yet.
          </p>
          <button onClick={() => navigate("/submit-complaint")} style={styles.newBtn}>
            Submit Your First Complaint
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {complaints.map(c => {
            const s = statusColors[c.status] || statusColors.NEW;
            return (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={styles.idBadge}>#{c.id}</span>
                    <span style={styles.subject}>{c.subject}</span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: s.bg,
                    color: s.color,
                  }}>
                    {s.label}
                  </span>
                </div>

                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>📁 {c.category}</span>
                  <span style={{
                    ...styles.metaItem,
                    color: urgencyColors[c.urgency],
                    fontWeight: "600",
                  }}>
                    ⚡ {c.urgency}
                  </span>
                  <span style={styles.metaItem}>
                    🕒 {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  {c.anonymous && (
                    <span style={{ ...styles.metaItem, color: "#667eea", fontWeight: "600" }}>
                      🎭 Anonymous
                    </span>
                  )}
                  {c.assignedTo && (
                    <span style={{ ...styles.metaItem, color: "#48bb78", fontWeight: "600" }}>
                      👤 {c.assignedTo}
                    </span>
                  )}
                </div>

                <p style={styles.desc}>
                  {c.description?.substring(0, 120)}
                  {c.description?.length > 120 ? "..." : ""}
                </p>

                <button onClick={() => viewTimeline(c)} style={styles.timelineBtn}>
                  View Timeline & Replies →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1a2e", flex: 1 }}>
                #{selected.id} — {selected.subject}
              </h2>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
            </div>

            {/* Current Status */}
            <div style={styles.statusBig}>
              <span style={{ color: "#666" }}>Current Status: </span>
              <span style={{
                color: statusColors[selected.status]?.color,
                fontWeight: "700",
              }}>
                {statusColors[selected.status]?.label}
              </span>
              {selected.assignedTo && (
                <span style={{ marginLeft: "16px", color: "#48bb78", fontSize: "13px" }}>
                  👤 Assigned to {selected.assignedTo}
                </span>
              )}
            </div>
            {/* Attached Files */}
<div style={{ marginBottom: "16px" }}>
  <p style={{ margin: "0 0 10px", fontWeight: "700", fontSize: "15px", color: "#1a1a2e" }}>
    📎 Attached Files
  </p>
  <FileViewer complaintId={selected.id} />
</div>

            {/* Timeline */}
            <p style={styles.sectionLabel}>📋 Status Timeline</p>
            {timeline.length === 0 ? (
              <p style={{ color: "#999", fontSize: "13px" }}>No updates yet.</p>
            ) : (
              <div style={styles.timeline}>
                {timeline.map((t, i) => (
                  <div key={t.id} style={styles.timelineItem}>
                    <div style={styles.dot} />
                    {i < timeline.length - 1 && <div style={styles.line} />}
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineStatus}>
                        {t.status.replace("_", " ")}
                      </div>
                      <div style={styles.timelineComment}>{t.comment}</div>
                      <div style={styles.timelineMeta}>
                        {new Date(t.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Public Replies from Admin */}
            {publicNotes.length > 0 && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
                <p style={styles.sectionLabel}>💬 Replies from Admin</p>
                {publicNotes.map(n => (
                  <div key={n.id} style={styles.replyCard}>
                    <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#333", lineHeight: "1.5" }}>
                      {n.content}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                      — {n.authorName || n.authorEmail} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f7fafc", padding: "24px" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" },
  back: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #cbd5e0", background: "white", cursor: "pointer" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1a1a2e", flex: 1 },
  newBtn: { padding: "10px 20px", borderRadius: "8px", background: "#667eea", color: "white", border: "none", cursor: "pointer", fontWeight: "600" },
  empty: { textAlign: "center", padding: "60px", color: "#666" },
  list: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px", margin: "0 auto" },
  card: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  idBadge: { background: "#ebf4ff", color: "#3182ce", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  subject: { fontWeight: "700", fontSize: "16px", color: "#1a1a2e" },
  statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  cardMeta: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "10px" },
  metaItem: { fontSize: "13px", color: "#666" },
  desc: { color: "#555", fontSize: "14px", lineHeight: "1.5", margin: "0 0 12px" },
  timelineBtn: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #667eea", color: "#667eea", background: "white", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "white", borderRadius: "16px", padding: "28px", width: "90%", maxWidth: "520px", maxHeight: "85vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#666" },
  statusBig: { background: "#f7fafc", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "15px" },
  sectionLabel: { margin: "0 0 12px", fontWeight: "700", fontSize: "15px", color: "#1a1a2e" },
  timeline: { display: "flex", flexDirection: "column", marginBottom: "16px" },
  timelineItem: { display: "flex", gap: "16px", position: "relative", paddingBottom: "20px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%", background: "#667eea", flexShrink: 0, marginTop: "4px" },
  line: { position: "absolute", left: "5px", top: "16px", width: "2px", height: "100%", background: "#e2e8f0" },
  timelineContent: { flex: 1 },
  timelineStatus: { fontWeight: "700", color: "#1a1a2e", fontSize: "14px", marginBottom: "4px" },
  timelineComment: { color: "#555", fontSize: "13px", marginBottom: "4px" },
  timelineMeta: { color: "#999", fontSize: "12px" },
  replyCard: { background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "8px", padding: "12px", marginBottom: "10px" },
};