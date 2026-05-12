import { useState, useEffect } from "react";
import axios from "axios";

export default function ReportIssue() {
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({
    machine_id: "",
    issue_type: "",
    description: "",
    severity: "low",
  });
  const [myIssues, setMyIssues] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("report");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMachines();
    fetchMyIssues();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/machines");
      setMachines(res.data);
    } catch (err) {
      console.error("Failed to fetch machines");
    }
  };

  const fetchMyIssues = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-machine-issues", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyIssues(res.data);
    } catch (err) {
      console.error("Failed to fetch issues");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/machine-issues", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Issue reported successfully! Admin will review it soon.");
      setForm({ machine_id: "", issue_type: "", description: "", severity: "low" });
      fetchMyIssues();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to report issue.");
    }
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return { bg: "#fee2e2", color: "#dc2626" };
    if (severity === "medium") return { bg: "#fef9c3", color: "#ca8a04" };
    return { bg: "#dcfce7", color: "#16a34a" };
  };

  const getStatusColor = (status) => {
    if (status === "resolved") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "in_progress") return { bg: "#dbeafe", color: "#1e40af" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Report Machine Issue</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Report any problems with Fab Lab machines</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["report", "my-issues"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, backgroundColor: activeTab === tab ? "#1e40af" : "#f1f5f9", color: activeTab === tab ? "white" : "#64748b" }}>
            {tab === "report" ? "Report Issue" : "My Reports"}
          </button>
        ))}
      </div>

      {/* Report Form */}
      {activeTab === "report" && (
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", maxWidth: 600 }}>
          {message && <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{message}</div>}
          {error && <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Machine</label>
              <select name="machine_id" value={form.machine_id} onChange={handleChange} required
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                <option value="">Select Machine</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Issue Type</label>
                <select name="issue_type" value={form.issue_type} onChange={handleChange} required
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select Type</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="electrical">Electrical</option>
                  <option value="software">Software</option>
                  <option value="safety">Safety Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Severity</label>
                <select name="severity" value={form.severity} onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High - Machine Not Working</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                placeholder="Describe the issue in detail..."
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            {form.severity === "high" && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>High severity will automatically mark the machine as faulty and block bookings.</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
              {loading ? "Submitting..." : "Report Issue"}
            </button>
          </form>
        </div>
      )}

      {/* My Issues */}
      {activeTab === "my-issues" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myIssues.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No issues reported yet.</p>
          ) : (
            myIssues.map(issue => (
              <div key={issue.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{issue.machine?.name}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{issue.issue_type} | {new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: getSeverityColor(issue.severity).bg, color: getSeverityColor(issue.severity).color }}>
                      {issue.severity}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: getStatusColor(issue.status).bg, color: getStatusColor(issue.status).color }}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>{issue.description}</p>
                {issue.admin_note && (
                  <div style={{ marginTop: 10, background: "#eff6ff", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>Admin Note: {issue.admin_note}</p>
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