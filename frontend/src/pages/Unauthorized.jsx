
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7fafc" }}>
      <div style={{ fontSize: "64px" }}>🚫</div>
      <h1 style={{ color: "#e53e3e", margin: "16px 0 8px" }}>Access Denied</h1>
      <p style={{ color: "#666" }}>You do not have permission to view this page.</p>
      <button onClick={() => navigate("/login")} style={{ marginTop: "24px", padding: "12px 24px", borderRadius: "8px", background: "#667eea", color: "white", border: "none", cursor: "pointer", fontWeight: "600" }}>
        Back to Login
      </button>
    </div>
  );
}
