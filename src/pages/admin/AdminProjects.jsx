import { useState, useEffect } from "react";
import axios from "axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    video_url: "",
  });
  const [file, setFile] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("video_url", form.video_url);
      if (file) formData.append("file", file);

      await axios.post("http://127.0.0.1:8000/api/projects", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Project submitted successfully! Awaiting admin approval.");
      setShowForm(false);
      setForm({ title: "", description: "", category: "", video_url: "" });
      setFile(null);
      fetchProjects();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit project. Please try again.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Project deleted successfully!");
      fetchProjects();
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

  const categories = ["3D Printing", "Laser Cutting", "Electronics", "Woodworking", "Programming", "Design", "Robotics", "Other"];

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>My Projects</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Submit and track your Fab Lab projects</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          style={{ padding: "10px 20px", background: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          {showForm ? "✕ Cancel" : "+ Submit Project"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          ❌ {error}
        </div>
      )}

      {/* Submit Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 28 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Submit New Project</h3>
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Project Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Enter your project title"
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", background: "white" }}
              >
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your project, what you built, tools used, challenges faced..."
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            {/* Document Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                📄 Upload Document (PDF, DOC, DOCX, PPT, PPTX, ZIP — max 20MB)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                onChange={handleFileChange}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", boxSizing: "border-box", background: "#f8fafc" }}
              />
              {file && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                  ✅ Selected: {file.name}
                </p>
              )}
            </div>

            {/* Video URL */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                🎥 Video URL (YouTube, Google Drive, etc.)
              </label>
              <input
                name="video_url"
                value={form.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", padding: "12px", background: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}
            >
              {submitting ? "Submitting..." : "🚀 Submit Project"}
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 14, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>No projects yet</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Submit your first Fab Lab project using the button above!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {projects.map(project => (
            <div key={project.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>

              {/* Icon */}
              <div style={{ width: "100%", height: 90, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                📄
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    {project.category || "General"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: getStatusColor(project.status).bg, color: getStatusColor(project.status).color }}>
                    {project.status}
                  </span>
                </div>

                <h4 style={{ margin: "6px 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{project.title}</h4>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{project.description?.substring(0, 80)}...</p>

                {/* Document */}
                {project.file_path && (
                  <a
                    href={`http://127.0.0.1:8000/storage/${project.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", marginBottom: 8, marginRight: 8, padding: "4px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                  >
                    📄 View Document
                  </a>
                )}

                {/* Video */}
                {project.video_url && (
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", marginBottom: 8, padding: "4px 12px", background: "#dbeafe", color: "#1e40af", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                  >
                    🎥 Watch Video
                  </a>
                )}

                {/* Admin Note */}
                {project.admin_note && (
                  <div style={{ margin: "8px 0", padding: "8px 10px", background: "#f8fafc", borderRadius: 6, borderLeft: "3px solid #1e40af" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#374151", fontWeight: 600 }}>Admin Note:</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{project.admin_note}</p>
                  </div>
                )}

                {/* Featured */}
                {project.is_featured && (
                  <span style={{ display: "block", marginBottom: 8, fontSize: 11, background: "#fef9c3", color: "#ca8a04", padding: "2px 8px", borderRadius: 10, fontWeight: 700, width: "fit-content" }}>
                    ⭐ Featured
                  </span>
                )}

                {/* Delete button - only for pending */}
                {project.status === "pending" && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    style={{ width: "100%", marginTop: 8, padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
