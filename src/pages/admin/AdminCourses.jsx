import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [completing, setCompleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    location: "",
    duration_weeks: "",
    schedule: "",
    max_seats: "",
    start_date: "",
    status: "active",
    grants_certificate: true,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses");
    }
    setLoading(false);
  };

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/enrollments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(res.data);
    } catch (err) {
      console.error("Failed to fetch enrollments");
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const openAddForm = () => {
    setEditCourse(null);
    setForm({ title: "", description: "", instructor: "", location: "", duration_weeks: "", schedule: "", max_seats: "", start_date: "", status: "active", grants_certificate: true });
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setEditCourse(course);
    setForm({
      title:              course.title,
      description:        course.description || "",
      instructor:         course.instructor,
      location:           course.location || "",
      duration_weeks:     course.duration_weeks,
      schedule:           course.schedule || "",
      max_seats:          course.max_seats,
      start_date:         course.start_date,
      status:             course.status,
      grants_certificate: course.grants_certificate,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await axios.put(
          `http://127.0.0.1:8000/api/admin/courses/${editCourse.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Course updated successfully");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/admin/courses",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Course added successfully");
      }
      setShowForm(false);
      fetchCourses();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to save course");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/courses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Course deleted successfully");
      fetchCourses();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to delete course");
    }
  };

  const openCompleteModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setAdminNote("");
    setShowCompleteModal(true);
  };

  const markCompleted = async () => {
    setCompleting(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/enrollments/${selectedEnrollment.id}/complete`,
        { admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Training marked as completed! Email sent to user and they can now book machines.");
      setShowCompleteModal(false);
      fetchEnrollments();
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage("Failed to mark as completed");
    }
    setCompleting(false);
  };

  const getStatusColor = (status) => {
    if (status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "cancelled") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#dbeafe", color: "#1e40af" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Course Management</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage training courses and verify student completions</p>
        </div>
        {activeTab === "courses" && (
          <button
            onClick={openAddForm}
            style={{ padding: "10px 20px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            + Add Course
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["courses", "enrollments"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: activeTab === tab ? "#1e40af" : "#f1f5f9",
              color: activeTab === tab ? "white" : "#64748b",
            }}
          >
            {tab === "courses" ? "Courses" : "Student Enrollments"}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        loading ? (
          <p style={{ color: "#64748b" }}>Loading courses...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {courses.map(course => (
              <div key={course.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    {course.status}
                  </span>
                  {course.grants_certificate && (
                    <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                      Certificate
                    </span>
                  )}
                </div>
                <h4 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{course.title}</h4>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{course.description?.substring(0, 80)}...</p>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  <p style={{ margin: "3px 0" }}>Instructor: {course.instructor}</p>
                  <p style={{ margin: "3px 0" }}>Location: {course.location}</p>
                  <p style={{ margin: "3px 0" }}>Schedule: {course.schedule}</p>
                  <p style={{ margin: "3px 0" }}>Duration: {course.duration_weeks} weeks</p>
                  <p style={{ margin: "3px 0", fontWeight: 600, color: course.seats_left > 0 ? "#16a34a" : "#dc2626" }}>
                    Seats: {course.enrolled_count}/{course.max_seats} ({course.seats_left} left)
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => openEditForm(course)}
                    style={{ flex: 1, padding: "6px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    style={{ flex: 1, padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>
                No courses yet. Click Add Course to get started!
              </div>
            )}
          </div>
        )
      )}

      {/* Enrollments Tab */}
      {activeTab === "enrollments" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Student</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Course</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Enrolled On</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Certificate</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment, i) => (
                <tr key={enrollment.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{enrollment.user?.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{enrollment.user?.email}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#0f172a" }}>{enrollment.course?.title}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>
                    {new Date(enrollment.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: getStatusColor(enrollment.status).bg, color: getStatusColor(enrollment.status).color }}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: enrollment.certificate_issued ? "#dcfce7" : "#f1f5f9", color: enrollment.certificate_issued ? "#16a34a" : "#64748b" }}>
                      {enrollment.certificate_issued ? "Issued" : "Not Issued"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {enrollment.status === "enrolled" && (
                      <button
                        onClick={() => openCompleteModal(enrollment)}
                        style={{ padding: "6px 14px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        Mark Completed
                      </button>
                    )}
                    {enrollment.status === "completed" && (
                      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>Training Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>No enrollments yet!</p>
          )}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editCourse ? "Edit Course" : "Add New Course"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>x</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Course Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Instructor</label>
                  <input type="text" name="instructor" value={form.instructor} onChange={handleChange} required
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Location</label>
                  <input type="text" name="location" value={form.location} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Duration (weeks)</label>
                  <input type="number" name="duration_weeks" value={form.duration_weeks} onChange={handleChange} required min="1"
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Max Seats</label>
                  <input type="number" name="max_seats" value={form.max_seats} onChange={handleChange} required min="1"
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Start Date</label>
                  <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Schedule</label>
                <input type="text" name="schedule" value={form.schedule} onChange={handleChange} placeholder="e.g. Mon & Wed, 10:00 - 11:30 AM"
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  <input type="checkbox" name="grants_certificate" checked={form.grants_certificate} onChange={handleChange} />
                  Grants Training Certificate (allows machine booking)
                </label>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit"
                  style={{ flex: 1, padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                  {editCourse ? "Update Course" : "Add Course"}
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

      {/* Mark Completed Modal */}
      {showCompleteModal && selectedEnrollment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Mark Training as Completed</h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
              Student: <strong>{selectedEnrollment.user?.name}</strong><br />
              Course: <strong>{selectedEnrollment.course?.title}</strong>
            </p>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#1e40af", fontWeight: 600 }}>This will:</p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
                <li>Mark the student as training completed</li>
                <li>Issue a certificate to the student</li>
                <li>Send a congratulations email to the student</li>
                <li>Allow the student to book machines</li>
              </ul>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Note to Student (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="e.g. Congratulations on completing the training! You are now certified to use all Fab Lab machines."
                rows={3}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={markCompleted}
                disabled={completing}
                style={{ flex: 1, padding: "12px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}
              >
                {completing ? "Processing..." : "Confirm Completion"}
              </button>
              <button
                onClick={() => setShowCompleteModal(false)}
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