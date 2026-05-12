import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    my_bookings: 0,
    active_courses: 0,
    machines_available: 0,
    product_orders: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [productOrders, setProductOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchDashboardData();

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const bookingsRes = await axios.get("http://127.0.0.1:8000/api/my-machine-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const enrollmentsRes = await axios.get("http://127.0.0.1:8000/api/my-enrollments", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const machinesRes = await axios.get("http://127.0.0.1:8000/api/machines");

      const productOrdersRes = await axios.get("http://127.0.0.1:8000/api/product-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const bookings = bookingsRes.data;
      const enrollments = enrollmentsRes.data;
      const machines = machinesRes.data;
      const orders = productOrdersRes.data;

      setStats({
        my_bookings:        bookings.length,
        active_courses:     enrollments.filter(e => e.status === "enrolled").length,
        machines_available: machines.filter(m => m.status === "available").length,
        product_orders:     orders.length,
      });

      setRecentBookings(bookings.slice(0, 3));
      setMyCourses(enrollments.slice(0, 2));
      setProductOrders(orders.slice(0, 3));

    } catch (err) {
      console.error("Failed to fetch dashboard data");
    }
    setLoading(false);
  };

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getStatusStyle = (status) => {
    if (status === "approved" || status === "enrolled" || status === "completed") {
      return { background: "#dcfce7", color: "#16a34a" };
    }
    if (status === "pending") {
      return { background: "#fef9c3", color: "#ca8a04" };
    }
    return { background: "#fee2e2", color: "#dc2626" };
  };

  const statCards = [
    { label: "My Bookings", value: stats.my_bookings, color: "#3b82f6", bg: "#eff6ff", path: "/my-bookings", icon: "📅" },
    { label: "Active Courses", value: stats.active_courses, color: "#10b981", bg: "#ecfdf5", path: "/course-registration", icon: "📚" },
    { label: "Machines Available", value: stats.machines_available, color: "#8b5cf6", bg: "#f5f3ff", path: "/book-machine", icon: "🖥️" },
    { label: "Product Orders", value: stats.product_orders, color: "#f59e0b", bg: "#fffbeb", path: "/book-product", icon: "📦" },
  ];

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* GREETING BANNER */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 28,
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 14, opacity: 0.8 }}>
            {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>
            {greeting()}, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
            Welcome to JNEC Fab Lab Student Portal
          </p>
          {user?.is_trained && (
            <span style={{ display: "inline-block", marginTop: 8, background: "#16a34a", color: "white", fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
              Certified User
            </span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
            {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student"} Account
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div
            key={i}
            onClick={() => navigate(s.path)}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "20px 22px",
              cursor: "pointer",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 500 }}>{s.label}</p>
                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: s.color }}>
                  {loading ? "..." : s.value}
                </h2>
              </div>
              <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {s.icon}
              </div>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12, color: s.color, fontWeight: 600 }}>View all</p>
          </div>
        ))}
      </div>

      {/* Training Status */}
      {!user?.is_trained && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#92400e" }}>Training Required</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#92400e" }}>Complete a training course to unlock machine booking.</p>
          </div>
          <button
            onClick={() => navigate("/course-registration")}
            style={{ padding: "8px 18px", background: "#f59e0b", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
          >
            Enroll Now
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>

        {/* RECENT MACHINE BOOKINGS */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Recent Machine Bookings</h3>
            <span onClick={() => navigate("/my-bookings")} style={{ fontSize: 12, color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>View All</span>
          </div>
          {loading ? (
            <p style={{ color: "#64748b", fontSize: 14 }}>Loading...</p>
          ) : recentBookings.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No machine bookings yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentBookings.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{b.machine?.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{b.booking_date} | {b.start_time} - {b.end_time}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, ...getStatusStyle(b.status) }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate("/book-machine")}
            style={{ width: "100%", marginTop: 16, padding: "10px", background: "#1e40af", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Book New Machine
          </button>
        </div>

        {/* MY COURSES */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>My Courses</h3>
            <span onClick={() => navigate("/course-registration")} style={{ fontSize: 12, color: "#10b981", cursor: "pointer", fontWeight: 600 }}>View All</span>
          </div>
          {loading ? (
            <p style={{ color: "#64748b", fontSize: 14 }}>Loading...</p>
          ) : myCourses.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No courses enrolled yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myCourses.map((e, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{e.course?.title}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, ...getStatusStyle(e.status) }}>
                      {e.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Instructor: {e.course?.instructor}</p>
                  {e.certificate_issued && (
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#16a34a", fontWeight: 700 }}>Certificate Issued</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate("/course-registration")}
            style={{ width: "100%", marginTop: 16, padding: "10px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Enroll in Course
          </button>
        </div>
      </div>

      {/* PRODUCT ORDERS */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Recent Product Orders</h3>
          <span onClick={() => navigate("/book-product")} style={{ fontSize: 12, color: "#f59e0b", cursor: "pointer", fontWeight: 600 }}>View All</span>
        </div>
        {loading ? (
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading...</p>
        ) : productOrders.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No product orders yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {productOrders.map((order, i) => (
              <div key={i} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{order.product_name}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, ...getStatusStyle(order.status) }}>
                    {order.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Qty: {order.quantity}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>Nu. {order.total_price}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate("/book-product")}
          style={{ width: "100%", marginTop: 16, padding: "10px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Order Products
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Book Machine", color: "#3b82f6", path: "/book-machine" },
            { label: "Book Product", color: "#10b981", path: "/book-product" },
            { label: "Custom Order", color: "#f59e0b", path: "/custom-order" },
            { label: "Enroll Course", color: "#8b5cf6", path: "/course-registration" },
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => navigate(q.path)}
              style={{
                padding: "16px 12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}