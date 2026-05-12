import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jnecLogo from "../assets/jnec-logo.png";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", cid: "", gender: "", phone: "",
    account_type: "", email: "", password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (password.length === 0) setPasswordStrength("");
    else if (password.length < 6) setPasswordStrength("weak");
    else if (password.length >= 6 && password.length < 8 && hasNumber) setPasswordStrength("average");
    else if (password.length >= 8 && hasNumber && (hasSymbol || hasUpper)) setPasswordStrength("strong");
    else setPasswordStrength("average");
  };

  const validateEmail = (email, accountType) => {
    if (accountType === "student") return /^05\d{6}\.jnec@rub\.edu\.bt$/.test(email);
    else if (accountType === "staff") return /^[a-zA-Z]+\.jnec@rub\.edu\.bt$/.test(email);
    else return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.account_type) { setMessage("Please select an account type."); return; }
    if (!validateEmail(form.email, form.account_type)) {
      if (form.account_type === "student") setMessage("Student email must be: 05XXXXXX.jnec@rub.edu.bt");
      else if (form.account_type === "staff") setMessage("Staff email must be: yourname.jnec@rub.edu.bt");
      else setMessage("Please enter a valid email address.");
      return;
    }
    if (passwordStrength === "weak") { setMessage("Password is too weak. Use at least 6 characters with numbers."); return; }
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/register", form);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const strengthColor = passwordStrength === "strong" ? "#16a34a" : passwordStrength === "average" ? "#f59e0b" : "#dc2626";

  const inputStyle = {
    width: "100%", padding: "11px 14px", fontSize: 14,
    borderRadius: 8, border: "1.5px solid #e2e8f0",
    outline: "none", boxSizing: "border-box",
    color: "#374151", background: "white",
    fontFamily: "Segoe UI, sans-serif",
  };

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "#374151", marginBottom: 5,
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

      {/* Video Background */}
      <video autoPlay muted loop playsInline style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        objectFit: "cover", zIndex: 0,
      }}>
        <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        background: "rgba(0,0,0,0.55)", zIndex: 1,
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        backgroundColor: "rgba(255,255,255,0.97)",
        borderRadius: 24, padding: "32px 36px",
        width: "100%", maxWidth: 440,
        boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        margin: "20px",
        maxHeight: "92vh", overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            width: 72, height: 72, margin: "0 auto 12px",
            border: "1px solid #e2e8f0", borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
            <img src={jnecLogo} alt="JNEC Fab Lab"
              style={{ width: 54, height: 54, objectFit: "contain" }} />
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
            Create Account
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Join JNEC Fab Lab. Please fill in your details.
          </p>
        </div>

        {/* Error Message */}
        {message && (
          <div style={{
            padding: "10px 14px", background: "#fee2e2", color: "#dc2626",
            borderRadius: 8, marginBottom: 16, fontSize: 13,
            fontWeight: 600, textAlign: "center",
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Full Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text" name="name"
              placeholder="Enter your full name"
              onChange={handleChange} required
              style={inputStyle}
            />
          </div>

          {/* CID */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Citizenship ID (CID)</label>
            <input
              type="text" name="cid"
              placeholder="Enter your CID number"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Gender */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Gender</label>
            <select name="gender" onChange={handleChange}
              style={{ ...inputStyle, background: "white" }}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="text" name="phone"
              placeholder="Enter your phone number"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Account Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Account Type <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select name="account_type" onChange={handleChange} required
              style={{ ...inputStyle, background: "white" }}>
              <option value="">Select Account Type</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="external">External</option>
            </select>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Email <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="email" name="email"
              placeholder={
                form.account_type === "student" ? "05XXXXXX.jnec@rub.edu.bt"
                : form.account_type === "staff" ? "yourname.jnec@rub.edu.bt"
                : "Enter your email address"
              }
              onChange={handleChange} required
              style={inputStyle}
            />
            {form.account_type === "student" && (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>
                Format: 05XXXXXX.jnec@rub.edu.bt
              </p>
            )}
            {form.account_type === "staff" && (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>
                Format: yourname.jnec@rub.edu.bt
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>
              Password <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="password" name="password"
              placeholder="Create a strong password"
              onChange={handleChange} required
              style={inputStyle}
            />
          </div>

          {/* Password Strength */}
          {passwordStrength && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    height: 4, flex: 1, borderRadius: 4,
                    backgroundColor:
                      i === 1 ? strengthColor
                      : i === 2 && (passwordStrength === "average" || passwordStrength === "strong") ? strengthColor
                      : i === 3 && passwordStrength === "strong" ? strengthColor
                      : "#e2e8f0"
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: strengthColor, textAlign: "right", margin: 0 }}>
                {passwordStrength === "weak" && "Weak password"}
                {passwordStrength === "average" && "Average password"}
                {passwordStrength === "strong" && "Strong password ✓"}
              </p>
            </div>
          )}

          {/* Register Button */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 13,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "white", border: "none", borderRadius: 10,
            cursor: "pointer", fontSize: 15, fontWeight: 700,
            marginBottom: 14, marginTop: 8,
          }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Sign In Link */}
          <p style={{ textAlign: "center", margin: 0, fontSize: 13, color: "#64748b" }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "#f59e0b", fontWeight: 700, textDecoration: "none"
            }}>
              Sign In
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}