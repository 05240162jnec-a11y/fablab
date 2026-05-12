import { useState, useEffect } from "react";
import axios from "axios";

const categories = ["3D Printing", "Laser Cutting", "CNC", "Electronics", "Woodworking", "Other"];

export default function AdminMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMachine, setEditMachine] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "", category: "", description: "", status: "available",
    requires_training: true, max_booking_hours: 2, is_active: true,
  });

  const token = localStorage.getItem("token");

  useEffect(() => { fetchMachines(); }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/machines", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMachines(res.data);
    } catch (err) { console.error("Failed to fetch machines"); }
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const openAddForm = () => {
    setEditMachine(null);
    setForm({ name: "", category: "", description: "", status: "available", requires_training: true, max_booking_hours: 2, is_active: true });
    setImageFile(null); setImagePreview(null); setShowForm(true);
  };

  const openEditForm = (machine) => {
    setEditMachine(machine);
    setForm({
      name: machine.name, category: machine.category,
      description: machine.description || "", status: machine.status,
      requires_training: machine.requires_training,
      max_booking_hours: machine.max_booking_hours, is_active: machine.is_active,
    });
    setImageFile(null); setImagePreview(machine.image_url || null); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key =>
      formData.append(key, typeof form[key] === "boolean" ? (form[key] ? 1 : 0) : form[key])
    );
    if (imageFile) formData.append("image", imageFile);
    try {
      if (editMachine) {
        formData.append("_method", "PUT");
        await axios.post(`http://127.0.0.1:8000/api/admin/machines/${editMachine.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        setMessage("Machine updated successfully!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/admin/machines", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        setMessage("Machine added successfully!");
      }
      setShowForm(false); fetchMachines(); setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage("Failed to save machine."); }
  };

  const deleteMachine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/machines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Machine deleted successfully!");
      fetchMachines(); setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage("Failed to delete machine."); }
  };

  const getStatusColor = (status) => {
    if (status === "available") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "maintenance") return { bg: "#fef9c3", color: "#ca8a04" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", fontSize: 14,
    borderRadius: 6, border: "1px solid #d1d5db",
    outline: "none", boxSizing: "border-box",
    fontFamily: "Segoe UI, sans-serif", color: "#374151",
  };

  const labelStyle = {
    display: "block", fontSize: 13,
    fontWeight: 600, color: "#111827", marginBottom: 5,
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Machine Management</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Add and manage Fab Lab machines</p>
        </div>
        <button onClick={openAddForm} style={{
          padding: "10px 20px", backgroundColor: "#1e40af", color: "white",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}>
          + Add Machine
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Machines Grid */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading machines...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {machines.map((machine) => (
            <div key={machine.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ width: "100%", height: 140, background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {machine.image_url
                  ? <img src={machine.image_url} alt={machine.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "#94a3b8", fontSize: 13 }}>No Image</span>}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    {machine.category}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: getStatusColor(machine.status).bg, color: getStatusColor(machine.status).color }}>
                    {machine.status}
                  </span>
                </div>
                <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{machine.name}</h4>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  {machine.description?.substring(0, 65)}...
                </p>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  <p style={{ margin: "2px 0" }}>⏱ Max: {machine.max_booking_hours} hours/booking</p>
                  <p style={{ margin: "2px 0" }}>
                    🎓 Training: {machine.requires_training ? "Required" : "Not Required"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEditForm(machine)} style={{
                    flex: 1, padding: "7px", background: "#eff6ff", color: "#1e40af",
                    border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  }}>Edit</button>
                  <button onClick={() => deleteMachine(machine.id)} style={{
                    flex: 1, padding: "7px", background: "#fef2f2", color: "#dc2626",
                    border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {machines.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#64748b" }}>
              No machines yet. Click <strong>+ Add Machine</strong> to get started!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.45)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "white", borderRadius: 12, width: "100%", maxWidth: 480,
            maxHeight: "92vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>

            {/* Modal Header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "18px 24px", borderBottom: "1px solid #e5e7eb",
            }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>
                {editMachine ? "Edit Machine" : "Add New Machine"}
              </h3>
              <button onClick={() => setShowForm(false)} style={{
                background: "none", border: "none", fontSize: 22,
                cursor: "pointer", color: "#6b7280", lineHeight: 1, padding: "0 4px",
              }}>×</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div style={{ padding: "24px" }}>

                {/* Machine Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    Machine Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text" name="name" value={form.name}
                    onChange={handleChange} required
                    placeholder="e.g. 3D Printer, Laser Cutter"
                    style={inputStyle}
                  />
                </div>

                {/* Machine Type */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    Machine Type <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    name="category" value={form.category}
                    onChange={handleChange} required
                    style={{ ...inputStyle, background: "white" }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Status</label>
                  <select
                    name="status" value={form.status}
                    onChange={handleChange}
                    style={{ ...inputStyle, background: "white" }}
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="faulty">Faulty</option>
                  </select>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    name="description" value={form.description}
                    onChange={handleChange} rows={3}
                    placeholder="Brief description of the machine..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {/* Max Booking Hours */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Max Booking Hours</label>
                  <input
                    type="number" name="max_booking_hours"
                    value={form.max_booking_hours}
                    onChange={handleChange} min="1" max="4"
                    style={inputStyle}
                  />
                </div>

                {/* Machine Image */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Machine Image</label>
                  <input
                    type="file" accept="image/*"
                    onChange={handleImageChange}
                    style={{ ...inputStyle, padding: "7px 12px", cursor: "pointer" }}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview"
                      style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6, marginTop: 8 }} />
                  )}
                </div>

                {/* Checkboxes */}
                <div style={{ marginBottom: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                    <input
                      type="checkbox" name="requires_training"
                      checked={form.requires_training} onChange={handleChange}
                      style={{ width: 15, height: 15, accentColor: "#1e40af" }}
                    />
                    <span style={{ fontWeight: 600 }}>Requires Training Certificate</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                    <input
                      type="checkbox" name="is_active"
                      checked={form.is_active} onChange={handleChange}
                      style={{ width: 15, height: 15, accentColor: "#1e40af" }}
                    />
                    <span style={{ fontWeight: 600 }}>Active for Booking</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                padding: "16px 24px", borderTop: "1px solid #e5e7eb",
              }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: "9px 20px", background: "white", color: "#374151",
                  border: "1px solid #d1d5db", borderRadius: 6,
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: "9px 24px", background: "#1e40af", color: "white",
                  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600,
                }}>
                  {editMachine ? "Update Machine" : "Add Machine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}