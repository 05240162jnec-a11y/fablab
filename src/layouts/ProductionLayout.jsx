import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import jnecLogo from "../assets/jnec-logo.png";

const pageTitles = {
  "/production/dashboard": "Production Dashboard",
  "/production/orders":    "My Assigned Orders",
};

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

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
    transition: "all 0.2s ease",
  });

  return (
    <div style={{
      width: "250px",
      height: "100vh",
      backgroundColor: "#0f172a",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
        <img src={jnecLogo} alt="JNEC Logo" style={{ height: 40, width: "auto", objectFit: "contain" }} />
        <div>
          <h3 style={{ color: "white", margin: 0, fontSize: "16px" }}>JNEC Fab Lab</h3>
          <p style={{ color: "#64748b", margin: 0, fontSize: "12px" }}>Production Team</p>
        </div>
      </div>

      {/* Menu */}
      <div style={{ marginTop: "10px" }}>
        <p style={{ color: "#475569", fontSize: "11px", padding: "10px 20px 5px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
          Menu
        </p>
        <NavLink to="/production/dashboard" style={navStyle}>Dashboard</NavLink>
        <NavLink to="/production/orders" style={navStyle}>My Orders</NavLink>
      </div>

      {/* Logout */}
      <div style={{ padding: "20px", borderTop: "1px solid #1e293b", marginTop: "auto" }}>
        <button onClick={handleLogout} style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "transparent",
          color: "#ef4444",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
        }}>
          Logout
        </button>
      </div>
    </div>
  );
}

function Navbar({ title }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "PT";

  return (
    <div style={{
      height: "60px",
      backgroundColor: "white",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 25px",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{user?.name || "Production Team"}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Production Team</p>
        </div>
        <div style={{
          width: "38px",
          height: "38px",
          backgroundColor: "#1e40af",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "13px",
          flexShrink: 0,
        }}>{initials}</div>
      </div>
    </div>
  );
}

export default function ProductionLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Production Portal";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "250px", display: "flex", flexDirection: "column" }}>
        <Navbar title={title} />
        <div style={{ padding: "30px", flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}