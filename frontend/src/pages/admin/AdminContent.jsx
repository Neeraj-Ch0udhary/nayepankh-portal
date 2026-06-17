import { useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminContent() {
  const [form, setForm] = useState({ topic: "", platform: "Instagram" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    try {
      const res = await api.post("/admin/generate-content", form);
      setResult(res.data.content);
      toast.success("Content generated!");
    } catch {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>🤖 AI Content Generator</h1>
        <p style={styles.subtitle}>Generate social media posts for NayePankh awareness campaigns using AI</p>

        <div style={styles.grid}>
          <form onSubmit={generate} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Campaign Topic</label>
              <input style={styles.input} placeholder="e.g. Food drive in Kanpur this Sunday"
                value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Platform</label>
              <select style={styles.input} value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>WhatsApp</option>
                <option>Twitter</option>
                <option>Facebook</option>
              </select>
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Generating..." : "✨ Generate Post"}
            </button>
          </form>

          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <h3 style={styles.resultTitle}>Generated Content</h3>
              {result && <button onClick={copy} style={styles.copyBtn}>📋 Copy</button>}
            </div>
            {result ? (
              <pre style={styles.result}>{result}</pre>
            ) : (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>✨</div>
                <p>Your AI-generated post will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1a6b3c" },
  subtitle: { color: "#888", marginBottom: "2rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
  form: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1.2rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontWeight: "600", fontSize: "0.9rem", color: "#444" },
  input: { padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "0.95rem", outline: "none" },
  btn: { background: "#6f42c1", color: "#fff", border: "none", padding: "0.85rem", borderRadius: "8px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" },
  resultCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  resultTitle: { fontWeight: "700", fontSize: "1.1rem" },
  copyBtn: { background: "#f0f0f0", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
  result: { whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.7, color: "#333", fontFamily: "inherit" },
  placeholder: { textAlign: "center", padding: "3rem", color: "#aaa" },
  placeholderIcon: { fontSize: "3rem", marginBottom: "1rem" },
};