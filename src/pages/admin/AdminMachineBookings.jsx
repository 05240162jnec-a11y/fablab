import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminMachineBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/machine-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    }
    setLoading(false);
  };

  const openNoteModal = (booking, status) => {
    setSelectedBooking(booking);
    setSelectedStatus(status);
    setAdminNote("");
    setShowNoteModal(true);
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/machine-bookings/${selectedBooking.id}/status`,
        { status: selectedStatus, admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Booking ${selectedStatus} successfully!`);
      setShowNoteModal(false);
      fetchBookings();
      setTimeout(() => setMessage(""), 3000);
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

  const filteredBookings = filter === "all"
    ? bookings
    : bookings.filter(b => b.status === filter);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Machine Bookings</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage all machine booking requests from users</p>
        </div>
        <div style={{ background: "#dbeafe", color: "#1e40af", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
          Total: {bookings.length} bookings
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

      {/* Bookings Table */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading bookings...</p>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>User</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Machine</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Date</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Time</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Purpose</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, i) => (
                <tr key={booking.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{booking.user?.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{booking.user?.email}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                    {booking.machine?.name}
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{booking.machine?.category}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{booking.booking_date}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{booking.start_time} - {booking.end_time}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b", maxWidth: 150 }}>
                    {booking.purpose || "No purpose stated"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: getStatusStyle(booking.status).bg, color: getStatusStyle(booking.status).color }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => openNoteModal(booking, "approved")}
                            style={{ padding: "6px 12px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openNoteModal(booking, "rejected")}
                            style={{ padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "approved" && (
                        <button
                          onClick={() => openNoteModal(booking, "completed")}
                          style={{ padding: "6px 12px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>No bookings found!</p>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
              {selectedStatus === "approved" ? "Approve Booking" : selectedStatus === "rejected" ? "Reject Booking" : "Mark as Completed"}
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
              {selectedBooking?.user?.name} - {selectedBooking?.machine?.name}<br />
              {selectedBooking?.booking_date} | {selectedBooking?.start_time} - {selectedBooking?.end_time}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Note to User (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Add a note for the user..."
                rows={3}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

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