import { useState, useEffect } from "react";
import axios from "axios";

export default function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("available");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
    fetchMyEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses");
    }
    setLoading(false);
  };

  const fetchMyEnrollments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-enrollments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(res.data);
    } catch (err) {
      console.error("Failed to fetch enrollments");
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.course_id === courseId && e.status !== "cancelled");
  };

  const enroll = async (courseId) => {
    setError("");
    setMessage("");
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/course-enrollments",
        { course_id: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Enrolled successfully! You will receive details soon.");
      fetchMyEnrollments();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const cancelEnrollment = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to cancel this enrollment?")) return;
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/course-enrollments/${enrollmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Enrollment cancelled successfully.");
      fetchMyEnrollments();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to cancel enrollment.");
    }
  };

  const getStatusColor = (status) => {
    if (status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "cancelled") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#dbeafe", color: "#1e40af" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Course Registration</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Enroll in training courses to get your certification</p>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Training Info */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 14, color: "#1e40af", fontWeight: 600 }}>Why complete training?</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#3b82f6" }}>
          Completing a training course grants you a certificate that allows you to book machines like 3D Printers, Laser Cutters, and CNC Machines.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["available", "my-enrollments"].map(tab => (
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
            {tab === "available" ? "Available Courses" : "My Enrollments"}
          </button>
        ))}
      </div>

      {/* Available Courses */}
      {activeTab === "available" && (
        loading ? (
          <p style={{ color: "#64748b" }}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No courses available at the moment.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {courses.map(course => (
              <div key={course.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    Active
                  </span>
                  {course.grants_certificate && (
                    <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                      Certificate
                    </span>
                  )}
                </div>

                <h4 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{course.title}</h4>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{course.description}</p>

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                  <p style={{ margin: "4px 0" }}>Instructor: <strong>{course.instructor}</strong></p>
                  <p style={{ margin: "4px 0" }}>Location: {course.location}</p>
                  <p style={{ margin: "4px 0" }}>Schedule: {course.schedule}</p>
                  <p style={{ margin: "4px 0" }}>Duration: {course.duration_weeks} weeks</p>
                  <p style={{ margin: "4px 0" }}>Start Date: {new Date(course.start_date).toLocaleDateString()}</p>
                  <p style={{ margin: "4px 0", fontWeight: 600, color: course.seats_left > 0 ? "#16a34a" : "#dc2626" }}>
                    {course.seats_left > 0 ? `${course.seats_left} seats left` : "No seats available"}
                  </p>
                </div>

                {isEnrolled(course.id) ? (
                  <button
                    disabled
                    style={{ width: "100%", padding: "10px", backgroundColor: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 8, cursor: "not-allowed", fontSize: 13, fontWeight: 700 }}
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => enroll(course.id)}
                    disabled={course.seats_left <= 0}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: course.seats_left <= 0 ? "#94a3b8" : "#1e40af",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: course.seats_left <= 0 ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {course.seats_left <= 0 ? "Course Full" : "Enroll Now"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* My Enrollments */}
      {activeTab === "my-enrollments" && (
        enrollments.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>You have not enrolled in any courses yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {enrollments.map(enrollment => (
              <div key={enrollment.id} style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{enrollment.course?.title}</h4>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>Instructor: {enrollment.course?.instructor}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Enrolled on: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                  {enrollment.completed_at && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                      Completed on: {new Date(enrollment.completed_at).toLocaleDateString()}
                    </p>
                  )}
                  {enrollment.certificate_issued && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#16a34a", fontWeight: 700 }}>
                      Certificate Issued - You can now book machines!
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: getStatusColor(enrollment.status).bg, color: getStatusColor(enrollment.status).color }}>
                    {enrollment.status}
                  </span>
                  {enrollment.status === "enrolled" && (
                    <button
                      onClick={() => cancelEnrollment(enrollment.id)}
                      style={{ padding: "6px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}