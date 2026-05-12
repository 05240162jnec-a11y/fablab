import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/register", form);
      setSuccess(res.data.message);
      setForm({ name: "", email: "", password: "", password_confirmation: "" });
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ["Something went wrong. Try again."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>

      {success && <p style={styles.success}>{success}</p>}
      {errors.general && <p style={styles.error}>{errors.general[0]}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.field}>
          <label>Name</label>
          <input name="name" value={form.name} placeholder="Enter your name" onChange={handleChange} style={styles.input} />
          {errors.name && <p style={styles.error}>{errors.name[0]}</p>}
        </div>

        <div style={styles.field}>
          <label>Email</label>
          <input name="email" value={form.email} placeholder="Enter your email" onChange={handleChange} style={styles.input} />
          {errors.email && <p style={styles.error}>{errors.email[0]}</p>}
        </div>

        <div style={styles.field}>
          <label>Password</label>
          <input name="password" type="password" value={form.password} placeholder="Enter password" onChange={handleChange} style={styles.input} />
          {errors.password && <p style={styles.error}>{errors.password[0]}</p>}
        </div>

        <div style={styles.field}>
          <label>Confirm Password</label>
          <input name="password_confirmation" type="password" value={form.password_confirmation} placeholder="Confirm password" onChange={handleChange} style={styles.input} />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", fontFamily: "Arial" },
  form:      { display: "flex", flexDirection: "column", gap: "15px" },
  field:     { display: "flex", flexDirection: "column", gap: "5px" },
  input:     { padding: "8px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" },
  button:    { padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  success:   { color: "green" },
  error:     { color: "red", fontSize: "12px" },
};