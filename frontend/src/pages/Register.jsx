import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const SKILLS_OPTIONS = [
  "teaching", "communication", "design", "social media",
  "coding", "writing", "coordination", "data entry",
  "research", "photography", "fundraising", "medical"
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    city: "", phone: "", availability: "weekends",
    skills: [], bio: ""
  });

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: form.name, email: form.email, password: form.password
      });
      login(res.data.token, res.data.user);

      await api.post("/volunteers/profile", {
        city: form.city, phone: form.phone,
        skills: form.skills, availability: form.availability, bio: form.bio
      });

      toast.success("Welcome to NayePankh! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🕊️ NayePankh</div>
        <h2 style={styles.title}>Join as a Volunteer</h2>

        <div style={styles.steps}>
          {[1, 2].map((s) => (
            <div key={s} style={{ ...styles.step, ...(step >= s ? styles.stepActive : {}) }}>
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} style={styles.form}>
          {step === 1 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} placeholder="Neeraj Choudhary" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input style={styles.input} type="password" placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <button type="submit" style={styles.btn}>Next →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input style={styles.input} placeholder="Kanpur" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} placeholder="+91 98765 43210" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Availability</label>
                <select style={styles.input} value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Skills (select all that apply)</label>
                <div style={styles.skillsGrid}>
                  {SKILLS_OPTIONS.map((skill) => (
                    <button key={skill} type="button"
                      onClick={() => toggleSkill(skill)}
                      style={{ ...styles.skillBtn, ...(form.skills.includes(skill) ? styles.skillBtnActive : {}) }}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Bio (optional)</label>
                <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }}
                  placeholder="Tell us about yourself..."
                  value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="button" onClick={() => setStep(1)} style={styles.backBtn}>← Back</button>
                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? "Registering..." : "Join NayePankh 🎉"}
                </button>
              </div>
            </>
          )}
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "linear-gradient(135deg, #f0faf4, #e8f5ee)", padding: "2rem",
  },
  card: {
    background: "#fff", borderRadius: "16px", padding: "2.5rem",
    width: "100%", maxWidth: "480px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  logo: { fontSize: "1.8rem", fontWeight: "800", color: "#1a6b3c", textAlign: "center", marginBottom: "0.5rem" },
  title: { fontSize: "1.5rem", fontWeight: "700", textAlign: "center", marginBottom: "1.5rem" },
  steps: { display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" },
  step: {
    width: "36px", height: "36px", borderRadius: "50%", background: "#eee",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", color: "#aaa",
  },
  stepActive: { background: "#1a6b3c", color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontWeight: "600", fontSize: "0.9rem", color: "#444" },
  input: {
    padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd",
    fontSize: "0.95rem", outline: "none",
  },
  btn: {
    flex: 1, background: "#1a6b3c", color: "#fff", padding: "0.85rem",
    borderRadius: "8px", border: "none", fontSize: "1rem",
    fontWeight: "700", cursor: "pointer",
  },
  backBtn: {
    background: "#f0f0f0", color: "#444", padding: "0.85rem 1.2rem",
    borderRadius: "8px", border: "none", fontSize: "1rem", cursor: "pointer",
  },
  skillsGrid: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  skillBtn: {
    padding: "0.4rem 0.9rem", borderRadius: "20px", border: "1.5px solid #ddd",
    background: "#fff", cursor: "pointer", fontSize: "0.85rem", color: "#555",
  },
  skillBtnActive: { background: "#1a6b3c", color: "#fff", borderColor: "#1a6b3c" },
  footer: { textAlign: "center", marginTop: "1rem", fontSize: "0.9rem", color: "#666" },
  link: { color: "#1a6b3c", fontWeight: "600", textDecoration: "none" },
};