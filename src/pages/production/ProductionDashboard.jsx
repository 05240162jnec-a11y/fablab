import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductionDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/production/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
    setLoading(false);
  };

  const stats = {
    total:       orders.length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    completed:   orders.filter(o => o.status === "completed").length,
    pending:     orders.filter(o => o.status === "pending").length,
  };

  const getStatusColor = (status) => {
    if (status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "in_progress") return { bg: "#dbeafe", color: "#1e40af" };
    if (status === "rejected") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 28,
        color: "#fff",
      }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
          JNEC Fab Lab Production Team Portal
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Orders", value: stats.total, color: "#3b82f6", bg: "#eff6ff", icon: "📦" },
          { label: "In Progress", value: stats.in_progress, color: "#f59e0b", bg: "#fffbeb", icon: "⚙️" },
          { label: "Completed", value: stats.completed, color: "#16a34a", bg: "#dcfce7", icon: "✅" },
          { label: "Pending", value: stats.pending, color: "#8b5cf6", bg: "#f5f3ff", icon: "⏳" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "20px 22px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 500 }}>{s.label}</p>
                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: s.color }}>
                  {loading ? "..." : s.value}
                </h2>
              </div>
              <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {s.icon}
              </div>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12, color: s.color, fontWeight: 600 }}>View all</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: "white", borderRadius: 14, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>My Assigned Orders</h3>
          <button
            onClick={() => navigate("/production/orders")}
            style={{ padding: "8px 16px", background: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            View All
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "30px 0" }}>No orders assigned yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.slice(0, 5).map(order => (
              <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{order.title}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                    By: {order.user?.name} | Material: {order.material} | Qty: {order.quantity}
                  </p>
                  {order.deadline && (
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                      Deadline: {new Date(order.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: getStatusColor(order.status).bg, color: getStatusColor(order.status).color }}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}