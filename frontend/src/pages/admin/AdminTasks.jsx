import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", required_skills: "", due_date: "" });
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    api.get("/tasks/").then((r) => setTasks(r.data));
    api.get("/admin/tasks/applications").then((r) => setApplications(r.data));
  };

  useEffect(() => { fetchData(); }, []);

  const createTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tasks/", {
        ...form,
        required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean)
      });
      toast.success("Task created!");
      setForm({ title: "", description: "", required_skills: "", due_date: "" });
      setShowForm(false);
      fetchData();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const aiAssign = async (taskId) => {
    try {
      toast.loading("AI is finding best volunteer...");
      const res = await api.post(`/tasks/${taskId}/ai-assign`);
      toast.dismiss();
      toast.success(`Assigned to ${res.data.assigned_to?.name || "volunteer"}!`);
      fetchData();
    } catch {
      toast.dismiss();
      toast.error("AI assign failed — add volunteer profiles first");
    }
  };

  const updateApp = async (appId, status) => {
    try {
      await api.put(`/admin/tasks/applications/${appId}`, { status });
      toast.success(`Application ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Task Management</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.createBtn}>
            {showForm ? "Cancel" : "+ Create Task"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={createTask} style={styles.form}>
            <h3 style={styles.formTitle}>New Task</h3>
            <input style={styles.input} placeholder="Task title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }}
              placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input style={styles.input} placeholder="Required skills (comma separated)"
              value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
            <input style={styles.input} type="date" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </form>
        )}

        {applications.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📬 Pending Applications</h2>
            {applications.map((a) => (
              <div key={a.id} style={styles.appCard}>
                <div>
                  <div style={styles.appTitle}>{a.volunteer_name} → {a.task_title}</div>
                  <div style={styles.appEmail}>{a.volunteer_email}</div>
                </div>
                <div style={styles.appActions}>
                  <button onClick={() => updateApp(a.id, "accepted")} style={styles.acceptBtn}>Accept</button>
                  <button onClick={() => updateApp(a.id, "rejected")} style={styles.rejectBtn}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>All Tasks</h2>
          {tasks.map((t) => (
            <div key={t.id} style={styles.taskCard}>
              <div style={styles.taskInfo}>
                <div style={styles.taskTitle}>{t.title}</div>
                <div style={styles.taskDesc}>{t.description}</div>
                {t.required_skills?.length > 0 && (
                  <div style={styles.skills}>
                    {t.required_skills.map((s) => <span key={s} style={styles.skill}>{s}</span>)}
                  </div>
                )}
              </div>
              <div style={styles.taskRight}>
                <span style={{ ...styles.badge, background: t.status === "open" ? "#d4edda" : t.status === "completed" ? "#cce5ff" : "#fff3cd", color: t.status === "open" ? "#155724" : t.status === "completed" ? "#004085" : "#856404" }}>
                  {t.status}
                </span>
                {t.status === "open" && (
                  <button onClick={() => aiAssign(t.id)} style={styles.aiBtn}>🤖 AI Assign</button>
                )}
              </div>
            </div>
          ))}
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
  formTitle: { fontWeight: "700", fontSize: "1.1rem", color: "#2d2d2d" },
  input: { padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "0.95rem", outline: "none" },
  submitBtn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  section: { background: "#fff", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", color: "#2d2d2d" },
  appCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#f8faf9", borderRadius: "8px", marginBottom: "0.8rem" },
  appTitle: { fontWeight: "600", marginBottom: "0.2rem" },
  appEmail: { color: "#888", fontSize: "0.85rem" },
  appActions: { display: "flex", gap: "0.5rem" },
  acceptBtn: { background: "#1a6b3c", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  rejectBtn: { background: "#dc3545", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  taskCard: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1rem", background: "#f8faf9", borderRadius: "8px", marginBottom: "0.8rem", gap: "1rem" },
  taskInfo: { flex: 1 },
  taskTitle: { fontWeight: "700", marginBottom: "0.3rem" },
  taskDesc: { color: "#666", fontSize: "0.85rem", marginBottom: "0.5rem" },
  skills: { display: "flex", flexWrap: "wrap", gap: "0.3rem" },
  skill: { background: "#e8f5ee", color: "#1a6b3c", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" },
  taskRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
  badge: { padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600" },
  aiBtn: { background: "#6f42c1", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
};