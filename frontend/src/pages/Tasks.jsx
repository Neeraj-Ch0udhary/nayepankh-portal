import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    api.get(`/tasks/?status=${filter}`).then((r) => setTasks(r.data)).finally(() => setLoading(false));
  }, [filter]);

  const apply = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/apply`);
      toast.success("Applied successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not apply");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>📋 Available Tasks</h1>

        <div style={styles.filters}>
          {["open", "assigned", "completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <p style={styles.empty}>Loading...</p> : tasks.length === 0 ? (
          <p style={styles.empty}>No {filter} tasks right now.</p>
        ) : (
          <div style={styles.grid}>
            {tasks.map((t) => (
              <div key={t.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <h3 style={styles.cardTitle}>{t.title}</h3>
                  <span style={{ ...styles.badge, background: t.status === "open" ? "#d4edda" : "#fff3cd", color: t.status === "open" ? "#155724" : "#856404" }}>
                    {t.status}
                  </span>
                </div>
                <p style={styles.cardDesc}>{t.description}</p>
                {t.required_skills?.length > 0 && (
                  <div style={styles.skills}>
                    {t.required_skills.map((s) => (
                      <span key={s} style={styles.skill}>{s}</span>
                    ))}
                  </div>
                )}
                {t.due_date && <p style={styles.due}>📅 Due: {t.due_date}</p>}
                {t.status === "open" && user && (
                  <button onClick={() => apply(t.id)} style={styles.applyBtn}>Apply Now</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a6b3c" },
  filters: { display: "flex", gap: "0.8rem", marginBottom: "2rem" },
  filterBtn: { padding: "0.5rem 1.2rem", borderRadius: "20px", border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#666" },
  filterActive: { background: "#1a6b3c", color: "#fff", borderColor: "#1a6b3c" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" },
  cardTitle: { fontWeight: "700", fontSize: "1rem", color: "#2d2d2d", flex: 1, marginRight: "0.5rem" },
  cardDesc: { color: "#666", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" },
  skills: { display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.8rem" },
  skill: { background: "#e8f5ee", color: "#1a6b3c", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "600" },
  due: { color: "#888", fontSize: "0.85rem", marginBottom: "1rem" },
  applyBtn: { width: "100%", background: "#1a6b3c", color: "#fff", border: "none", padding: "0.7rem", borderRadius: "8px", cursor: "pointer", fontWeight: "700" },
  badge: { padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600", whiteSpace: "nowrap" },
  empty: { color: "#888", textAlign: "center", marginTop: "3rem" },
};