import { useState, useEffect } from "react";
import axios from "axios";

export default function Feedback() {
  const [form, setForm] = useState({
    category: "",
    rating: 0,
    comment: "",
  });
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("submit");
  const [hoveredStar, setHoveredStar] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  const fetchMyFeedbacks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-feedbacks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/feedbacks", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Feedback submitted successfully! Thank you.");
      setForm({ category: "", rating: 0, comment: "" });
      fetchMyFeedbacks();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    }
    setLoading(false);
  };

  const getRatingLabel = (rating) => {
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    if (rating === 5) return "Excellent";
    return "";
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Feedback</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Share your experience and help us improve</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["submit", "my-feedbacks"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, backgroundColor: activeTab === tab ? "#1e40af" : "#f1f5f9", color: activeTab === tab ? "white" : "#64748b" }}>
            {tab === "submit" ? "Submit Feedback" : "My Feedbacks"}
          </button>
        ))}
      </div>

      {/* Submit Feedback */}
      {activeTab === "submit" && (
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", maxWidth: 600 }}>
          {message && <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{message}</div>}
          {error && <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} required
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                <option value="">Select Category</option>
                <option value="machine">Machine & Equipment</option>
                <option value="course">Training & Courses</option>
                <option value="service">Lab Service</option>
                <option value="staff">Staff</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Star Rating */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Rating</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    style={{
                      fontSize: 36,
                      cursor: "pointer",
                      color: star <= (hoveredStar || form.rating) ? "#f59e0b" : "#e2e8f0",
                      transition: "color 0.1s ease",
                    }}
                  >
                    ★
                  </span>
                ))}
                {form.rating > 0 && (
                  <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 700, marginLeft: 8 }}>
                    {getRatingLabel(form.rating)}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Comment</label>
              <textarea name="comment" value={form.comment} onChange={handleChange} required rows={4}
                placeholder="Share your experience..."
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      )}

      {/* My Feedbacks */}
      {activeTab === "my-feedbacks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myFeedbacks.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No feedbacks submitted yet.</p>
          ) : (
            myFeedbacks.map(feedback => (
              <div key={feedback.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{feedback.category}</span>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>{new Date(feedback.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{ color: star <= feedback.rating ? "#f59e0b" : "#e2e8f0", fontSize: 18 }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>{feedback.comment}</p>
                <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: feedback.status === "reviewed" ? "#dcfce7" : "#f1f5f9", color: feedback.status === "reviewed" ? "#16a34a" : "#64748b" }}>
                  {feedback.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}