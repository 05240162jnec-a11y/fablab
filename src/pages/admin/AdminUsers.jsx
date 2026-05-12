 
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
    setLoading(false);
  };

  const updateRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:8000/api/admin/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("User role updated successfully! ✅");
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update role ❌");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("User deleted successfully! ✅");
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to delete user ❌");
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role) => {
    if (role === "super_admin") return { bg: "#fee2e2", color: "#dc2626" };
    if (role === "admin") return { bg: "#dbeafe", color: "#1e40af" };
    if (role === "production_team") return { bg: "#d1fae5", color: "#065f46" };
    return { bg: "#f1f5f9", color: "#64748b" };
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>User Management</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage all registered users</p>
        </div>
        <div style={{ background: "#dbeafe", color: "#1e40af", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
          Total: {users.length} users
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 14,
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading users...</p>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Name</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Email</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Account Type</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Role</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Change Role</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#64748b" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: "#1e40af", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{user.email}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{user.account_type || "student"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, ...getRoleColor(user.role) }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", cursor: "pointer" }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="production_team">Production Team</option>
                    </select>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => deleteUser(user.id)}
                      style={{ padding: "6px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>No users found!</p>
          )}
        </div>
      )}
    </div>
  );
}