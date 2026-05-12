import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, bookingsRes, enrollmentsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://127.0.0.1:8000/api/admin/product-orders", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://127.0.0.1:8000/api/admin/machine-bookings", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://127.0.0.1:8000/api/admin/enrollments", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
      setRecentBookings(bookingsRes.data.slice(0, 5));
      setRecentEnrollments(enrollmentsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch admin dashboard data");
    }
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    if (status === "approved" || status === "completed" || status === "enrolled") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "pending") return { bg: "#fef9c3", color: "#ca8a04" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  // Chart data
 const orderChartData = [
    { name: "Total", value: stats.total_orders ?? 0, fill: "#1e40af" },
    { name: "Pending", value: stats.pending_orders ?? 0, fill: "#ca8a04" },
    { name: "Completed", value: stats.completed_orders ?? 0, fill: "#16a34a" },
];

  const bookingChartData = [
    { name: "Total", value: stats.total_bookings ?? 0, fill: "#1e40af" },
    { name: "Pending", value: stats.pending_bookings ?? 0, fill: "#ca8a04" },
    { name: "Available", value: stats.available_machines ?? 0, fill: "#16a34a" },
];

  const pieData = [
    { name: "Orders", value: stats.total_orders ?? 0 },
    { name: "Bookings", value: stats.total_bookings ?? 0 },
    { name: "Enrollments", value: stats.total_enrollments ?? 0 },
    { name: "Users", value: stats.total_users ?? 0 },
  ];

const PIE_COLORS = ["#1e40af", "#3b82f6", "#16a34a", "#ca8a04"];
const statCards = [
    { label: "Total Users", value: stats.total_users, color: "#0f172a", bg: "#eff6ff", path: "/admin/users", icon: "👥" },
    { label: "Product Orders", value: stats.total_orders, color: "#0f172a", bg: "#eff6ff", path: "/admin/orders", icon: "📦" },
    { label: "Pending Orders", value: stats.pending_orders, color: "#0f172a", bg: "#fffbeb", path: "/admin/orders", icon: "⏳" },
    { label: "Completed Orders", value: stats.completed_orders, color: "#0f172a", bg: "#f0fdf4", path: "/admin/orders", icon: "✅" },
    { label: "Total Machines", value: stats.total_machines, color: "#0f172a", bg: "#eff6ff", path: "/admin/machines", icon: "🖥️" },
    { label: "Machine Bookings", value: stats.total_bookings, color: "#0f172a", bg: "#eff6ff", path: "/admin/machine-bookings", icon: "📅" },
    { label: "Pending Bookings", value: stats.pending_bookings, color: "#0f172a", bg: "#fffbeb", path: "/admin/machine-bookings", icon: "🕐" },
    { label: "Total Enrollments", value: stats.total_enrollments, color: "#0f172a", bg: "#f0fdf4", path: "/admin/courses", icon: "📚" },
];

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Admin Dashboard</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Welcome to JNEC Fab Lab Admin Panel</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {statCards.map((s, i) => (
              <div key={i} onClick={() => navigate(s.path)}
                style={{ background: "white", borderRadius: 14, padding: "18px 20px", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "transform 0.2s", }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</p>
                    <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: s.color }}>{s.value ?? 0}</h2>
                  </div>
                  <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {s.icon}
                  </div>
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 11, color: s.color, fontWeight: 600 }}>View all →</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>

            {/* Orders Bar Chart */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Product Orders</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={orderChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {orderChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bookings Bar Chart */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Machine Bookings</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={bookingChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {bookingChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>System Overview</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Data */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>

            {/* Recent Orders */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Orders</h3>
                <span onClick={() => navigate("/admin/orders")} style={{ fontSize: 12, color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>View All →</span>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No orders yet</p>
              ) : recentOrders.map((order, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < recentOrders.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{order.product_name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{order.user?.name} | Nu. {order.total_price}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: getStatusStyle(order.status).bg, color: getStatusStyle(order.status).color }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Machine Bookings</h3>
                <span onClick={() => navigate("/admin/machine-bookings")} style={{ fontSize: 12, color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>View All →</span>
              </div>
              {recentBookings.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No bookings yet</p>
              ) : recentBookings.map((booking, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < recentBookings.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{booking.machine?.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{booking.user?.name} | {booking.booking_date}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: getStatusStyle(booking.status).bg, color: getStatusStyle(booking.status).color }}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Enrollments */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Course Enrollments</h3>
                <span onClick={() => navigate("/admin/courses")} style={{ fontSize: 12, color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>View All →</span>
              </div>
              {recentEnrollments.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No enrollments yet</p>
              ) : recentEnrollments.map((enrollment, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < recentEnrollments.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{enrollment.user?.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{enrollment.course?.title}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: getStatusStyle(enrollment.status).bg, color: getStatusStyle(enrollment.status).color }}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "white", borderRadius: 14, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: " Manage Users", path: "/admin/users", color: "#3b82f6" },
                { label: " Product Orders", path: "/admin/orders", color: "#10b981" },
                { label: " Machine Bookings", path: "/admin/machine-bookings", color: "#f59e0b" },
                { label: " Course Management", path: "/admin/courses", color: "#8b5cf6" },
                { label: " Add Machine", path: "/admin/machines", color: "#0891b2" },
                { label: " Reported Issues", path: "/admin/issues", color: "#dc2626" },
                { label: " Manage Projects", path: "/admin/projects", color: "#16a34a" },
                { label: " View Reports", path: "/admin/reports", color: "#ea580c" },
              ].map((q, i) => (
                <button key={i} onClick={() => navigate(q.path)}
                  style={{ padding: "14px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = q.color; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}