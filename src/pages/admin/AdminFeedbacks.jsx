import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/feedbacks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks");
    }
    setLoading(false);
  };

  const markReviewed = async (id) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/feedbacks/${id}/review`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Feedback marked as reviewed!");
      fetchFeedbacks();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update feedback");
    }
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  };

  const filteredFeedbacks = filter === "all"
    ? feedbacks
    : feedbacks.filter(f => f.status === filter);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>User Feedbacks</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>View and manage feedback from users</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "#fffbeb", color: "#ca8a04", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
            Avg Rating: {getAverageRating()} / 5
          </div>
          <div style={{ background: "#dbeafe", color: "#1e40af", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
            Total: {feedbacks.length}
          </div>
        </div>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Rating Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[5, 4, 3, 2, 1].map(star => {
          const count = feedbacks.filter(f => f.rating === star).length;
          const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
          return (
            <div key={star} style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ fontSize: 24, color: "#f59e0b" }}>{"★".repeat(star)}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>{count}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{percentage.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["all", "pending", "reviewed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: filter === f ? "#1e40af" : "#f1f5f9", color: filter === f ? "white" : "#64748b" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Feedbacks */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading feedbacks...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filteredFeedbacks.map(feedback => (
            <div key={feedback.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{feedback.user?.name}</p>
                  <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{feedback.category}</span>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ color: star <= feedback.rating ? "#f59e0b" : "#e2e8f0", fontSize: 16 }}>★</span>
                  ))}
                </div>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{feedback.comment}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>{new Date(feedback.created_at).toLocaleDateString()}</span>
                {feedback.status === "pending" ? (
                  <button onClick={() => markReviewed(feedback.id)}
                    style={{ padding: "5px 12px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    Mark Reviewed
                  </button>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: "#dcfce7", color: "#16a34a" }}>
                    Reviewed
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredFeedbacks.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>
              No feedbacks found!
            </div>
          )}
        </div>
      )}
    </div>
  );
}