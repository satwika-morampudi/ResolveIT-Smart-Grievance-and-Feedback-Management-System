
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🙋 User Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.email}>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={{...styles.card, borderTop: "4px solid #667eea"}}>
            <div style={styles.cardIcon}>📝</div>
            <h3 style={styles.cardTitle}>Submit Complaint</h3>
            <p style={styles.cardDesc}>File a new grievance anonymously or publicly</p>
            <button style={styles.cardBtn} onClick={() => navigate("/submit-complaint")}>Submit Now</button>
          </div>
          <div style={{...styles.card, borderTop: "4px solid #48bb78"}}>
            <div style={styles.cardIcon}>📋</div>
            <h3 style={styles.cardTitle}>My Complaints</h3>
            <p style={styles.cardDesc}>Track the status of your submitted complaints</p>
            <button style={styles.cardBtn} onClick={() => navigate("/my-complaints")}>View All</button>
          </div>
          <div style={{...styles.card, borderTop: "4px solid #ed8936"}}>
            <div style={styles.cardIcon}>🔔</div>
            <h3 style={styles.cardTitle}>Notifications</h3>
            <p style={styles.cardDesc}>Check updates on your complaints</p>
            <button style={styles.cardBtn}>View</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f7fafc" },
  header: { background: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  title: { margin: 0, fontSize: "22px", color: "#1a1a2e" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  email: { color: "#666", fontSize: "14px" },
  logoutBtn: { padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #e53e3e", background: "white", color: "#e53e3e", cursor: "pointer", fontWeight: "600" },
  content: { padding: "32px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardIcon: { fontSize: "36px", marginBottom: "12px" },
  cardTitle: { margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "#1a1a2e" },
  cardDesc: { margin: "0 0 20px", color: "#666", fontSize: "14px", lineHeight: "1.5" },
  cardBtn: { padding: "10px 20px", borderRadius: "8px", background: "#667eea", color: "white", border: "none", cursor: "pointer", fontWeight: "600" },
};
