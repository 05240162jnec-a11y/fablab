import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import jnecLogo from "../assets/jnec-logo.png";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/book-machine": "Book a Machine",
  "/book-product": "Book a Product",
  "/custom-order": "Custom Order",
  "/my-bookings": "My Bookings",
  "/course-registration": "Course Registration",
  "/announcements": "Announcements",
  "/faqs": "FAQs",
  "/help": "Help & Contact",
  "/projects": "Projects",
  "/report-issue": "Report Machine Issue",
  "/feedback": "Feedback",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/orders": "Product Orders",
  "/admin/products": "Product Management",
  "/admin/machines": "Machine Management",
  "/admin/courses": "Course Management",
  "/admin/machine-bookings": "Machine Bookings",
  "/admin/issues": "Reported Issues",
  "/admin/projects": "Manage Projects",
  "/admin/feedbacks": "User Feedbacks",
  "/admin/reports": "Reports & Analytics",
  "/admin/custom-orders": "Custom Orders",
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin" || role === "super_admin";

  const [openSections, setOpenSections] = useState({
    userManagement: true,
    operations: true,
    resources: true,
    contentMedia: false,
    transactions: true,
    services: true,
    myActivity: true,
    support: false,
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px 8px 40px",
    color: isActive(path) ? "white" : "#94a3b8",
    backgroundColor: isActive(path) ? "#1e40af" : "transparent",
    textDecoration: "none",
    borderRadius: 6,
    margin: "1px 8px",
    fontSize: 13,
    transition: "all 0.2s",
  });

  const sectionHeader = (label, icon, key) => (
    <div
      onClick={() => toggleSection(key)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        cursor: "pointer",
        color: "#64748b",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        marginTop: 4,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <span style={{ fontSize: 10, transition: "transform 0.2s", transform: openSections[key] ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
    </div>
  );

  return (
    <div style={{
      width: 240,
      height: "100vh",
      backgroundColor: "#0f172a",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      overflowY: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: "#1e293b #0f172a",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 10 }}>
        <img src={jnecLogo} alt="JNEC" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        <div>
          <h3 style={{ color: "white", margin: 0, fontSize: 15, fontWeight: 700 }}>JNEC Fab Lab</h3>
          <p style={{ color: "#64748b", margin: 0, fontSize: 11 }}>{isAdmin ? "Admin Panel" : "Student Portal"}</p>
        </div>
      </div>

      {/* Admin Sidebar */}
      {isAdmin && (
        <div style={{ flex: 1, paddingBottom: 16 }}>

          {/* Dashboard */}
          <div style={{ padding: "8px 8px 0" }}>
            <NavLink to="/admin/dashboard" style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              color: isActive ? "white" : "#94a3b8",
              backgroundColor: isActive ? "#1e40af" : "transparent",
              textDecoration: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
              transition: "all 0.2s",
            })}>
              📊 Dashboard
            </NavLink>
          </div>

          {/* User Management */}
          {sectionHeader("User Management", "👥", "userManagement")}
          {openSections.userManagement && (
            <div>
              <NavLink to="/admin/users" style={linkStyle("/admin/users")}>Users</NavLink>
            </div>
          )}

          {/* Operations */}
          {sectionHeader("Operations", "⚙️", "operations")}
          {openSections.operations && (
            <div>
              <NavLink to="/admin/machines" style={linkStyle("/admin/machines")}>Machines</NavLink>
              <NavLink to="/admin/machine-bookings" style={linkStyle("/admin/machine-bookings")}>Bookings</NavLink>
              <NavLink to="/admin/courses" style={linkStyle("/admin/courses")}>Courses</NavLink>
              <NavLink to="/admin/custom-orders" style={linkStyle("/admin/custom-orders")}>Custom Orders</NavLink>
            </div>
          )}

          {/* Resources */}
          {sectionHeader("Resources", "📦", "resources")}
          {openSections.resources && (
            <div>
              <NavLink to="/admin/products" style={linkStyle("/admin/products")}>Products</NavLink>
              <NavLink to="/admin/orders" style={linkStyle("/admin/orders")}>Product Orders</NavLink>
            </div>
          )}

          {/* Content & Media */}
          {sectionHeader("Content & Media", "💡", "contentMedia")}
          {openSections.contentMedia && (
            <div>
              <NavLink to="/admin/projects" style={linkStyle("/admin/projects")}>Projects</NavLink>
              <NavLink to="/admin/feedbacks" style={linkStyle("/admin/feedbacks")}>Feedbacks</NavLink>
            </div>
          )}

          {/* Transactions */}
          {sectionHeader("Transactions", "📋", "transactions")}
          {openSections.transactions && (
            <div>
              <NavLink to="/admin/issues" style={linkStyle("/admin/issues")}>Reported Issues</NavLink>
              <NavLink to="/admin/reports" style={linkStyle("/admin/reports")}>Reports</NavLink>
            </div>
          )}
        </div>
      )}

      {/* User Sidebar */}
      {!isAdmin && (
        <div style={{ flex: 1, paddingBottom: 16 }}>

          {/* Dashboard */}
          <div style={{ padding: "8px 8px 0" }}>
            <NavLink to="/dashboard" style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              color: isActive ? "white" : "#94a3b8",
              backgroundColor: isActive ? "#1e40af" : "transparent",
              textDecoration: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
              transition: "all 0.2s",
            })}>
              🏠 Dashboard
            </NavLink>
          </div>

          {/* Services */}
          {sectionHeader("Services", "🛠️", "services")}
          {openSections.services && (
            <div>
              <NavLink to="/book-machine" style={linkStyle("/book-machine")}>Book a Machine</NavLink>
              <NavLink to="/book-product" style={linkStyle("/book-product")}>Book a Product</NavLink>
              <NavLink to="/custom-order" style={linkStyle("/custom-order")}>Custom Order</NavLink>
              <NavLink to="/course-registration" style={linkStyle("/course-registration")}>Course Registration</NavLink>
            </div>
          )}

          {/* My Activity */}
          {sectionHeader("My Activity", "📁", "myActivity")}
          {openSections.myActivity && (
            <div>
              <NavLink to="/my-bookings" style={linkStyle("/my-bookings")}>My Bookings</NavLink>
              <NavLink to="/projects" style={linkStyle("/projects")}>Projects</NavLink>
              <NavLink to="/report-issue" style={linkStyle("/report-issue")}>Report Issue</NavLink>
              <NavLink to="/feedback" style={linkStyle("/feedback")}>Feedback</NavLink>
              <NavLink to="/announcements" style={linkStyle("/announcements")}>Announcements</NavLink>
            </div>
          )}

          {/* Support */}
          {sectionHeader("Support", "❓", "support")}
          {openSections.support && (
            <div>
              <NavLink to="/faqs" style={linkStyle("/faqs")}>FAQs</NavLink>
              <NavLink to="/help" style={linkStyle("/help")}>Help & Contact</NavLink>
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid #1e293b" }}>
        <button onClick={handleLogout} style={{
          width: "100%", padding: "10px", backgroundColor: "transparent",
          color: "#1e40af", border: "1px solid #1e40af",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  const title = pageTitles[location.pathname] || "Portal";
  const isAdmin = role === "admin" || role === "super_admin";

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column" }}>

        {/* Navbar */}
        <div style={{
          height: 60, backgroundColor: "white", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user?.name || "User"}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{isAdmin ? "admin" : user?.account_type || "student"}</p>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              backgroundColor: isAdmin ? "#7c3aed" : "#1e40af",
              color: "white", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>{initials}</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: 28, flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}