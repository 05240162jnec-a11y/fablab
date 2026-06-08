import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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

/* ── Category colour palette (cycles through for any category name) ─────── */
const PALETTES = [
    { color: '#e0f2fe', accent: '#0369a1' },
    { color: '#fef3c7', accent: '#92400e' },
    { color: '#dcfce7', accent: '#065f46' },
    { color: '#fce7f3', accent: '#9d174d' },
    { color: '#ede9fe', accent: '#5b21b6' },
    { color: '#fee2e2', accent: '#991b1b' },
    { color: '#ecfdf5', accent: '#065f46' },
];
function catPalette(cat, allCats) {
    const idx = allCats.indexOf(cat);
    return PALETTES[idx % PALETTES.length] || PALETTES[0];
}

export default function FAQ() {
    const [scrolled, setScrolled] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setCategory] = useState('All');
    const [searchQuery, setSearch] = useState('');
    const [expandedId, setExpanded] = useState(null);
    const [heroIdx, setHeroIdx] = useState(0);

    const heroSlides = [
        '../images/home.jpg',
        '../images/home2.jpg',
        '../images/home3.jpg',
    ];

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(p => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/home/faq`);
                if (res.ok) {
                    const d = await res.json();
                    setFaqs(d.faqs || d.data || d);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const toggle = (id) => setExpanded(expandedId === id ? null : id);

    /* derive categories from real data */
    const allCatNames = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));
    const categories = ['All', ...allCatNames];

    const filtered = faqs.filter(f => {
        const matchCat = activeCategory === 'All' || f.category === activeCategory;
        const matchSearch = !searchQuery ||
            f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const catCount = (cat) => cat === 'All'
        ? faqs.length
        : faqs.filter(f => f.category === cat).length;

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
                .nav-root.top .nav-link.active      { color:white; }
                .nav-root.top .nav-link.active::after { background:white; }
                .nav-root.top .nav-login { background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.3); color:white; }
                .nav-root.top .nav-login:hover { background:rgba(255,255,255,.25); }
                .nav-inner { max-width:82rem; margin:0 auto; padding:0 2rem; display:flex; align-items:center; justify-content:space-between; height:76px; }
                .nav-logo-wrap { display:flex; align-items:center; gap:.875rem; text-decoration:none; }
                .nav-logo-circle { width:52px; height:52px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(26,86,219,.35); overflow:hidden; flex-shrink:0; transition:transform .3s,box-shadow .3s; }
                .nav-logo-circle:hover { transform:scale(1.06); }
                .nav-logo-circle img { width:100%; height:100%; object-fit:cover; }
                .nav-logo-circle .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.5rem; color:white; }
                .nav-brand-text .name { font-size:1rem; font-weight:700; color:var(--ink); display:block; line-height:1.2; transition:color .3s; }
                .nav-brand-text .sub  { font-size:.65rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; display:block; transition:color .3s; }
                .nav-links { display:flex; gap:1.75rem; align-items:center; }
                .nav-link { font-size:.875rem; font-weight:500; color:var(--ink-2); text-decoration:none; position:relative; padding-bottom:2px; transition:color .2s; }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--blue); border-radius:2px; transition:width .25s; }
                .nav-link:hover { color:var(--blue); }
                .nav-link:hover::after { width:100%; }
                .nav-link.active { color:var(--blue); font-weight:600; }
                .nav-link.active::after { width:100%; }
                .nav-login { padding:.5rem 1.4rem; font-size:.875rem; font-weight:600; color:var(--blue); background:var(--blue-lt); border:1.5px solid rgba(26,86,219,.2); border-radius:9999px; text-decoration:none; transition:all .25s; }
                .nav-login:hover { background:var(--blue); color:white; border-color:var(--blue); }

                /* ── HERO ── */
                .hero-section { position:relative; padding-top:76px; background:var(--ink); overflow:hidden; }
                .hero-bg-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; z-index:0; }
                .hero-bg-slide.active { opacity:1; }
                .hero-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.88) 0%,rgba(5,10,25,.75) 55%,rgba(10,30,90,.6) 100%); }
                .hero-grid { position:absolute; inset:0; z-index:2; opacity:.04; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:48px 48px; }
                .hero-glow  { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(26,86,219,.2) 0%,transparent 70%); top:-200px; right:-100px; pointer-events:none; z-index:2; }
                .hero-glow2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(90,172,255,.1) 0%,transparent 70%); bottom:-100px; left:5%; pointer-events:none; z-index:2; }
                .hero-inner { max-width:82rem; margin:0 auto; padding:5rem 2rem 0; position:relative; z-index:3; text-align:center; }

                /* bouncing eyebrow */
                .hero-eyebrow { display:inline-flex; align-items:center; gap:.5rem; padding:.3rem .9rem; border-radius:9999px; background:rgba(26,86,219,.15); border:1px solid rgba(26,86,219,.3); color:#7abaff; font-size:.7rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.25rem; animation:eyebrowIn .8s ease both, gentleBounce 3s ease-in-out 1s infinite; }
                @keyframes eyebrowIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                @keyframes gentleBounce { 0%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}60%{transform:translateY(-3px)} }
                .hero-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#7abaff; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)} }

                .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.5rem,5vw,4rem); font-weight:900; color:white; letter-spacing:-.03em; line-height:1.05; margin-bottom:1rem; animation:eyebrowIn .9s .15s ease both; }
                .hero-title .accent { color:#7abaff; font-style:italic; }
                .hero-subtitle { font-size:1rem; color:rgba(255,255,255,.6); max-width:460px; margin:0 auto 2.5rem; line-height:1.75; animation:eyebrowIn 1s .3s ease both; }

                /* Hero search */
                .hero-search-wrap { max-width:520px; margin:0 auto; display:flex; align-items:center; gap:.75rem; background:rgba(255,255,255,.08); border:1.5px solid rgba(255,255,255,.15); border-radius:9999px; padding:.6rem .6rem .6rem 1.25rem; backdrop-filter:blur(12px); transition:border-color .2s,box-shadow .2s; animation:eyebrowIn 1s .45s ease both; }
                .hero-search-wrap:focus-within { border-color:rgba(26,86,219,.6); box-shadow:0 0 0 4px rgba(26,86,219,.15); }
                .hero-search-wrap svg { flex-shrink:0; color:rgba(255,255,255,.4); }
                .hero-search-wrap input { flex:1; border:none; background:transparent; outline:none; font-size:.95rem; color:white; font-family:inherit; }
                .hero-search-wrap input::placeholder { color:rgba(255,255,255,.35); }
                .hero-search-clear { padding:.5rem 1.1rem; background:var(--blue); color:white; font-size:.8rem; font-weight:700; border-radius:9999px; border:none; cursor:pointer; transition:background .2s; white-space:nowrap; flex-shrink:0; }
                .hero-search-clear:hover { background:var(--blue-dk); }

                /* Hero stats strip */
                .hero-stats { display:flex; justify-content:center; gap:3.5rem; padding:2.75rem 0; border-top:1px solid rgba(255,255,255,.07); margin-top:3rem; animation:eyebrowIn 1s .6s ease both; }
                .hstat-num   { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:900; color:white; display:block; line-height:1; }
                .hstat-label { font-size:.68rem; font-weight:600; color:rgba(255,255,255,.4); letter-spacing:.1em; text-transform:uppercase; margin-top:.2rem; display:block; }

                /* ── LAYOUT ── */
                .faq-section { padding:4rem 0 6rem; }
                .faq-container { max-width:82rem; margin:0 auto; padding:0 2rem; }
                .faq-layout { display:grid; grid-template-columns:280px 1fr; gap:3rem; align-items:start; }

                /* ── SIDEBAR ── */
                .sidebar { position:sticky; top:calc(76px + 1.5rem); }
                .sidebar-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.04); padding:1.75rem; }
                .sidebar-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:800; color:var(--ink); margin-bottom:1.25rem; letter-spacing:-.01em; }
                .cat-btn { display:flex; align-items:center; justify-content:space-between; width:100%; padding:.65rem .9rem; border-radius:.75rem; border:none; cursor:pointer; font-family:inherit; font-size:.875rem; font-weight:500; color:var(--muted); background:transparent; transition:all .2s; margin-bottom:.35rem; text-align:left; }
                .cat-btn:hover { background:var(--offwhite); color:var(--ink); }
                .cat-btn.active { background:var(--blue-lt); color:var(--blue); font-weight:700; }
                .cat-btn-left { display:flex; align-items:center; gap:.6rem; }
                .cat-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
                .cat-count { font-size:.72rem; font-weight:700; padding:.15rem .5rem; border-radius:9999px; background:rgba(0,0,0,.06); color:var(--muted); }
                .cat-btn.active .cat-count { background:rgba(26,86,219,.15); color:var(--blue); }

                /* Skeleton sidebar */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

                /* Sidebar contact card */
                .sidebar-contact { background:var(--ink); border-radius:var(--radius-lg); padding:1.5rem; margin-top:1.25rem; }
                .sidebar-contact h4 { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:white; margin-bottom:.5rem; }
                .sidebar-contact p  { font-size:.8rem; color:rgba(255,255,255,.55); line-height:1.65; margin-bottom:1rem; }
                .btn-contact { display:block; width:100%; padding:.65rem; background:var(--blue); color:white; font-size:.82rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; text-align:center; text-decoration:none; transition:background .25s; }
                .btn-contact:hover { background:var(--blue-dk); }

                /* ── ACCORDION ── */
                .faq-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.65rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; }
                .results-label { font-size:.82rem; color:var(--muted); font-weight:500; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }

                .accordion-list { display:flex; flex-direction:column; gap:1rem; }
                .accordion-item { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; transition:box-shadow .25s,border-color .25s; }
                .accordion-item.open { border-color:var(--blue); box-shadow:0 4px 20px rgba(26,86,219,.1); }
                .accordion-trigger { width:100%; display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1.4rem 1.75rem; background:transparent; border:none; cursor:pointer; text-align:left; transition:background .2s; }
                .accordion-trigger:hover { background:var(--offwhite); }
                .trigger-left { display:flex; align-items:center; gap:1rem; flex:1; min-width:0; }
                .trigger-cat-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
                .trigger-question { font-size:.975rem; font-weight:700; color:var(--ink); letter-spacing:-.01em; }
                .accordion-item.open .trigger-question { color:var(--blue); }
                .trigger-badge { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.2rem .6rem; border-radius:9999px; flex-shrink:0; }
                .chevron { flex-shrink:0; color:var(--muted); transition:transform .3s ease; }
                .accordion-item.open .chevron { transform:rotate(180deg); color:var(--blue); }
                .accordion-body { max-height:0; overflow:hidden; transition:max-height .4s ease; }
                .accordion-item.open .accordion-body { max-height:500px; }
                .accordion-body-inner { padding:0 1.75rem 1.5rem; border-top:1px solid var(--border); padding-top:1.25rem; }
                .accordion-answer { font-size:.9rem; color:#475569; line-height:1.8; }

                /* Skeleton accordion */
                .skeleton-accordion { display:flex; flex-direction:column; gap:1rem; }
                .skeleton-accordion-item { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); padding:1.4rem 1.75rem; display:flex; align-items:center; gap:1rem; }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:4rem 0; color:var(--muted); }
                .empty-state svg { color:#cbd5e1; margin:0 auto 1.25rem; display:block; }
                .empty-state h3 { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--ink); margin-bottom:.5rem; }
                .empty-state p { font-size:.9rem; }

                /* ── CTA STRIP ── */
                .cta-strip { background:var(--ink); padding:4rem 0; position:relative; overflow:hidden; }
                .cta-glow { position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(26,86,219,.18) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
                .cta-inner { max-width:60rem; margin:0 auto; padding:0 2rem; display:flex; align-items:center; justify-content:space-between; gap:3rem; position:relative; z-index:1; }
                .cta-text h2 { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,3vw,2.2rem); font-weight:900; color:white; letter-spacing:-.03em; margin-bottom:.5rem; }
                .cta-text p  { font-size:.9rem; color:rgba(255,255,255,.55); line-height:1.7; }
                .cta-actions { display:flex; gap:.875rem; flex-shrink:0; }
                .btn-cta-primary { padding:.8rem 2rem; background:var(--blue); color:white; font-weight:700; font-size:.9rem; border-radius:9999px; text-decoration:none; display:inline-block; box-shadow:0 8px 24px rgba(26,86,219,.4); transition:all .3s; border:none; cursor:pointer; }
                .btn-cta-primary:hover { background:var(--blue-dk); transform:translateY(-2px); }
                .btn-cta-outline { padding:.8rem 2rem; background:transparent; color:rgba(255,255,255,.8); font-weight:600; font-size:.9rem; border-radius:9999px; text-decoration:none; display:inline-block; border:1.5px solid rgba(255,255,255,.2); transition:all .3s; }
                .btn-cta-outline:hover { border-color:rgba(255,255,255,.5); color:white; background:rgba(255,255,255,.05); }

                /* ── FOOTER ── */
                .footer { background:#080d14; padding:5rem 0 0; }
                .footer-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr 1.4fr; gap:3rem; padding-bottom:3.5rem; }
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
                .footer-bottom { border-top:1px solid #1a2332; padding:1.5rem 0; display:flex; justify-content:space-between; align-items:center; }
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
                    <div className="nav-links">
                        <a href="/" className="nav-link">Home</a>
                        <a href="/machines" className="nav-link">Machines</a>
                        <a href="/shop" className="nav-link">Shop</a>
                        <a href="/training" className="nav-link">Training</a>
                        <a href="/projects" className="nav-link">Projects</a>
                        <a href="/about" className="nav-link">About</a>
                        <a href="/gallery" className="nav-link">Gallery</a>
                        <a href="/faq" className="nav-link active">FAQ</a>
                        <Link to="/login" className="nav-login">Login</Link>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <div className="hero-section">
                {heroSlides.map((src, i) => (
                    <div key={i} className={`hero-bg-slide ${i === heroIdx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${src})` }} />
                ))}
                <div className="hero-overlay" />
                <div className="hero-grid" />
                <div className="hero-glow" />
                <div className="hero-glow2" />
                <div className="hero-inner">
                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot" />
                        Help Centre
                    </div>
                    <h1 className="hero-title">
                        Frequently Asked <span className="accent">Questions</span>
                    </h1>
                    <p className="hero-subtitle">
                        Find quick answers about machines, booking, training, projects, and system usage.
                    </p>
                    {/* Search */}
                    <div className="hero-search-wrap">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            placeholder="Search questions…"
                            value={searchQuery}
                            onChange={e => { setSearch(e.target.value); setExpanded(null); }}
                        />
                        {searchQuery && (
                            <button className="hero-search-clear" onClick={() => setSearch('')}>Clear</button>
                        )}
                    </div>
                    {/* Stats */}
                    <div className="hero-stats">
                        {[
                            [loading ? '…' : faqs.length, 'Questions'],
                            [loading ? '…' : allCatNames.length, 'Categories'],
                        ].map(([n, l]) => (
                            <div key={l} style={{ textAlign: 'center' }}>
                                <span className="hstat-num">{n}</span>
                                <span className="hstat-label">{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ FAQ CONTENT ═══ */}
            <section className="faq-section">
                <div className="faq-container">
                    <div className="faq-layout">

                        {/* ── Sidebar ── */}
                        <aside className="sidebar">
                            <div className="sidebar-card">
                                <h3 className="sidebar-title">Categories</h3>
                                {loading ? (
                                    /* skeleton category buttons */
                                    [80, 100, 90, 110, 85].map((w, i) => (
                                        <div key={i} className="skeleton" style={{ height: 38, marginBottom: '.35rem', borderRadius: '.75rem', width: `${w}%` }} />
                                    ))
                                ) : (
                                    categories.map(cat => {
                                        const pal = cat === 'All' ? { accent: '#1a56db' } : catPalette(cat, allCatNames);
                                        return (
                                            <button key={cat} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                                onClick={() => { setCategory(cat); setExpanded(null); }}>
                                                <span className="cat-btn-left">
                                                    {cat === 'All' && (
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                        </svg>
                                                    )}
                                                    {cat}
                                                </span>
                                                <span className="cat-count">{catCount(cat)}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </aside>

                        {/* ── Accordion ── */}
                        <div>
                            <Reveal>
                                <div className="faq-header">
                                    <div>
                                        <span className="section-label">
                                            {activeCategory === 'All' ? 'All Questions' : activeCategory}
                                        </span>
                                        <h2 className="section-title">
                                            {searchQuery ? `Results for "${searchQuery}"` : 'Frequently Asked Questions'}
                                        </h2>
                                        <div className="divider" />
                                    </div>
                                    <span className="results-label">
                                        {loading ? '…' : `${filtered.length} question${filtered.length !== 1 ? 's' : ''}`}
                                    </span>
                                </div>
                            </Reveal>

                            {loading ? (
                                /* skeleton accordion items */
                                <div className="skeleton-accordion">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div key={i} className="skeleton-accordion-item">
                                            <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
                                            <div className="skeleton" style={{ flex: 1, height: 14 }} />
                                            <div className="skeleton" style={{ width: 60, height: 20, borderRadius: '9999px' }} />
                                            <div className="skeleton" style={{ width: 18, height: 18, borderRadius: '.35rem', flexShrink: 0 }} />
                                        </div>
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="empty-state">
                                    <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3>No questions found</h3>
                                    <p>Try a different search term or select another category.</p>
                                </div>
                            ) : (
                                <div className="accordion-list">
                                    {filtered.map((faq, idx) => {
                                        const pal = catPalette(faq.category, allCatNames);
                                        const isOpen = expandedId === faq.id;
                                        return (
                                            <Reveal key={faq.id} delay={Math.min(idx * 0.05, 0.3)}>
                                                <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
                                                    <button className="accordion-trigger" onClick={() => toggle(faq.id)}>
                                                        <div className="trigger-left">
                                                            <span className="trigger-question">{faq.question}</span>
                                                        </div>
                                                        {faq.category && (
                                                            <span className="trigger-badge"
                                                                style={{ background: 'var(--offwhite)', color: 'var(--muted)' }}>
                                                                {faq.category}
                                                            </span>
                                                        )}
                                                        <svg className="chevron" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <div className="accordion-body">
                                                        <div className="accordion-body-inner">
                                                            <p className="accordion-answer">{faq.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Reveal>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CTA STRIP ═══ */}
            <Reveal>
                <div className="cta-strip">
                    <div className="cta-glow" />
                    <div className="cta-inner">
                        <div className="cta-text">
                            <h2>Still have a question?</h2>
                            <p>Our team is ready to help. Reach out or create an account to get started with the Fab Lab.</p>
                        </div>
                        <div className="cta-actions">
                            <Link to="/register" className="btn-cta-primary">Create Account</Link>
                            <a href="/contact" className="btn-cta-outline">Contact Us</a>
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* ═══ FOOTER ═══ */}
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