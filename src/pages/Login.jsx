import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jnecLogo from "../assets/jnec-logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // if already logged in redirect based on role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "admin" || role === "super_admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role || res.data.user.account_type);// redirect based on role
      const userRole = res.data.user.role;
      if (userRole === "admin" || userRole === "super_admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "production_team") {
        navigate("/production/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ["Invalid email or password!"] });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/api/auth/google";
  };

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Segoe UI, Arial, sans-serif",
      overflow: "hidden",
    }}>

      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.55)",
        zIndex: 1,
      }} />

      {/* LOGIN CARD */}
      <div style={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "rgba(255,255,255,0.97)",
        borderRadius: "24px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={jnecLogo}
            alt="JNEC Fab Lab Logo"
            style={{ height: 80, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Title */}
        <h1 style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
          Sign In
        </h1>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>
          Welcome Back, Please enter your details.
        </p>

        {/* Error message */}
        {errors.general && (
          <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "12px 15px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {errors.general[0]}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              placeholder="Enter your email"
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                fontSize: 14,
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errors.email && <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}>{errors.email[0]}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              placeholder="Enter your password"
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                fontSize: 14,
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errors.password && <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}>{errors.password[0]}</p>}
          </div>

          {/* Forgot Password and Remember Me */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Link to="/forgot-password" style={{ color: "#e67e22", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
              Forgot Password?
            </Link>
            <label style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" style={{ marginRight: 5 }} />
              Remember Me
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              backgroundColor: "#e67e22",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0" }} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0" }} />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              padding: 12,
              backgroundColor: "white",
              color: "#374151",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

        </form>

        {/* Register Link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#e67e22", textDecoration: "none", fontWeight: 600 }}>
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}