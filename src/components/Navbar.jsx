export default function Navbar({ title }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "PS";

  return (
    <div style={styles.navbar}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.right}>
        <div style={styles.bell}>🔔</div>
        <div style={styles.avatar}>{initials}</div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: "60px",
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: { margin: 0, fontSize: "18px", fontWeight: "600", color: "#0f172a" },
  right: { display: "flex", alignItems: "center", gap: "15px" },
  bell: { fontSize: "20px", cursor: "pointer" },
  avatar: {
    width: "38px",
    height: "38px",
    backgroundColor: "#1e40af",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "13px",
  },
};