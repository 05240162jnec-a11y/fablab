import { useState, useEffect } from "react";
import axios from "axios";

const timeSlots = [
  { start: "09:00", end: "10:00", label: "9:00 AM - 10:00 AM" },
  { start: "10:00", end: "11:00", label: "10:00 AM - 11:00 AM" },
  { start: "11:00", end: "12:00", label: "11:00 AM - 12:00 PM" },
  { start: "13:00", end: "14:00", label: "1:00 PM - 2:00 PM" },
  { start: "14:00", end: "15:00", label: "2:00 PM - 3:00 PM" },
  { start: "15:00", end: "16:00", label: "3:00 PM - 4:00 PM" },
];

export default function BookMachine() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=select machine, 2=select slot, 3=confirm

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/machines");
      setMachines(res.data);
    } catch (err) {
      console.error("Failed to fetch machines");
    }
    setLoading(false);
  };

  const fetchSlots = async (machineId, date) => {
    if (!machineId || !date) return;
    setSlotsLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/machine-slots", {
        params: { machine_id: machineId, booking_date: date },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots");
    }
    setSlotsLoading(false);
  };

  const selectMachine = (machine) => {
    // check if machine requires training
    if (machine.requires_training && !user.is_trained) {
      setError("You must complete training before booking this machine. Please enroll in a training course first.");
      return;
    }
    setSelectedMachine(machine);
    setError("");
    setStep(2);
  };

  const handleDateChange = (e) => {
    setBookingDate(e.target.value);
    setSelectedSlot(null);
    if (selectedMachine) {
      fetchSlots(selectedMachine.id, e.target.value);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !bookingDate || !selectedMachine) return;
    setBooking(true);
    setError("");
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/machine-bookings",
        {
          machine_id:   selectedMachine.id,
          booking_date: bookingDate,
          start_time:   selectedSlot.start,
          end_time:     selectedSlot.end,
          purpose:      purpose,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Machine booked successfully! Waiting for admin approval.");
      setStep(1);
      setSelectedMachine(null);
      setBookingDate("");
      setSelectedSlot(null);
      setPurpose("");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book machine.");
    }
    setBooking(false);
  };

  // get today's date for min date
  const today = new Date().toISOString().split("T")[0];

  const getStatusColor = (status) => {
    if (status === "available") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "maintenance") return { bg: "#fef9c3", color: "#ca8a04" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Book a Machine</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Book Fab Lab machines from 9:00 AM to 4:00 PM daily</p>
      </div>

      {/* Training Warning */}
      {!user.is_trained && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 14, color: "#92400e", fontWeight: 600 }}>
            Training Required
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#92400e" }}>
            Some machines require training certification. Please complete training to book restricted machines.
          </p>
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Step 1 - Select Machine */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Step 1: Select a Machine</h3>
          {loading ? (
            <p style={{ color: "#64748b" }}>Loading machines...</p>
          ) : machines.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No machines available.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {machines.map(machine => (
                <div
                  key={machine.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: machine.status !== "available" ? "1px solid #e2e8f0" : "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    opacity: machine.status !== "available" ? 0.7 : 1,
                  }}
                >
                  {/* Machine Image */}
                  <div style={{ width: "100%", height: 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {machine.image_url ? (
                      <img src={machine.image_url} alt={machine.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 40, color: "#94a3b8" }}>No Image</span>
                    )}
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                        {machine.category}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: getStatusColor(machine.status).bg, color: getStatusColor(machine.status).color }}>
                        {machine.status}
                      </span>
                    </div>
                    <h4 style={{ margin: "8px 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{machine.name}</h4>
                    <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{machine.description?.substring(0, 80)}</p>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                      <p style={{ margin: "2px 0" }}>Max: {machine.max_booking_hours} hours/booking</p>
                      <p style={{ margin: "2px 0", color: machine.requires_training ? "#f59e0b" : "#16a34a", fontWeight: 600 }}>
                        {machine.requires_training ? "Training Required" : "No Training Required"}
                      </p>
                    </div>
                    <button
                      onClick={() => selectMachine(machine)}
                      disabled={machine.status !== "available"}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: machine.status !== "available" ? "#94a3b8" : "#1e40af",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: machine.status !== "available" ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {machine.status !== "available" ? "Not Available" : "Select Machine"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2 - Select Date and Time */}
      {step === 2 && selectedMachine && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => { setStep(1); setSelectedMachine(null); setError(""); }}
              style={{ padding: "8px 16px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
            >
              Back
            </button>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Step 2: Select Date and Time - {selectedMachine.name}
            </h3>
          </div>

          {/* Selected Machine Info */}
          <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
            {selectedMachine.image_url && (
              <img src={selectedMachine.image_url} alt={selectedMachine.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
            )}
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{selectedMachine.name}</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{selectedMachine.category} | Max {selectedMachine.max_booking_hours} hours</p>
            </div>
          </div>

          {/* Date Picker */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0", marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Select Date
            </label>
            <input
              type="date"
              value={bookingDate}
              min={today}
              onChange={handleDateChange}
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Time Slots */}
          {bookingDate && (
            <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Available Time Slots</h4>
              {slotsLoading ? (
                <p style={{ color: "#64748b" }}>Loading slots...</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      disabled={!slot.available}
                      style={{
                        padding: "12px",
                        borderRadius: 8,
                        border: selectedSlot?.start === slot.start ? "2px solid #1e40af" : "1px solid #e2e8f0",
                        background: !slot.available ? "#f1f5f9" : selectedSlot?.start === slot.start ? "#eff6ff" : "white",
                        color: !slot.available ? "#94a3b8" : selectedSlot?.start === slot.start ? "#1e40af" : "#374151",
                        cursor: !slot.available ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {timeSlots.find(t => t.start === slot.start)?.label || `${slot.start} - ${slot.end}`}
                      <br />
                      <span style={{ fontSize: 11, fontWeight: 400 }}>
                        {!slot.available ? "Booked" : "Available"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Purpose */}
          {selectedSlot && (
            <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                Purpose of Booking
              </label>
              <textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Describe what you will be doing with this machine..."
                rows={3}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />

              <button
                onClick={handleBooking}
                disabled={booking}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "13px",
                  backgroundColor: "#1e40af",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}