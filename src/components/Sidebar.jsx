import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏭</div>
        <div>
          <h3 style={styles.logoTitle}>JNEC Fab Lab</h3>
          <p style={styles.logoSubtitle}>Student Portal</p>
        </div>
      </div>

      <div style={styles.menuSection}>
        <p style={styles.menuLabel}>Menu</p>
        <NavLink to="/dashboard" style={navStyle}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/book-machine" style={navStyle}>
          <span>🖥️</span> Book a Machine
        </NavLink>
        <NavLink to="/course-registration" style={navStyle}>
          <span>📚</span> Course Registration
        </NavLink>
        <NavLink to="/my-bookings" style={navStyle}>
          <span>📅</span> My Bookings
        </NavLink>
        <NavLink to="/announcements" style={navStyle}>
          <span>📢</span> Announcements
        </NavLink>
      </div>

      <div style={styles.menuSection}>
        <p style={styles.menuLabel}>Support</p>
        <NavLink to="/faqs" style={navStyle}>
          <span>❓</span> FAQs
        </NavLink>
        <NavLink to="/help" style={navStyle}>
          <span>💬</span> Help / Contact
        </NavLink>
      </div>

      <div style={styles.logoutSection}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          ⬅️ Logout
        </button>
      </div>
    </div>
  );
}

const navStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 15px",
  color: isActive ? "white" : "#94a3b8",
  backgroundColor: isActive ? "#1e40af" : "transparent",
  textDecoration: "none",
  borderRadius: "8px",
  margin: "2px 10px",
  fontSize: "14px",
});

const styles = {
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
  },
  logo: {
    padding: "20px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: { fontSize: "30px" },
  logoTitle: { color: "white", margin: 0, fontSize: "16px" },
  logoSubtitle: { color: "#64748b", margin: 0, fontSize: "12px" },
  menuSection: { marginTop: "10px" },
  menuLabel: {
    color: "#475569",
    fontSize: "11px",
    padding: "10px 20px 5px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  logoutSection: {
    marginTop: "auto",
    padding: "20px",
    borderTop: "1px solid #1e293b",
  },
  logoutBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#1e40af",
    color: "white",
    border: "1px solid #1e40af",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};