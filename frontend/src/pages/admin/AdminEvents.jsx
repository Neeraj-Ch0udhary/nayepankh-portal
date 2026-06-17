import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", total_slots: 10 });
  const [loading, setLoading] = useState(false);

  const fetchEvents = () => api.get("/events/").then((r) => setEvents(r.data));
  useEffect(() => { fetchEvents(); }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/events/", { ...form, total_slots: parseInt(form.total_slots) });
      toast.success("Event created!");
      setForm({ title: "", description: "", date: "", location: "", total_slots: 10 });
      setShowForm(false);
      fetchEvents();
    } catch {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>📅 Event Management</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.createBtn}>
            {showForm ? "Cancel" : "+ Create Event"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={createEvent} style={styles.form}>
            <h3 style={styles.formTitle}>New Event</h3>
            <input style={styles.input} placeholder="Event title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }}
              placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input style={styles.input} type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <input style={styles.input} placeholder="Location (e.g. Kanpur, UP)" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Total slots" value={form.total_slots}
              onChange={(e) => setForm({ ...form, total_slots: e.target.value })} />
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        )}

        <div style={styles.grid}>
          {events.map((e) => {
            const pct = Math.round((e.filled_slots / e.total_slots) * 100);
            return (
              <div key={e.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{e.title}</h3>
                <p style={styles.cardDesc}>{e.description}</p>
                <div style={styles.meta}>
                  <span>📍 {e.location}</span>
                  <span>📅 {e.date}</span>
                </div>
                <div style={styles.slotRow}>
                  <span>{e.filled_slots} / {e.total_slots} slots</span>
                  <span>{pct}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${pct}%` }} />
                </div>
                {e.qr_code && (
                  <div style={styles.qrWrap}>
                    <p style={styles.qrLabel}>QR Check-in Code:</p>
                    <img src={`data:image/png;base64,${e.qr_code}`} alt="QR" style={styles.qr} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", color: "#1a6b3c" },
  createBtn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  form: { background: "#fff", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1rem" },
  formTitle: { fontWeight: "700", fontSize: "1.1rem" },
  input: { padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "0.95rem", outline: "none" },
  submitBtn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.5rem" },
  cardDesc: { color: "#666", fontSize: "0.9rem", marginBottom: "1rem" },
  meta: { display: "flex", flexDirection: "column", gap: "0.3rem", color: "#888", fontSize: "0.85rem", marginBottom: "1rem" },
  slotRow: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" },
  progressBar: { background: "#eee", borderRadius: "100px", height: "8px", overflow: "hidden", marginBottom: "1rem" },
  progressFill: { background: "#1a6b3c", height: "100%", borderRadius: "100px" },
  qrWrap: { textAlign: "center", marginTop: "1rem" },
  qrLabel: { fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" },
  qr: { width: "120px", height: "120px" },
};