import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // get token and user from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");
    const error = params.get("error");

    if (error) {
      // if error redirect to login
      navigate("/login?error=google_auth_failed");
      return;
    }

    if (token && user) {
      // save token and user to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      localStorage.setItem("role", JSON.parse(user).role);
      // redirect to dashboard
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Segoe UI, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <p style={{ fontSize: 16, color: "#64748b" }}>
          Signing you in with Google...
        </p>
      </div>
    </div>
  );
}