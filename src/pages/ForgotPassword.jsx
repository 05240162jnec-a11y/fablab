import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    pin: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1 - Send PIN
  const handleSendPin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/forgot-password/send-pin", {
        email: form.email,
      });
      setSuccess("PIN sent to your email! Check your inbox.");
      setStep(2);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ["Email not found!"] });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - Verify PIN
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/forgot-password/verify-pin", {
        email: form.email,
        pin: form.pin,
      });
      setSuccess("PIN verified! Now set your new password.");
      setStep(3);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ["Something went wrong!"] });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3 - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/forgot-password/reset", {
        email: form.email,
        pin: form.pin,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ["Something went wrong!"] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <svg width="70" height="60" viewBox="0 0 80 70">
            <polygon points="40,5 75,65 5,65" fill="none" stroke="#e67e22" strokeWidth="3"/>
            <circle cx="25" cy="45" r="7" fill="none" stroke="#e67e22" strokeWidth="2"/>
            <circle cx="55" cy="45" r="5" fill="none" stroke="#2980b9" strokeWidth="2"/>
            <circle cx="40" cy="20" r="5" fill="none" stroke="#f39c12" strokeWidth="2"/>
            <line x1="25" y1="45" x2="55" y2="45" stroke="#2980b9" strokeWidth="2"/>
            <line x1="25" y1="45" x2="40" y2="20" stroke="#e67e22" strokeWidth="2"/>
            <line x1="55" y1="45" x2="40" y2="20" stroke="#f39c12" strokeWidth="2"/>
          </svg>
        </div>

        {/* Steps indicator */}
        <div style={styles.steps}>
          <div style={{...styles.step, ...(step >= 1 ? styles.stepActive : {})}}>1</div>
          <div style={styles.stepLine}></div>
          <div style={{...styles.step, ...(step >= 2 ? styles.stepActive : {})}}>2</div>
          <div style={styles.stepLine}></div>
          <div style={{...styles.step, ...(step >= 3 ? styles.stepActive : {})}}>3</div>
        </div>

        {/* Step titles */}
        {step === 1 && <h2 style={styles.title}>Forgot Password?</h2>}
        {step === 2 && <h2 style={styles.title}>Enter PIN</h2>}
        {step === 3 && <h2 style={styles.title}>New Password</h2>}

        {success && <p style={styles.successBox}>✅ {success}</p>}
        {errors.general && <p style={styles.errorBox}>{errors.general[0]}</p>}

        {/* Step 1 - Email */}
        {step === 1 && (
          <form onSubmit={handleSendPin} style={styles.form}>
            <p style={styles.subtitle}>
              Enter your email and we'll send you a PIN code.
            </p>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                placeholder="Enter your email"
                onChange={handleChange}
                style={styles.input}
              />
              {errors.email && <p style={styles.error}>{errors.email[0]}</p>}
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Sending PIN..." : "Send PIN"}
            </button>
          </form>
        )}

        {/* Step 2 - PIN */}
        {step === 2 && (
          <form onSubmit={handleVerifyPin} style={styles.form}>
            <p style={styles.subtitle}>
              Enter the 6-digit PIN sent to <strong>{form.email}</strong>
            </p>
            <div style={styles.field}>
              <label style={styles.label}>PIN Code</label>
              <input
                name="pin"
                type="text"
                value={form.pin}
                placeholder="Enter 6-digit PIN"
                onChange={handleChange}
                style={{...styles.input, ...styles.pinInput}}
                maxLength={6}
              />
              {errors.pin && <p style={styles.error}>{errors.pin[0]}</p>}
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Verifying..." : "Verify PIN"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={styles.backBtn}
            >
              ← Resend PIN
            </button>
          </form>
        )}

        {/* Step 3 - New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <p style={styles.subtitle}>Enter your new password.</p>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                placeholder="Min 8 characters"
                onChange={handleChange}
                style={styles.input}
              />
              {errors.password && <p style={styles.error}>{errors.password[0]}</p>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                placeholder="Confirm new password"
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p style={styles.loginText}>
          Remember password?{" "}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  logo: { textAlign: "center", marginBottom: "20px" },
  steps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "25px",
    gap: "5px",
  },
  step: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#e2e8f0",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
  },
  stepActive: {
    backgroundColor: "#e67e22",
    color: "white",
  },
  stepLine: {
    width: "50px",
    height: "2px",
    backgroundColor: "#e2e8f0",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 15px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
    margin: "0 0 20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 15px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  pinInput: {
    fontSize: "24px",
    textAlign: "center",
    letterSpacing: "10px",
    fontWeight: "700",
  },
  button: {
    padding: "13px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
  backBtn: {
    padding: "10px",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "10px",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "10px",
    textAlign: "center",
  },
  error: { color: "#dc2626", fontSize: "12px", margin: 0 },
  loginText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#64748b",
  },
  link: {
    color: "#e67e22",
    textDecoration: "none",
    fontWeight: "600",
  },
};