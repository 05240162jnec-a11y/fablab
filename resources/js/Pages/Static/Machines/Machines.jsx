import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Machines() {
    const [scrolled, setScrolled] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const machines = [
        { id: 1, name: 'Prusa FDM 3D Printer', category: '3D Printing', tag: 'Additive', img: '../images/Persua FDM 3D Printer.webp', fb: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80', desc: 'Builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle. Ideal for rapid prototyping and functional parts.' },
        { id: 2, name: 'Zund G3 Cutting Machine', category: 'Cutting', tag: 'Precision', img: '../images/3D-Printer.avif', fb: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', desc: 'A precision machine meticulously engineered with perfectly coordinated components from the innovative drive system for clean, accurate cuts.' },
        { id: 3, name: 'Trotec Speedy 100', category: 'Laser', tag: 'Laser', img: '../images/Trotec Speedy 100.png', fb: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80', desc: 'A versatile and powerful laser engraving and cutting machine designed for a wide range of applications with exceptional precision.' },
        { id: 4, name: 'Trotec Speedy 400', category: 'Laser', tag: 'Laser', img: '../images/Trotec Speedy 400.png', fb: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80', desc: 'A cutting-edge laser engraving and cutting machine that offers unparalleled precision, versatility, and high-throughput performance.' },
        { id: 5, name: 'Omax Water Jet Cutter', category: 'Cutting', tag: 'WaterJet', img: '../images/Prusa FDM 3D Printer.webp', fb: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', desc: 'A state-of-the-art cutting solution renowned for its precision, versatility, and efficiency — cuts virtually any material without heat distortion.' },
        { id: 6, name: 'Mechatronika Pick & Place', category: 'Electronics', tag: 'Assembly', img: '../images/Zund g3 cutting machine.jpg', fb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', desc: 'A cutting-edge solution designed for high-speed, high-precision electronic component assembly on PCB boards.' },
        { id: 7, name: 'V-Scope 3D Scanner', category: '3D Printing', tag: 'Scanning', img: '../images/Prusa FDM 3D Printer.webp', fb: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&w=800&q=80', desc: 'High-precision 3D scanning system for reverse engineering and quality inspection. Captures complex geometries with sub-millimetre accuracy.' },
        { id: 8, name: 'Tai Lathe Machine', category: 'CNC', tag: 'CNC', img: '../images/Trotec Speedy 400.png', fb: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', desc: 'A high-precision CNC lathe, perfect for model construction, training, and small-batch productions with excellent surface finish quality.' },
        { id: 9, name: 'Formlabs Resin Printer', category: '3D Printing', tag: 'Resin', img: '../images/Zund g3 cutting machine.jpg', fb: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80', desc: 'Industry-leading SLA resin 3D printer renowned for precision, reliability, and ease of use. Produces parts with exceptional surface quality.' },
        { id: 10, name: 'ShopBot CNC Machine', category: 'CNC', tag: 'CNC', img: '../images/Prusa FDM 3D Printer.webp', fb: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80', desc: 'A versatile and powerful CNC router designed to meet the diverse fabrication needs of makers, designers, and professionals alike.' },
    ];

    const categories = ['All', ...Array.from(new Set(machines.map(m => m.category)))];

    const filtered = machines.filter(m => {
        const matchCat = filter === 'All' || m.category === filter;
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.desc.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const tagColors = {
        'Additive': { bg: '#e0f2fe', color: '#0369a1' },
        'Precision': { bg: '#fce7f3', color: '#9d174d' },
        'Laser': { bg: '#fef3c7', color: '#92400e' },
        'WaterJet': { bg: '#d1fae5', color: '#065f46' },
        'Assembly': { bg: '#ede9fe', color: '#5b21b6' },
        'Scanning': { bg: '#e0f2fe', color: '#0369a1' },
        'CNC': { bg: '#ffedd5', color: '#9a3412' },
        'Resin': { bg: '#fce7f3', color: '#9d174d' },
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
                .nav-root {
                    position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
                    transition: all .35s ease;
                }
                .nav-root.scrolled {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06);
                }
                .nav-root.top {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 1px 0 rgba(0,0,0,0.06);
                }
                .nav-inner {
                    max-width: 82rem; margin: 0 auto; padding: 0 2rem;
                    display: flex; align-items: center; justify-content: space-between;
                    height: 76px;
                }
                .nav-logo-wrap { display: flex; align-items: center; gap: .875rem; text-decoration: none; }
                .nav-logo-circle {
                    width: 52px; height: 52px; border-radius: 50%;
                    background: var(--blue);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 18px rgba(0,102,255,0.35);
                    overflow: hidden; flex-shrink: 0;
                    transition: transform .3s ease, box-shadow .3s ease;
                }
                .nav-logo-circle:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,102,255,0.45); }
                .nav-logo-circle img { width: 100%; height: 100%; object-fit: cover; }
                .nav-logo-circle .logo-letter {
                    font-family: 'Playfair Display', serif;
                    font-weight: 900; font-size: 1.5rem; color: white; letter-spacing: -1px;
                }
                .nav-brand-text .name { font-size: 1rem; font-weight: 700; color: var(--ink); letter-spacing: -.01em; display: block; line-height: 1.2; }
                .nav-brand-text .sub  { font-size: .65rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; display: block; }
                .nav-links { display: flex; gap: 1.75rem; align-items: center; }
                .nav-link {
                    font-size: .875rem; font-weight: 500; color: var(--ink-2);
                    text-decoration: none; position: relative; padding-bottom: 2px; transition: color .2s;
                }
                .nav-link::after {
                    content: ''; position: absolute; bottom: -2px; left: 0;
                    width: 0; height: 2px; background: var(--blue);
                    border-radius: 2px; transition: width .25s ease;
                }
                .nav-link:hover { color: var(--blue); }
                .nav-link:hover::after { width: 100%; }
                .nav-link.active { color: var(--blue); font-weight: 600; }
                .nav-link.active::after { width: 100%; }
                .nav-login {
                    padding: .5rem 1.4rem; font-size: .875rem; font-weight: 600;
                    color: var(--blue); background: var(--blue-lt);
                    border: 1.5px solid rgba(0,102,255,.2); border-radius: 9999px;
                    text-decoration: none; transition: all .25s;
                }
                .nav-login:hover { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,102,255,.3); }

                /* ── Page Hero Banner ── */
                .page-hero {
                    padding-top: 76px;
                    background: var(--ink);
                    position: relative; overflow: hidden;
                }
                .page-hero-inner {
                    max-width: 82rem; margin: 0 auto; padding: 5rem 2rem 4rem;
                    position: relative; z-index: 2;
                }
                .page-hero-glow {
                    position: absolute; width: 700px; height: 700px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(0,102,255,.2) 0%, transparent 70%);
                    top: -200px; right: -100px; pointer-events: none; z-index: 1;
                }
                .page-hero-glow2 {
                    position: absolute; width: 400px; height: 400px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(90,172,255,.1) 0%, transparent 70%);
                    bottom: -100px; left: 5%; pointer-events: none; z-index: 1;
                }
                /* Grid pattern overlay */
                .page-hero-grid {
                    position: absolute; inset: 0; z-index: 0; opacity: .04;
                    background-image:
                        linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px);
                    background-size: 48px 48px;
                }
                .page-eyebrow {
                    display: inline-flex; align-items: center; gap: .5rem;
                    padding: .3rem .9rem; border-radius: 9999px;
                    background: rgba(0,102,255,.15); border: 1px solid rgba(0,102,255,.3);
                    color: #5aacff; font-size: .7rem; font-weight: 700;
                    letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.25rem;
                }
                .page-eyebrow-dot {
                    width: 6px; height: 6px; border-radius: 50%; background: #5aacff;
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.4; transform:scale(1.5); } }
                .page-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 900; color: white;
                    letter-spacing: -.03em; line-height: 1.05; margin-bottom: 1rem;
                }
                .page-title .accent { color: #5aacff; font-style: italic; }
                .page-subtitle { font-size: 1rem; color: rgba(255,255,255,.6); max-width: 480px; line-height: 1.75; }
                .page-hero-stats {
                    display: flex; gap: 2.5rem; margin-top: 3rem;
                }
                .phero-stat-num {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem; font-weight: 900; color: white; display: block; line-height: 1;
                }
                .phero-stat-label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.45); letter-spacing: .1em; text-transform: uppercase; margin-top: .25rem; display: block; }

                /* ── Controls bar ── */
                .controls-bar {
                    background: var(--card-bg);
                    border-bottom: 1px solid var(--border);
                    position: sticky; top: 76px; z-index: 50;
                    box-shadow: 0 4px 24px rgba(0,0,0,.05);
                }
                .controls-inner {
                    max-width: 82rem; margin: 0 auto; padding: 1.1rem 2rem;
                    display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
                    flex-wrap: wrap;
                }
                .filter-pills { display: flex; gap: .5rem; flex-wrap: wrap; }
                .pill {
                    padding: .4rem 1rem; border-radius: 9999px;
                    font-size: .8rem; font-weight: 600; cursor: pointer;
                    border: 1.5px solid var(--border);
                    background: var(--offwhite); color: var(--muted);
                    transition: all .2s;
                }
                .pill:hover { border-color: var(--blue); color: var(--blue); }
                .pill.active { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 12px rgba(0,102,255,.25); }
                .search-wrap {
                    display: flex; align-items: center; gap: .6rem;
                    background: var(--offwhite); border: 1.5px solid var(--border);
                    border-radius: 9999px; padding: .45rem 1rem; min-width: 220px;
                    transition: border-color .2s;
                }
                .search-wrap:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,102,255,.1); }
                .search-wrap input {
                    border: none; background: transparent; outline: none;
                    font-size: .875rem; color: var(--ink); font-family: inherit; width: 100%;
                }
                .search-wrap input::placeholder { color: #a0aec0; }
                .search-wrap svg { flex-shrink: 0; color: #a0aec0; }
                .results-count { font-size: .8rem; color: var(--muted); font-weight: 500; white-space: nowrap; }

                /* ── Machines grid ── */
                .machines-section { padding: 4rem 0 6rem; }
                .machines-container { max-width: 82rem; margin: 0 auto; padding: 0 2rem; }
                .machines-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.75rem;
                }

                /* ── Machine card ── */
                .machine-card {
                    background: var(--card-bg);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,.04);
                    display: flex; flex-direction: column;
                    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                }
                .machine-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 24px 48px rgba(0,0,0,.1);
                }
                .machine-img-wrap {
                    background: #f0f4f8;
                    height: 220px;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; position: relative; flex-shrink: 0;
                }
                .machine-img-wrap img {
                    max-height: 180px; max-width: 85%;
                    object-fit: contain;
                    transition: transform .6s ease;
                }
                .machine-card:hover .machine-img-wrap img { transform: scale(1.06); }
                .machine-tag {
                    position: absolute; top: 1rem; left: 1rem;
                    font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
                    padding: .25rem .65rem; border-radius: 9999px;
                }
                .machine-id-badge {
                    position: absolute; top: 1rem; right: 1rem;
                    width: 28px; height: 28px; border-radius: 50%;
                    background: rgba(255,255,255,.9);
                    display: flex; align-items: center; justify-content: center;
                    font-size: .7rem; font-weight: 800; color: var(--muted);
                    border: 1px solid var(--border);
                }
                .machine-body { padding: 1.6rem; flex: 1; display: flex; flex-direction: column; }
                .machine-cat  { font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--blue); margin-bottom: .4rem; }
                .machine-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 800; color: var(--ink); margin-bottom: .6rem; letter-spacing: -.02em; line-height: 1.3; }
                .machine-desc { font-size: .85rem; color: var(--muted); line-height: 1.7; flex: 1; margin-bottom: 1.25rem;
                    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
                }
                .machine-actions { display: flex; gap: .75rem; }
                .btn-readmore {
                    flex: 1; padding: .65rem; text-align: center;
                    background: var(--offwhite); color: var(--ink-2);
                    font-size: .82rem; font-weight: 600;
                    border-radius: .65rem; border: 1.5px solid var(--border);
                    text-decoration: none; cursor: pointer;
                    transition: all .25s;
                }
                .btn-readmore:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-lt); }
                .btn-book {
                    flex: 1; padding: .65rem; text-align: center;
                    background: var(--blue); color: white;
                    font-size: .82rem; font-weight: 700;
                    border-radius: .65rem; border: none; cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,102,255,.25);
                    transition: all .25s;
                }
                .btn-book:hover { background: var(--blue-dk); box-shadow: 0 8px 24px rgba(0,102,255,.4); transform: translateY(-1px); }

                /* Empty state */
                .empty-state { text-align: center; padding: 5rem 0; color: var(--muted); }
                .empty-state svg { color: #cbd5e1; margin: 0 auto 1.25rem; display: block; }
                .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--ink); margin-bottom: .5rem; }

                /* ── Footer (exact match) ── */
                .footer { background: #080d14; padding: 5rem 0 0; }
                .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.4fr; gap: 3rem; padding-bottom: 3.5rem; }
                .footer-brand-logo {
                    width: 56px; height: 56px; border-radius: 50%;
                    background: var(--blue); display: flex; align-items: center; justify-content: center;
                    overflow: hidden; margin-bottom: 1.25rem;
                    box-shadow: 0 4px 18px rgba(0,102,255,.35);
                }
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
                .social-btn {
                    width: 38px; height: 38px; border-radius: 50%;
                    background: #0d1a2e; border: 1px solid #1e2d42;
                    display: flex; align-items: center; justify-content: center;
                    color: #64748b; text-decoration: none; transition: all .25s;
                }
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
                        <a href="/machines" className="nav-link active">Machines</a>
                        <a href="/shop" className="nav-link">Shop</a>
                        <a href="/training" className="nav-link">Training</a>
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
                    <div className="page-eyebrow">
                        <span className="page-eyebrow-dot" />
                        Equipment & Tools
                    </div>
                    <h1 className="page-title">
                        Our <span className="accent">Machines</span>
                    </h1>
                    <p className="page-subtitle">
                        Industry-grade digital fabrication equipment — from laser cutters and CNC routers to 3D printers and beyond.
                    </p>
                    <div className="page-hero-stats">
                        {[['10+', 'Machines'], ['5', 'Categories'], ['24/7', 'Bookable'], ['Expert', 'Support']].map(([n, l]) => (
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
                    {/* Filter pills */}
                    <div className="filter-pills">
                        {categories.map(cat => (
                            <button key={cat} className={`pill ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {/* Result count */}
                        <span className="results-count">{filtered.length} machine{filtered.length !== 1 ? 's' : ''}</span>

                        {/* Search */}
                        <div className="search-wrap">
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input placeholder="Search machines…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════ MACHINES GRID ════════ */}
            <section className="machines-section">
                <div className="machines-container">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No machines found</h3>
                            <p>Try a different search or filter.</p>
                        </div>
                    ) : (
                        <div className="machines-grid">
                            {filtered.map(m => {
                                const tc = tagColors[m.tag] || { bg: '#e8f0fe', color: '#0066FF' };
                                return (
                                    <div key={m.id} className="machine-card">
                                        {/* Image */}
                                        <div className="machine-img-wrap">
                                            <img src={m.img} alt={m.name}
                                                onError={e => { e.currentTarget.src = m.fb; e.currentTarget.style.objectFit = 'cover'; e.currentTarget.style.maxHeight = '100%'; e.currentTarget.style.maxWidth = '100%'; }} />
                                            <span className="machine-tag" style={{ background: tc.bg, color: tc.color }}>{m.tag}</span>
                                            <span className="machine-id-badge">#{String(m.id).padStart(2, '0')}</span>
                                        </div>

                                        {/* Body */}
                                        <div className="machine-body">
                                            <span className="machine-cat">{m.category}</span>
                                            <h3 className="machine-name">{m.name}</h3>
                                            <p className="machine-desc">{m.desc}</p>
                                            <div className="machine-actions">
                                                <a href="#" className="btn-readmore">Read More</a>
                                                <button className="btn-book">Book Now</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ════════ FOOTER ════════ */}
            <footer className="footer">
                <div style={{ maxWidth: '82rem', margin: '0 auto', padding: '0 2rem' }}>
                    <div className="footer-grid">

                        {/* Brand */}
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

                        {/* Quick Links */}
                        <div>
                            <span className="footer-col-title">Quick Links</span>
                            {[['Machines', '/machines'], ['Training', '/training'], ['Projects', '/projects'], ['Gallery', '/gallery'], ['About Us', '/about'], ['FAQ', '/faq']].map(([l, h]) => (
                                <a key={l} href={h} className="footer-link">{l}</a>
                            ))}
                        </div>

                        {/* Support */}
                        <div>
                            <span className="footer-col-title">Support</span>
                            <a href="/faq" className="footer-link">FAQ</a>
                            <a href="/contact" className="footer-link">Contact Us</a>
                            <Link to="/login" className="footer-link">Login / Register</Link>
                        </div>

                        {/* Contact */}
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

                    {/* Bottom bar */}
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