import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>⚙️ Admin Dashboard</h1>

        <div style={styles.statsGrid}>
          {[
            { label: "Total Volunteers", value: stats?.total_volunteers, icon: "👐" },
            { label: "Total Tasks", value: stats?.total_tasks, icon: "📋" },
            { label: "Completed Tasks", value: stats?.completed_tasks, icon: "✅" },
            { label: "Total Events", value: stats?.total_events, icon: "📅" },
            { label: "Total Donations", value: `₹${stats?.total_donations || 0}`, icon: "💚" },
            { label: "Certificates Issued", value: stats?.certificates_issued, icon: "🎓" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statValue}>{s.value ?? "..."}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {[
            { label: "Manage Volunteers", icon: "👐", to: "/admin/volunteers", desc: "View, search and export volunteers" },
            { label: "Manage Tasks", icon: "📋", to: "/admin/tasks", desc: "Create tasks and AI-assign volunteers" },
            { label: "Manage Events", icon: "📅", to: "/admin/events", desc: "Create events and track registrations" },
            { label: "AI Content Generator", icon: "🤖", to: "/admin/content", desc: "Generate social media posts with AI" },
          ].map((a, i) => (
            <Link key={i} to={a.to} style={styles.actionCard}>
              <div style={styles.actionIcon}>{a.icon}</div>
              <div style={styles.actionLabel}>{a.label}</div>
              <div style={styles.actionDesc}>{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a6b3c" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2.5rem" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: "2rem", marginBottom: "0.5rem" },
  statValue: { fontSize: "1.8rem", fontWeight: "800", color: "#1a6b3c" },
  statLabel: { color: "#888", fontSize: "0.82rem", marginTop: "0.3rem" },
  sectionTitle: { fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem", color: "#2d2d2d" },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" },
  actionCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textDecoration: "none", color: "#2d2d2d", transition: "transform 0.2s" },
  actionIcon: { fontSize: "2rem", marginBottom: "0.5rem" },
  actionLabel: { fontWeight: "700", fontSize: "1rem", marginBottom: "0.3rem" },
  actionDesc: { color: "#888", fontSize: "0.85rem" },
};