import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/machine-issues", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(res.data);
    } catch (err) {
      console.error("Failed to fetch issues");
    }
    setLoading(false);
  };

  const openModal = (issue, status) => {
    setSelectedIssue(issue);
    setSelectedStatus(status);
    setAdminNote("");
    setShowModal(true);
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/machine-issues/${selectedIssue.id}/status`,
        { status: selectedStatus, admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Issue marked as ${selectedStatus} successfully!`);
      setShowModal(false);
      fetchIssues();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update issue status");
    }
    setUpdating(false);
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

  const filteredIssues = filter === "all"
    ? issues
    : issues.filter(i => i.status === filter);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Reported Issues</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>View and manage machine issues reported by users</p>
        </div>
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
          Total: {issues.length} issues
        </div>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["all", "open", "in_progress", "resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: filter === f ? "#1e40af" : "#f1f5f9", color: filter === f ? "white" : "#64748b" }}>
            {f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Issues Table */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading issues...</p>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Reported By</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Machine</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Issue Type</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Severity</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Description</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue, i) => (
                <tr key={issue.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{issue.user?.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{new Date(issue.created_at).toLocaleDateString()}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{issue.machine?.name}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{issue.issue_type}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: getSeverityColor(issue.severity).bg, color: getSeverityColor(issue.severity).color }}>
                      {issue.severity}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b", maxWidth: 180 }}>{issue.description}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: getStatusColor(issue.status).bg, color: getStatusColor(issue.status).color }}>
                      {issue.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {issue.status === "open" && (
                        <button onClick={() => openModal(issue, "in_progress")}
                          style={{ padding: "6px 12px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          In Progress
                        </button>
                      )}
                      {issue.status !== "resolved" && (
                        <button onClick={() => openModal(issue, "resolved")}
                          style={{ padding: "6px 12px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredIssues.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>No issues found!</p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
              {selectedStatus === "resolved" ? "Resolve Issue" : "Mark In Progress"}
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
              Machine: {selectedIssue?.machine?.name} | Reported by: {selectedIssue?.user?.name}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Note to User</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                placeholder="Describe what action was taken..."
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={updateStatus} disabled={updating}
                style={{ flex: 1, padding: "12px", backgroundColor: selectedStatus === "resolved" ? "#16a34a" : "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                {updating ? "Processing..." : "Confirm"}
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