import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/volunteers/leaderboard").then((r) => setLeaders(r.data)).finally(() => setLoading(false));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>🏆 Volunteer Leaderboard</h1>
        <p style={styles.subtitle}>Top volunteers making a difference at NayePankh Foundation</p>

        {loading ? <p style={styles.empty}>Loading...</p> : leaders.length === 0 ? (
          <p style={styles.empty}>No volunteers yet. Be the first!</p>
        ) : (
          <div style={styles.list}>
            {leaders.map((v, i) => (
              <div key={i} style={{ ...styles.card, ...(i === 0 ? styles.first : {}) }}>
                <div style={styles.rank}>{medals[i] || `#${i + 1}`}</div>
                <div style={styles.info}>
                  <div style={styles.name}>{v.name}</div>
                  <div style={styles.city}>📍 {v.city || "India"}</div>
                </div>
                <div style={styles.tasks}>
                  <div style={styles.taskCount}>{v.tasks_completed}</div>
                  <div style={styles.taskLabel}>tasks done</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "700px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1a6b3c", textAlign: "center" },
  subtitle: { color: "#888", textAlign: "center", marginBottom: "2rem" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    display: "flex", alignItems: "center", gap: "1.5rem",
    background: "#fff", borderRadius: "12px", padding: "1.2rem 1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  first: { border: "2px solid #ffd700", background: "#fffdf0" },
  rank: { fontSize: "2rem", minWidth: "40px", textAlign: "center" },
  info: { flex: 1 },
  name: { fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.2rem" },
  city: { color: "#888", fontSize: "0.85rem" },
  tasks: { textAlign: "center" },
  taskCount: { fontSize: "1.8rem", fontWeight: "800", color: "#1a6b3c" },
  taskLabel: { fontSize: "0.75rem", color: "#888" },
  empty: { color: "#888", textAlign: "center", marginTop: "3rem" },
};