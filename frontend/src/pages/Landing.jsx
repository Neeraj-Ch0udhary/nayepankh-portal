import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Landing() {
  const [stats, setStats] = useState({
    people_helped: 200000,
    interns_trained: 30000,
    total_volunteers: 0,
    total_events: 0,
  });

  useEffect(() => {
    api.get("/admin/stats").then((res) => {
      setStats((prev) => ({
        ...prev,
        total_volunteers: res.data.total_volunteers,
        total_events: res.data.total_events,
      }));
    }).catch(() => {});
  }, []);

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Give Wings to the Underprivileged 🕊️</h1>
          <p style={styles.heroSubtitle}>
            NayePankh Foundation — a UP Government registered NGO helping over 2 lakh
            underprivileged people through food, education, clothes & hygiene awareness.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/register" style={styles.primaryBtn}>Become a Volunteer</Link>
            <Link to="/donations" style={styles.secondaryBtn}>Donate Now</Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>Our Impact</h2>
        <div style={styles.statsGrid}>
          {[
            { label: "People Helped", value: "2 Lakh+", icon: "🤝" },
            { label: "Interns Trained", value: "30,000+", icon: "🎓" },
            { label: "Volunteers", value: stats.total_volunteers, icon: "👐" },
            { label: "Events Held", value: stats.total_events, icon: "📅" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What We Do */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What We Do</h2>
        <div style={styles.cardsGrid}>
          {[
            { icon: "🍱", title: "Food Drives", desc: "Distributing meals to underprivileged families and stray animals across UP." },
            { icon: "👕", title: "Clothes Donation", desc: "Collecting and distributing clothes to poor families in need." },
            { icon: "📚", title: "Education", desc: "Providing free education and workshops to underprivileged children." },
            { icon: "🌸", title: "Hygiene Awareness", desc: "Creating awareness about menstrual hygiene and distributing sanitary pads." },
          ].map((item, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardIcon}>{item.icon}</div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Make a Difference?</h2>
        <p style={styles.ctaDesc}>Join thousands of volunteers and help us uplift communities across India.</p>
        <Link to="/register" style={styles.primaryBtn}>Join Us Today</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 NayePankh Foundation | UP Govt. Registered NGO | 80G & 12A Certified</p>
        <p>📧 contact@nayepankh.com | 📞 +91 83185 00748</p>
      </footer>
    </div>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, #1a6b3c 0%, #2d9e5f 100%)",
    padding: "5rem 2rem",
    textAlign: "center",
    color: "#fff",
  },
  heroContent: { maxWidth: "700px", margin: "0 auto" },
  heroTitle: { fontSize: "2.8rem", fontWeight: "800", marginBottom: "1rem", lineHeight: 1.2 },
  heroSubtitle: { fontSize: "1.1rem", opacity: 0.9, marginBottom: "2rem", lineHeight: 1.7 },
  heroButtons: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" },
  primaryBtn: {
    background: "#fff", color: "#1a6b3c", padding: "0.8rem 2rem",
    borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "1rem",
  },
  secondaryBtn: {
    background: "transparent", color: "#fff", padding: "0.8rem 2rem",
    borderRadius: "8px", textDecoration: "none", fontWeight: "700",
    border: "2px solid #fff", fontSize: "1rem",
  },
  statsSection: { padding: "4rem 2rem", background: "#fff", textAlign: "center" },
  sectionTitle: { fontSize: "2rem", fontWeight: "700", color: "#1a6b3c", marginBottom: "2.5rem" },
  statsGrid: { display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" },
  statCard: {
    background: "#f0faf4", borderRadius: "12px", padding: "2rem",
    minWidth: "160px", textAlign: "center",
  },
  statIcon: { fontSize: "2rem", marginBottom: "0.5rem" },
  statValue: { fontSize: "2rem", fontWeight: "800", color: "#1a6b3c" },
  statLabel: { color: "#666", marginTop: "0.3rem" },
  section: { padding: "4rem 2rem", textAlign: "center", background: "#f8faf9" },
  cardsGrid: { display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", maxWidth: "1000px", margin: "0 auto" },
  card: {
    background: "#fff", borderRadius: "12px", padding: "2rem",
    width: "220px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  cardIcon: { fontSize: "2.5rem", marginBottom: "1rem" },
  cardTitle: { fontWeight: "700", marginBottom: "0.5rem", color: "#1a6b3c" },
  cardDesc: { color: "#666", fontSize: "0.9rem", lineHeight: 1.6 },
  ctaSection: {
    background: "linear-gradient(135deg, #1a6b3c, #2d9e5f)",
    padding: "4rem 2rem", textAlign: "center", color: "#fff",
  },
  ctaTitle: { fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" },
  ctaDesc: { marginBottom: "2rem", opacity: 0.9 },
  footer: {
    background: "#1a1a1a", color: "#aaa", padding: "2rem",
    textAlign: "center", lineHeight: 2,
  },
};