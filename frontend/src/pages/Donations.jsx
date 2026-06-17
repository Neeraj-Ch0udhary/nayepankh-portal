import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ donor_name: "", amount: "", category: "food", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/donations/").then((r) => setDonations(r.data));
    api.get("/donations/stats").then((r) => setStats(r.data));
  }, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/donations/", { ...form, amount: parseFloat(form.amount) });
      toast.success("Thank you for your donation! 💚");
      setForm({ donor_name: "", amount: "", category: "food", message: "" });
      api.get("/donations/").then((r) => setDonations(r.data));
      api.get("/donations/stats").then((r) => setStats(r.data));
    } catch {
      toast.error("Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = { food: "🍱", clothes: "👕", education: "📚", sanitary: "🌸", other: "💛" };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>💚 Support Our Mission</h1>

        {/* Stats */}
        {stats && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>₹{stats.total?.toLocaleString()}</div>
              <div style={styles.statLabel}>Total Donated</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.count}</div>
              <div style={styles.statLabel}>Donors</div>
            </div>
            {Object.entries(stats.by_category || {}).map(([cat, amt]) => (
              <div key={cat} style={styles.statCard}>
                <div style={styles.statValue}>{categoryIcons[cat]} ₹{amt}</div>
                <div style={styles.statLabel}>{cat}</div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.grid}>
          {/* Donation Form */}
          <div style={styles.formCard}>
            <h2 style={styles.sectionTitle}>Make a Donation</h2>
            <form onSubmit={handleDonate} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Your Name</label>
                <input style={styles.input} placeholder="Neeraj Choudhary" value={form.donor_name}
                  onChange={(e) => setForm({ ...form, donor_name: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Amount (₹)</label>
                <input style={styles.input} type="number" placeholder="500" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select style={styles.input} value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="food">🍱 Food</option>
                  <option value="clothes">👕 Clothes</option>
                  <option value="education">📚 Education</option>
                  <option value="sanitary">🌸 Sanitary</option>
                  <option value="other">💛 Other</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Message (optional)</label>
                <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }}
                  placeholder="A message of support..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? "Processing..." : "Donate Now 💚"}
              </button>
            </form>
          </div>

          {/* Recent Donations */}
          <div style={styles.recentCard}>
            <h2 style={styles.sectionTitle}>Recent Donations</h2>
            {donations.length === 0 ? (
              <p style={styles.empty}>No donations yet. Be the first!</p>
            ) : (
              donations.map((d) => (
                <div key={d.id} style={styles.donationRow}>
                  <div>
                    <div style={styles.donorName}>{categoryIcons[d.category]} {d.donor_name}</div>
                    {d.message && <div style={styles.donorMsg}>"{d.message}"</div>}
                  </div>
                  <div style={styles.donorAmount}>₹{d.amount}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a6b3c" },
  statsRow: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "1.2rem 1.5rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", minWidth: "130px" },
  statValue: { fontSize: "1.4rem", fontWeight: "800", color: "#1a6b3c" },
  statLabel: { color: "#888", fontSize: "0.85rem", marginTop: "0.2rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
  formCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  recentCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "1.2rem", color: "#2d2d2d" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontWeight: "600", fontSize: "0.9rem", color: "#444" },
  input: { padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "0.95rem", outline: "none" },
  btn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.85rem", borderRadius: "8px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" },
  donationRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid #f0f0f0" },
  donorName: { fontWeight: "600", marginBottom: "0.2rem" },
  donorMsg: { fontSize: "0.82rem", color: "#888", fontStyle: "italic" },
  donorAmount: { fontWeight: "800", color: "#1a6b3c", fontSize: "1.1rem" },
  empty: { color: "#888", fontSize: "0.9rem" },
};