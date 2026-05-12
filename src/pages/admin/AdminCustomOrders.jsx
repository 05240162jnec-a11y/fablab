import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState([]);
  const [productionTeam, setProductionTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignTo, setAssignTo] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
    fetchProductionTeam();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/custom-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
    setLoading(false);
  };

  const fetchProductionTeam = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductionTeam(res.data.filter(u => u.role === "production_team"));
    } catch (err) {
      console.error("Failed to fetch production team");
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setAssignTo("");
    setAdminNote("");
    setShowModal(true);
  };

  const assignOrder = async () => {
    if (!assignTo) {
      alert("Please select a production team member");
      return;
    }
    setUpdating(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/assign`,
        { assigned_to: assignTo, admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Order assigned successfully!");
      setShowModal(false);
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to assign order");
    }
    setUpdating(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/custom-orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Order ${status} successfully!`);
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update order");
    }
  };

  const getStatusColor = (status) => {
    if (status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "in_progress") return { bg: "#dbeafe", color: "#1e40af" };
    if (status === "rejected") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Custom Orders</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage and assign custom fabrication orders</p>
        </div>
        <div style={{ background: "#dbeafe", color: "#1e40af", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
          Total: {orders.length} orders
        </div>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["all", "pending", "in_progress", "completed", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: filter === f ? "#1e40af" : "#f1f5f9", color: filter === f ? "white" : "#64748b" }}>
            {f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading orders...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{order.title}</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                    By: <strong>{order.user?.name}</strong> | {order.user?.email}
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: getStatusColor(order.status).bg, color: getStatusColor(order.status).color }}>
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#374151" }}>{order.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Material</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{order.material}</p>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Quantity</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{order.quantity}</p>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Deadline</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: order.deadline ? "#ef4444" : "#0f172a" }}>
                    {order.deadline ? new Date(order.deadline).toLocaleDateString() : "No deadline"}
                  </p>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Assigned To</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    {order.assigned_to ? order.assignedTo?.name : "Not assigned"}
                  </p>
                </div>
              </div>

              {order.file_url && (
                <a href={order.file_url} target="_blank" rel="noreferrer"
                  style={{ display: "inline-block", marginBottom: 12, padding: "6px 14px", background: "#dbeafe", color: "#1e40af", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  View Design File
                </a>
              )}

              {order.production_note && (
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#16a34a" }}>Production Note: {order.production_note}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                {order.status === "pending" && (
                  <>
                    <button onClick={() => openAssignModal(order)}
                      style={{ padding: "8px 18px", background: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      Assign to Team
                    </button>
                    <button onClick={() => updateStatus(order.id, "rejected")}
                      style={{ padding: "8px 18px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      Reject
                    </button>
                  </>
                )}
                {order.status === "in_progress" && (
                  <button onClick={() => updateStatus(order.id, "completed")}
                    style={{ padding: "8px 18px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>No orders found!</p>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Assign Order to Production Team</h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>{selectedOrder?.title}</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Production Team Member</label>
              <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                <option value="">Select Member</option>
                {productionTeam.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              {productionTeam.length === 0 && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444" }}>No production team members found. Please assign production_team role to users first.</p>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Note to Production Team</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                placeholder="Special instructions for the production team..."
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={assignOrder} disabled={updating}
                style={{ flex: 1, padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                {updating ? "Assigning..." : "Assign Order"}
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "12px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}