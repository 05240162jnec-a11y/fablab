import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Training() {
    const [scrolled, setScrolled] = useState(false);
    const [filter, setFilter] = useState('All');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    };

    const handleEnroll = (course) => {
        showToast(`Enrollment initiated for "${course.title}" — please login to complete.`);
    };

    const courses = [
        {
            id: 1,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00–16:00',
            seats: 2,
            status: 'Open',
            category: 'CNC',
            level: 'Beginner',
            icon: '⚙️',
        },
        {
            id: 2,
            title: '3D Printing Essentials',
            instructor: 'Ms. Pema Wangmo',
            description: 'Learn FDM and resin 3D printing from scratch — slicer settings, support structures, material selection, and post-processing techniques.',
            duration: '4 weeks',
            schedule: 'Mon & Wed, 10:00–12:00',
            seats: 5,
            status: 'Open',
            category: '3D Printing',
            level: 'Beginner',
            icon: '🖨️',
        },
        {
            id: 3,
            title: 'Laser Cutting & Engraving',
            instructor: 'Mr. Tshering Dorji',
            description: 'Hands-on training with the Trotec Speedy 100 and 400 — vector design, material settings, safety protocols, and project creation.',
            duration: '3 weeks',
            schedule: 'Fri, 09:00–12:00',
            seats: 0,
            status: 'Full',
            category: 'Laser',
            level: 'Intermediate',
            icon: '🔦',
        },
        {
            id: 4,
            title: 'PCB Design & Electronics',
            instructor: 'Mr. Kinley Namgyal',
            description: 'From schematic to physical board — KiCad design, PCB fabrication, component soldering, and programming with the Mechatronika machine.',
            duration: '5 weeks',
            schedule: 'Tue & Thu, 10:00–12:00',
            seats: 4,
            status: 'Open',
            category: 'Electronics',
            level: 'Intermediate',
            icon: '🔌',
        },
        {
            id: 5,
            title: 'Advanced CNC Milling',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'In-depth CNC techniques including multi-axis toolpaths, fixture design, surface finishing, and ShopBot CNC router operations.',
            duration: '8 weeks',
            schedule: 'Mon & Wed & Fri, 14:00–16:00',
            seats: 3,
            status: 'Open',
            category: 'CNC',
            level: 'Advanced',
            icon: '⚙️',
        },
        {
            id: 6,
            title: '3D Scanning & Reverse Engineering',
            instructor: 'Ms. Sonam Choki',
            description: 'Use the V-Scope 3D scanner for capturing real-world objects, cleaning point clouds, and converting scans to editable CAD models.',
            duration: '4 weeks',
            schedule: 'Thu, 14:00–17:00',
            seats: 6,
            status: 'Open',
            category: '3D Printing',
            level: 'Advanced',
            icon: '📡',
        },
    ];

    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
    const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
    const [levelFilter, setLevelFilter] = useState('All Levels');

    const filtered = courses.filter(c => {
        const matchCat = filter === 'All' || c.category === filter;
        const matchLevel = levelFilter === 'All Levels' || c.level === levelFilter;
        return matchCat && matchLevel;
    });

    const openCount = courses.filter(c => c.status === 'Open').length;
    const totalSeats = courses.reduce((s, c) => s + c.seats, 0);

    const levelColors = {
        Beginner: { bg: '#e0f2fe', color: '#0369a1' },
        Intermediate: { bg: '#fef3c7', color: '#92400e' },
        Advanced: { bg: '#fce7f3', color: '#9d174d' },
    };

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#0d1117', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

                :root {
                    --blue:    #0066FF;
                    --blue-dk: #0051cc;
                    --blue-lt: #e8f0fe;
                    --ink:     #0d1117;
                    --ink-2:   #1e2a3a;
                    --muted:   #64748b;
                    --border:  rgba(0,0,0,0.07);
                    --card-bg: #ffffff;
                    --offwhite:#f9fafb;
                    --radius:  1rem;
                    --radius-lg: 1.5rem;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* ── Nav ── */
                .nav-root { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; transition: all .35s ease; }
                .nav-root.scrolled { background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06); }
                .nav-root.top      { background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
                .nav-inner { max-width: 82rem; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 76px; }
                .nav-logo-wrap { display: flex; align-items: center; gap: .875rem; text-decoration: none; }
                .nav-logo-circle { width: 52px; height: 52px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(0,102,255,0.35); overflow: hidden; flex-shrink: 0; transition: transform .3s, box-shadow .3s; }
                .nav-logo-circle:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,102,255,0.45); }
                .nav-logo-circle img { width: 100%; height: 100%; object-fit: cover; }
                .nav-logo-circle .logo-letter { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.5rem; color: white; }
                .nav-brand-text .name { font-size: 1rem; font-weight: 700; color: var(--ink); display: block; line-height: 1.2; }
                .nav-brand-text .sub  { font-size: .65rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; display: block; }
                .nav-links { display: flex; gap: 1.75rem; align-items: center; }
                .nav-link { font-size: .875rem; font-weight: 500; color: var(--ink-2); text-decoration: none; position: relative; padding-bottom: 2px; transition: color .2s; }
                .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: var(--blue); border-radius: 2px; transition: width .25s; }
                .nav-link:hover { color: var(--blue); }
                .nav-link:hover::after { width: 100%; }
                .nav-link.active { color: var(--blue); font-weight: 600; }
                .nav-link.active::after { width: 100%; }
                .nav-login { padding: .5rem 1.4rem; font-size: .875rem; font-weight: 600; color: var(--blue); background: var(--blue-lt); border: 1.5px solid rgba(0,102,255,.2); border-radius: 9999px; text-decoration: none; transition: all .25s; }
                .nav-login:hover { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,102,255,.3); }

                /* ── Page Hero ── */
                .page-hero { padding-top: 76px; background: var(--ink); position: relative; overflow: hidden; }
                .page-hero-grid { position: absolute; inset: 0; z-index: 0; opacity: .04; background-image: linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size: 48px 48px; }
                .page-hero-glow  { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle,rgba(0,102,255,.2) 0%,transparent 70%); top: -200px; right: -100px; pointer-events: none; z-index: 1; }
                .page-hero-glow2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle,rgba(90,172,255,.1) 0%,transparent 70%); bottom: -100px; left: 5%; pointer-events: none; z-index: 1; }
                .page-hero-inner { max-width: 82rem; margin: 0 auto; padding: 5rem 2rem 4rem; position: relative; z-index: 2; display: grid; grid-template-columns: 1fr auto; gap: 4rem; align-items: center; }
                .page-eyebrow { display: inline-flex; align-items: center; gap: .5rem; padding: .3rem .9rem; border-radius: 9999px; background: rgba(0,102,255,.15); border: 1px solid rgba(0,102,255,.3); color: #5aacff; font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.25rem; }
                .page-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #5aacff; animation: pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.4; transform:scale(1.5); } }
                .page-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem,5vw,4rem); font-weight: 900; color: white; letter-spacing: -.03em; line-height: 1.05; margin-bottom: 1rem; }
                .page-title .accent { color: #5aacff; font-style: italic; }
                .page-subtitle { font-size: 1rem; color: rgba(255,255,255,.6); max-width: 480px; line-height: 1.75; margin-bottom: 2rem; }
                .page-hero-stats { display: flex; gap: 2.5rem; }
                .phero-stat-num   { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: white; display: block; line-height: 1; }
                .phero-stat-label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.45); letter-spacing: .1em; text-transform: uppercase; margin-top: .25rem; display: block; }

                /* Hero right card */
                .hero-info-card {
                    background: rgba(255,255,255,.06);
                    border: 1px solid rgba(255,255,255,.1);
                    border-radius: var(--radius-lg);
                    padding: 2rem 2.25rem;
                    backdrop-filter: blur(12px);
                    min-width: 300px;
                }
                .hero-info-card h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 800; color: white; margin-bottom: .5rem; }
                .hero-info-card p  { font-size: .85rem; color: rgba(255,255,255,.6); line-height: 1.7; margin-bottom: 1.25rem; }
                .btn-learn-more {
                    display: inline-block; padding: .65rem 1.5rem;
                    background: white; color: var(--ink);
                    font-weight: 700; font-size: .85rem;
                    border-radius: 9999px; text-decoration: none;
                    border: none; cursor: pointer; transition: all .25s;
                }
                .btn-learn-more:hover { background: var(--blue-lt); color: var(--blue); }

                /* ── Controls bar ── */
                .controls-bar { background: var(--card-bg); border-bottom: 1px solid var(--border); position: sticky; top: 76px; z-index: 50; box-shadow: 0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width: 82rem; margin: 0 auto; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
                .filter-pills { display: flex; gap: .5rem; flex-wrap: wrap; }
                .pill { padding: .4rem 1rem; border-radius: 9999px; font-size: .8rem; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--offwhite); color: var(--muted); transition: all .2s; }
                .pill:hover { border-color: var(--blue); color: var(--blue); }
                .pill.active { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 12px rgba(0,102,255,.25); }
                .controls-right { display: flex; align-items: center; gap: 1rem; }
                .sort-select { padding: .45rem .9rem; border-radius: 9999px; border: 1.5px solid var(--border); background: var(--offwhite); font-size: .8rem; font-weight: 600; color: var(--muted); outline: none; cursor: pointer; font-family: inherit; transition: border-color .2s; }
                .sort-select:focus { border-color: var(--blue); }
                .results-count { font-size: .8rem; color: var(--muted); font-weight: 500; white-space: nowrap; }

                /* ── Courses section ── */
                .courses-section { padding: 4.5rem 0 6rem; }
                .courses-container { max-width: 82rem; margin: 0 auto; padding: 0 2rem; }
                .section-label { display: inline-block; font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--blue); background: var(--blue-lt); padding: .25rem .75rem; border-radius: 9999px; margin-bottom: .65rem; }
                .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem,2.5vw,2rem); font-weight: 800; color: var(--ink); letter-spacing: -.02em; }
                .section-sub { font-size: .925rem; color: var(--muted); margin-top: .4rem; }
                .divider { width: 3rem; height: 3px; background: var(--blue); border-radius: 9999px; margin-top: .75rem; }

                /* ── Course grid ── */
                .courses-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.75rem; margin-top: 3rem; }

                /* ── Course card ── */
                .course-card {
                    background: var(--card-bg);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,.04);
                    overflow: hidden; position: relative;
                    display: flex; flex-direction: column;
                    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                }
                .course-card:hover { transform: translateY(-5px); box-shadow: 0 24px 48px rgba(0,0,0,.1); }
                .course-card.full { opacity: .7; }

                /* left colour accent */
                .course-card::before {
                    content: ''; position: absolute; top: 0; left: 0;
                    width: 4px; height: 100%;
                    background: linear-gradient(180deg, var(--blue), #4f7cff);
                    border-radius: 1rem 0 0 1rem;
                }

                .course-top {
                    padding: 1.75rem 2rem 0 2rem;
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 1.25rem;
                }
                .course-icon {
                    width: 3rem; height: 3rem; border-radius: .875rem;
                    background: var(--blue-lt); display: flex; align-items: center; justify-content: center;
                    font-size: 1.35rem; flex-shrink: 0;
                }
                .course-badges { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; justify-content: flex-end; }

                .badge-open {
                    display: inline-flex; align-items: center; gap: .35rem;
                    padding: .28rem .75rem; background: #dcfce7; color: #15803d;
                    font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
                    border-radius: 9999px;
                }
                .badge-open::before { content:''; width:6px; height:6px; border-radius:50%; background:#16a34a; animation: pulse 2s ease-in-out infinite; }
                .badge-full {
                    display: inline-flex; align-items: center; gap: .35rem;
                    padding: .28rem .75rem; background: #fee2e2; color: #991b1b;
                    font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
                    border-radius: 9999px;
                }
                .badge-level {
                    font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
                    padding: .25rem .65rem; border-radius: 9999px;
                }
                .badge-dur {
                    font-size: .75rem; font-weight: 600; color: var(--muted);
                    background: var(--offwhite); padding: .25rem .65rem; border-radius: .5rem;
                }

                .course-body { padding: 0 2rem 2rem; flex: 1; display: flex; flex-direction: column; }
                .course-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 800; color: var(--ink); margin-bottom: .25rem; letter-spacing: -.02em; line-height: 1.25; }
                .course-instructor { font-size: .85rem; color: var(--muted); margin-bottom: 1rem; font-style: italic; }
                .course-desc { font-size: .875rem; color: #4a5568; line-height: 1.7; margin-bottom: 1.5rem; flex: 1; }

                .course-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .65rem; margin-bottom: 1.75rem; }
                .meta-chip {
                    display: flex; align-items: center; gap: .45rem;
                    background: var(--offwhite); padding: .6rem .85rem;
                    border-radius: .75rem; font-size: .78rem; color: var(--muted); font-weight: 500;
                }
                .meta-chip svg { flex-shrink: 0; color: var(--blue); }
                .meta-chip.seats-low { background: #fef3c7; color: #92400e; }
                .meta-chip.seats-low svg { color: #d97706; }
                .meta-chip.seats-none { background: #fee2e2; color: #991b1b; }
                .meta-chip.seats-none svg { color: #ef4444; }

                .btn-enroll {
                    width: 100%; padding: .875rem;
                    background: var(--ink); color: white;
                    font-size: .9rem; font-weight: 700; letter-spacing: .02em;
                    border-radius: .75rem; border: none; cursor: pointer;
                    transition: all .25s;
                }
                .btn-enroll:hover:not(:disabled) { background: var(--blue); box-shadow: 0 8px 28px rgba(0,102,255,.4); transform: translateY(-1px); }
                .btn-enroll:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; }

                /* Divider between top and body */
                .card-divider { height: 1px; background: var(--border); margin: 0 2rem 1.5rem; }

                /* ── Empty state ── */
                .empty-state { text-align: center; padding: 5rem 0; color: var(--muted); }
                .empty-state svg { color: #cbd5e1; margin: 0 auto 1.25rem; display: block; }
                .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--ink); margin-bottom: .5rem; }

                /* ── Toast ── */
                .toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: var(--ink); color: white; padding: .75rem 1.75rem; border-radius: 9999px; font-size: .875rem; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,.3); z-index: 9999; display: flex; align-items: center; gap: .6rem; white-space: nowrap; animation: slideUp .3s ease; }
                @keyframes slideUp { from { opacity:0; transform:translate(-50%,16px); } to { opacity:1; transform:translate(-50%,0); } }
                .toast-dot { width: 8px; height: 8px; border-radius: 50%; background: #4af; flex-shrink: 0; }

                /* ── Footer ── */
                .footer { background: #080d14; padding: 5rem 0 0; }
                .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.4fr; gap: 3rem; padding-bottom: 3.5rem; }
                .footer-brand-logo { width: 56px; height: 56px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 1.25rem; box-shadow: 0 4px 18px rgba(0,102,255,.35); }
                .footer-brand-logo img { width: 100%; height: 100%; object-fit: cover; }
                .footer-brand-logo .logo-letter { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.6rem; color: white; }
                .footer-brand-name { font-size: 1.1rem; font-weight: 700; color: white; display: block; margin-bottom: .15rem; }
                .footer-brand-sub  { font-size: .68rem; font-weight: 500; color: #475569; letter-spacing: .1em; text-transform: uppercase; display: block; margin-bottom: 1rem; }
                .footer-about { font-size: .85rem; color: #64748b; line-height: 1.75; }
                .footer-col-title { font-size: .7rem; font-weight: 700; color: #cbd5e1; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.25rem; display: block; }
                .footer-link { display: block; font-size: .875rem; color: #64748b; text-decoration: none; padding: .3rem 0; transition: color .2s; }
                .footer-link:hover { color: white; }
                .footer-contact-item { display: flex; align-items: flex-start; gap: .75rem; margin-bottom: 1rem; }
                .footer-contact-item svg { flex-shrink: 0; margin-top: .15rem; }
                .footer-contact-text { font-size: .85rem; color: #64748b; line-height: 1.6; }
                .footer-bottom { border-top: 1px solid #1a2332; padding: 1.5rem 0; display: flex; justify-content: space-between; align-items: center; }
                .footer-copy { font-size: .78rem; color: #334155; }
                .footer-socials { display: flex; gap: .875rem; }
                .social-btn { width: 38px; height: 38px; border-radius: 50%; background: #0d1a2e; border: 1px solid #1e2d42; display: flex; align-items: center; justify-content: center; color: #64748b; text-decoration: none; transition: all .25s; }
                .social-btn:hover { background: var(--blue); border-color: var(--blue); color: white; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,102,255,.35); }
            `}</style>

            {/* ════════ NAV ════════ */}
            <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
                <div className="nav-inner">
                    <a href="/" className="nav-logo-wrap">
                        <div className="nav-logo-circle">
                            <img src="/images/logo.png" alt="JNEC Fab Lab"
                                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                            <span className="logo-letter" style={{ display: 'none' }}>J</span>
                        </div>
                        <div className="nav-brand-text">
                            <span className="name">JNEC Fab Lab</span>
                            <span className="sub">Fabrication Laboratory</span>
                        </div>
                    </a>
                    <div className="nav-links">
                        <a href="/" className="nav-link">Home</a>
                        <a href="/machines" className="nav-link">Machines</a>
                        <a href="/shop" className="nav-link">Shop</a>
                        <a href="/training" className="nav-link active">Training</a>
                        <a href="/projects" className="nav-link">Projects</a>
                        <a href="/about" className="nav-link">About</a>
                        <a href="/gallery" className="nav-link">Gallery</a>
                        <a href="/faq" className="nav-link">FAQ</a>
                        <Link to="/login" className="nav-login">Login</Link>
                    </div>
                </div>
            </nav>

            {/* ════════ PAGE HERO ════════ */}
            <div className="page-hero">
                <div className="page-hero-grid" />
                <div className="page-hero-glow" />
                <div className="page-hero-glow2" />
                <div className="page-hero-inner">
                    {/* Left */}
                    <div>
                        <div className="page-eyebrow">
                            <span className="page-eyebrow-dot" />
                            Skill Development
                        </div>
                        <h1 className="page-title">
                            Training <span className="accent">Courses</span>
                        </h1>
                        <p className="page-subtitle">
                            Build essential fabrication skills with hands-on training from experienced instructors — covering everything from 3D printing to electronics and CNC.
                        </p>
                        <div className="page-hero-stats">
                            {[
                                [courses.length, 'Courses'],
                                [openCount, 'Open Now'],
                                [totalSeats + '+', 'Seats Available'],
                                ['Free', 'For Members'],
                            ].map(([n, l]) => (
                                <div key={l}>
                                    <span className="phero-stat-num">{n}</span>
                                    <span className="phero-stat-label">{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — info card */}
                    <div className="hero-info-card">
                        <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>📋</div>
                        <h3>New to the Fab Lab?</h3>
                        <p>All first-time users must complete a mandatory safety orientation before enrolling in any course. Sessions are held every Monday at 9:00 AM in Lab A.</p>
                        <button className="btn-learn-more">Learn about orientation →</button>
                    </div>
                </div>
            </div>

            {/* ════════ CONTROLS ════════ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    <div className="filter-pills">
                        {categories.map(cat => (
                            <button key={cat} className={`pill ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="controls-right">
                        <span className="results-count">{filtered.length} course{filtered.length !== 1 ? 's' : ''}</span>
                        <select className="sort-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ════════ COURSES ════════ */}
            <section className="courses-section">
                <div className="courses-container">
                    <div>
                        <span className="section-label">Upcoming</span>
                        <h2 className="section-title">Available Courses</h2>
                        <p className="section-sub">Log in to enroll — seats are limited</p>
                        <div className="divider" />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No courses found</h3>
                            <p>Try a different category or level filter.</p>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {filtered.map(course => {
                                const lc = levelColors[course.level] || { bg: '#e8f0fe', color: '#0066FF' };
                                const isFull = course.status === 'Full';
                                const seatsClass = course.seats === 0 ? 'seats-none' : course.seats <= 3 ? 'seats-low' : '';
                                return (
                                    <div key={course.id} className={`course-card ${isFull ? 'full' : ''}`}>

                                        {/* Top row */}
                                        <div className="course-top">
                                            <div className="course-icon">{course.icon}</div>
                                            <div className="course-badges">
                                                {isFull
                                                    ? <span className="badge-full">Full</span>
                                                    : <span className="badge-open">Open</span>
                                                }
                                                <span className="badge-level" style={{ background: lc.bg, color: lc.color }}>{course.level}</span>
                                                <span className="badge-dur">{course.duration}</span>
                                            </div>
                                        </div>

                                        <div className="card-divider" />

                                        {/* Body */}
                                        <div className="course-body">
                                            <h3 className="course-title">{course.title}</h3>
                                            <p className="course-instructor">— {course.instructor}</p>
                                            <p className="course-desc">{course.description}</p>

                                            {/* Meta chips */}
                                            <div className="course-meta">
                                                {/* Duration */}
                                                <div className="meta-chip">
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {course.duration}
                                                </div>
                                                {/* Schedule */}
                                                <div className="meta-chip">
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {course.schedule}
                                                </div>
                                                {/* Seats */}
                                                <div className={`meta-chip ${seatsClass}`}>
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {isFull ? 'No seats left' : `${course.seats} seat${course.seats !== 1 ? 's' : ''} left`}
                                                </div>
                                            </div>

                                            <button
                                                className="btn-enroll"
                                                onClick={() => !isFull && handleEnroll(course)}
                                                disabled={isFull}
                                            >
                                                {isFull ? 'Course Full' : 'Enroll Now →'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ════════ TOAST ════════ */}
            {toast && (
                <div className="toast">
                    <span className="toast-dot" />
                    {toast}
                </div>
            )}

            {/* ════════ FOOTER ════════ */}
            <footer className="footer">
                <div style={{ maxWidth: '82rem', margin: '0 auto', padding: '0 2rem' }}>
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand-logo">
                                <img src="/images/logo.png" alt="JNEC Fab Lab"
                                    onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
                                <span className="logo-letter" style={{ display: 'none' }}>J</span>
                            </div>
                            <span className="footer-brand-name">JNEC Fab Lab</span>
                            <span className="footer-brand-sub">Fabrication Laboratory</span>
                            <p className="footer-about">The JNEC Fabrication Lab provides access to digital fabrication tools and hands-on training for students, faculty, and the wider community.</p>
                        </div>
                        <div>
                            <span className="footer-col-title">Quick Links</span>
                            {[['Machines', '/machines'], ['Training', '/training'], ['Projects', '/projects'], ['Gallery', '/gallery'], ['About Us', '/about'], ['FAQ', '/faq']].map(([l, h]) => (
                                <a key={l} href={h} className="footer-link">{l}</a>
                            ))}
                        </div>
                        <div>
                            <span className="footer-col-title">Support</span>
                            <a href="/faq" className="footer-link">FAQ</a>
                            <a href="/contact" className="footer-link">Contact Us</a>
                            <Link to="/login" className="footer-link">Login / Register</Link>
                        </div>
                        <div>
                            <span className="footer-col-title">Contact</span>
                            <div className="footer-contact-item">
                                <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="footer-contact-text">Fab Lab, JNEC Campus, Dewathang, Samdrupjongkhar, Bhutan.</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="footer-contact-text">fablab@jnec.ac.in</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="footer-contact-text">+975 77653429</span>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="footer-copy">© 2026 JNEC Fab Lab, Jigme Namgyel Engineering College. All rights reserved.</p>
                        <div className="footer-socials">
                            <a href="https://www.tiktok.com/@jnec_fablab" target="_blank" rel="noreferrer" className="social-btn" aria-label="TikTok">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                            </a>
                            <a href="https://www.facebook.com/share/18HY9mpzDF/" target="_blank" rel="noreferrer" className="social-btn" aria-label="Facebook">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="http://www.youtube.com/@JNECFabLab" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}