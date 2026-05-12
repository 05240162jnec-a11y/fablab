import { useState, useEffect } from "react";
import axios from "axios";

const categories = ["3D Printing", "Laser Cutting", "CNC", "Electronics", "Woodworking", "Other"];

export default function Projects() {
  const [myProjects, setMyProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    video_url: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPublicProjects();
    fetchMyProjects();
  }, []);

  const fetchPublicProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/projects");
      setPublicProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
    setLoading(false);
  };

  const fetchMyProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch my projects");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("video_url", form.video_url);
    if (file) formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/api/projects", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setMessage("Project submitted successfully! Admin will review it soon.");
      setShowForm(false);
      setForm({ title: "", description: "", category: "", video_url: "" });
      setFile(null);
      fetchMyProjects();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit project.");
    }
    setSubmitting(false);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Project deleted successfully.");
      fetchMyProjects();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete project.");
    }
  };

  const getStatusColor = (status) => {
    if (status === "approved") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "rejected") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Projects</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Browse and submit Fab Lab projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          + Submit Project
        </button>
      </div>

      {/* Messages */}
      {message && <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{message}</div>}
      {error && <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["browse", "my-projects"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, backgroundColor: activeTab === tab ? "#1e40af" : "#f1f5f9", color: activeTab === tab ? "white" : "#64748b" }}>
            {tab === "browse" ? "Browse Projects" : "My Projects"}
          </button>
        ))}
      </div>

      {/* Browse Projects */}
      {activeTab === "browse" && (
        loading ? (
          <p style={{ color: "#64748b" }}>Loading projects...</p>
        ) : publicProjects.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No approved projects yet. Be the first to submit!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {publicProjects.map(project => (
              <div key={project.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                {project.file_url && (
                  <img src={project.file_url} alt={project.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                )}
                {!project.file_url && (
                  <div style={{ width: "100%", height: 120, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#94a3b8" }}>
                    No Image
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  {project.is_featured && (
                    <span style={{ fontSize: 11, background: "#fef9c3", color: "#ca8a04", padding: "2px 8px", borderRadius: 10, fontWeight: 700, marginBottom: 6, display: "inline-block" }}>
                      Featured
                    </span>
                  )}
                  <h4 style={{ margin: "6px 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{project.title}</h4>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{project.description?.substring(0, 100)}...</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>By: {project.user?.name}</p>
                  {project.video_url && (
                    <a href={project.video_url} target="_blank" rel="noreferrer"
                      style={{ display: "inline-block", marginTop: 10, padding: "6px 14px", background: "#1e40af", color: "white", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* My Projects */}
      {activeTab === "my-projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myProjects.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No projects submitted yet.</p>
          ) : (
            myProjects.map(project => (
              <div key={project.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{project.title}</h4>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: getStatusColor(project.status).bg, color: getStatusColor(project.status).color }}>
                      {project.status}
                    </span>
                    {project.is_featured && (
                      <span style={{ fontSize: 11, background: "#fef9c3", color: "#ca8a04", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>Featured</span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: "#64748b" }}>{project.description?.substring(0, 150)}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Category: {project.category} | Submitted: {new Date(project.created_at).toLocaleDateString()}</p>
                  {project.admin_note && (
                    <div style={{ marginTop: 8, background: "#eff6ff", borderRadius: 8, padding: "8px 12px" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>Admin Note: {project.admin_note}</p>
                    </div>
                  )}
                </div>
                {project.status === "pending" && (
                  <button
                    onClick={() => deleteProject(project.id)}
                    style={{ marginLeft: 16, padding: "6px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Submit Project Modal */}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Submit Project</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>x</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Project Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Video URL (YouTube/Vimeo)</label>
                <input type="url" name="video_url" value={form.video_url} onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Upload File/Image</label>
                <div
                  onClick={() => document.getElementById("projectFile").click()}
                  style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", background: "#f8fafc" }}
                >
                  {file ? (
                    <p style={{ margin: 0, fontSize: 14, color: "#1e40af", fontWeight: 600 }}>{file.name}</p>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Click to upload image or document</p>
                  )}
                </div>
                <input id="projectFile" type="file" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                  {submitting ? "Submitting..." : "Submit Project"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "12px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 