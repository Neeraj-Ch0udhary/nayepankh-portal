import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        🕊️ NayePankh
      </Link>

      <div style={styles.menuIcon} onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </div>

      <div style={{ ...styles.links, ...(open ? styles.linksOpen : {}) }}>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
        <Link to="/events" style={styles.link}>Events</Link>
        <Link to="/leaderboard" style={styles.link}>Leaderboard</Link>
        <Link to="/donations" style={styles.link}>Donate</Link>

        {user?.role === "admin" && (
          <Link to="/admin" style={styles.adminLink}>Admin</Link>
        )}

        {user ? (
          <div style={styles.userBox}>
            <span style={styles.userName}>Hi, {user.name.split(" ")[0]}</span>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div style={styles.authBox}>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    height: "64px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#1a6b3c",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  link: {
    color: "#444",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  adminLink: {
    color: "#1a6b3c",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "0.95rem",
  },
  registerBtn: {
    background: "#1a6b3c",
    color: "#fff",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "1px solid #ddd",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "#666",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  authBox: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userName: {
    fontWeight: "600",
    color: "#1a6b3c",
  },
  menuIcon: {
    display: "none",
    cursor: "pointer",
  },
};