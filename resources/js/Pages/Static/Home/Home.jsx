import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [slideIdx, setSlideIdx] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const heroRef = useRef(null);

    /* sticky nav shadow on scroll */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* hero slideshow */
    useEffect(() => {
        const t = setInterval(() => setSlideIdx(p => (p + 1) % 3), 5000);
        return () => clearInterval(t);
    }, []);

    const slides = [
        '../images/home.jpg',
        '../images/home2.jpg',
        '../images/home3.jpg',
    ];

    const machines = [
        { img: '../images/3D-Printer.avif', fb: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', title: '3D Printers', tag: 'Additive', desc: 'Ultimaker S5 & Prusa i3 MK3S+ for rapid prototyping with PLA, ABS, and PETG filament.' },
        { img: '../images/3D-Printer.avif', fb: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=800&q=80', title: 'Biomaterials', tag: 'Sustainable', desc: 'Create recipes using the most ubiquitous biowastes — turning organic matter into usable material.' },
        { img: '../images/3D-Printer.avif', fb: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80', title: 'Plastic → Filament', tag: 'Circular', desc: 'Design and operate machines that process plastic waste into 3D printing filament.' },
    ];

    const announcements = [
        { icon: '🕗', title: 'Extended Hours — Project Season', body: 'Fab Lab operates 8 AM – 8 PM starting next week to support end-of-semester projects.' },
        { icon: '⚡', title: 'New Trotec Speedy 100 Installed', body: 'A high-precision laser cutter is now live in Lab B. Training sessions coming soon.' },
        { icon: '🛡', title: 'Safety Orientation Every Monday', body: 'Mandatory sessions at 9:00 AM in Lab A for all first-time users — no exceptions.' },
    ];

    const services = [
        { img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', title: 'Custom Prototyping', desc: "From simple models to complex assemblies — we turn your sketches and CAD files into physical reality with precision." },
        { img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', title: 'Workshops & Training', desc: 'Expert-led, hands-on sessions covering CNC, laser cutting, 3D printing, electronics, and more.' },
        { img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', title: 'Collaborative Projects', desc: "Join interdisciplinary teams pushing the boundaries of what's possible in fabrication and design." },
    ];

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#1a1a2e', overflowX: 'hidden' }}>
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
                    --white:   #ffffff;
                    --offwhite:#f9fafb;
                    --card-bg: #ffffff;
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
                    background: transparent;
                }
                .nav-inner {
                    max-width: 82rem; margin: 0 auto;
                    padding: 0 2rem;
                    display: flex; align-items: center; justify-content: space-between;
                    height: 76px;
                }
                .nav-logo-wrap {
                    display: flex; align-items: center; gap: .875rem; text-decoration: none;
                }
                .nav-logo-circle {
                    width: 52px; height: 52px; border-radius: 50%;
                    background: var(--blue);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 18px rgba(0,102,255,0.35);
                    overflow: hidden;
                    flex-shrink: 0;
                    transition: transform .3s ease, box-shadow .3s ease;
                }
                .nav-logo-circle:hover {
                    transform: scale(1.06);
                    box-shadow: 0 6px 24px rgba(0,102,255,0.45);
                }
                .nav-logo-circle img { width: 100%; height: 100%; object-fit: cover; }
                .nav-logo-circle .logo-letter {
                    font-family: 'Playfair Display', serif;
                    font-weight: 900; font-size: 1.5rem; color: white; letter-spacing: -1px;
                }
                .nav-brand-text .name {
                    font-size: 1rem; font-weight: 700; color: var(--ink); letter-spacing: -.01em; display: block; line-height: 1.2;
                }
                .nav-brand-text .sub {
                    font-size: .65rem; font-weight: 500; color: var(--muted);
                    text-transform: uppercase; letter-spacing: .1em; display: block;
                }
                /* white text when hero is behind nav */
                .nav-root.top .nav-brand-text .name { color: white; }
                .nav-root.top .nav-brand-text .sub  { color: rgba(255,255,255,.6); }
                .nav-root.top .nav-link             { color: rgba(255,255,255,.85); }
                .nav-root.top .nav-link:hover       { color: white; }
                .nav-root.top .nav-login {
                    background: rgba(255,255,255,.15);
                    border-color: rgba(255,255,255,.35);
                    color: white;
                    backdrop-filter: blur(6px);
                }
                .nav-root.top .nav-login:hover {
                    background: rgba(255,255,255,.25);
                }

                .nav-links { display: flex; gap: 1.75rem; align-items: center; }
                .nav-link {
                    font-size: .875rem; font-weight: 500;
                    color: var(--ink-2); text-decoration: none;
                    position: relative; padding-bottom: 2px;
                    transition: color .2s;
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
                    padding: .5rem 1.4rem;
                    font-size: .875rem; font-weight: 600;
                    color: var(--blue);
                    background: var(--blue-lt);
                    border: 1.5px solid rgba(0,102,255,.2);
                    border-radius: 9999px;
                    text-decoration: none;
                    transition: all .25s;
                }
                .nav-login:hover {
                    background: var(--blue);
                    color: white;
                    border-color: var(--blue);
                    box-shadow: 0 4px 16px rgba(0,102,255,.3);
                }

                /* ── Hero ── */
                .hero {
                    position: relative; height: 100vh; min-height: 640px;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .hero-slide {
                    position: absolute; inset: 0;
                    background-size: cover; background-position: center;
                    opacity: 0; transition: opacity 1.4s ease;
                }
                .hero-slide.active { opacity: 1; }
                .hero-overlay {
                    position: absolute; inset: 0; z-index: 1;
                    background: linear-gradient(
                        165deg,
                        rgba(5,10,25,.72) 0%,
                        rgba(5,10,25,.55) 50%,
                        rgba(0,60,160,.3) 100%
                    );
                }
                .hero-content {
                    position: relative; z-index: 2;
                    text-align: center; padding: 0 1.5rem; max-width: 900px;
                }
                .hero-eyebrow {
                    display: inline-flex; align-items: center; gap: .5rem;
                    padding: .35rem 1rem;
                    border-radius: 9999px;
                    background: rgba(255,255,255,.1);
                    border: 1px solid rgba(255,255,255,.2);
                    color: rgba(255,255,255,.9);
                    font-size: .72rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
                    margin-bottom: 1.75rem;
                    backdrop-filter: blur(8px);
                    animation: fadeUp .8s ease both;
                }
                .hero-eyebrow-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #4af; animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%,100%{ opacity:1; transform:scale(1); }
                    50%{ opacity:.5; transform:scale(1.4); }
                }
                .hero-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.8rem, 7vw, 5.5rem);
                    font-weight: 900; color: white;
                    line-height: 1.08; letter-spacing: -.03em;
                    margin-bottom: 1.5rem;
                    animation: fadeUp .9s .15s ease both;
                }
                .hero-title .accent { color: #5aacff; font-style: italic; }
                .hero-sub {
                    font-size: 1.1rem; font-weight: 400; color: rgba(255,255,255,.75);
                    max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.75;
                    animation: fadeUp 1s .3s ease both;
                }
                .hero-actions {
                    display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
                    animation: fadeUp 1s .45s ease both;
                }
                .btn-hero-primary {
                    padding: .85rem 2.25rem;
                    background: var(--blue);
                    color: white; font-weight: 700; font-size: 1rem;
                    border-radius: 9999px; text-decoration: none; display: inline-block;
                    box-shadow: 0 8px 32px rgba(0,102,255,.45);
                    transition: all .3s;
                    border: none; cursor: pointer;
                }
                .btn-hero-primary:hover {
                    background: var(--blue-dk);
                    transform: translateY(-3px);
                    box-shadow: 0 14px 40px rgba(0,102,255,.55);
                }
                .btn-hero-ghost {
                    padding: .85rem 2.25rem;
                    background: rgba(255,255,255,.12);
                    color: white; font-weight: 600; font-size: 1rem;
                    border-radius: 9999px; text-decoration: none; display: inline-block;
                    border: 1.5px solid rgba(255,255,255,.35);
                    backdrop-filter: blur(8px);
                    transition: all .3s;
                }
                .btn-hero-ghost:hover {
                    background: rgba(255,255,255,.22);
                    border-color: rgba(255,255,255,.6);
                }

                /* Slide dots */
                .hero-dots {
                    position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
                    z-index: 3; display: flex; gap: .5rem;
                }
                .hero-dot {
                    width: 8px; height: 8px; border-radius: 9999px;
                    background: rgba(255,255,255,.35); border: none; cursor: pointer;
                    transition: all .3s; padding: 0;
                }
                .hero-dot.active {
                    background: white; width: 24px;
                }

                /* Scroll indicator */
                .scroll-hint {
                    position: absolute; bottom: 2rem; right: 2.5rem; z-index: 3;
                    display: flex; flex-direction: column; align-items: center; gap: .4rem;
                    color: rgba(255,255,255,.5); font-size: .65rem; font-weight: 600;
                    letter-spacing: .12em; text-transform: uppercase;
                    animation: scrollBounce 2.5s ease-in-out infinite;
                }
                .scroll-hint svg { color: rgba(255,255,255,.5); }
                @keyframes scrollBounce {
                    0%,100%{ transform: translateY(0); opacity:.5; }
                    50%{ transform: translateY(6px); opacity:1; }
                }

                /* ── Section commons ── */
                .section { padding: 6rem 0; }
                .section-alt { background: var(--offwhite); }
                .section-dark { background: var(--ink); }
                .container { max-width: 82rem; margin: 0 auto; padding: 0 2rem; }
                .section-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 3rem;
                }
                .section-label {
                    display: inline-block;
                    font-size: .68rem; font-weight: 700; letter-spacing: .14em;
                    text-transform: uppercase; color: var(--blue);
                    background: var(--blue-lt); padding: .25rem .75rem;
                    border-radius: 9999px; margin-bottom: .75rem;
                }
                .section-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.75rem, 3vw, 2.5rem);
                    font-weight: 800; color: var(--ink); letter-spacing: -.02em; line-height: 1.15;
                }
                .section-sub { font-size: .925rem; color: var(--muted); margin-top: .4rem; }
                .view-all-link {
                    display: inline-flex; align-items: center; gap: .35rem;
                    font-size: .875rem; font-weight: 600; color: var(--blue);
                    text-decoration: none; white-space: nowrap;
                    transition: gap .2s;
                }
                .view-all-link:hover { gap: .6rem; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Machine cards ── */
                .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.75rem; }
                .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.75rem; }

                .machine-card {
                    background: var(--card-bg); border-radius: var(--radius-lg);
                    overflow: hidden; border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,.04);
                    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                    display: flex; flex-direction: column;
                }
                .machine-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 24px 48px rgba(0,0,0,.1);
                }
                .machine-img-wrap {
                    height: 220px; overflow: hidden; position: relative; flex-shrink: 0;
                }
                .machine-img-wrap img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform .7s ease;
                }
                .machine-card:hover .machine-img-wrap img { transform: scale(1.08); }
                .machine-tag {
                    position: absolute; top: 1rem; left: 1rem;
                    background: rgba(0,0,0,.55); color: white;
                    font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
                    padding: .25rem .65rem; border-radius: 9999px;
                    backdrop-filter: blur(6px);
                }
                .machine-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
                .machine-date { font-size: .75rem; color: #a0aec0; margin-bottom: .4rem; }
                .machine-title { font-size: 1.1rem; font-weight: 700; color: var(--ink); margin-bottom: .5rem; letter-spacing: -.01em; }
                .machine-desc { font-size: .875rem; color: var(--muted); line-height: 1.65; flex: 1; margin-bottom: 1.25rem;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                }
                .btn-book {
                    display: block; width: 100%; padding: .7rem;
                    background: var(--blue); color: white;
                    font-size: .875rem; font-weight: 700; letter-spacing: .02em;
                    border-radius: .65rem; border: none; cursor: pointer;
                    text-align: center; text-decoration: none;
                    box-shadow: 0 4px 16px rgba(0,102,255,.25);
                    transition: all .25s;
                }
                .btn-book:hover {
                    background: var(--blue-dk);
                    box-shadow: 0 8px 28px rgba(0,102,255,.4);
                    transform: translateY(-1px);
                }

                /* ── Course cards ── */
                .course-card {
                    background: var(--card-bg); border-radius: var(--radius-lg);
                    padding: 2.25rem; border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,.04);
                    position: relative; overflow: hidden;
                    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                }
                .course-card::before {
                    content: ''; position: absolute; top: 0; left: 0;
                    width: 4px; height: 100%;
                    background: linear-gradient(180deg, var(--blue), #4f7cff);
                }
                .course-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 24px 48px rgba(0,0,0,.1);
                }
                .course-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
                .badge-open {
                    display: inline-flex; align-items: center; gap: .35rem;
                    padding: .3rem .8rem;
                    background: #dcfce7; color: #15803d;
                    font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
                    border-radius: 9999px;
                }
                .badge-open::before {
                    content:''; width:6px; height:6px; border-radius:50%; background:#16a34a;
                    animation: pulse 2s ease-in-out infinite;
                }
                .badge-dur {
                    font-size: .75rem; color: var(--muted);
                    background: var(--offwhite); padding: .25rem .65rem;
                    border-radius: .5rem; font-weight: 600;
                }
                .course-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.35rem; font-weight: 800; color: var(--ink); margin-bottom: .25rem; letter-spacing: -.02em;
                }
                .course-instructor { font-size: .85rem; color: var(--muted); margin-bottom: 1rem; font-style: italic; }
                .course-desc { font-size: .875rem; color: #4a5568; line-height: 1.7; margin-bottom: 1.5rem; }
                .course-meta { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: 1.75rem; }
                .meta-item {
                    display: flex; align-items: center; gap: .5rem;
                    font-size: .8rem; color: var(--muted); font-weight: 500;
                    background: var(--offwhite); padding: .6rem .9rem; border-radius: .65rem;
                }
                .meta-item svg { flex-shrink: 0; color: var(--blue); }
                .btn-enroll {
                    display: block; width: 100%; padding: .85rem;
                    background: var(--ink); color: white;
                    font-size: .9rem; font-weight: 700; letter-spacing: .02em;
                    border-radius: .75rem; border: none; cursor: pointer;
                    text-align: center; text-decoration: none;
                    transition: all .25s;
                }
                .btn-enroll:hover {
                    background: var(--blue);
                    box-shadow: 0 8px 28px rgba(0,102,255,.4);
                    transform: translateY(-1px);
                }

                /* ── Announcements ── */
                .ann-card {
                    display: flex; align-items: flex-start; gap: 1.25rem;
                    padding: 1.5rem 1.75rem;
                    background: var(--card-bg); border-radius: var(--radius);
                    border: 1px solid var(--border);
                    box-shadow: 0 1px 4px rgba(0,0,0,.04);
                    transition: all .3s;
                    cursor: default;
                }
                .ann-card:hover {
                    border-color: var(--blue);
                    box-shadow: 0 8px 32px rgba(0,102,255,.1);
                    transform: translateX(4px);
                }
                .ann-icon {
                    width: 2.75rem; height: 2.75rem; border-radius: .75rem;
                    background: var(--blue-lt); display: flex; align-items: center; justify-content: center;
                    font-size: 1.1rem; flex-shrink: 0;
                }
                .ann-title { font-size: .975rem; font-weight: 700; color: var(--ink); margin-bottom: .25rem; letter-spacing: -.01em; }
                .ann-body  { font-size: .85rem; color: var(--muted); line-height: 1.65; }

                /* ── Services ── */
                .service-card { position: relative; overflow: hidden; border-radius: var(--radius-lg); }
                .service-img-wrap { height: 280px; overflow: hidden; border-radius: var(--radius-lg); position: relative; }
                .service-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .6s ease; display:block; }
                .service-card:hover .service-img-wrap img { transform:scale(1.07); }
                .service-img-overlay {
                    position:absolute; inset:0;
                    background:linear-gradient(to top, rgba(5,10,25,.7) 0%, transparent 55%);
                    border-radius: var(--radius-lg);
                }
                .service-content {
                    position:absolute; bottom:0; left:0; right:0; padding:1.75rem;
                }
                .service-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:800; color:white; margin-bottom:.35rem; letter-spacing:-.02em; }
                .service-desc  { font-size:.8rem; color:rgba(255,255,255,.8); line-height:1.6; }

                /* ── Stats bar ── */
                .stats-bar {
                    background: var(--blue);
                    padding: 3rem 0;
                }
                .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; text-align:center; }
                .stat-num {
                    font-family:'Playfair Display',serif;
                    font-size:2.5rem; font-weight:900; color:white; display:block; line-height:1;
                }
                .stat-label { font-size:.8rem; font-weight:600; color:rgba(255,255,255,.7); letter-spacing:.08em; text-transform:uppercase; margin-top:.4rem; display:block; }

                /* ── CTA ── */
                .cta-section {
                    background: var(--ink);
                    padding: 6rem 0; position:relative; overflow:hidden;
                }
                .cta-glow {
                    position:absolute; width:600px; height:600px; border-radius:50%;
                    background: radial-gradient(circle, rgba(0,102,255,.18) 0%, transparent 70%);
                    top:50%; left:50%; transform:translate(-50%,-50%);
                    pointer-events:none;
                }
                .cta-grid {
                    display:grid; grid-template-columns:1fr auto; gap:4rem; align-items:center;
                }
                .cta-eyebrow { font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#5aacff; margin-bottom:.75rem; display:block; }
                .cta-title {
                    font-family:'Playfair Display',serif;
                    font-size:clamp(2rem,4vw,3rem); font-weight:900; color:white; letter-spacing:-.03em; line-height:1.1; margin-bottom:1rem;
                }
                .cta-body { font-size:.95rem; color:rgba(255,255,255,.6); line-height:1.75; max-width:460px; }
                .cta-actions { display:flex; flex-direction:column; gap:.875rem; align-items:center; flex-shrink:0; }
                .btn-cta-primary {
                    padding:.9rem 2.5rem; background:var(--blue);
                    color:white; font-weight:700; font-size:1rem;
                    border-radius:9999px; text-decoration:none; display:inline-block;
                    box-shadow:0 8px 32px rgba(0,102,255,.45); transition:all .3s; white-space:nowrap;
                    border:none; cursor:pointer;
                }
                .btn-cta-primary:hover { background:var(--blue-dk); transform:translateY(-3px); box-shadow:0 14px 40px rgba(0,102,255,.55); }
                .btn-cta-outline {
                    padding:.9rem 2.5rem;
                    background:transparent; color:rgba(255,255,255,.8); font-weight:600; font-size:1rem;
                    border-radius:9999px; text-decoration:none; display:inline-block;
                    border:1.5px solid rgba(255,255,255,.2); transition:all .3s; white-space:nowrap;
                }
                .btn-cta-outline:hover { border-color:rgba(255,255,255,.5); color:white; background:rgba(255,255,255,.05); }

                /* ── Footer ── */
                .footer { background: #080d14; padding:5rem 0 0; }
                .footer-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr 1.4fr; gap:3rem; padding-bottom:3.5rem; }
                .footer-brand-logo {
                    width:56px; height:56px; border-radius:50%;
                    background:var(--blue);
                    display:flex; align-items:center; justify-content:center;
                    overflow:hidden; margin-bottom:1.25rem;
                    box-shadow:0 4px 18px rgba(0,102,255,.35);
                }
                .footer-brand-logo img { width:100%; height:100%; object-fit:cover; }
                .footer-brand-logo .logo-letter {
                    font-family:'Playfair Display',serif; font-weight:900; font-size:1.6rem; color:white;
                }
                .footer-brand-name { font-size:1.1rem; font-weight:700; color:white; display:block; margin-bottom:.15rem; }
                .footer-brand-sub  { font-size:.68rem; font-weight:500; color:#475569; letter-spacing:.1em; text-transform:uppercase; display:block; margin-bottom:1rem; }
                .footer-about { font-size:.85rem; color:#64748b; line-height:1.75; }
                .footer-col-title { font-size:.7rem; font-weight:700; color:#cbd5e1; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.25rem; display:block; }
                .footer-link {
                    display:block; font-size:.875rem; color:#64748b;
                    text-decoration:none; padding:.3rem 0; transition:color .2s;
                }
                .footer-link:hover { color:white; }
                .footer-contact-item { display:flex; align-items:flex-start; gap:.75rem; margin-bottom:1rem; }
                .footer-contact-item svg { flex-shrink:0; margin-top:.15rem; }
                .footer-contact-text { font-size:.85rem; color:#64748b; line-height:1.6; }
                .footer-bottom {
                    border-top:1px solid #1a2332;
                    padding:1.5rem 0; display:flex; justify-content:space-between; align-items:center;
                }
                .footer-copy { font-size:.78rem; color:#334155; }
                .footer-socials { display:flex; gap:.875rem; }
                .social-btn {
                    width:38px; height:38px; border-radius:50%;
                    background:#0d1a2e; border:1px solid #1e2d42;
                    display:flex; align-items:center; justify-content:center;
                    color:#64748b; text-decoration:none;
                    transition:all .25s;
                }
                .social-btn:hover { background:var(--blue); border-color:var(--blue); color:white; transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,102,255,.35); }

                /* Divider */
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }
            `}</style>

            {/* ════════════════ NAV ════════════════ */}
            <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
                <div className="nav-inner">
                    {/* Logo */}
                    <a href="/" className="nav-logo-wrap">
                        <div className="nav-logo-circle">
                            <img
                                src="/images/logo.png"
                                alt="JNEC Fab Lab"
                                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                            />
                            <span className="logo-letter" style={{ display: 'none' }}>J</span>
                        </div>
                        <div className="nav-brand-text">
                            <span className="name">JNEC Fab Lab</span>
                            <span className="sub">Fabrication Laboratory</span>
                        </div>
                    </a>

                    {/* Links */}
                    <div className="nav-links">
                        <a href="/" className="nav-link active">Home</a>
                        <a href="/machines" className="nav-link">Machines</a>
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

            {/* ════════════════ HERO ════════════════ */}
            <section className="hero">
                {slides.map((src, i) => (
                    <div key={i} className={`hero-slide ${i === slideIdx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${src})` }} />
                ))}
                <div className="hero-overlay" />

                <div className="hero-content">
                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot" />
                        Welcome to JNEC Fab Lab
                    </div>
                    <h1 className="hero-title">
                        Where Ideas<br />
                        Become <span className="accent">Reality</span>
                    </h1>
                    <p className="hero-sub">
                        State-of-the-art digital fabrication equipment, expert-led training, and a community of innovators — all in one place.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-hero-primary">Register Now →</Link>
                        <a href="/about" className="btn-hero-ghost">Learn More</a>
                    </div>
                </div>

                {/* Slide dots */}
                <div className="hero-dots">
                    {slides.map((_, i) => (
                        <button key={i} className={`hero-dot ${i === slideIdx ? 'active' : ''}`}
                            onClick={() => setSlideIdx(i)} aria-label={`Slide ${i + 1}`} />
                    ))}
                </div>

                {/* Scroll cue */}
                <div className="scroll-hint">
                    <span>Scroll</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ════════════════ STATS BAR ════════════════ */}
            <div className="stats-bar">
                <div className="container">
                    <div className="stats-grid">
                        {[['12+', 'Machines Available'], ['500+', 'Projects Completed'], ['200+', 'Trained Members'], ['3', 'Specialised Labs']].map(([n, l]) => (
                            <div key={l}>
                                <span className="stat-num">{n}</span>
                                <span className="stat-label">{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════════════ MACHINES ════════════════ */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span className="section-label">Equipment</span>
                            <h2 className="section-title">Our Machines</h2>
                            <p className="section-sub">Industry-grade tools for every fabrication need</p>
                            <div className="divider" style={{ marginTop: '1rem' }} />
                        </div>
                        <a href="/machines" className="view-all-link">
                            View All
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>

                    <div className="grid-3">
                        {machines.map((m, i) => (
                            <div key={i} className="machine-card">
                                <div className="machine-img-wrap">
                                    <img src={m.img} alt={m.title} onError={e => { e.currentTarget.src = m.fb; }} />
                                    <span className="machine-tag">{m.tag}</span>
                                </div>
                                <div className="machine-body">
                                    <span className="machine-date">Aug 2, 2024</span>
                                    <h3 className="machine-title">{m.title}</h3>
                                    <p className="machine-desc">{m.desc}</p>
                                    <button className="btn-book">Book Machine</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ TRAINING ════════════════ */}
            <section className="section section-alt">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span className="section-label">Courses</span>
                            <h2 className="section-title">Upcoming Training</h2>
                            <p className="section-sub">Hands-on learning from experienced instructors</p>
                            <div className="divider" style={{ marginTop: '1rem' }} />
                        </div>
                        <a href="/training" className="view-all-link">
                            View All
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>

                    <div className="grid-2">
                        {[0, 1].map(i => (
                            <div key={i} className="course-card">
                                <div className="course-card-top">
                                    <span className="badge-open">Open</span>
                                    <span className="badge-dur">6 Weeks</span>
                                </div>
                                <h3 className="course-title">CNC Machining Fundamentals</h3>
                                <p className="course-instructor">— Mr. Dorji Gyeltshen</p>
                                <p className="course-desc">
                                    Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.
                                </p>
                                <div className="course-meta">
                                    <div className="meta-item">
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Tue & Thu · 14:00–16:00
                                    </div>
                                    <div className="meta-item">
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        2 seats left
                                    </div>
                                </div>
                                <button className="btn-enroll">Enroll Now</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ ANNOUNCEMENTS ════════════════ */}
            <section className="section">
                <div className="container" style={{ maxWidth: '64rem' }}>
                    <div style={{ marginBottom: '2.75rem' }}>
                        <span className="section-label">Updates</span>
                        <h2 className="section-title">Latest Announcements</h2>
                        <p className="section-sub">Stay in the loop with Fab Lab news and updates</p>
                        <div className="divider" style={{ marginTop: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {announcements.map((a, i) => (
                            <div key={i} className="ann-card">
                                <div className="ann-icon">{a.icon}</div>
                                <div>
                                    <p className="ann-title">{a.title}</p>
                                    <p className="ann-body">{a.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ SERVICES ════════════════ */}
            <section className="section section-alt">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <span className="section-label">What We Offer</span>
                        <h2 className="section-title">Our Services</h2>
                        <p className="section-sub" style={{ maxWidth: '40rem', margin: '.4rem auto 0' }}>
                            Everything you need to design, prototype, and bring your ideas to life
                        </p>
                    </div>
                    <div className="grid-3">
                        {services.map((s, i) => (
                            <div key={i} className="service-card">
                                <div className="service-img-wrap">
                                    <img src={s.img} alt={s.title} />
                                    <div className="service-img-overlay" />
                                    <div className="service-content">
                                        <h3 className="service-title">{s.title}</h3>
                                        <p className="service-desc">{s.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ CTA ════════════════ */}
            <section className="cta-section">
                <div className="cta-glow" />
                <div className="container">
                    <div className="cta-grid">
                        <div>
                            <span className="cta-eyebrow">Get Started Today</span>
                            <h2 className="cta-title">Ready to Start<br />Making?</h2>
                            <p className="cta-body">
                                Create an account to book machines, enroll in courses, submit projects, and place custom fabrication orders — all in one platform.
                            </p>
                        </div>
                        <div className="cta-actions">
                            <Link to="/register" className="btn-cta-primary">Create Free Account</Link>
                            <Link to="/contact" className="btn-cta-outline">Talk to Us</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════ FOOTER ════════════════ */}
            <footer className="footer">
                <div className="container">
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
                            <p className="footer-about">
                                The JNEC Fabrication Lab provides access to digital fabrication tools and hands-on training for students, faculty, and the wider community.
                            </p>
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
                            {/* TikTok */}
                            <a href="https://www.tiktok.com/@jnec_fablab" target="_blank" rel="noreferrer" className="social-btn" aria-label="TikTok">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                </svg>
                            </a>
                            {/* Facebook */}
                            <a href="https://www.facebook.com/share/18HY9mpzDF/" target="_blank" rel="noreferrer" className="social-btn" aria-label="Facebook">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a href="http://www.youtube.com/@JNECFabLab" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}