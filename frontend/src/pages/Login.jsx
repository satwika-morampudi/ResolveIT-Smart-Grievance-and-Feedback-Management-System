
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/api/auth/login", form);
      login(res.data);
      const role = res.data.role;
      if (role === "SUPER_ADMIN") navigate("/super-admin");
      else if (role === "ADMIN") navigate("/admin");
      else if (role === "STAFF") navigate("/staff");
      else navigate("/user");
    } catch (err) {
      setError(err.response?.data || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🛡️</div>
        <h1 style={styles.title}>ResolveIT</h1>
        <p style={styles.subtitle}>Smart Grievance Portal</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.registerText}>
          No account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  logo: { fontSize: "48px", marginBottom: "8px" },
  title: { margin: "0 0 4px", fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  subtitle: { margin: "0 0 32px", color: "#666", fontSize: "14px" },
  form: { textAlign: "left" },
  field: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#333" },
  input: {
    width: "100%", padding: "12px 16px", borderRadius: "8px",
    border: "1.5px solid #e0e0e0", fontSize: "15px",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  error: { color: "#e53e3e", fontSize: "14px", marginBottom: "12px", textAlign: "center" },
  button: {
    width: "100%", padding: "13px", borderRadius: "8px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white", fontSize: "16px", fontWeight: "600",
    border: "none", cursor: "pointer", marginTop: "8px",
  },
  registerText: { marginTop: "24px", fontSize: "14px", color: "#666" },
  link: { color: "#667eea", cursor: "pointer", fontWeight: "600" },
};
