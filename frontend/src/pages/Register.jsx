
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/api/auth/register", form);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🛡️</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>ResolveIT Portal</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          {["name", "email", "password"].map((field) => (
            <div key={field} style={styles.field}>
              <label style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          ))}
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="USER">User</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p style={styles.registerText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  card: { background: "white", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" },
  logo: { fontSize: "48px", marginBottom: "8px" },
  title: { margin: "0 0 4px", fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  subtitle: { margin: "0 0 32px", color: "#666", fontSize: "14px" },
  form: { textAlign: "left" },
  field: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#333" },
  input: { width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "15px", outline: "none", boxSizing: "border-box" },
  error: { color: "#e53e3e", fontSize: "14px", marginBottom: "12px" },
  success: { color: "#38a169", fontSize: "14px", marginBottom: "12px" },
  button: { width: "100%", padding: "13px", borderRadius: "8px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "16px", fontWeight: "600", border: "none", cursor: "pointer" },
  registerText: { marginTop: "24px", fontSize: "14px", color: "#666" },
  link: { color: "#667eea", cursor: "pointer", fontWeight: "600" },
};