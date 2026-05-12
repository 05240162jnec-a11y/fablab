import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/admin/product-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
    setLoading(false);
  };

  const openNoteModal = (order, status) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    setAdminNote("");
    setShowNoteModal(true);
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:8000/api/admin/product-orders/${selectedOrder.id}/status`,
        { status: selectedStatus, admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Order ${selectedStatus} successfully! Email sent to user.`);
      setShowNoteModal(false);
      fetchOrders();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setMessage("Failed to update status");
    }
    setUpdating(false);
  };

  const getStatusStyle = (status) => {
    if (status === "approved") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "completed") return { bg: "#dbeafe", color: "#1e40af" };
    if (status === "rejected") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Product Orders</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage all product orders from users</p>
        </div>
        <div style={{ background: "#dbeafe", color: "#1e40af", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
          Total: {orders.length} orders
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["all", "pending", "approved", "completed", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: filter === f ? "#1e40af" : "#f1f5f9",
              color: filter === f ? "white" : "#64748b",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading orders...</p>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Order ID</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>User</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Product</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Qty</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Total</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#1e40af" }}>
                    #{order.id}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{order.user?.name || "Unknown"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{order.user?.email}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#0f172a" }}>{order.product_name}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{order.quantity}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#1e40af" }}>Nu. {order.total_price}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                      background: getStatusStyle(order.status).bg,
                      color: getStatusStyle(order.status).color
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => openNoteModal(order, "approved")}
                            style={{ padding: "6px 12px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openNoteModal(order, "rejected")}
                            style={{ padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status === "approved" && (
                        <button
                          onClick={() => openNoteModal(order, "completed")}
                          style={{ padding: "6px 12px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          Mark Completed
                        </button>
                      )}
                      {order.admin_note && (
                        <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
                          Note: {order.admin_note}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>No orders found!</p>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
              {selectedStatus === "approved" ? "Approve Order" : selectedStatus === "rejected" ? "Reject Order" : "Mark as Completed"}
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
              Order #{selectedOrder?.id} - {selectedOrder?.product_name}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Note to User (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder={
                  selectedStatus === "approved"
                    ? "e.g. Please collect your order from the Fab Lab between 9 AM - 5 PM"
                    : selectedStatus === "rejected"
                    ? "e.g. Sorry, this item is currently out of stock"
                    : "e.g. Your order is ready for collection"
                }
                rows={4}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            {selectedStatus === "approved" && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 14, marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#1e40af", fontWeight: 600 }}>Payment details will be sent to user via email</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#3b82f6" }}>Total amount: Nu. {selectedOrder?.total_price}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={updateStatus}
                disabled={updating}
                style={{
                  flex: 1, padding: "12px",
                  backgroundColor: selectedStatus === "approved" ? "#16a34a" : selectedStatus === "rejected" ? "#dc2626" : "#1e40af",
                  color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600
                }}
              >
                {updating ? "Processing..." : `Confirm ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                style={{ flex: 1, padding: "12px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}