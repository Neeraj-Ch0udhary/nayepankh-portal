import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events/").then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  const register = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      toast.success("Registered for event!");
      api.get("/events/").then((r) => setEvents(r.data));
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not register");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>📅 Upcoming Events</h1>

        {loading ? <p style={styles.empty}>Loading...</p> : events.length === 0 ? (
          <p style={styles.empty}>No upcoming events.</p>
        ) : (
          <div style={styles.grid}>
            {events.map((e) => {
              const pct = Math.round((e.filled_slots / e.total_slots) * 100);
              const full = e.filled_slots >= e.total_slots;
              return (
                <div key={e.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{e.title}</h3>
                  <p style={styles.cardDesc}>{e.description}</p>
                  <div style={styles.meta}>
                    <span>📍 {e.location}</span>
                    <span>📅 {e.date}</span>
                  </div>

                  <div style={styles.slotRow}>
                    <span style={styles.slotText}>{e.filled_slots} / {e.total_slots} slots filled</span>
                    <span style={styles.slotText}>{pct}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${pct}%`, background: full ? "#dc3545" : "#1a6b3c" }} />
                  </div>

                  {user && (
                    <button onClick={() => register(e.id)} disabled={full} style={{ ...styles.btn, background: full ? "#ccc" : "#1a6b3c", cursor: full ? "not-allowed" : "pointer" }}>
                      {full ? "Event Full" : "Register Now"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a6b3c" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.8rem", color: "#2d2d2d" },
  cardDesc: { color: "#666", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" },
  meta: { display: "flex", flexDirection: "column", gap: "0.3rem", color: "#888", fontSize: "0.85rem", marginBottom: "1rem" },
  slotRow: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: "0.4rem" },
  slotText: { fontWeight: "600" },
  progressBar: { background: "#eee", borderRadius: "100px", height: "8px", overflow: "hidden", marginBottom: "1rem" },
  progressFill: { height: "100%", borderRadius: "100px", transition: "width 0.3s" },
  btn: { width: "100%", color: "#fff", border: "none", padding: "0.7rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.95rem" },
  empty: { color: "#888", textAlign: "center", marginTop: "3rem" },
};