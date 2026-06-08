import React, { useState, useEffect, useRef, useCallback } from 'react';
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
            { threshold: 0.06 }
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

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function Gallery() {
    const [scrolled, setScrolled] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState('All');
    const [catFilter, setCatFilter] = useState('All');
    const [lightbox, setLightbox] = useState(null); // { ...img, idx }
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

    /* fetch gallery */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/home/gallery`);
                if (res.ok) {
                    const d = await res.json();
                    setImages(d.galleries || d.data || d);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    /* lightbox keyboard nav */
    useEffect(() => {
        const fn = e => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowRight' && lightbox) navigate(1);
            if (e.key === 'ArrowLeft' && lightbox) navigate(-1);
        };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [lightbox]);

    /* prevent body scroll when lightbox open */
    useEffect(() => {
        document.body.style.overflow = lightbox ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightbox]);

    /* derive year options from real data */
    const years = ['All', ...Array.from(new Set(
        images.map(i => i.uploadedAt ? new Date(i.uploadedAt).getFullYear().toString() : null).filter(Boolean)
    )).sort((a, b) => b - a)];

    /* derive category options from real data */
    const categories = ['All', ...Array.from(new Set(images.map(i => i.category).filter(Boolean)))];

    /* filter */
    const filtered = images.filter(img => {
        const imgYear = img.uploadedAt ? new Date(img.uploadedAt).getFullYear().toString() : '';
        const matchYear = yearFilter === 'All' || imgYear === yearFilter;
        const matchCat = catFilter === 'All' || img.category === catFilter;
        return matchYear && matchCat;
    });

    const navigate = useCallback((dir) => {
        setLightbox(prev => {
            if (!prev) return null;
            const idx = (prev.idx + dir + filtered.length) % filtered.length;
            return { ...filtered[idx], idx };
        });
    }, [filtered]);

    const openLightbox = (img, idx) => setLightbox({ ...img, idx });

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#0d1117', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

                :root {
                    --blue:       #1a56db;
                    --blue-dk:    #1446b8;
                    --blue-lt:    #e8f0fe;
                    --red:        #e02020;
                    --green:      #16a34a;
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
                .nav-inner { max-width:82rem; margin:0 auto; padding:0 2rem; display:flex; align-items:center; justify-content:space-between; height:76px; }
                .nav-logo-wrap { display:flex; align-items:center; gap:.875rem; text-decoration:none; }
                .nav-logo-circle { width:52px; height:52px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(26,86,219,.35); overflow:hidden; flex-shrink:0; transition:transform .3s,box-shadow .3s; }
                .nav-logo-circle:hover { transform:scale(1.06); }
                .nav-logo-circle img { width:100%; height:100%; object-fit:cover; }
                .nav-logo-circle .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.5rem; color:white; }
                .nav-brand-text .name { font-size:1rem; font-weight:700; color:var(--ink); letter-spacing:-.01em; display:block; line-height:1.2; transition:color .3s; }
                .nav-brand-text .sub  { font-size:.65rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; display:block; transition:color .3s; }
                .nav-links { display:flex; gap:1.75rem; align-items:center; }
                .nav-link { font-size:.875rem; font-weight:500; color:var(--ink-2); text-decoration:none; position:relative; padding-bottom:2px; transition:color .2s; }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--blue); border-radius:2px; transition:width .25s; }
                .nav-link:hover { color:var(--blue); }
                .nav-link:hover::after { width:100%; }
                .nav-link.active { color:var(--blue); font-weight:600; }
                .nav-link.active::after { width:100%; }
                .nav-root.top .nav-link.active { color:white; }
                .nav-root.top .nav-link.active::after { background:white; }
                .nav-login { padding:.5rem 1.4rem; font-size:.875rem; font-weight:600; color:var(--blue); background:var(--blue-lt); border:1.5px solid rgba(26,86,219,.2); border-radius:9999px; text-decoration:none; transition:all .25s; }
                .nav-login:hover { background:var(--blue); color:white; border-color:var(--blue); }

                /* ── HERO with slideshow ── */
                .hero-section { position:relative; height:65vh; min-height:480px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
                .hero-bg-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; z-index:0; }
                .hero-bg-slide.active { opacity:1; }
                .hero-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.85) 0%,rgba(5,10,25,.6) 55%,rgba(0,40,130,.25) 100%); }
                .hero-grid { position:absolute; inset:0; z-index:2; opacity:.04; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:48px 48px; }
                .hero-content { position:relative; z-index:3; text-align:center; padding:0 1.5rem; max-width:760px; }

                /* bouncing eyebrow */
                .hero-eyebrow { display:inline-flex; align-items:center; gap:.5rem; padding:.35rem 1rem; border-radius:9999px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.9); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.5rem; backdrop-filter:blur(8px); animation:fadeUp .8s ease both, gentleBounce 3s ease-in-out 1s infinite; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
                @keyframes gentleBounce { 0%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}60%{transform:translateY(-4px)} }
                .hero-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#4af; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)} }

                .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.5rem,6vw,4.5rem); font-weight:900; color:white; line-height:1.08; letter-spacing:-.03em; margin-bottom:1.25rem; animation:fadeUp .9s .15s ease both; }
                .hero-title .accent { color:#7abaff; font-style:italic; }
                .hero-sub { font-size:1.05rem; color:rgba(255,255,255,.72); max-width:460px; margin:0 auto; line-height:1.75; animation:fadeUp 1s .3s ease both; }
                .hero-stats { display:flex; justify-content:center; gap:3rem; margin-top:2.5rem; animation:fadeUp 1s .45s ease both; }
                .hero-stat-num   { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:900; color:white; display:block; line-height:1; }
                .hero-stat-label { font-size:.68rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.1em; text-transform:uppercase; margin-top:.2rem; display:block; }

                /* ── CONTROLS BAR ── */
                .controls-bar { background:var(--card-bg); border-bottom:1px solid var(--border); position:sticky; top:76px; z-index:50; box-shadow:0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width:82rem; margin:0 auto; padding:.9rem 2rem; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; }
                .filter-group { display:flex; align-items:center; gap:.75rem; }
                .filter-label { font-size:.72rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; white-space:nowrap; }
                .filter-pills { display:flex; gap:.4rem; flex-wrap:wrap; }
                .pill { padding:.35rem .9rem; border-radius:9999px; font-size:.78rem; font-weight:600; cursor:pointer; border:1.5px solid var(--border); background:var(--offwhite); color:var(--muted); transition:all .2s; }
                .pill:hover { border-color:var(--blue); color:var(--blue); }
                .pill.active { background:var(--blue); color:white; border-color:var(--blue); box-shadow:0 4px 12px rgba(26,86,219,.25); }
                .results-count { font-size:.8rem; color:var(--muted); font-weight:500; white-space:nowrap; }
                .controls-sep { width:1px; height:24px; background:var(--border); flex-shrink:0; }

                /* ── GALLERY SECTION ── */
                .gallery-section { padding:4rem 0 6rem; }
                .gallery-container { max-width:82rem; margin:0 auto; padding:0 2rem; }

                /* ── MASONRY ── */
                .masonry-grid { columns:3; column-gap:1.5rem; }
                .masonry-item {
                    break-inside:avoid; margin-bottom:1.5rem;
                    position:relative; border-radius:var(--radius-lg); overflow:hidden;
                    cursor:pointer; box-shadow:0 2px 12px rgba(0,0,0,.08);
                    transition:transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                }
                .masonry-item:hover { transform:translateY(-4px); box-shadow:0 20px 48px rgba(0,0,0,.18); }
                .masonry-item img { width:100%; display:block; transition:transform .6s ease; }
                .masonry-item:hover img { transform:scale(1.04); }

                /* hover overlay */
                .masonry-overlay {
                    position:absolute; inset:0;
                    background:linear-gradient(to top,rgba(5,10,25,.82) 0%,transparent 55%);
                    opacity:0; transition:opacity .3s;
                    display:flex; flex-direction:column; justify-content:flex-end;
                    padding:1.25rem 1.25rem 1rem;
                }
                .masonry-item:hover .masonry-overlay { opacity:1; }
                .overlay-year  { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#7abaff; margin-bottom:.2rem; }
                .overlay-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:white; letter-spacing:-.01em; }
                .overlay-cat   { font-size:.72rem; color:rgba(255,255,255,.6); margin-top:.2rem; }
                /* zoom icon */
                .zoom-icon { position:absolute; top:.85rem; right:.85rem; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); display:flex; align-items:center; justify-content:center; color:white; opacity:0; transition:opacity .3s; backdrop-filter:blur(4px); }
                .masonry-item:hover .zoom-icon { opacity:1; }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
                .masonry-skeleton { columns:3; column-gap:1.5rem; }
                .masonry-skeleton-item { break-inside:avoid; margin-bottom:1.5rem; border-radius:var(--radius-lg); overflow:hidden; }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:5rem 0; color:var(--muted); }
                .empty-state svg { color:#cbd5e1; margin:0 auto 1.25rem; display:block; }
                .empty-state h3 { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--ink); margin-bottom:.5rem; }
                .empty-state p { font-size:.9rem; }

                /* ── LIGHTBOX ── */
                .lightbox-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.97); backdrop-filter:blur(16px); display:flex; align-items:center; justify-content:center; animation:lbFade .25s ease; }
                @keyframes lbFade { from{opacity:0}to{opacity:1} }
                .lightbox-inner { position:relative; max-width:90vw; max-height:90vh; display:flex; flex-direction:column; align-items:center; }
                .lightbox-img { max-width:88vw; max-height:75vh; border-radius:var(--radius-lg); box-shadow:0 32px 80px rgba(0,0,0,.6); object-fit:contain; display:block; animation:lbImg .2s ease; }
                @keyframes lbImg { from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)} }
                .lightbox-info { text-align:center; margin-top:1.25rem; }
                .lightbox-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:800; color:white; }
                .lightbox-meta  { font-size:.82rem; color:rgba(255,255,255,.5); margin-top:.25rem; }
                .lb-close { position:absolute; top:-3rem; right:0; width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; transition:background .2s; }
                .lb-close:hover { background:rgba(255,255,255,.2); }
                .lb-nav { position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; transition:all .2s; }
                .lb-nav:hover { background:var(--blue); border-color:var(--blue); }
                .lb-prev { left:-3.5rem; }
                .lb-next { right:-3.5rem; }
                .lb-counter { position:absolute; bottom:-2.5rem; left:50%; transform:translateX(-50%); font-size:.78rem; color:rgba(255,255,255,.4); font-weight:600; white-space:nowrap; }

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
                        <a href="/gallery" className="nav-link active">Gallery</a>
                        <a href="/faq" className="nav-link">FAQ</a>
                        <Link to="/login" className="nav-login">Login</Link>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
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
                        Visual Archive
                    </div>
                    <h1 className="hero-title">
                        Fab Lab <span className="accent">Gallery</span>
                    </h1>
                    <p className="hero-sub">
                        Photos of activities, workshops, projects, and events captured inside the Fab Lab.
                    </p>
                    <div className="hero-stats">
                        {[
                            [loading ? '…' : `${images.length}+`, 'Photos'],
                            [loading ? '…' : `${years.length - 1}`, 'Years'],
                            [loading ? '…' : `${categories.length - 1}`, 'Categories'],
                        ].map(([n, l]) => (
                            <div key={l} style={{ textAlign: 'center' }}>
                                <span className="hero-stat-num">{n}</span>
                                <span className="hero-stat-label">{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CONTROLS ═══ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    {/* Year filter — derived from real data */}
                    <div className="filter-group">
                        <span className="filter-label">Year</span>
                        <div className="filter-pills">
                            {years.map(y => (
                                <button key={y} className={`pill ${yearFilter === y ? 'active' : ''}`}
                                    onClick={() => setYearFilter(y)}>{y}</button>
                            ))}
                        </div>
                    </div>

                    <div className="controls-sep" />

                    {/* Category filter — derived from real data */}
                    <div className="filter-group">
                        <span className="filter-label">Type</span>
                        <div className="filter-pills">
                            {categories.map(c => (
                                <button key={c} className={`pill ${catFilter === c ? 'active' : ''}`}
                                    onClick={() => setCatFilter(c)}>{c}</button>
                            ))}
                        </div>
                    </div>

                    <span className="results-count">
                        {loading ? 'Loading…' : `${filtered.length} photo${filtered.length !== 1 ? 's' : ''}`}
                    </span>
                </div>
            </div>

            {/* ═══ GALLERY ═══ */}
            <section className="gallery-section">
                <div className="gallery-container">
                    {loading ? (
                        /* Skeleton masonry */
                        <div className="masonry-skeleton">
                            {[280, 200, 340, 220, 300, 180, 250, 320, 200].map((h, i) => (
                                <div key={i} className="masonry-skeleton-item">
                                    <div className="skeleton" style={{ height: h }} />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3>No photos found</h3>
                            <p>Try a different year or category filter.</p>
                        </div>
                    ) : (
                        <div className="masonry-grid">
                            {filtered.map((img, idx) => {
                                const year = img.uploadedAt ? new Date(img.uploadedAt).getFullYear() : '';
                                return (
                                    <Reveal key={img.id} delay={Math.min((idx % 3) * 0.08, 0.25)}>
                                        <div
                                            className="masonry-item"
                                            onClick={() => openLightbox(img, idx)}
                                        >
                                            <img
                                                src={img.image}
                                                alt={img.title}
                                                loading="lazy"
                                                onError={e => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <div className="masonry-overlay">
                                                {year && <span className="overlay-year">{year}</span>}
                                                <div className="overlay-title">{img.title}</div>
                                                {img.category && <div className="overlay-cat">{img.category}</div>}
                                            </div>
                                            <div className="zoom-icon">
                                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ LIGHTBOX ═══ */}
            {lightbox && (
                <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
                    <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
                        <button className="lb-close" onClick={() => setLightbox(null)}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {filtered.length > 1 && (
                            <>
                                <button className="lb-nav lb-prev" onClick={() => navigate(-1)}>
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button className="lb-nav lb-next" onClick={() => navigate(1)}>
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <img src={lightbox.image} alt={lightbox.title} className="lightbox-img" />

                        <div className="lightbox-info">
                            <div className="lightbox-title">{lightbox.title}</div>
                            <div className="lightbox-meta">
                                {lightbox.category && `${lightbox.category}`}
                                {lightbox.uploadedAt && ` · ${new Date(lightbox.uploadedAt).getFullYear()}`}
                                {lightbox.description && ` · ${lightbox.description}`}
                            </div>
                        </div>

                        <div className="lb-counter">{lightbox.idx + 1} / {filtered.length}</div>
                    </div>
                </div>
            )}

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