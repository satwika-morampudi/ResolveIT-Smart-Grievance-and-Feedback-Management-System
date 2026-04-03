import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Escalations() {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ complaintId: "", reason: "" });
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, cRes] = await Promise.all([
        API.get("/api/escalations"),
        API.get("/api/complaints"),
      ]);
      setEscalations(eRes.data);
      setComplaints(cRes.data.filter(c => c.status !== "RESOLVED"));
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!form.complaintId || !form.reason.trim()) {
      setMsg("❌ Please select a complaint and provide a reason.");
      return;
    }
    try {
      await API.post("/api/escalations", {
        complaintId: parseInt(form.complaintId),
        reason: form.reason,
      });
      setMsg("✅ Complaint escalated successfully!");
      setForm({ complaintId: "", reason: "" });
      setShowForm(false);
      fetchData();
    } catch {
      setMsg("❌ Failed to escalate. Try again.");
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.patch(`/api/escalations/${id}/resolve`);
      setMsg("✅ Escalation resolved!");
      fetchData();
    } catch {
      setMsg("❌ Failed to resolve.");
    }
  };

  const filtered = filter === "ALL" ? escalations
    : filter === "OPEN" ? escalations.filter(e => !e.resolved)
    : escalations.filter(e => e.resolved);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>⚡ Escalations</h1>
        <button onClick={() => { setShowForm(!showForm); setMsg(""); }}
          style={styles.newBtn}>
          {showForm ? "Cancel" : "+ New Escalation"}
        </button>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          [escalations.length, "Total", "#667eea"],
          [escalations.filter(e => !e.resolved).length, "Open", "#e53e3e"],
          [escalations.filter(e => e.resolved).length, "Resolved", "#48bb78"],
          [escalations.filter(e => e.autoEscalated).length, "Auto-Escalated", "#ed8936"],
        ].map(([val, label, color]) => (
          <div key={label} style={styles.statCard}>
            <div style={{ ...styles.statVal, color }}>{val}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* New Escalation Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Escalate a Complaint</h3>
          <p style={styles.formNote}>
            Escalating will mark the complaint as ESCALATED and notify the Super Admin.
          </p>

          <div style={styles.field}>
            <label style={styles.label}>Select Complaint *</label>
            <select value={form.complaintId}
              onChange={e => setForm({ ...form, complaintId: e.target.value })}
              style={styles.input}>
              <option value="">-- Select a complaint --</option>
              {complaints.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.subject} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Reason for Escalation *</label>
            <textarea
              placeholder="Explain why this complaint needs to be escalated..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              rows={4}
              style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {msg && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px", marginBottom: "14px",
              background: msg.startsWith("✅") ? "#f0fff4" : "#fff5f5",
              color: msg.startsWith("✅") ? "#276749" : "#c53030",
              fontWeight: "600", fontSize: "13px",
            }}>{msg}</div>
          )}

          <button onClick={handleEscalate} style={styles.escalateBtn}>
            ⚡ Escalate Complaint
          </button>
        </div>
      )}

      {/* Filter Buttons */}
      <div style={styles.filterRow}>
        {["ALL", "OPEN", "RESOLVED"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              background: filter === f ? "#e53e3e" : "white",
              color: filter === f ? "white" : "#555",
            }}>
            {f}
          </button>
        ))}
      </div>

      {msg && !showForm && (
        <div style={{
          padding: "10px 14px", borderRadius: "8px", marginBottom: "14px",
          background: msg.startsWith("✅") ? "#f0fff4" : "#fff5f5",
          color: msg.startsWith("✅") ? "#276749" : "#c53030",
          fontWeight: "600", fontSize: "13px",
        }}>{msg}</div>
      )}

      {/* Escalations List */}
      {loading ? (
        <p style={{ color: "#666" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "48px" }}>⚡</div>
          <p style={{ color: "#666" }}>No escalations found.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(e => (
            <div key={e.id} style={{
              ...styles.escalationCard,
              borderLeft: `4px solid ${e.resolved ? "#48bb78" : "#e53e3e"}`,
            }}>
              <div style={styles.cardTop}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={styles.idBadge}>#{e.complaintId}</span>
                  <span style={styles.subject}>{e.complaintSubject}</span>
                  {e.autoEscalated && (
                    <span style={styles.autoBadge}>🤖 Auto</span>
                  )}
                </div>
                <span style={{
                  ...styles.statusPill,
                  background: e.resolved ? "#f0fff4" : "#fff5f5",
                  color: e.resolved ? "#276749" : "#c53030",
                }}>
                  {e.resolved ? "✅ Resolved" : "🔴 Open"}
                </span>
              </div>

              <div style={styles.reasonBox}>
                <span style={styles.reasonLabel}>Reason: </span>
                {e.reason}
              </div>

              <div style={styles.metaRow}>
                <span>👤 Escalated by: <strong>{e.escalatedBy}</strong></span>
                <span>📨 Assigned to: <strong>{e.escalatedTo}</strong></span>
                <span>🕒 {new Date(e.escalatedAt).toLocaleString()}</span>
              </div>

              {!e.resolved && (
                <button onClick={() => handleResolve(e.id)} style={styles.resolveBtn}>
                  ✅ Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f7fafc", padding: "24px" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  backBtn: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #cbd5e0", background: "white", cursor: "pointer" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1a1a2e", flex: 1 },
  newBtn: { padding: "10px 20px", borderRadius: "8px", background: "#e53e3e", color: "white", border: "none", cursor: "pointer", fontWeight: "600" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "14px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "12px", padding: "18px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  statVal: { fontSize: "32px", fontWeight: "700", marginBottom: "4px" },
  statLabel: { color: "#666", fontSize: "13px" },
  formCard: { background: "white", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: "600px" },
  formTitle: { margin: "0 0 6px", fontSize: "17px", fontWeight: "700", color: "#1a1a2e" },
  formNote: { margin: "0 0 18px", fontSize: "13px", color: "#666", lineHeight: "1.5" },
  field: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  escalateBtn: { width: "100%", padding: "12px", borderRadius: "8px", background: "#e53e3e", color: "white", fontSize: "15px", fontWeight: "700", border: "none", cursor: "pointer" },
  filterRow: { display: "flex", gap: "8px", marginBottom: "16px" },
  filterBtn: { padding: "7px 16px", borderRadius: "20px", border: "1.5px solid #e2e8f0", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  empty: { textAlign: "center", padding: "60px", color: "#666" },
  list: { display: "flex", flexDirection: "column", gap: "14px", maxWidth: "860px" },
  escalationCard: { background: "white", borderRadius: "12px", padding: "18px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  idBadge: { background: "#fff5f5", color: "#c53030", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  subject: { fontWeight: "700", fontSize: "15px", color: "#1a1a2e" },
  autoBadge: { background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  statusPill: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  reasonBox: { background: "#fff5f5", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px", fontSize: "14px", color: "#444", lineHeight: "1.5" },
  reasonLabel: { fontWeight: "700", color: "#c53030" },
  metaRow: { display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "#666", marginBottom: "12px" },
  resolveBtn: { padding: "8px 18px", borderRadius: "8px", background: "#48bb78", color: "white", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
};