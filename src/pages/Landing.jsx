import logo from "../assets/jnec-logo.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = () => localStorage.getItem("token") !== null;

 const handleLogin = () => {
  navigate("/login");
};

const handleRegister = () => {
  navigate("/register");
};

  const handleEnroll = () => {
    if (isLoggedIn()) {
      navigate("/course-registration");
    } else {
      navigate("/login");
    }
  };

  const handleNavClick = (link) => {
    if (link === "Home") navigate("/");
    else if (link === "Machines") navigate("/book-machine");
    else if (link === "Training") navigate("/course-registration");
    else if (link === "Projects") navigate("/dashboard");
    else if (link === "About Us") navigate("/");
    else if (link === "Gallery") navigate("/");
    else if (link === "Shop now") navigate("/");
    else if (link === "FAQ") navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const machines = [
    { title: "3D Printers", date: "Aug 3, 2024", desc: "Ultimaker S5 & Prusa i3 MK3S+ for rapid prototyping with PLA, ABS, and PETG Filament...", icon: "🖨️", bg: "#e8f4f8" },
    { title: "Biomaterials in Manufacturing", date: "Aug 2, 2024", desc: "The goal of this project is to create a recipe using the most ubiquitous biowastes in the lab...", icon: "🧬", bg: "#e8f8f0" },
    { title: "Plastic Waste to Filaments", date: "Aug 2, 2024", desc: "The goal of this project is to design a machine that will process plastic waste material...", icon: "♻️", bg: "#fff8e8" },
  ];

  const courses = [
    { title: "CNC Machining Fundamentals", instructor: "Mr. Dorji", location: "Gyetshen", weeks: 6, days: "Tue & Thu, 14:00-15:30", seats: 8 },
    { title: "3D Printing Basics", instructor: "Ms. Pema", location: "Lab A", weeks: 4, days: "Mon & Wed, 10:00-11:30", seats: 5 },
    { title: "Laser Cutting Workshop", instructor: "Mr. Tshering", location: "Lab B", weeks: 3, days: "Fri, 14:00-17:00", seats: 10 },
    { title: "Electronics & Arduino", instructor: "Mr. Karma", location: "Lab C", weeks: 5, days: "Tue & Thu, 10:00-11:30", seats: 6 },
  ];

  const announcements = [
    { title: "Fab Lab Extended Hours During Project Season", desc: "The Fab Lab will operate from 8:00 AM to 8:00 PM starting next week to support end-of-semester projects." },
    { title: "New Laser Cutter Installed", desc: "A new Trotec Speedy 100 has been installed in Lab B. Training sessions will be scheduled soon." },
    { title: "Safety Orientation - Every Monday", desc: "Mandatory safety orientation sessions are held every Monday at 9:00 AM in Lab A for first-time users." },
  ];

  const services = [
    { title: "Custom Prototyping", desc: "Bring your ideas to life with our cutting-edge prototyping services.", icon: "🔧" },
    { title: "Workshops", desc: "Unlock your potential with our hands-on workshops and expert-led training sessions.", icon: "🎓" },
    { title: "Collaborative Projects", desc: "Join a community of innovators and creators working on exciting projects.", icon: "🤝" },
  ];

  const navLinks = ["Home", "Machines", "Shop now", "Training", "Projects", "About Us", "Gallery", "FAQ"];
  const quickLinks = ["Machines", "Training", "Projects", "Gallery", "About", "FAQ"];
  const supportLinks = ["FAQ", "Contact Us", "Login/Register"];

  return (
    <div style={{ fontFamily: "Georgia, serif", width: "100%", minHeight: "100vh", overflowX: "hidden", color: "#222" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Sans+3:wght@300;400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; }
        .hero-text { animation: fadeInUp 1.2s ease forwards; }
        .hero-subtitle { animation: fadeInUp 1.2s ease 0.3s forwards; opacity: 0; }
        .hero-btn { animation: fadeInUp 1.2s ease 0.6s forwards; opacity: 0; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .machine-card { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
        .machine-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
        .course-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .course-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .nav-link { transition: color 0.2s ease; }
        .nav-link:hover { color: #c8a96e !important; }
        .enroll-btn { transition: background 0.2s ease; }
        .enroll-btn:hover { background: #2d3a6b !important; }
        .login-btn { transition: all 0.2s ease; }
        .login-btn:hover { background: #1a1a2e !important; color: #fff !important; border-color: #1a1a2e !important; }
        .register-btn { transition: all 0.2s ease; }
        .register-btn:hover { background: #17a36e !important; transform: scale(1.04); }
        .footer-link { transition: color 0.2s ease; }
        .footer-link:hover { color: #c8a96e !important; }
        .signin-btn { transition: all 0.2s ease; }
        .signin-btn:hover { background: rgba(255,255,255,0.15) !important; }
        @media (max-width: 1024px) {
          .machines-grid { grid-template-columns: 1fr 1fr !important; }
          .courses-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .machines-grid { grid-template-columns: 1fr !important; }
          .courses-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .section-padding { padding: 40px 24px !important; }
          .nav-links { display: none !important; }
          .hero-title { font-size: 32px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "10px 48px" : "18px 48px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid #eee" : "none",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.4s ease",
      }}>
       <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
  <img
    src={logo}
    alt="JNEC Fab Lab Logo"
    style={{
      height: 45,
      width: "auto",
      objectFit: "contain",
      filter: "none",
    }}
  />
</div>

        <div className="nav-links" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {navLinks.map((link) => (
            <span
              key={link}
              className="nav-link"
              onClick={() => handleNavClick(link)}
              style={{
                fontSize: 14,
                color: scrolled ? (link === "Home" ? "#1a1a2e" : "#555") : "#fff",
                cursor: "pointer",
                fontWeight: link === "Home" ? 700 : 400,
                fontFamily: "Source Sans 3, sans-serif",
                letterSpacing: 0.3,
              }}
            >
              {link}
            </span>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        width: "100%",
        height: "70vh",
        minHeight: 480,
        maxHeight: 700,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url(https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1920&h=1080&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }} />
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(10,20,50,0.88) 0%, rgba(10,30,60,0.78) 50%, rgba(0,0,0,0.68) 100%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #c8a96e, transparent)",
        }} />
        <div style={{ position: "relative", textAlign: "center", color: "#fff", padding: "0 24px", maxWidth: 860, width: "100%" }}>
          <div className="hero-text" style={{
            fontSize: 12,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#c8a96e",
            marginBottom: 16,
            fontFamily: "Source Sans 3, sans-serif",
            fontWeight: 600,
          }}>
            Jigme Namgyel Engineering College
          </div>
          <h1 className="hero-text hero-title" style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            fontWeight: 900,
            margin: "0 0 16px",
            fontFamily: "Playfair Display, Georgia, serif",
            lineHeight: 1.15,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            letterSpacing: -1,
          }}>
            Welcome to JNEC
            <br />
            <span style={{ color: "#c8a96e" }}>Fab Lab</span>
          </h1>
          <p className="hero-subtitle" style={{
            fontSize: "clamp(13px, 1.8vw, 17px)",
            margin: "0 auto 32px",
            fontFamily: "Source Sans 3, sans-serif",
            fontWeight: 300,
            lineHeight: 1.8,
            maxWidth: 580,
            opacity: 0.88,
          }}>
            A state-of-the-art digital fabrication laboratory — empowering students, faculty, and the community to innovate, create, and build.
          </p>
          <div className="hero-btn" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="register-btn"
              onClick={handleRegister}
              style={{
                padding: "13px 38px",
                background: "#1db87e",
                border: "none",
                borderRadius: 4,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Source Sans 3, sans-serif",
                letterSpacing: 0.5,
              }}
            >
              Register Now
            </button>
            <button
              className="signin-btn"
              onClick={handleLogin}
              style={{
                padding: "13px 38px",
                background: "transparent",
                border: "2px solid rgba(255,255,255,0.7)",
                borderRadius: 4,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Source Sans 3, sans-serif",
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="stats-grid" style={{
        background: "#1a1a2e",
        padding: "28px 60px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 20,
        textAlign: "center",
        width: "100%",
      }}>
        {[
          { number: "20+", label: "Machines Available" },
          { number: "500+", label: "Students Trained" },
          { number: "15+", label: "Active Courses" },
          { number: "100+", label: "Projects Completed" },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#c8a96e", fontFamily: "Playfair Display, serif" }}>
              {s.number}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "Source Sans 3, sans-serif", letterSpacing: 0.5, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* OUR MACHINES */}
      <div className="section-padding" style={{ padding: "70px 60px 50px", background: "#fff", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#c8a96e", marginBottom: 8, fontFamily: "Source Sans 3, sans-serif", fontWeight: 600 }}>
              EQUIPMENT
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0, fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>
              Our Machines
            </h2>
            <p style={{ margin: "8px 0 0", color: "#888", fontSize: 14, fontFamily: "Source Sans 3, sans-serif" }}>
              State-of-the-art equipment for digital fabrication
            </p>
          </div>
          <button
            onClick={() => handleNavClick("Machines")}
            style={{ fontSize: 13, border: "1px solid #ddd", borderRadius: 20, padding: "7px 18px", background: "#fff", cursor: "pointer", fontFamily: "Source Sans 3, sans-serif", color: "#555" }}
          >
            View All
          </button>
        </div>
        <div className="machines-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 26 }}>
          {machines.map((m, i) => (
            <div key={i} className="machine-card" style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ height: 190, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: 52 }}>{m.icon}</span>
                <span style={{ position: "absolute", bottom: 10, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, padding: "3px 9px", borderRadius: 3, fontFamily: "Source Sans 3, sans-serif" }}>
                  {m.date}
                </span>
              </div>
              <div style={{ padding: "18px 20px 22px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 14px", lineHeight: 1.7, fontFamily: "Source Sans 3, sans-serif" }}>{m.desc}</p>
                <span style={{ color: "#1db87e", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Source Sans 3, sans-serif" }}>Read More</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRAINING COURSES */}
      <div className="section-padding" style={{ padding: "50px 60px", background: "#f8f7f4", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#c8a96e", marginBottom: 8, fontFamily: "Source Sans 3, sans-serif", fontWeight: 600 }}>
              LEARN
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>
              Upcoming Training Courses
            </h2>
            <p style={{ margin: "8px 0 0", color: "#888", fontSize: 14, fontFamily: "Source Sans 3, sans-serif" }}>
              Hands-on training from experienced instructors
            </p>
          </div>
          <button
            onClick={() => handleNavClick("Training")}
            style={{ fontSize: 13, border: "1px solid #ddd", borderRadius: 20, padding: "7px 18px", background: "#fff", cursor: "pointer", fontFamily: "Source Sans 3, sans-serif", color: "#555" }}
          >
            View All
          </button>
        </div>
        <div className="courses-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          {courses.map((c, i) => (
            <div key={i} className="course-card" style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 9, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, background: "#e8f5e9", color: "#2e7d32", padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontFamily: "Source Sans 3, sans-serif", display: "inline-block", width: "fit-content" }}>
                Active
              </span>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3, fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>{c.title}</h3>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#333", fontFamily: "Source Sans 3, sans-serif" }}>{c.instructor}</div>
                <div style={{ fontSize: 11, color: "#888", fontFamily: "Source Sans 3, sans-serif" }}>{c.location}</div>
              </div>
              <p style={{ fontSize: 12, color: "#666", margin: 0, lineHeight: 1.6, fontFamily: "Source Sans 3, sans-serif" }}>
                Comprehensive course on hands-on machining projects with various materials and tools.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#666", fontFamily: "Source Sans 3, sans-serif" }}>
                <div>{c.weeks} weeks</div>
                <div>{c.days}</div>
                <div>{c.seats} seats left</div>
              </div>
              <button
                className="enroll-btn"
                onClick={handleEnroll}
                style={{ marginTop: 4, padding: "10px 0", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "Source Sans 3, sans-serif" }}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      <div className="section-padding" style={{ padding: "60px 60px 30px", background: "#fff", width: "100%" }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#c8a96e", marginBottom: 8, fontFamily: "Source Sans 3, sans-serif", fontWeight: 600 }}>
            NEWS
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 6px", fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>
            Latest Announcements
          </h2>
          <p style={{ margin: "0 0 24px", color: "#888", fontSize: 14, fontFamily: "Source Sans 3, sans-serif" }}>
            Stay updated with Fab Lab news
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {announcements.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", border: "1px solid #eee", borderRadius: 10, padding: "18px 22px", background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 42, height: 42, minWidth: 42, background: "#fdf6ec", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1px solid #f0e0c0" }}>
                  🔔
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 700, fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>{a.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.7, fontFamily: "Source Sans 3, sans-serif" }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <div className="section-padding" style={{ padding: "40px 60px 70px", background: "#fff", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#c8a96e", marginBottom: 8, fontFamily: "Source Sans 3, sans-serif", fontWeight: 600 }}>
            WHAT WE OFFER
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>
            Our <span style={{ color: "#1db87e" }}>Services</span>
          </h2>
        </div>
        <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 36, maxWidth: 900, margin: "0 auto" }}>
          {services.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, background: i === 0 ? "#e8f4f8" : i === 1 ? "#e8f8f0" : "#fff8e8", borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", fontFamily: "Playfair Display, serif", color: "#1a1a2e" }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.8, fontFamily: "Source Sans 3, sans-serif" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#1a1a2e", padding: "70px 60px", textAlign: "center", color: "#fff", width: "100%", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #c8a96e, transparent)" }} />
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#c8a96e", marginBottom: 14, fontFamily: "Source Sans 3, sans-serif", fontWeight: 600 }}>
          GET STARTED
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 14px", fontFamily: "Playfair Display, serif" }}>
          Ready to start making?
        </h2>
        <p style={{ fontSize: 15, margin: "0 auto 32px", opacity: 0.75, maxWidth: 480, fontFamily: "Source Sans 3, sans-serif", lineHeight: 1.8 }}>
          Sign up for an account to book machines, enroll in courses, submit projects, and place custom fabrication orders.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleRegister}
            style={{ padding: "13px 36px", background: "#c8a96e", color: "#1a1a2e", border: "none", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Source Sans 3, sans-serif", letterSpacing: 0.5 }}
          >
            Get Started
          </button>
          <button
            style={{ padding: "13px 36px", background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Source Sans 3, sans-serif" }}
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#111827", padding: "50px 60px 22px", width: "100%" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.4fr", gap: 40, marginBottom: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer" }} onClick={() => navigate("/")}>
  <img
    src={logo}
    alt="JNEC Fab Lab Logo"
    style={{ height: 40, width: "auto", objectFit: "contain" }}
  />
  <div>
    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Playfair Display, serif" }}>JNEC Fab Lab</div>
    <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>Fabrication Laboratory</div>
  </div>
</div>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8, maxWidth: 230, fontFamily: "Source Sans 3, sans-serif" }}>
              The JNEC Fabrication Lab provides access to digital fabrication tools and training for students, faculty, and the community.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: 12, margin: "0 0 14px", color: "#fff", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Source Sans 3, sans-serif" }}>
              Quick Links
            </h4>
            {quickLinks.map((l) => (
              <div key={l} style={{ marginBottom: 9 }}>
                <span className="footer-link" onClick={() => handleNavClick(l)} style={{ fontSize: 13, color: "#666", cursor: "pointer", fontFamily: "Source Sans 3, sans-serif" }}>
                  {l}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: 12, margin: "0 0 14px", color: "#fff", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Source Sans 3, sans-serif" }}>
              Support
            </h4>
            {supportLinks.map((l) => (
              <div key={l} style={{ marginBottom: 9 }}>
                <span
                  className="footer-link"
                  onClick={() => { if (l === "Login/Register") navigate("/login"); else navigate("/"); }}
                  style={{ fontSize: 13, color: "#666", cursor: "pointer", fontFamily: "Source Sans 3, sans-serif" }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: 12, margin: "0 0 14px", color: "#fff", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Source Sans 3, sans-serif" }}>
              Contact
            </h4>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.9, margin: "0 0 4px", fontFamily: "Source Sans 3, sans-serif" }}>
              Fab Lab, JNEC Campus
            </p>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.9, margin: "0 0 10px", fontFamily: "Source Sans 3, sans-serif" }}>
              Dewathang, Samdrupjongkhar
            </p>
            <p style={{ fontSize: 13, margin: "0 0 8px" }}>
              <a href="mailto:fablab@jnec.ac.in" style={{ color: "#c8a96e", textDecoration: "none", fontFamily: "Source Sans 3, sans-serif" }}>
                fablab@jnec.ac.in
              </a>
            </p>
            <p style={{ fontSize: 13, color: "#666", margin: 0, fontFamily: "Source Sans 3, sans-serif" }}>
              +975 77602429
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1f2937", paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#444", fontFamily: "Source Sans 3, sans-serif" }}>
            2026, JNEC Fab Lab, Jigme Namgyel Engineering College. All rights reserved
          </p>
          <div style={{ display: "flex", gap: 14, fontSize: 18 }}>
            <span style={{ cursor: "pointer" }}>📷</span>
            <span style={{ cursor: "pointer" }}>💼</span>
            <span style={{ cursor: "pointer" }}>▶</span>
          </div>
        </div>
      </div>

    </div>
  );
}