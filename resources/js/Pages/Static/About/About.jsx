import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ── Scroll-reveal ─────────────────────────────────────────────────────── */
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}
function Reveal({ children, delay = 0, style = {} }) {
    const [ref, visible] = useReveal();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(36px)',
            transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
            ...style
        }}>{children}</div>
    );
}

/* ── Feature SVG icons — plain black aesthetic ─────────────────────────── */
const FeatureIcons = {
    inventory: (
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    booking: (
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    courses: (
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    projects: (
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    ),
    analytics: (
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
};

/* ── Reusable circle profile — no card, no border ──────────────────────── */
function TeamCircleCard({ member, large, avatarColor, initials }) {
    const col = avatarColor(member.name);
    const size = large ? 200 : 160;
    return (
        <Reveal>
            <div className="team-profile-wrap">
                {/* Circle photo — no border, no card, no outline; hover handled by CSS */}
                <div className="team-profile-photo" style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    flexShrink: 0,
                    boxShadow: '0 8px 32px rgba(0,0,0,.12)',
                    background: member.image ? '#e2e8f0' : col,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {member.image ? (
                        <img src={member.image} alt={member.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                        <span style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: large ? '2.25rem' : '1.75rem',
                            fontWeight: 900, color: 'white',
                        }}>
                            {initials(member.name)}
                        </span>
                    )}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', fontWeight: 800, color: '#0d1117', marginBottom: '.2rem', letterSpacing: '-.01em' }}>
                    {member.name}
                </h3>
                <p style={{ fontSize: '.82rem', color: '#64748b', marginBottom: (member.linkedin_url || member.facebook_url || member.twitter_url) ? '.75rem' : 0 }}>
                    {member.role}
                </p>
                {(member.linkedin_url || member.facebook_url || member.twitter_url) && (
                    <div style={{ display: 'flex', gap: '.45rem', justifyContent: 'center' }}>
                        {member.linkedin_url && (
                            <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="t-social" aria-label="LinkedIn">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                        )}
                        {member.facebook_url && (
                            <a href={member.facebook_url} target="_blank" rel="noreferrer" className="t-social" aria-label="Facebook">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                        )}
                        {member.twitter_url && (
                            <a href={member.twitter_url} target="_blank" rel="noreferrer" className="t-social" aria-label="Twitter">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </Reveal>
    );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function About() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [sections, setSections] = useState({ who_we_are: null, mission: null, vision: null });
    const [heroIdx, setHeroIdx] = useState(0);

    const heroSlides = [
        '../images/home.jpg',
        '../images/home2.jpg',
        '../images/home3.jpg',
    ];

    const features = [
        { icon: FeatureIcons.inventory, title: 'Inventory Management', desc: 'Track consumables, materials, and tools used across all Fab Lab workstations.' },
        { icon: FeatureIcons.booking, title: 'Machine Booking', desc: 'Reserve machines and equipment with real-time availability and scheduling.' },
        { icon: FeatureIcons.courses, title: 'Course Registration', desc: 'Register for expert-led training programs directly through the platform.' },
        { icon: FeatureIcons.projects, title: 'Project Showcase', desc: 'Explore and publish innovative projects created by students and staff.' },
        { icon: FeatureIcons.analytics, title: 'Lab Analytics', desc: 'Visualize real-time lab usage, machine statistics, and booking trends.' },
    ];

    const facilities = [
        { img: '../images/home.jpg', name: '3D Printing', desc: 'FDM, resin, and multi-material printing for rapid prototyping.' },
        { img: '../images/home2.jpg', name: 'Laser Cutting', desc: 'Trotec Speedy 100/400 for precision cutting and engraving.' },
        { img: '../images/home3.jpg', name: 'CNC Machining', desc: 'ShopBot CNC router and high-precision lathe machines.' },
        { img: '../images/home.jpg', name: 'Electronics Lab', desc: 'PCB fabrication, soldering stations, and component assembly.' },
    ];

    const avatarColors = ['#1a56db', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#dc2626', '#16a34a', '#0284c7', '#9333ea'];
    const avatarColor = (name) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];
    const initials = (name) => (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(p => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/public/about');
                if (res.data.success) {
                    const map = {};
                    res.data.sections.forEach(s => { map[s.section_key] = s; });
                    setSections(map);
                    setTeamMembers(res.data.team_members);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const leader = teamMembers.find(m => m.section === 'leader') || null;
    const fabGuys = teamMembers.filter(m => m.section !== 'leader');

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#0d1117', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

                :root {
                    --blue:       #1a56db;
                    --blue-dk:    #1446b8;
                    --blue-lt:    #e8f0fe;
                    --ink:        #0d1117;
                    --ink-2:      #1e2a3a;
                    --muted:      #64748b;
                    --border:     rgba(0,0,0,0.07);
                    --offwhite:   #f9fafb;
                    --card-bg:    #ffffff;
                    --radius:     1rem;
                    --radius-lg:  1.5rem;
                }
                * { box-sizing:border-box; margin:0; padding:0; }

                /* ── NAV ── */
                .nav-root { position:fixed; top:0; left:0; width:100%; z-index:100; transition:all .35s ease; }
                .nav-root.scrolled { background:rgba(255,255,255,0.93); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); box-shadow:0 1px 0 rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.06); }
                .nav-root.top { background:transparent; }
                .nav-root.top .nav-brand-text .name { color:white; }
                .nav-root.top .nav-brand-text .sub  { color:rgba(255,255,255,.6); }
                .nav-root.top .nav-link             { color:rgba(255,255,255,.85); }
                .nav-root.top .nav-link:hover       { color:white; }
                .nav-root.top .nav-login { background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.3); color:white; }
                .nav-root.top .nav-login:hover { background:rgba(255,255,255,.25); }
                .nav-inner { max-width:82rem; margin:0 auto; padding:0 1.25rem; display:flex; align-items:center; justify-content:space-between; height:72px; }
                .nav-logo-wrap { display:flex; align-items:center; gap:.75rem; text-decoration:none; }
                .nav-logo-circle { width:46px; height:46px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(26,86,219,.35); overflow:hidden; flex-shrink:0; transition:transform .3s,box-shadow .3s; }
                .nav-logo-circle:hover { transform:scale(1.06); }
                .nav-logo-circle img { width:100%; height:100%; object-fit:cover; }
                .nav-logo-circle .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.5rem; color:white; }
                .nav-brand-text .name { font-size:.95rem; font-weight:700; color:var(--ink); display:block; line-height:1.2; transition:color .3s; }
                .nav-brand-text .sub  { font-size:.6rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; display:block; transition:color .3s; }
                /* desktop links */
                .nav-links { display:flex; gap:1.5rem; align-items:center; }
                .nav-link { font-size:.875rem; font-weight:500; color:var(--ink-2); text-decoration:none; position:relative; padding-bottom:2px; transition:color .2s; }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--blue); border-radius:2px; transition:width .25s; }
                .nav-link:hover { color:var(--blue); }
                .nav-link:hover::after { width:100%; }
                .nav-link.active { color:var(--blue); font-weight:600; }
                .nav-link.active::after { width:100%; }
                .nav-root.top .nav-link.active { color:white; }
                .nav-root.top .nav-link.active::after { background:white; }
                .nav-login { padding:.5rem 1.25rem; font-size:.875rem; font-weight:600; color:var(--blue); background:var(--blue-lt); border:1.5px solid rgba(26,86,219,.2); border-radius:9999px; text-decoration:none; transition:all .25s; }
                .nav-login:hover { background:var(--blue); color:white; border-color:var(--blue); }
                /* hamburger */
                .nav-hamburger { display:none; flex-direction:column; justify-content:center; gap:5px; width:40px; height:40px; background:none; border:none; cursor:pointer; padding:6px; border-radius:.5rem; transition:background .2s; flex-shrink:0; }
                .nav-hamburger:hover { background:rgba(0,0,0,.06); }
                .nav-root.top .nav-hamburger:hover { background:rgba(255,255,255,.12); }
                .nav-hamburger span { display:block; width:100%; height:2px; background:var(--ink); border-radius:2px; transition:all .3s; }
                .nav-root.top .nav-hamburger span { background:white; }
                .nav-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
                .nav-hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
                .nav-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
                /* mobile drawer */
                .nav-mobile { display:none; position:fixed; top:72px; left:0; width:100%; background:white; border-bottom:1px solid var(--border); box-shadow:0 8px 32px rgba(0,0,0,.1); z-index:99; padding:1.25rem 1.25rem 1.5rem; flex-direction:column; gap:.25rem; }
                .nav-mobile.open { display:flex; }
                .nav-mobile-link { font-size:1rem; font-weight:500; color:var(--ink-2); text-decoration:none; padding:.75rem 1rem; border-radius:.75rem; transition:background .2s,color .2s; display:block; }
                .nav-mobile-link:hover, .nav-mobile-link.active { background:var(--blue-lt); color:var(--blue); font-weight:600; }
                .nav-mobile-login { display:block; margin-top:.75rem; padding:.85rem; background:var(--blue); color:white; font-weight:700; font-size:1rem; border-radius:.75rem; text-decoration:none; text-align:center; }
                @media (max-width:1024px) { .nav-links { gap:1rem; } .nav-link { font-size:.8rem; } }
                @media (max-width:860px) { .nav-links { display:none; } .nav-hamburger { display:flex; } }

                /* ── HERO ── */
                .hero-section { position:relative; height:100vh; min-height:560px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
                .hero-bg-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; z-index:0; }
                .hero-bg-slide.active { opacity:1; }
                .hero-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.82) 0%,rgba(5,10,25,.6) 50%,rgba(0,60,160,.25) 100%); }
                .hero-grid { position:absolute; inset:0; z-index:2; opacity:.04; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:48px 48px; }
                .hero-content { position:relative; z-index:3; text-align:center; padding:0 1.25rem; max-width:860px; width:100%; }
                .hero-eyebrow { display:inline-flex; align-items:center; gap:.5rem; padding:.35rem 1rem; border-radius:9999px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.9); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.5rem; backdrop-filter:blur(8px); animation:fadeUp .8s ease both, gentleBounce 3s ease-in-out 1s infinite; }
                @keyframes gentleBounce { 0%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}60%{transform:translateY(-3px)} }
                .hero-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#4af; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)} }
                .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,7vw,5.5rem); font-weight:900; color:white; line-height:1.08; letter-spacing:-.03em; margin-bottom:1.25rem; animation:fadeUp .9s .15s ease both; }
                .hero-title .accent { color:#5aacff; font-style:italic; }
                .hero-sub { font-size:clamp(.9rem,2.5vw,1.1rem); color:rgba(255,255,255,.75); max-width:540px; margin:0 auto 2rem; line-height:1.75; animation:fadeUp 1s .3s ease both; }
                .hero-cta { animation:fadeUp 1s .45s ease both; }
                .btn-hero { display:inline-block; padding:.875rem 2.25rem; background:var(--blue); color:white; font-weight:700; font-size:1rem; border-radius:9999px; text-decoration:none; box-shadow:0 8px 32px rgba(26,86,219,.45); transition:all .3s; border:none; cursor:pointer; }
                .btn-hero:hover { background:var(--blue-dk); transform:translateY(-3px); box-shadow:0 14px 40px rgba(26,86,219,.55); }
                @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
                .scroll-hint { position:absolute; bottom:2rem; left:50%; transform:translateX(-50%); z-index:3; display:flex; flex-direction:column; align-items:center; gap:.4rem; color:rgba(255,255,255,.45); font-size:.65rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; animation:scrollBounce 2.5s ease-in-out infinite; }
                @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.45}50%{transform:translateX(-50%) translateY(6px);opacity:.9} }
                @media (max-width:640px) { .scroll-hint { display:none; } }

                /* ── SECTION COMMONS ── */
                .section { padding:4rem 0; }
                @media (min-width:768px) { .section { padding:6rem 0; } }
                .section-alt { background:var(--offwhite); }
                .container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px) { .container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .container { padding:0 2rem; } }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.65rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,3vw,2.5rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; line-height:1.15; }
                .section-title .accent { color:var(--blue); font-style:italic; }
                .section-sub { font-size:.9rem; color:var(--muted); margin-top:.4rem; line-height:1.7; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }
                .center { text-align:center; }
                .center .divider { margin:.75rem auto 0; }

                /* ── ABOUT BLURB ── */
                .about-grid { display:grid; grid-template-columns:1fr; gap:2.5rem; align-items:center; }
                @media (min-width:768px) { .about-grid { grid-template-columns:1fr 1.2fr; gap:3.5rem; } }
                @media (min-width:1024px) { .about-grid { gap:5rem; } }
                .about-text p { font-size:1rem; color:#475569; line-height:1.85; margin-top:1.5rem; }
                .about-img-wrap { border-radius:var(--radius-lg); overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,.12); }
                .about-img-wrap img { width:100%; height:260px; object-fit:cover; display:block; }
                @media (min-width:768px) { .about-img-wrap img { height:320px; } }
                @media (min-width:1024px) { .about-img-wrap img { height:380px; } }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

                /* ── FEATURES ── */
                .features-grid { display:grid; grid-template-columns:1fr; gap:1.25rem; margin-top:3rem; }
                @media (min-width:480px) { .features-grid { grid-template-columns:repeat(2,1fr); } }
                @media (min-width:900px) { .features-grid { grid-template-columns:repeat(3,1fr); gap:1.5rem; } }
                @media (min-width:1200px) { .features-grid { grid-template-columns:repeat(5,1fr); } }
                .feature-card { background:var(--card-bg); border-radius:var(--radius-lg); padding:2rem 1.5rem; border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.04); text-align:center; transition:transform .35s cubic-bezier(.4,0,.2,1),box-shadow .35s; }
                .feature-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,.1); }
                .feature-icon-wrap { width:3.25rem; height:3.25rem; border-radius:1rem; background:var(--offwhite); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; color:var(--ink-2); transition:background .25s,color .25s,border-color .25s; }
                .feature-card:hover .feature-icon-wrap { background:var(--blue); color:white; border-color:var(--blue); box-shadow:0 4px 16px rgba(26,86,219,.3); }
                .feature-card:hover .feature-title { color:var(--blue); }
                .feature-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:800; color:var(--ink); margin-bottom:.5rem; transition:color .25s; }
                .feature-desc  { font-size:.78rem; color:var(--muted); line-height:1.65; }

                /* ── FACILITIES ── */
                .facilities-grid { display:grid; grid-template-columns:1fr; gap:1.25rem; margin-top:3rem; }
                @media (min-width:540px) { .facilities-grid { grid-template-columns:repeat(2,1fr); } }
                @media (min-width:1024px) { .facilities-grid { grid-template-columns:repeat(4,1fr); gap:1.5rem; } }
                .facility-card { border-radius:var(--radius-lg); overflow:hidden; position:relative; box-shadow:0 4px 16px rgba(0,0,0,.08); transition:transform .35s cubic-bezier(.4,0,.2,1),box-shadow .35s; }
                .facility-card:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(0,0,0,.14); }
                .facility-card img { width:100%; height:220px; object-fit:cover; display:block; transition:transform .6s ease; }
                .facility-card:hover img { transform:scale(1.07); }
                .facility-card-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(5,10,25,.75) 0%,transparent 55%); }
                .facility-card-text { position:absolute; bottom:0; left:0; right:0; padding:1.25rem; }
                .facility-name { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:800; color:white; letter-spacing:-.02em; }
                .facility-desc { font-size:.75rem; color:rgba(255,255,255,.75); margin-top:.2rem; line-height:1.5; }

                /* ── MISSION & VISION ── */
                .mv-grid { display:grid; grid-template-columns:1fr; gap:1.25rem; margin-top:3rem; }
                @media (min-width:640px) { .mv-grid { grid-template-columns:1fr 1fr; gap:1.75rem; } }
                .mv-card { background:var(--card-bg); border-radius:var(--radius-lg); padding:2rem; border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.04); }
                @media (min-width:768px) { .mv-card { padding:2.75rem; } }
                .mv-card-icon  { font-size:2rem; margin-bottom:1rem; display:block; }
                .mv-card-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:800; color:var(--ink); margin-bottom:1rem; letter-spacing:-.02em; }
                @media (min-width:768px) { .mv-card-title { font-size:1.35rem; } }
                .mv-card-text  { font-size:.9rem; color:var(--muted); line-height:1.8; }

                /* ── TEAM SECTION ── */
                .team-section { padding:4rem 0; background:var(--offwhite); }
                @media (min-width:768px) { .team-section { padding:6rem 0; } }
                .team-group-label { text-align:center; font-size:.68rem; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--blue); margin-bottom:2.5rem; display:flex; align-items:center; justify-content:center; gap:1rem; }
                .team-group-label::before,.team-group-label::after { content:''; flex:1; max-width:120px; height:1px; background:var(--border); }
                .team-leader-row { display:flex; justify-content:center; margin-bottom:3rem; }
                @media (min-width:768px) { .team-leader-row { margin-bottom:4rem; } }
                .team-fab-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2rem 1.5rem; }
                @media (min-width:640px) { .team-fab-grid { grid-template-columns:repeat(3,1fr); } }
                @media (min-width:1024px) { .team-fab-grid { grid-template-columns:repeat(4,1fr); gap:2.5rem 2rem; } }
                .team-profile-wrap { display:flex; flex-direction:column; align-items:center; text-align:center; transition:transform .35s cubic-bezier(.4,0,.2,1); cursor:default; }
                .team-profile-wrap:hover { transform:translateY(-8px); }
                .team-profile-wrap:hover .team-profile-photo { box-shadow:0 18px 48px rgba(0,0,0,.2); }
                .team-profile-photo { transition:box-shadow .35s; }
                .t-social { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,.05); color:var(--muted); transition:all .22s; text-decoration:none; }
                .t-social:hover { background:var(--blue); color:white; transform:scale(1.1); }

                /* ── FOOTER ── */
                .footer { background:#080d14; padding:4rem 0 0; }
                @media (min-width:768px) { .footer { padding:5rem 0 0; } }
                .footer-grid { display:grid; grid-template-columns:1fr; gap:2rem; padding-bottom:3rem; }
                @media (min-width:640px) { .footer-grid { grid-template-columns:repeat(2,1fr); gap:2.5rem; } }
                @media (min-width:1024px) { .footer-grid { grid-template-columns:1.5fr 1fr 1fr 1.4fr; gap:3rem; } }
                .footer-brand-logo { width:56px; height:56px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:1.25rem; box-shadow:0 4px 18px rgba(26,86,219,.35); }
                .footer-brand-logo img { width:100%; height:100%; object-fit:cover; }
                .footer-brand-logo .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.6rem; color:white; }
                .footer-brand-name { font-size:1.1rem; font-weight:700; color:white; display:block; margin-bottom:.15rem; }
                .footer-brand-sub  { font-size:.68rem; font-weight:500; color:#475569; letter-spacing:.1em; text-transform:uppercase; display:block; margin-bottom:1rem; }
                .footer-about { font-size:.85rem; color:#64748b; line-height:1.75; }
                .footer-col-title { font-size:.7rem; font-weight:700; color:#cbd5e1; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.25rem; display:block; }
                .footer-link { display:block; font-size:.875rem; color:#64748b; text-decoration:none; padding:.3rem 0; transition:color .2s; }
                .footer-link:hover { color:white; }
                .footer-contact-item { display:flex; align-items:flex-start; gap:.75rem; margin-bottom:1rem; }
                .footer-contact-item svg { flex-shrink:0; margin-top:.15rem; }
                .footer-contact-text { font-size:.85rem; color:#64748b; line-height:1.6; }
                .footer-bottom { border-top:1px solid #1a2332; padding:1.5rem 0; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:1rem; text-align:center; }
                @media (min-width:640px) { .footer-bottom { flex-direction:row; justify-content:space-between; text-align:left; } }
                .footer-copy { font-size:.78rem; color:#334155; }
                .footer-socials { display:flex; gap:.875rem; }
                .social-btn { width:38px; height:38px; border-radius:50%; background:#0d1a2e; border:1px solid #1e2d42; display:flex; align-items:center; justify-content:center; color:#64748b; text-decoration:none; transition:all .25s; }
                .social-btn:hover { background:var(--blue); border-color:var(--blue); color:white; transform:translateY(-2px); box-shadow:0 6px 20px rgba(26,86,219,.35); }
            `}</style>

            {/* ═══ NAV ═══ */}
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
                    {/* Desktop links */}
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
                    {/* Hamburger */}
                    <button
                        className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        <span /><span /><span />
                    </button>
                </div>
                {/* Mobile drawer */}
                <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
                    <a href="/" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="/machines" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Machines</a>
                    <a href="/shop" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Shop</a>
                    <a href="/training" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Training</a>
                    <a href="/projects" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Projects</a>
                    <a href="/about" className="nav-mobile-link active" onClick={() => setMenuOpen(false)}>About</a>
                    <a href="/gallery" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Gallery</a>
                    <a href="/faq" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>FAQ</a>
                    <Link to="/login" className="nav-mobile-login" onClick={() => setMenuOpen(false)}>Login / Register</Link>
                </div>
            </nav>

            {/* ═══ HERO — slideshow with local images ═══ */}
            <section className="hero-section">
                {heroSlides.map((src, i) => (
                    <div key={i} className={`hero-bg-slide ${i === heroIdx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${src})` }} />
                ))}
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
                        <button className="btn-hero"
                            onClick={() => document.getElementById('about-content').scrollIntoView({ behavior: 'smooth' })}>
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

            {/* ═══ WHO WE ARE ═══ */}
            <section className="section" id="about-content">
                <div className="container">
                    {loading ? (
                        <div className="about-grid">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="skeleton" style={{ height: 20, width: '30%' }} />
                                <div className="skeleton" style={{ height: 36, width: '70%' }} />
                                <div className="skeleton" style={{ height: 3, width: '3rem' }} />
                                <div className="skeleton" style={{ height: 14, width: '100%', marginTop: '.5rem' }} />
                                <div className="skeleton" style={{ height: 14, width: '90%' }} />
                                <div className="skeleton" style={{ height: 14, width: '95%' }} />
                                <div className="skeleton" style={{ height: 14, width: '80%' }} />
                            </div>
                            <div className="skeleton" style={{ height: 380, borderRadius: '1.5rem' }} />
                        </div>
                    ) : (
                        <div className="about-grid">
                            <Reveal>
                                <div className="about-text">
                                    <span className="section-label">Who We Are</span>
                                    <h2 className="section-title">
                                        {sections.who_we_are?.title || 'JNEC'} <span className="accent">Fab Lab?</span>
                                    </h2>
                                    <div className="divider" />
                                    {sections.who_we_are?.body
                                        ? sections.who_we_are.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
                                        : <p style={{ color: '#475569', marginTop: '1.5rem', lineHeight: '1.85' }}>
                                            The JNEC Fabrication Lab is a state-of-the-art space that brings together cutting-edge digital fabrication tools, innovative teaching methods, and a collaborative community of makers.
                                        </p>
                                    }
                                </div>
                            </Reveal>
                            <Reveal delay={0.15}>
                                <div className="about-img-wrap">
                                    <img
                                        src={sections.who_we_are?.image || '../images/home2.jpg'}
                                        alt="Fab Lab"
                                        onError={e => { e.currentTarget.src = '../images/home.jpg'; }}
                                    />
                                </div>
                            </Reveal>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ PLATFORM FEATURES — black SVG icons ═══ */}
            <section className="section section-alt">
                <div className="container">
                    <Reveal>
                        <div className="center">
                            <span className="section-label">Platform Features</span>
                            <h2 className="section-title">What Our <span className="accent">System</span> Provides</h2>
                            <p className="section-sub" style={{ maxWidth: '480px', margin: '.4rem auto 0' }}>
                                One integrated platform for booking, training, projects, and lab management
                            </p>
                            <div className="divider" />
                        </div>
                    </Reveal>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <Reveal key={i} delay={i * 0.08}>
                                <div className="feature-card">
                                    <div className="feature-icon-wrap">{f.icon}</div>
                                    <h3 className="feature-title">{f.title}</h3>
                                    <p className="feature-desc">{f.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FACILITIES — local images ═══ */}
            <section className="section">
                <div className="container">
                    <Reveal>
                        <div className="center">
                            <span className="section-label">Infrastructure</span>
                            <h2 className="section-title">Fab Lab <span className="accent">Facilities</span></h2>
                            <p className="section-sub" style={{ maxWidth: '440px', margin: '.4rem auto 0' }}>
                                State-of-the-art equipment across four specialised workspaces
                            </p>
                            <div className="divider" />
                        </div>
                    </Reveal>
                    <div className="facilities-grid">
                        {facilities.map((f, i) => (
                            <Reveal key={i} delay={i * 0.09}>
                                <div className="facility-card">
                                    <img src={f.img} alt={f.name}
                                        onError={e => { e.currentTarget.src = '../images/home.jpg'; }} />
                                    <div className="facility-card-overlay" />
                                    <div className="facility-card-text">
                                        <div className="facility-name">{f.name}</div>
                                        <div className="facility-desc">{f.desc}</div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MISSION & VISION ═══ */}
            <section className="section section-alt">
                <div className="container">
                    <Reveal>
                        <div className="center">
                            <span className="section-label">Purpose</span>
                            <h2 className="section-title">Mission & <span className="accent">Vision</span></h2>
                            <div className="divider" />
                        </div>
                    </Reveal>
                    <div className="mv-grid">
                        {loading ? (
                            <>
                                <div className="skeleton" style={{ height: 200, borderRadius: '1.5rem' }} />
                                <div className="skeleton" style={{ height: 200, borderRadius: '1.5rem' }} />
                            </>
                        ) : (
                            <>
                                <Reveal>
                                    <div className="mv-card">
                                        <span className="mv-card-icon">🎯</span>
                                        <h3 className="mv-card-title">{sections.mission?.title || 'Our Mission'}</h3>
                                        <p className="mv-card-text">{sections.mission?.body || 'Empowering the next generation of innovators through accessible digital fabrication tools and hands-on learning experiences.'}</p>
                                    </div>
                                </Reveal>
                                <Reveal delay={0.12}>
                                    <div className="mv-card">
                                        <span className="mv-card-icon">🔭</span>
                                        <h3 className="mv-card-title">{sections.vision?.title || 'Our Vision'}</h3>
                                        <p className="mv-card-text">{sections.vision?.body || 'To be the leading fabrication hub in Bhutan, fostering creativity, technical excellence, and entrepreneurship.'}</p>
                                    </div>
                                </Reveal>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══ MEET OUR TEAM ═══ */}
            <section className="team-section">
                <div className="container">
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                            <span className="section-label">The People</span>
                            <h2 className="section-title">Meet <span className="accent">Our Team</span></h2>
                            <p className="section-sub">The dedicated professionals behind JNEC Fab Lab</p>
                            <div className="divider" style={{ margin: '.75rem auto 0' }} />
                        </div>
                    </Reveal>

                    {loading ? (
                        /* skeleton: 1 large circle + 4 small circles */
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                                    <div className="skeleton" style={{ width: 200, height: 200, borderRadius: '50%' }} />
                                    <div className="skeleton" style={{ height: 16, width: 120 }} />
                                    <div className="skeleton" style={{ height: 12, width: 80 }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '2rem' }}>
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                                        <div className="skeleton" style={{ width: 160, height: 160, borderRadius: '50%' }} />
                                        <div className="skeleton" style={{ height: 14, width: 100 }} />
                                        <div className="skeleton" style={{ height: 11, width: 70 }} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : teamMembers.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem 0' }}>No team members to display.</p>
                    ) : (
                        <>
                            {/* Leader */}
                            {leader && (
                                <>
                                    <div className="team-group-label">Leader</div>
                                    <div className="team-leader-row">
                                        <TeamCircleCard member={leader} large avatarColor={avatarColor} initials={initials} />
                                    </div>
                                </>
                            )}

                            {/* Fab Lab Team */}
                            {fabGuys.length > 0 && (
                                <>
                                    <div className="team-group-label">Fab Lab Team</div>
                                    <div className="team-fab-grid">
                                        {fabGuys.map((member, idx) => (
                                            <Reveal key={member.id} delay={(idx % 4) * 0.08}>
                                                <TeamCircleCard member={member} large={false} avatarColor={avatarColor} initials={initials} />
                                            </Reveal>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="footer">
                <div className="container">
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