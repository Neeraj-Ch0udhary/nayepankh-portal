import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [certInfo, setCertInfo] = useState(null);

  useEffect(() => {
    api.get("/volunteers/profile").then((r) => setProfile(r.data)).catch(() => {});
    api.get("/tasks/my").then((r) => setMyTasks(r.data)).catch(() => {});
    api.get("/events/my").then((r) => setMyEvents(r.data)).catch(() => {});
    api.get("/certificates/check").then((r) => setCertInfo(r.data)).catch(() => {});
  }, []);

  const downloadCert = async () => {
    try {
      const res = await api.get("/certificates/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.pdf";
      a.click();
    } catch {
      toast.error("Complete 5 tasks to unlock your certificate!");
    }
  };

  const progress = certInfo ? Math.min((certInfo.tasks_completed / 5) * 100, 100) : 0;

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>

        {/* Certificate Progress */}
        <div style={styles.certCard}>
          <div style={styles.certHeader}>
            <h3>🎓 Certificate Progress</h3>
            {certInfo?.eligible && (
              <button onClick={downloadCert} style={styles.downloadBtn}>
                Download Certificate
              </button>
            )}
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <p style={styles.progressText}>
            {certInfo?.tasks_completed || 0} / 5 tasks completed
            {certInfo?.eligible ? " 🎉 Eligible!" : ` — ${certInfo?.tasks_needed || 5} more to go`}
          </p>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: "Tasks Assigned", value: myTasks.length, icon: "📋" },
            { label: "Events Joined", value: myEvents.length, icon: "📅" },
            { label: "Tasks Done", value: certInfo?.tasks_completed || 0, icon: "✅" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* My Tasks */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>My Tasks</h2>
            <Link to="/tasks" style={styles.viewAll}>Browse Tasks →</Link>
          </div>
          {myTasks.length === 0 ? (
            <p style={styles.empty}>No tasks assigned yet. <Link to="/tasks" style={styles.link}>Browse open tasks</Link></p>
          ) : (
            myTasks.map((t) => (
              <div key={t.id} style={styles.taskCard}>
                <div>
                  <div style={styles.taskTitle}>{t.title}</div>
                  <div style={styles.taskDesc}>{t.description}</div>
                </div>
                <span style={{ ...styles.badge, background: t.status === "completed" ? "#d4edda" : "#fff3cd", color: t.status === "completed" ? "#155724" : "#856404" }}>
                  {t.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* My Events */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>My Events</h2>
            <Link to="/events" style={styles.viewAll}>Browse Events →</Link>
          </div>
          {myEvents.length === 0 ? (
            <p style={styles.empty}>No events joined yet. <Link to="/events" style={styles.link}>Browse events</Link></p>
          ) : (
            myEvents.map((e) => (
              <div key={e.id} style={styles.taskCard}>
                <div>
                  <div style={styles.taskTitle}>{e.title}</div>
                  <div style={styles.taskDesc}>📍 {e.location} | 📅 {e.date}</div>
                </div>
                <span style={{ ...styles.badge, background: e.attended ? "#d4edda" : "#e8f4fd", color: e.attended ? "#155724" : "#0c5460" }}>
                  {e.attended ? "Attended ✓" : "Registered"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a6b3c" },
  certCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  certHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  progressBar: { background: "#e8f5ee", borderRadius: "100px", height: "12px", overflow: "hidden" },
  progressFill: { background: "#1a6b3c", height: "100%", borderRadius: "100px", transition: "width 0.5s ease" },
  progressText: { marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" },
  downloadBtn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  statsRow: { display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: "140px", background: "#fff", borderRadius: "12px", padding: "1.2rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: "1.8rem", marginBottom: "0.3rem" },
  statValue: { fontSize: "1.8rem", fontWeight: "800", color: "#1a6b3c" },
  statLabel: { color: "#888", fontSize: "0.85rem" },
  section: { background: "#fff", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "700", color: "#2d2d2d" },
  viewAll: { color: "#1a6b3c", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" },
  taskCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "8px", background: "#f8faf9", marginBottom: "0.8rem" },
  taskTitle: { fontWeight: "600", marginBottom: "0.2rem" },
  taskDesc: { fontSize: "0.85rem", color: "#888" },
  badge: { padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", whiteSpace: "nowrap" },
  empty: { color: "#888", fontSize: "0.9rem" },
  link: { color: "#1a6b3c", fontWeight: "600" },
};