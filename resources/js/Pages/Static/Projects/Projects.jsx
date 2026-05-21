import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Projects() {
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActive] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Data ── */
    const categories = [
        {
            name: 'PCB Fabrication',
            icon: '🔌',
            color: '#e0f2fe',
            accent: '#0369a1',
            projects: [
                { id: 1, title: 'Prusa FDM 3D Printer', author: 'Sonam Wangchuk', year: '2024', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 2, title: 'Zund G3 Cutting Machine', author: 'Pema Dorji', year: '2024', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 3, title: 'Prusa FDM 3D Printer V2', author: 'Kinley Tshering', year: '2023', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 4, title: 'Zund G3 Cutting Mk II', author: 'Tenzin Lhamo', year: '2023', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
        {
            name: 'CNC Shopbot',
            icon: '⚙️',
            color: '#fef3c7',
            accent: '#92400e',
            projects: [
                { id: 5, title: 'Prusa FDM 3D Printer', author: 'Dorji Namgyal', year: '2024', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 6, title: 'Zund G3 Cutting Machine', author: 'Cheki Wangmo', year: '2024', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 7, title: 'Prusa FDM 3D Printer V2', author: 'Ugyen Phuntsho', year: '2023', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 8, title: 'Zund G3 Cutting Mk II', author: 'Sangay Dema', year: '2023', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
        {
            name: 'Embedded Programming: Arduino',
            icon: '💡',
            color: '#dcfce7',
            accent: '#065f46',
            projects: [
                { id: 9, title: 'Prusa FDM 3D Printer', author: 'Namgay Zangpo', year: '2024', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 10, title: 'Zund G3 Cutting Machine', author: 'Dawa Choki', year: '2024', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 11, title: 'Prusa FDM 3D Printer V2', author: 'Tshering Nidup', year: '2023', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 12, title: 'Zund G3 Cutting Mk II', author: 'Karma Yangzom', year: '2023', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
        {
            name: '3D Shopbot',
            icon: '🖨️',
            color: '#fce7f3',
            accent: '#9d174d',
            projects: [
                { id: 13, title: 'Prusa FDM 3D Printer', author: 'Rinzin Dorji', year: '2024', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 14, title: 'Zund G3 Cutting Machine', author: 'Dechen Wangmo', year: '2024', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 15, title: 'Prusa FDM 3D Printer V2', author: 'Jigme Tenzin', year: '2023', description: 'An FDM 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.' },
                { id: 16, title: 'Zund G3 Cutting Mk II', author: 'Phuntsho Wangdi', year: '2023', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
    ];

    const allProjects = categories.flatMap(c => c.projects.map(p => ({ ...p, category: c.name })));
    const totalProjects = allProjects.length;

    const filterTabs = ['All', ...categories.map(c => c.name)];

    const visibleCategories = categories
        .map(cat => ({
            ...cat,
            projects: cat.projects.filter(p =>
                (activeCategory === 'All' || cat.name === activeCategory) &&
                (p.title.toLowerCase().includes(search.toLowerCase()) ||
                    p.author.toLowerCase().includes(search.toLowerCase()))
            ),
        }))
        .filter(cat => cat.projects.length > 0);

    /* initials avatar */
    const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    /* avatar colour from name */
    const avatarColors = ['#0066FF', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#dc2626', '#16a34a'];
    const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

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
                .page-hero-inner { max-width: 82rem; margin: 0 auto; padding: 5rem 2rem 4rem; position: relative; z-index: 2; }
                .page-eyebrow { display: inline-flex; align-items: center; gap: .5rem; padding: .3rem .9rem; border-radius: 9999px; background: rgba(0,102,255,.15); border: 1px solid rgba(0,102,255,.3); color: #5aacff; font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.25rem; }
                .page-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #5aacff; animation: pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.4; transform:scale(1.5); } }
                .page-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem,5vw,4rem); font-weight: 900; color: white; letter-spacing: -.03em; line-height: 1.05; margin-bottom: 1rem; }
                .page-title .accent { color: #5aacff; font-style: italic; }
                .page-subtitle { font-size: 1rem; color: rgba(255,255,255,.6); max-width: 520px; line-height: 1.75; }
                .page-hero-stats { display: flex; gap: 2.5rem; margin-top: 3rem; }
                .phero-stat-num   { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: white; display: block; line-height: 1; }
                .phero-stat-label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.45); letter-spacing: .1em; text-transform: uppercase; margin-top: .25rem; display: block; }

                /* ── Controls bar ── */
                .controls-bar { background: var(--card-bg); border-bottom: 1px solid var(--border); position: sticky; top: 76px; z-index: 50; box-shadow: 0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width: 82rem; margin: 0 auto; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
                .filter-pills { display: flex; gap: .5rem; flex-wrap: wrap; }
                .pill { padding: .4rem 1rem; border-radius: 9999px; font-size: .8rem; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--offwhite); color: var(--muted); transition: all .2s; white-space: nowrap; }
                .pill:hover { border-color: var(--blue); color: var(--blue); }
                .pill.active { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 12px rgba(0,102,255,.25); }
                .search-wrap { display: flex; align-items: center; gap: .6rem; background: var(--offwhite); border: 1.5px solid var(--border); border-radius: 9999px; padding: .45rem 1rem; min-width: 220px; transition: border-color .2s; }
                .search-wrap:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,102,255,.1); }
                .search-wrap input { border: none; background: transparent; outline: none; font-size: .875rem; color: var(--ink); font-family: inherit; width: 100%; }
                .search-wrap input::placeholder { color: #a0aec0; }
                .results-count { font-size: .8rem; color: var(--muted); font-weight: 500; white-space: nowrap; }

                /* ── Projects main ── */
                .projects-main { padding: 4.5rem 0 6rem; }
                .projects-container { max-width: 82rem; margin: 0 auto; padding: 0 2rem; }

                /* Category block */
                .category-block { margin-bottom: 4.5rem; }
                .category-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
                .category-left { display: flex; align-items: center; gap: 1rem; }
                .category-icon { width: 2.75rem; height: 2.75rem; border-radius: .875rem; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; }
                .category-name { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 800; color: var(--ink); letter-spacing: -.02em; }
                .category-count { font-size: .78rem; font-weight: 600; color: var(--muted); background: var(--offwhite); border: 1px solid var(--border); padding: .2rem .65rem; border-radius: 9999px; }

                /* Projects grid */
                .projects-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; }

                /* Project card */
                .project-card {
                    background: var(--card-bg); border-radius: var(--radius-lg);
                    border: 1px solid var(--border); overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,.04);
                    display: flex; flex-direction: column;
                    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                }
                .project-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,.1); }

                /* Avatar area */
                .project-avatar-wrap {
                    height: 140px; display: flex; align-items: center; justify-content: center;
                    position: relative; overflow: hidden;
                }
                .project-avatar {
                    width: 72px; height: 72px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem; font-weight: 900; color: white;
                    box-shadow: 0 8px 24px rgba(0,0,0,.2);
                    z-index: 1; position: relative;
                }
                .project-avatar-bg {
                    position: absolute; inset: 0;
                    opacity: .08;
                }
                /* Decorative dots */
                .avatar-dot { position: absolute; border-radius: 50%; opacity: .15; }

                /* Body */
                .project-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
                .project-year  { font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--blue); margin-bottom: .3rem; }
                .project-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 800; color: var(--ink); margin-bottom: .4rem; letter-spacing: -.01em; line-height: 1.35; }
                .project-author { display: flex; align-items: center; gap: .4rem; font-size: .78rem; color: var(--muted); margin-bottom: .75rem; }
                .author-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }
                .project-desc { font-size: .8rem; color: #64748b; line-height: 1.65; flex: 1; margin-bottom: 1.1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

                /* Action buttons */
                .project-actions { display: flex; gap: .6rem; }
                .btn-doc {
                    flex: 1; padding: .55rem; text-align: center;
                    background: var(--offwhite); color: var(--ink-2);
                    font-size: .78rem; font-weight: 700;
                    border-radius: .65rem; border: 1.5px solid var(--border);
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .35rem;
                    transition: all .25s; text-decoration: none;
                }
                .btn-doc:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-lt); }
                .btn-vid {
                    flex: 1; padding: .55rem; text-align: center;
                    background: var(--ink); color: white;
                    font-size: .78rem; font-weight: 700;
                    border-radius: .65rem; border: none;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .35rem;
                    transition: all .25s;
                }
                .btn-vid:hover { background: var(--blue); box-shadow: 0 6px 20px rgba(0,102,255,.35); transform: translateY(-1px); }

                /* Empty state */
                .empty-state { text-align: center; padding: 5rem 0; color: var(--muted); }
                .empty-state svg { color: #cbd5e1; margin: 0 auto 1.25rem; display: block; }
                .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--ink); margin-bottom: .5rem; }

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
                        <a href="/training" className="nav-link">Training</a>
                        <a href="/projects" className="nav-link active">Projects</a>
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
                    <div className="page-eyebrow">
                        <span className="page-eyebrow-dot" />
                        Student & Staff Work
                    </div>
                    <h1 className="page-title">
                        Projects <span className="accent">Centre</span>
                    </h1>
                    <p className="page-subtitle">
                        Explore the full range of fabrication projects built by our community — from PCB design and CNC machining to embedded systems and 3D printing.
                    </p>
                    <div className="page-hero-stats">
                        {[
                            [totalProjects + '+', 'Projects'],
                            [categories.length, 'Categories'],
                            [new Set(allProjects.map(p => p.author)).size, 'Contributors'],
                            ['Open', 'Source Docs'],
                        ].map(([n, l]) => (
                            <div key={l}>
                                <span className="phero-stat-num">{n}</span>
                                <span className="phero-stat-label">{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════ CONTROLS ════════ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    <div className="filter-pills">
                        {filterTabs.map(tab => (
                            <button key={tab} className={`pill ${activeCategory === tab ? 'active' : ''}`}
                                onClick={() => setActive(tab)}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="results-count">
                            {visibleCategories.reduce((s, c) => s + c.projects.length, 0)} project{visibleCategories.reduce((s, c) => s + c.projects.length, 0) !== 1 ? 's' : ''}
                        </span>
                        <div className="search-wrap">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input placeholder="Search projects or authors…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════ PROJECTS ════════ */}
            <main className="projects-main">
                <div className="projects-container">
                    {visibleCategories.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No projects found</h3>
                            <p>Try a different category or search term.</p>
                        </div>
                    ) : (
                        visibleCategories.map((cat) => (
                            <div key={cat.name} className="category-block">

                                {/* Category header */}
                                <div className="category-header">
                                    <div className="category-left">
                                        <div className="category-icon" style={{ background: cat.color }}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h2 className="category-name">{cat.name}</h2>
                                        </div>
                                    </div>
                                    <span className="category-count">{cat.projects.length} project{cat.projects.length !== 1 ? 's' : ''}</span>
                                </div>

                                {/* Project cards */}
                                <div className="projects-grid">
                                    {cat.projects.map(project => {
                                        const col = avatarColor(project.author);
                                        return (
                                            <div key={project.id} className="project-card">
                                                {/* Avatar area */}
                                                <div className="project-avatar-wrap" style={{ background: `${col}10` }}>
                                                    {/* Decorative dots */}
                                                    <div className="avatar-dot" style={{ width: 80, height: 80, background: col, top: -20, right: -20 }} />
                                                    <div className="avatar-dot" style={{ width: 40, height: 40, background: col, bottom: 10, left: 15 }} />
                                                    {/* Avatar */}
                                                    <div className="project-avatar" style={{ background: col }}>
                                                        {initials(project.author)}
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="project-body">
                                                    <span className="project-year">{project.year}</span>
                                                    <h3 className="project-title">{project.title}</h3>
                                                    <div className="project-author">
                                                        <span className="author-dot" />
                                                        {project.author}
                                                    </div>
                                                    <p className="project-desc">{project.description}</p>

                                                    <div className="project-actions">
                                                        <button className="btn-doc">
                                                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Docs
                                                        </button>
                                                        <button className="btn-vid">
                                                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                            Video
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

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