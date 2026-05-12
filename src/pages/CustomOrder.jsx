import { useState, useEffect } from "react";
import axios from "axios";

export default function CustomOrder() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    material: "",
    quantity: 1,
    deadline: "",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("submit");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-custom-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("material", form.material);
    formData.append("quantity", form.quantity);
    formData.append("deadline", form.deadline);
    formData.append("notes", form.notes);
    if (file) formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/api/custom-orders", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setSubmitted(true);
      fetchMyOrders();
      setTimeout(() => {
        setSubmitted(false);
        setForm({ title: "", description: "", material: "", quantity: 1, deadline: "", notes: "" });
        setFile(null);
        setActiveTab("my-orders");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit order.");
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "in_progress") return { bg: "#dbeafe", color: "#1e40af" };
    if (status === "rejected") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: "#16a34a", margin: "0 0 8px" }}>Order Submitted!</h2>
          <p style={{ color: "#64748b" }}>Your custom order has been submitted. The production team will review it soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Custom Order</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Submit a custom fabrication request to the Fab Lab production team</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["submit", "my-orders"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, backgroundColor: activeTab === tab ? "#1e40af" : "#f1f5f9", color: activeTab === tab ? "white" : "#64748b" }}>
            {tab === "submit" ? "Submit Order" : "My Orders"}
          </button>
        ))}
      </div>

      {/* Submit Order */}
      {activeTab === "submit" && (
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", maxWidth: 700 }}>

          {error && <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Project Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g. Custom Trophy, Phone Stand, Logo Sign"
                style={{ width: "100%", padding: "12px 15px", fontSize: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                placeholder="Describe your project in detail. Include dimensions, colors, and specific requirements..."
                style={{ width: "100%", padding: "12px 15px", fontSize: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Material</label>
                <select name="material" value={form.material} onChange={handleChange} required
                  style={{ width: "100%", padding: "12px 15px", fontSize: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select Material</option>
                  <option value="PLA">PLA (3D Printing)</option>
                  <option value="ABS">ABS (3D Printing)</option>
                  <option value="Resin">Resin (3D Printing)</option>
                  <option value="Acrylic">Acrylic (Laser Cutting)</option>
                  <option value="Wood">Wood (Laser Cutting / CNC)</option>
                  <option value="Metal">Metal (CNC)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Quantity</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required
                  style={{ width: "100%", padding: "12px 15px", fontSize: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Required By (Deadline)</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                style={{ width: "100%", padding: "12px 15px", fontSize: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Upload Design File / Reference Image</label>
              <div onClick={() => document.getElementById("customFile").click()}
                style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", backgroundColor: "#f8fafc" }}>
                {file ? (
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e40af" }}>{file.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151" }}>Click to upload file</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Supports: JPG, PNG, PDF, STL, DXF (Max 10MB)</p>
                  </div>
                )}
              </div>
              <input id="customFile" type="file" accept=".jpg,.jpeg,.png,.pdf,.stl,.dxf"
                onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Additional Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                placeholder="Any additional information or special instructions..."
                style={{ width: "100%", padding: "12px 15px", fontSize: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#1e40af", fontWeight: 600 }}>Important Information</p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#3b82f6", lineHeight: 1.6 }}>
                After submitting, the production team will review your order and contact you within 1-2 working days with a quote and timeline.
              </p>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>
              {loading ? "Submitting..." : "Submit Custom Order"}
            </button>
          </form>
        </div>
      )}

      {/* My Orders */}
      {activeTab === "my-orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myOrders.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No custom orders submitted yet.</p>
          ) : (
            myOrders.map(order => (
              <div key={order.id} style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{order.title}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Material: {order.material} | Qty: {order.quantity} | Submitted: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: getStatusColor(order.status).bg, color: getStatusColor(order.status).color }}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#374151" }}>{order.description}</p>
                {order.deadline && (
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>Deadline: {new Date(order.deadline).toLocaleDateString()}</p>
                )}
                {order.admin_note && (
                  <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>Admin Note: {order.admin_note}</p>
                  </div>
                )}
                {order.production_note && (
                  <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#16a34a" }}>Production Note: {order.production_note}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}