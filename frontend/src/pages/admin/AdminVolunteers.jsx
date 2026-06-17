import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/volunteers/all").then((r) => setVolunteers(r.data)).finally(() => setLoading(false));
  }, []);

  const exportCSV = async () => {
    try {
      const res = await api.get("/admin/volunteers/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "volunteers.csv";
      a.click();
      toast.success("CSV downloaded!");
    } catch {
      toast.error("Export failed");
    }
  };

  const filtered = volunteers.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>👐 Volunteers</h1>
          <button onClick={exportCSV} style={styles.exportBtn}>📥 Export CSV</button>
        </div>

        <input style={styles.search} placeholder="Search by name or city..."
          value={search} onChange={(e) => setSearch(e.target.value)} />

        {loading ? <p style={styles.empty}>Loading...</p> : filtered.length === 0 ? (
          <p style={styles.empty}>No volunteers found.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Name", "Email", "City", "Skills", "Availability", "Tasks Done"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.rowEven : {}}>
                    <td style={styles.td}>{v.name}</td>
                    <td style={styles.td}>{v.email}</td>
                    <td style={styles.td}>{v.city || "—"}</td>
                    <td style={styles.td}>{v.skills?.join(", ") || "—"}</td>
                    <td style={styles.td}>{v.availability || "—"}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "#1a6b3c" }}>{v.tasks_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", color: "#1a6b3c" },
  exportBtn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  search: { width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "0.95rem", marginBottom: "1.5rem", outline: "none" },
  tableWrap: { overflowX: "auto", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "1rem", textAlign: "left", background: "#f8faf9", fontWeight: "700", color: "#444", fontSize: "0.85rem", borderBottom: "2px solid #eee" },
  td: { padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#555", borderBottom: "1px solid #f0f0f0" },
  rowEven: { background: "#fafafa" },
  empty: { color: "#888", textAlign: "center", marginTop: "3rem" },
};