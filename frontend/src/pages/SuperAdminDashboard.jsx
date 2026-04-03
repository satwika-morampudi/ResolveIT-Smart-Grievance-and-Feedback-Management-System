import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ open: 0, resolved: 0, escalated: 0, total: 0 });

  useEffect(() => {
    API.get("/api/complaints").then(res => {
      const data = res.data;
      setStats({
        total: data.length,
        open: data.filter(c => c.status === "NEW" || c.status === "UNDER_REVIEW").length,
        resolved: data.filter(c => c.status === "RESOLVED").length,
        escalated: data.filter(c => c.status === "ESCALATED").length,
      });
    });
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const cards = [
    {
      icon: "⚡",
      title: "All Escalations",
      desc: "Manage all escalated complaints requiring urgent attention",
      color: "#e53e3e",
      action: () => navigate("/escalations"),
    },
    {
      icon: "📋",
      title: "All Complaints",
      desc: "Full access to view and manage every complaint",
      color: "#667eea",
      action: () => navigate("/admin/complaints"),
    },
    {
      icon: "📊",
      title: "Full Reports",
      desc: "View all analytics and export complaint data to CSV",
      color: "#48bb78",
      action: () => navigate("/reports"),
    },
    {
      icon: "✏️",
      title: "Submit Complaint",
      desc: "Submit a new complaint directly",
      color: "#9f7aea",
      action: () => navigate("/submit-complaint"),
    },
    {
      icon: "📁",
      title: "My Complaints",
      desc: "View your own submitted complaints",
      color: "#3182ce",
      action: () => navigate("/my-complaints"),
    },
    {
      icon: "⚙️",
      title: "System Overview",
      desc: "View full system stats and all user activity",
      color: "#ed8936",
      action: () => navigate("/admin/complaints"),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>👑 Super Admin Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.badge}>SUPER ADMIN</span>
          <span style={styles.email}>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Nav Bar */}
      <div style={styles.navbar}>
        {[
          ["📋 All Complaints", () => navigate("/admin/complaints")],
          ["⚡ Escalations", () => navigate("/escalations")],
          ["📊 Reports", () => navigate("/reports")],
          ["✏️ Submit Complaint", () => navigate("/submit-complaint")],
          ["📁 My Complaints", () => navigate("/my-complaints")],
        ].map(([label, action]) => (
          <button key={label} onClick={action} style={styles.navBtn}>
            {label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {/* Live Stats */}
        <div style={styles.statsRow}>
          {[
            [stats.open, "Open", "#667eea"],
            [stats.resolved, "Resolved", "#48bb78"],
            [stats.escalated, "Escalated", "#e53e3e"],
            [stats.total, "Total", "#ed8936"],
          ].map(([val, label, color]) => (
            <div key={label} style={styles.statCard}>
              <div style={{ ...styles.statVal, color }}>{val}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div style={styles.grid}>
          {cards.map(({ icon, title, desc, color, action }) => (
            <div key={title} style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
              <div style={styles.cardIcon}>{icon}</div>
              <h3 style={styles.cardTitle}>{title}</h3>
              <p style={styles.cardDesc}>{desc}</p>
              <button onClick={action} style={{ ...styles.cardBtn, background: color }}>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f7fafc" },
  header: { background: "#744210", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0, fontSize: "22px", color: "white" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  badge: { background: "#ed8936", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  email: { color: "#fbd38d", fontSize: "14px" },
  logoutBtn: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #e53e3e", background: "transparent", color: "#fed7aa", cursor: "pointer", fontWeight: "600" },
  navbar: { background: "white", padding: "0 28px", display: "flex", gap: "4px", borderBottom: "1px solid #e2e8f0", overflowX: "auto" },
  navBtn: { padding: "14px 18px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#666", borderBottom: "3px solid transparent", whiteSpace: "nowrap" },
  content: { padding: "32px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { background: "white", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statVal: { fontSize: "32px", fontWeight: "700", marginBottom: "4px" },
  statLabel: { color: "#666", fontSize: "13px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardIcon: { fontSize: "32px", marginBottom: "12px" },
  cardTitle: { margin: "0 0 8px", fontSize: "17px", fontWeight: "700", color: "#1a1a2e" },
  cardDesc: { margin: "0 0 20px", color: "#666", fontSize: "13px", lineHeight: "1.5" },
  cardBtn: { padding: "9px 18px", borderRadius: "8px", color: "white", border: "none", cursor: "pointer", fontWeight: "600" },
};