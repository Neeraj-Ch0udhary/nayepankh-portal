import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🕊️ NayePankh</div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to your volunteer account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
        <p style={styles.footer}>
          <Link to="/" style={styles.link}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "linear-gradient(135deg, #f0faf4, #e8f5ee)",
  },
  card: {
    background: "#fff", borderRadius: "16px", padding: "2.5rem",
    width: "100%", maxWidth: "420px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  logo: { fontSize: "1.8rem", fontWeight: "800", color: "#1a6b3c", textAlign: "center", marginBottom: "0.5rem" },
  title: { fontSize: "1.5rem", fontWeight: "700", textAlign: "center", marginBottom: "0.3rem" },
  subtitle: { color: "#888", textAlign: "center", marginBottom: "2rem", fontSize: "0.9rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontWeight: "600", fontSize: "0.9rem", color: "#444" },
  input: {
    padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd",
    fontSize: "0.95rem", outline: "none", transition: "border 0.2s",
  },
  btn: {
    background: "#1a6b3c", color: "#fff", padding: "0.85rem",
    borderRadius: "8px", border: "none", fontSize: "1rem",
    fontWeight: "700", cursor: "pointer", marginTop: "0.5rem",
  },
  footer: { textAlign: "center", marginTop: "1rem", fontSize: "0.9rem", color: "#666" },
  link: { color: "#1a6b3c", fontWeight: "600", textDecoration: "none" },
};