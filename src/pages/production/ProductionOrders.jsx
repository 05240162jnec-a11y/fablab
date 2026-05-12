import { useState, useEffect } from "react";
import axios from "axios";

export default function ProductionOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [productionNote, setProductionNote] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const openModal = (order, status) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    setProductionNote(order.production_note || "");
    setShowModal(true);
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/production/orders/${selectedOrder.id}/status`,
        { status: selectedStatus, production_note: productionNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Order marked as ${selectedStatus.replace("_", " ")} successfully!`);
      setShowModal(false);
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update order status");
    }
    setUpdating(false);
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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>My Assigned Orders</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>View and update your assigned custom fabrication orders</p>
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
        {["all", "pending", "in_progress", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: filter === f ? "#1e40af" : "#f1f5f9", color: filter === f ? "white" : "#64748b" }}>
            {f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No orders found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{order.title}</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                    Requested by: <strong>{order.user?.name}</strong> | {order.user?.email}
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: getStatusColor(order.status).bg, color: getStatusColor(order.status).color }}>
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{order.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Material</p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{order.material}</p>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Quantity</p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{order.quantity}</p>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Deadline</p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: order.deadline ? "#ef4444" : "#0f172a" }}>
                    {order.deadline ? new Date(order.deadline).toLocaleDateString() : "No deadline"}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div style={{ background: "#fffbeb", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>Notes: {order.notes}</p>
                </div>
              )}

              {order.file_url && (
                <a href={order.file_url} target="_blank" rel="noreferrer"
                  style={{ display: "inline-block", marginBottom: 12, padding: "6px 14px", background: "#dbeafe", color: "#1e40af", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  View Design File
                </a>
              )}

              {order.admin_note && (
                <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>Admin Note: {order.admin_note}</p>
                </div>
              )}

              {order.production_note && (
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#16a34a" }}>My Note: {order.production_note}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                {order.status === "pending" && (
                  <button onClick={() => openModal(order, "in_progress")}
                    style={{ padding: "8px 18px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Start Working
                  </button>
                )}
                {order.status === "in_progress" && (
                  <button onClick={() => openModal(order, "completed")}
                    style={{ padding: "8px 18px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Mark as Completed
                  </button>
                )}
                <button onClick={() => openModal(order, order.status)}
                  style={{ padding: "8px 18px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  Update Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
              {selectedStatus === "in_progress" ? "Start Working on Order" : selectedStatus === "completed" ? "Mark Order as Completed" : "Update Order Note"}
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>{selectedOrder?.title}</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Production Note
              </label>
              <textarea
                value={productionNote}
                onChange={e => setProductionNote(e.target.value)}
                placeholder="Add a note about the work being done..."
                rows={4}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={updateStatus} disabled={updating}
                style={{ flex: 1, padding: "12px", backgroundColor: selectedStatus === "completed" ? "#16a34a" : "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                {updating ? "Updating..." : "Confirm"}
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