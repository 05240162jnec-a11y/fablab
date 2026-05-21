import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    const [scrolled, setScrolled] = useState(false);
    const [activeFilter, setFilter] = useState('ALL');
    const [activePage, setPage] = useState(1);
    const PER_PAGE = 8;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const teamMembers = [
        { id: 1, name: 'Pema Wangchug', role: 'Associate Director', dept: 'DRIVE/SFL', linkedin: '#' },
        { id: 2, name: 'Tshering Wangzom', role: 'Senior Analyst', dept: 'SFL', linkedin: '#' },
        { id: 3, name: 'Chirag Sharma', role: 'Senior Analyst', dept: 'DRIVE', linkedin: '#' },
        { id: 4, name: 'Nirpa Raj Dangal', role: 'Associate Analyst', dept: 'DRIVE', linkedin: '#' },
        { id: 5, name: 'Uzal Chhetri', role: 'Associate Analyst', dept: 'DRIVE', linkedin: '#' },
        { id: 6, name: 'Thinley Jamtsho', role: 'Associate Analyst', dept: 'DRIVE', linkedin: '#' },
        { id: 7, name: 'Subham Chhetri', role: 'Associate Analyst', dept: 'DRIVE', linkedin: '#' },
        { id: 8, name: 'Lhendup Dorji', role: 'Associate Analyst', dept: 'DRIVE', linkedin: '#' },
        { id: 9, name: 'Karma Choden', role: 'Lab Technician', dept: 'SFL', linkedin: '#' },
        { id: 10, name: 'Dawa Penjor', role: 'Research Associate', dept: 'DRIVE', linkedin: '#' },
    ];

    const features = [
        { icon: '📋', color: '#fff7ed', accent: '#ea580c', title: 'Inventory Management', desc: 'Track consumables, materials, and tools used across all Fab Lab workstations.' },
        { icon: '📅', color: '#eff6ff', accent: '#2563eb', title: 'Machine Booking', desc: 'Reserve machines and equipment with real-time availability and scheduling.' },
        { icon: '✅', color: '#f0fdf4', accent: '#16a34a', title: 'Course Registration', desc: 'Register for expert-led training programs directly through the platform.' },
        { icon: '🚀', color: '#fdf4ff', accent: '#9333ea', title: 'Project Showcase', desc: 'Explore and publish innovative projects created by students and staff.' },
        { icon: '📊', color: '#fff1f2', accent: '#e11d48', title: 'Lab Analytics', desc: 'Visualize real-time lab usage, machine statistics, and booking trends.' },
    ];

    const facilities = [
        { img: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?auto=format&fit=crop&w=600&q=80', name: '3D Printing', desc: 'FDM, resin, and multi-material printing for rapid prototyping.' },
        { img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=600&q=80', name: 'Laser Cutting', desc: 'Trotec Speedy 100/400 for precision cutting and engraving.' },
        { img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80', name: 'CNC Machining', desc: 'ShopBot CNC router and high-precision lathe machines.' },
        { img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', name: 'Electronics Lab', desc: 'PCB fabrication, soldering stations, and component assembly.' },
    ];

    const avatarColors = ['#0066FF', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#dc2626', '#16a34a', '#0284c7', '#9333ea'];
    const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
    const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const filteredMembers = teamMembers.filter(m =>
        activeFilter === 'ALL' || m.dept.includes(activeFilter)
    );
    const totalPages = Math.ceil(filteredMembers.length / PER_PAGE);
    const pageMembers = filteredMembers.slice((activePage - 1) * PER_PAGE, activePage * PER_PAGE);

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
                .nav-root.top      { background: transparent; }
                .nav-root.top .nav-brand-text .name { color: white; }
                .nav-root.top .nav-brand-text .sub  { color: rgba(255,255,255,.6); }
                .nav-root.top .nav-link             { color: rgba(255,255,255,.85); }
                .nav-root.top .nav-link:hover       { color: white; }
                .nav-root.top .nav-login { background: rgba(255,255,255,.15); border-color: rgba(255,255,255,.3); color: white; }
                .nav-root.top .nav-login:hover { background: rgba(255,255,255,.25); }
                .nav-inner { max-width: 82rem; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 76px; }
                .nav-logo-wrap { display: flex; align-items: center; gap: .875rem; text-decoration: none; }
                .nav-logo-circle { width: 52px; height: 52px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(0,102,255,0.35); overflow: hidden; flex-shrink: 0; transition: transform .3s, box-shadow .3s; }
                .nav-logo-circle:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,102,255,0.45); }
                .nav-logo-circle img { width: 100%; height: 100%; object-fit: cover; }
                .nav-logo-circle .logo-letter { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.5rem; color: white; }
                .nav-brand-text .name { font-size: 1rem; font-weight: 700; color: var(--ink); display: block; line-height: 1.2; transition: color .3s; }
                .nav-brand-text .sub  { font-size: .65rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; display: block; transition: color .3s; }
                .nav-links { display: flex; gap: 1.75rem; align-items: center; }
                .nav-link { font-size: .875rem; font-weight: 500; color: var(--ink-2); text-decoration: none; position: relative; padding-bottom: 2px; transition: color .2s; }
                .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: var(--blue); border-radius: 2px; transition: width .25s; }
                .nav-link:hover { color: var(--blue); }
                .nav-link:hover::after { width: 100%; }
                .nav-link.active { color: var(--blue); font-weight: 600; }
                .nav-link.active::after { width: 100%; }
                .nav-root.top .nav-link.active { color: white; }
                .nav-root.top .nav-link.active::after { background: white; }
                .nav-login { padding: .5rem 1.4rem; font-size: .875rem; font-weight: 600; color: var(--blue); background: var(--blue-lt); border: 1.5px solid rgba(0,102,255,.2); border-radius: 9999px; text-decoration: none; transition: all .25s; }
                .nav-login:hover { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,102,255,.3); }

                /* ── Cinematic Hero ── */
                .hero-section {
                    position: relative; height: 100vh; min-height: 640px;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .hero-bg {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=90');
                    background-size: cover; background-position: center;
                }
                .hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(165deg, rgba(5,10,25,.82) 0%, rgba(5,10,25,.6) 50%, rgba(0,60,160,.25) 100%);
                }
                .hero-grid { position: absolute; inset: 0; opacity: .04; background-image: linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size: 48px 48px; }
                .hero-content { position: relative; z-index: 2; text-align: center; padding: 0 1.5rem; max-width: 860px; }
                .hero-eyebrow { display: inline-flex; align-items: center; gap: .5rem; padding: .35rem 1rem; border-radius: 9999px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.9); font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.75rem; backdrop-filter: blur(8px); animation: fadeUp .8s ease both; }
                .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #4af; animation: pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.4; transform:scale(1.5); } }
                .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem,7vw,5.5rem); font-weight: 900; color: white; line-height: 1.08; letter-spacing: -.03em; margin-bottom: 1.5rem; animation: fadeUp .9s .15s ease both; }
                .hero-title .accent { color: #5aacff; font-style: italic; }
                .hero-sub { font-size: 1.1rem; font-weight: 400; color: rgba(255,255,255,.75); max-width: 540px; margin: 0 auto 2.5rem; line-height: 1.75; animation: fadeUp 1s .3s ease both; }
                .hero-cta { animation: fadeUp 1s .45s ease both; }
                .btn-hero { display: inline-block; padding: .875rem 2.25rem; background: var(--blue); color: white; font-weight: 700; font-size: 1rem; border-radius: 9999px; text-decoration: none; box-shadow: 0 8px 32px rgba(0,102,255,.45); transition: all .3s; border: none; cursor: pointer; }
                .btn-hero:hover { background: var(--blue-dk); transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,102,255,.55); }
                @keyframes fadeUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }

                /* Scroll hint */
                .scroll-hint { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: .4rem; color: rgba(255,255,255,.45); font-size: .65rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; animation: scrollBounce 2.5s ease-in-out infinite; }
                @keyframes scrollBounce { 0%,100%{ transform:translateX(-50%) translateY(0); opacity:.45; } 50%{ transform:translateX(-50%) translateY(6px); opacity:.9; } }

                /* ── Section commons ── */
                .section     { padding: 6rem 0; }
                .section-alt { background: var(--offwhite); }
                .section-dark{ background: var(--ink); }
                .container   { max-width: 82rem; margin: 0 auto; padding: 0 2rem; }
                .section-label { display: inline-block; font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--blue); background: var(--blue-lt); padding: .25rem .75rem; border-radius: 9999px; margin-bottom: .65rem; }
                .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.75rem,3vw,2.5rem); font-weight: 800; color: var(--ink); letter-spacing: -.02em; line-height: 1.15; }
                .section-title .accent { color: var(--blue); font-style: italic; }
                .section-sub { font-size: .925rem; color: var(--muted); margin-top: .4rem; line-height: 1.7; }
                .divider { width: 3rem; height: 3px; background: var(--blue); border-radius: 9999px; margin-top: .75rem; }
                .center { text-align: center; }
                .center .divider { margin: .75rem auto 0; }

                /* ── About blurb ── */
                .about-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 5rem; align-items: center; }
                .about-text p { font-size: 1rem; color: #475569; line-height: 1.85; margin-top: 1.5rem; }
                .about-img-wrap { border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,.12); }
                .about-img-wrap img { width: 100%; height: 380px; object-fit: cover; display: block; }

                /* ── Feature cards ── */
                .features-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 1.5rem; margin-top: 3.5rem; }
                .feature-card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 2rem 1.5rem; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,.04); text-align: center; transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s; }
                .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.1); }
                .feature-icon { width: 3.5rem; height: 3.5rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 1.25rem; }
                .feature-title { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 800; color: var(--ink); margin-bottom: .5rem; }
                .feature-desc  { font-size: .78rem; color: var(--muted); line-height: 1.65; }

                /* ── Facilities ── */
                .facilities-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: 3.5rem; }
                .facility-card { border-radius: var(--radius-lg); overflow: hidden; position: relative; box-shadow: 0 4px 16px rgba(0,0,0,.08); transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s; }
                .facility-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,.14); }
                .facility-card img { width: 100%; height: 220px; object-fit: cover; display: block; transition: transform .6s ease; }
                .facility-card:hover img { transform: scale(1.07); }
                .facility-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,10,25,.75) 0%, transparent 55%); }
                .facility-card-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem; }
                .facility-name { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 800; color: white; letter-spacing: -.02em; }
                .facility-desc { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .2rem; line-height: 1.5; }

                /* ── Mission / Vision ── */
                .mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; margin-top: 3rem; }
                .mv-card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 2.75rem; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,.04); position: relative; overflow: hidden; }
                .mv-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, var(--blue), #4f7cff); border-radius: 1rem 0 0 1rem; }
                .mv-card-icon { font-size: 2rem; margin-bottom: 1rem; display: block; }
                .mv-card-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 800; color: var(--ink); margin-bottom: 1rem; letter-spacing: -.02em; }
                .mv-card-text  { font-size: .9rem; color: var(--muted); line-height: 1.8; }

                /* ── Team section (dark) ── */
                .team-header { text-align: center; margin-bottom: 2.5rem; }
                .team-header .section-title { color: white; }
                .team-header .section-title .accent { color: #5aacff; }
                .team-header .section-sub { color: rgba(255,255,255,.5); }
                .team-header .divider { background: #5aacff; margin: .75rem auto 0; }
                .team-filters { display: flex; justify-content: center; gap: .75rem; margin-top: 2rem; margin-bottom: 3rem; }
                .team-pill { padding: .45rem 1.25rem; border-radius: 9999px; font-size: .8rem; font-weight: 600; cursor: pointer; border: 1.5px solid rgba(255,255,255,.15); background: rgba(255,255,255,.05); color: rgba(255,255,255,.6); transition: all .2s; }
                .team-pill:hover { border-color: rgba(255,255,255,.35); color: white; }
                .team-pill.active { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,102,255,.4); }

                /* Team grid */
                .team-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; }
                .team-card { background: rgba(255,255,255,.05); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid rgba(255,255,255,.08); transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s, background .25s; }
                .team-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,.35); background: rgba(255,255,255,.08); }
                .team-avatar-wrap { height: 130px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
                .team-avatar { width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: white; box-shadow: 0 8px 24px rgba(0,0,0,.35); z-index: 1; position: relative; }
                .team-avatar-dot { position: absolute; border-radius: 50%; opacity: .12; }
                .team-body { padding: 1.25rem; }
                .team-dept { display: inline-block; font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #5aacff; background: rgba(0,102,255,.15); padding: .2rem .6rem; border-radius: 9999px; margin-bottom: .4rem; }
                .team-name { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 800; color: white; margin-bottom: .2rem; letter-spacing: -.01em; }
                .team-role { font-size: .78rem; color: rgba(255,255,255,.5); font-style: italic; margin-bottom: .9rem; }
                .team-linkedin { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.5); transition: all .25s; text-decoration: none; }
                .team-linkedin:hover { background: var(--blue); border-color: var(--blue); color: white; transform: scale(1.1); }

                /* Pagination */
                .pagination { display: flex; justify-content: center; align-items: center; gap: .5rem; margin-top: 3rem; }
                .page-btn { width: 38px; height: 38px; border-radius: .5rem; display: flex; align-items: center; justify-content: center; font-size: .85rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: rgba(255,255,255,.6); transition: all .2s; }
                .page-btn:hover { border-color: rgba(255,255,255,.3); color: white; }
                .page-btn.active { background: var(--blue); border-color: var(--blue); color: white; box-shadow: 0 4px 12px rgba(0,102,255,.4); }
                .page-btn.arrow { font-size: 1rem; }
                .page-btn:disabled { opacity: .3; cursor: not-allowed; }

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
                        <a href="/projects" className="nav-link">Projects</a>
                        <a href="/about" className="nav-link active">About</a>
                        <a href="/gallery" className="nav-link">Gallery</a>
                        <a href="/faq" className="nav-link">FAQ</a>
                        <Link to="/login" className="nav-login">Login</Link>
                    </div>
                </div>
            </nav>

            {/* ════════ CINEMATIC HERO ════════ */}
            <section className="hero-section">
                <div className="hero-bg" />
                <div className="hero-overlay" />
                <div className="hero-grid" />
                <div className="hero-content">
                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot" />
                        Jigme Namgyel Engineering College
                    </div>
                    <h1 className="hero-title">
                        About <span className="accent">JNEC</span><br />Fab Lab
                    </h1>
                    <p className="hero-sub">
                        Empowering students to innovate, design, and build real-world projects using digital fabrication technologies.
                    </p>
                    <div className="hero-cta">
                        <button className="btn-hero" onClick={() => document.getElementById('about-content').scrollIntoView({ behavior: 'smooth' })}>
                            Explore More ↓
                        </button>
                    </div>
                </div>
                <div className="scroll-hint">
                    <span>Scroll</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ════════ ABOUT BLURB ════════ */}
            <section className="section" id="about-content">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-text">
                            <span className="section-label">Who We Are</span>
                            <h2 className="section-title">JNEC <span className="accent">Fab Lab?</span></h2>
                            <div className="divider" />
                            <p>The JNEC Fab Lab is a digital fabrication laboratory equipped with advanced tools such as 3D printers, laser cutters, CNC machines, and electronics workstations.</p>
                            <p>It provides students, faculty, and innovators with a dedicated space to transform creative ideas into real prototypes — fostering a culture of hands-on learning, collaboration, and innovation.</p>
                            <p>Open to all members of the JNEC community, the Fab Lab bridges the gap between classroom theory and real-world engineering practice.</p>
                        </div>
                        <div className="about-img-wrap">
                            <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&w=900&q=85" alt="Fab Lab" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════ WHAT OUR SYSTEM PROVIDES ════════ */}
            <section className="section section-alt">
                <div className="container">
                    <div className="center">
                        <span className="section-label">Platform Features</span>
                        <h2 className="section-title">What Our <span className="accent">System</span> Provides</h2>
                        <p className="section-sub" style={{ maxWidth: '480px', margin: '.4rem auto 0' }}>One integrated platform for booking, training, projects, and lab management</p>
                        <div className="divider" />
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon" style={{ background: f.color }}>
                                    {f.icon}
                                </div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ FACILITIES ════════ */}
            <section className="section">
                <div className="container">
                    <div className="center">
                        <span className="section-label">Infrastructure</span>
                        <h2 className="section-title">Fab Lab <span className="accent">Facilities</span></h2>
                        <p className="section-sub" style={{ maxWidth: '440px', margin: '.4rem auto 0' }}>State-of-the-art equipment across four specialised workspaces</p>
                        <div className="divider" />
                    </div>
                    <div className="facilities-grid">
                        {facilities.map((f, i) => (
                            <div key={i} className="facility-card">
                                <img src={f.img} alt={f.name} />
                                <div className="facility-card-overlay" />
                                <div className="facility-card-text">
                                    <div className="facility-name">{f.name}</div>
                                    <div className="facility-desc">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ MISSION & VISION ════════ */}
            <section className="section section-alt">
                <div className="container">
                    <div className="center">
                        <span className="section-label">Purpose</span>
                        <h2 className="section-title">Mission & <span className="accent">Vision</span></h2>
                        <div className="divider" />
                    </div>
                    <div className="mv-grid">
                        <div className="mv-card">
                            <span className="mv-card-icon">🎯</span>
                            <h3 className="mv-card-title">Our Mission</h3>
                            <p className="mv-card-text">To empower students and innovators by providing access to digital fabrication tools and enabling them to transform ideas into real-world solutions — bridging the gap between imagination and engineering reality.</p>
                        </div>
                        <div className="mv-card">
                            <span className="mv-card-icon">🔭</span>
                            <h3 className="mv-card-title">Our Vision</h3>
                            <p className="mv-card-text">To create a collaborative innovation hub where creativity, technology, and entrepreneurship thrive — inspiring the next generation of engineers, designers, and makers in Bhutan and beyond.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════ MEET OUR TEAM ════════ */}
            <section className="section section-dark">
                <div className="container">
                    <div className="team-header">
                        <span className="section-label">The People</span>
                        <h2 className="section-title">Meet <span className="accent">Our Team</span></h2>
                        <p className="section-sub" style={{ color: 'rgba(255,255,255,.5)' }}>The dedicated professionals behind JNEC Fab Lab</p>
                        <div className="divider" style={{ background: '#5aacff', margin: '.75rem auto 0' }} />
                    </div>

                    {/* Filter pills */}
                    <div className="team-filters">
                        {['ALL', 'SFL', 'DRIVE'].map(f => (
                            <button key={f} className={`team-pill ${activeFilter === f ? 'active' : ''}`}
                                onClick={() => { setFilter(f); setPage(1); }}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Team grid */}
                    <div className="team-grid">
                        {pageMembers.map(member => {
                            const col = avatarColor(member.name);
                            return (
                                <div key={member.id} className="team-card">
                                    <div className="team-avatar-wrap" style={{ background: `${col}12` }}>
                                        <div className="team-avatar-dot" style={{ width: 80, height: 80, background: col, top: -20, right: -20 }} />
                                        <div className="team-avatar-dot" style={{ width: 36, height: 36, background: col, bottom: 10, left: 15 }} />
                                        <div className="team-avatar" style={{ background: col }}>
                                            {initials(member.name)}
                                        </div>
                                    </div>
                                    <div className="team-body">
                                        <span className="team-dept">{member.dept}</span>
                                        <h3 className="team-name">{member.name}</h3>
                                        <p className="team-role">{member.role}</p>
                                        <a href={member.linkedin} className="team-linkedin" aria-label="LinkedIn">
                                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn arrow" disabled={activePage === 1}
                                onClick={() => setPage(p => p - 1)}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i + 1} className={`page-btn ${activePage === i + 1 ? 'active' : ''}`}
                                    onClick={() => setPage(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                            <button className="page-btn arrow" disabled={activePage === totalPages}
                                onClick={() => setPage(p => p + 1)}>›</button>
                        </div>
                    )}
                </div>
            </section>

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