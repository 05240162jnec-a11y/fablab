import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminReports() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
    setLoading(false);
  };

  const StatCard = ({ label, value, color, bg }) => (
    <div style={{ background: "white", borderRadius: 12, padding: "20px 22px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color }}>{value ?? 0}</h2>
    </div>
  );

  const BarChart = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 13, color: "#64748b" }}>{value} / {max}</span>
        </div>
        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${percentage}%`, background: color, borderRadius: 10, transition: "width 0.5s ease" }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Reports & Analytics</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Overview of all Fab Lab activities</p>
      </div>

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading reports...</p>
      ) : (
        <>
          {/* Stats Overview */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>System Overview</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Users" value={stats.total_users} color="#3b82f6" bg="#eff6ff" />
            <StatCard label="Total Machines" value={stats.total_machines} color="#8b5cf6" bg="#f5f3ff" />
            <StatCard label="Total Courses" value={stats.total_courses} color="#10b981" bg="#ecfdf5" />
            <StatCard label="Total Enrollments" value={stats.total_enrollments} color="#f59e0b" bg="#fffbeb" />
          </div>

          {/* Orders Report */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Product Orders Report</h3>
          <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <BarChart label="Total Orders" value={stats.total_orders} max={stats.total_orders} color="#3b82f6" />
                <BarChart label="Pending Orders" value={stats.pending_orders} max={stats.total_orders} color="#f59e0b" />
                <BarChart label="Completed Orders" value={stats.completed_orders} max={stats.total_orders} color="#10b981" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Total Orders", value: stats.total_orders, color: "#3b82f6" },
                  { label: "Pending", value: stats.pending_orders, color: "#f59e0b" },
                  { label: "Completed", value: stats.completed_orders, color: "#10b981" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Bookings Report */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Machine Bookings Report</h3>
          <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <BarChart label="Total Bookings" value={stats.total_bookings} max={stats.total_bookings} color="#8b5cf6" />
                <BarChart label="Pending Bookings" value={stats.pending_bookings} max={stats.total_bookings} color="#f59e0b" />
                <BarChart label="Available Machines" value={stats.available_machines} max={stats.total_machines} color="#10b981" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Total Bookings", value: stats.total_bookings, color: "#8b5cf6" },
                  { label: "Pending", value: stats.pending_bookings, color: "#f59e0b" },
                  { label: "Available Machines", value: stats.available_machines, color: "#10b981" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Training Report */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Training & Courses Report</h3>
          <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <BarChart label="Total Courses" value={stats.total_courses} max={stats.total_courses} color="#10b981" />
                <BarChart label="Total Enrollments" value={stats.total_enrollments} max={stats.total_enrollments} color="#3b82f6" />
                <BarChart label="Active Enrollments" value={stats.pending_enrollments} max={stats.total_enrollments} color="#f59e0b" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Total Courses", value: stats.total_courses, color: "#10b981" },
                  { label: "Total Enrollments", value: stats.total_enrollments, color: "#3b82f6" },
                  { label: "Active Enrollments", value: stats.pending_enrollments, color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}