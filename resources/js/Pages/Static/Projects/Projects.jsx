import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* initials from name */
function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

/* deterministic colour from name */
const AVATAR_COLORS = ['#1a56db', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#dc2626', '#16a34a'];
function avatarColor(name = '') {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

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

/* ── Project Detail Modal ───────────────────────────────────────────────── */
function ProjectModal({ project, onClose, isLoggedIn }) {
    if (!project) return null;
    const col = avatarColor(project.user?.name || '');

    const handleDownload = () => {
        if (!isLoggedIn) return;
        window.open(`${API_BASE}/user/projects/${project.id}/download`, '_blank');
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="modal-inner">
                    {/* Avatar side */}
                    <div className="modal-avatar-side" style={{ background: `${col}12` }}>
                        <div className="modal-avatar-circle" style={{ background: col }}>
                            {initials(project.user?.name)}
                        </div>
                        <p className="modal-avatar-name">{project.user?.name || 'Unknown'}</p>
                        {project.submitted_at && (
                            <p className="modal-avatar-date">Submitted {formatDate(project.submitted_at)}</p>
                        )}
                        {project.reviewed_at && (
                            <p className="modal-avatar-date">Approved {formatDate(project.reviewed_at)}</p>
                        )}
                    </div>

                    {/* Info side */}
                    <div className="modal-info-side">
                        <span className="modal-approved-badge">✓ Approved</span>
                        <h2 className="modal-title">{project.title}</h2>
                        {project.description && (
                            <p className="modal-desc">{project.description}</p>
                        )}
                        {project.admin_comments && (
                            <div className="modal-comment">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, color: 'var(--blue)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span><strong>Reviewer note:</strong> {project.admin_comments}</span>
                            </div>
                        )}
                        <div className="modal-actions">
                            {project.document_path && (
                                isLoggedIn ? (
                                    <button className="btn-modal-download" onClick={handleDownload}>
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Document
                                    </button>
                                ) : (
                                    <Link to="/login" className="btn-modal-download" onClick={onClose}>
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Login to Download
                                    </Link>
                                )
                            )}
                            <button className="btn-modal-close-action" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [heroIdx, setHeroIdx] = useState(0);
    const [selected, setSelected] = useState(null);

    const isLoggedIn = !!localStorage.getItem('token');

    const heroSlides = [
        '../images/home.jpg',
        '../images/home2.jpg',
        '../images/home3.jpg',
    ];

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(p => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') setSelected(null); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Accept': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // Try public endpoint first, fallback to admin
                let res = await fetch(`${API_BASE}/home/projects`, { headers });
                if (!res.ok) {
                    res = await fetch(`${API_BASE}/admin/projects`, { headers });
                }
                if (res.ok) {
                    const d = await res.json();
                    const all = d.data || d;
                    // Public page only shows approved projects
                    setProjects(Array.isArray(all) ? all.filter(p => p.status === 'approved') : []);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    /* filter by search */
    const displayed = projects.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        (p.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
    );

    const contributors = new Set(projects.map(p => p.user?.name)).size;

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
                    --green-lt:   #dcfce7;
                    --green-dk:   #0f7a38;
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
                .nav-root { position:fixed; top:0; left:0; width:100%; z-index:100; background:rgba(255,255,255,0.93); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); box-shadow:0 1px 0 rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.06); }
                .nav-inner { max-width:82rem; margin:0 auto; padding:0 2rem; display:flex; align-items:center; justify-content:space-between; height:76px; }
                .nav-logo-wrap { display:flex; align-items:center; gap:.875rem; text-decoration:none; }
                .nav-logo-circle { width:52px; height:52px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(26,86,219,.35); overflow:hidden; flex-shrink:0; transition:transform .3s,box-shadow .3s; }
                .nav-logo-circle:hover { transform:scale(1.06); }
                .nav-logo-circle img { width:100%; height:100%; object-fit:cover; }
                .nav-logo-circle .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.5rem; color:white; }
                .nav-brand-text .name { font-size:1rem; font-weight:700; color:var(--ink); letter-spacing:-.01em; display:block; line-height:1.2; }
                .nav-brand-text .sub  { font-size:.65rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; display:block; }
                .nav-links { display:flex; gap:1.75rem; align-items:center; }
                .nav-link { font-size:.875rem; font-weight:500; color:var(--ink-2); text-decoration:none; position:relative; padding-bottom:2px; transition:color .2s; }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--blue); border-radius:2px; transition:width .25s; }
                .nav-link:hover { color:var(--blue); }
                .nav-link:hover::after { width:100%; }
                .nav-link.active { color:var(--blue); font-weight:600; }
                .nav-link.active::after { width:100%; }
                .nav-login { padding:.5rem 1.4rem; font-size:.875rem; font-weight:600; color:var(--blue); background:var(--blue-lt); border:1.5px solid rgba(26,86,219,.2); border-radius:9999px; text-decoration:none; transition:all .25s; }
                .nav-login:hover { background:var(--blue); color:white; border-color:var(--blue); }

                /* ── PAGE HERO with slideshow ── */
                .page-hero { padding-top:76px; background:var(--ink); position:relative; overflow:hidden; }
                .hero-bg-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; z-index:0; }
                .hero-bg-slide.active { opacity:1; }
                .hero-bg-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.82) 0%,rgba(5,10,25,.68) 55%,rgba(10,30,90,.5) 100%); }
                .page-hero-grid { position:absolute; inset:0; z-index:2; opacity:.04; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:48px 48px; }
                .page-hero-glow  { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(26,86,219,.22) 0%,transparent 70%); top:-200px; right:-100px; pointer-events:none; z-index:2; }
                .page-hero-glow2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(22,163,74,.1) 0%,transparent 70%); bottom:-100px; left:5%; pointer-events:none; z-index:2; }
                .page-hero-inner { max-width:82rem; margin:0 auto; padding:5rem 2rem 4rem; position:relative; z-index:3; }

                /* bouncing eyebrow */
                .page-eyebrow { display:inline-flex; align-items:center; gap:.5rem; padding:.3rem .9rem; border-radius:9999px; background:rgba(26,86,219,.18); border:1px solid rgba(26,86,219,.35); color:#7abaff; font-size:.7rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.25rem; animation:eyebrowIn .8s ease both, gentleBounce 3s ease-in-out 1s infinite; }
                @keyframes eyebrowIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                @keyframes gentleBounce { 0%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}60%{transform:translateY(-4px)} }
                .page-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#7abaff; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)} }
                .page-title { font-family:'Playfair Display',serif; font-size:clamp(2.5rem,5vw,4rem); font-weight:900; color:white; letter-spacing:-.03em; line-height:1.05; margin-bottom:1rem; animation:eyebrowIn .9s .15s ease both; }
                .page-title .accent { color:#7abaff; font-style:italic; }
                .page-subtitle { font-size:1rem; color:rgba(255,255,255,.6); max-width:520px; line-height:1.75; animation:eyebrowIn 1s .3s ease both; }
                .page-hero-stats { display:flex; gap:2.5rem; margin-top:3rem; flex-wrap:wrap; animation:eyebrowIn 1s .45s ease both; }
                .phero-stat-num   { font-family:'Playfair Display',serif; font-size:2rem; font-weight:900; color:white; display:block; line-height:1; }
                .phero-stat-label { font-size:.72rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.1em; text-transform:uppercase; margin-top:.25rem; display:block; }

                /* ── CONTROLS BAR ── */
                .controls-bar { background:var(--card-bg); border-bottom:1px solid var(--border); position:sticky; top:76px; z-index:50; box-shadow:0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width:82rem; margin:0 auto; padding:1rem 2rem; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; }
                .results-count { font-size:.8rem; color:var(--muted); font-weight:500; white-space:nowrap; }
                .search-wrap { display:flex; align-items:center; gap:.6rem; background:var(--offwhite); border:1.5px solid var(--border); border-radius:9999px; padding:.45rem 1rem; min-width:260px; transition:border-color .2s; }
                .search-wrap:focus-within { border-color:var(--blue); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
                .search-wrap input { border:none; background:transparent; outline:none; font-size:.875rem; color:var(--ink); font-family:inherit; width:100%; }
                .search-wrap input::placeholder { color:#a0aec0; }

                /* ── PROJECTS SECTION ── */
                .projects-main { padding:4.5rem 0 6rem; }
                .projects-container { max-width:82rem; margin:0 auto; padding:0 2rem; }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.65rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; }
                .section-sub { font-size:.925rem; color:var(--muted); margin-top:.4rem; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }

                /* ── PROJECTS GRID — 4 columns ── */
                .projects-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; margin-top:3rem; align-items:stretch; }

                /* ── PROJECT CARD — same height, avatar top, content + button bottom ── */
                .project-card {
                    background: var(--card-bg);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,.04);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
                    cursor: pointer;
                }
                .project-card:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(0,0,0,.1); }

                /* avatar banner top */
                .project-avatar-wrap {
                    height: 130px;
                    display: flex; align-items: center; justify-content: center;
                    position: relative; overflow: hidden; flex-shrink: 0;
                }
                .avatar-deco { position:absolute; border-radius:50%; opacity:.12; }
                .project-avatar {
                    width: 68px; height: 68px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif;
                    font-size: 1.4rem; font-weight: 900; color: white;
                    box-shadow: 0 6px 20px rgba(0,0,0,.2);
                    position: relative; z-index: 1; flex-shrink: 0;
                }

                /* card body */
                .project-body { padding:1.1rem 1.2rem 1.25rem; flex:1; display:flex; flex-direction:column; }
                .project-date  { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--blue); margin-bottom:.3rem; }
                .project-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:var(--ink); margin-bottom:.35rem; letter-spacing:-.01em; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                .project-author { display:flex; align-items:center; gap:.4rem; font-size:.78rem; color:var(--muted); margin-bottom:.65rem; }
                .author-dot { width:5px; height:5px; border-radius:50%; background:var(--blue); flex-shrink:0; }
                .project-desc { font-size:.8rem; color:#64748b; line-height:1.65; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; flex:1; margin-bottom:.875rem; }

                /* spacer pushes buttons to bottom */
                .project-spacer { flex:1; min-height:.25rem; }

                /* action buttons */
                .project-actions { display:flex; gap:.6rem; margin-top:.25rem; }
                .btn-read-more-proj {
                    flex:1; padding:.58rem; text-align:center;
                    background:transparent; color:var(--green);
                    font-size:.8rem; font-weight:700;
                    border-radius:.65rem; border:1.5px solid var(--green);
                    cursor:pointer; transition:all .22s;
                }
                .btn-read-more-proj:hover { background:var(--green); color:white; }
                .btn-download-proj {
                    flex:1; padding:.58rem; text-align:center;
                    background:var(--blue); color:white;
                    font-size:.8rem; font-weight:700;
                    border-radius:.65rem; border:none; cursor:pointer;
                    box-shadow:0 3px 10px rgba(26,86,219,.25);
                    transition:all .22s; display:flex; align-items:center; justify-content:center; gap:.35rem;
                }
                .btn-download-proj:hover { background:var(--blue-dk); box-shadow:0 6px 18px rgba(26,86,219,.35); transform:translateY(-1px); }
                .btn-login-proj {
                    flex:1; padding:.58rem; text-align:center;
                    background:var(--blue); color:white;
                    font-size:.8rem; font-weight:700;
                    border-radius:.65rem; border:none; cursor:pointer;
                    box-shadow:0 3px 10px rgba(26,86,219,.25);
                    transition:all .22s; text-decoration:none; display:flex; align-items:center; justify-content:center;
                }
                .btn-login-proj:hover { background:var(--blue-dk); }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
                .skeleton-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden; }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:5rem 0; color:var(--muted); }
                .empty-state svg { color:#cbd5e1; margin:0 auto 1.25rem; display:block; }
                .empty-state h3 { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--ink); margin-bottom:.5rem; }
                .empty-state p { font-size:.9rem; }

                /* ── MODAL ── */
                .modal-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn .2s ease; }
                @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                .modal-box { background:white; border-radius:1.5rem; width:100%; max-width:780px; position:relative; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:slideUp .25s ease; }
                @keyframes slideUp { from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)} }
                .modal-close { position:absolute; top:1.1rem; right:1.1rem; z-index:10; width:34px; height:34px; border-radius:50%; background:#f1f5f9; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .2s; }
                .modal-close:hover { background:#e2e8f0; color:var(--ink); }
                .modal-inner { display:grid; grid-template-columns:.9fr 1.1fr; min-height:360px; }

                /* avatar side */
                .modal-avatar-side { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:2.5rem 1.5rem; }
                .modal-avatar-circle { width:88px; height:88px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:900; color:white; box-shadow:0 8px 28px rgba(0,0,0,.2); }
                .modal-avatar-name { font-size:.95rem; font-weight:700; color:var(--ink); text-align:center; }
                .modal-avatar-date { font-size:.75rem; color:var(--muted); text-align:center; }

                /* info side */
                .modal-info-side { padding:2.25rem 2rem 2.25rem 1.5rem; display:flex; flex-direction:column; border-left:1px solid var(--border); }
                .modal-approved-badge { display:inline-flex; align-items:center; gap:.35rem; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--green-dk); background:var(--green-lt); padding:.25rem .7rem; border-radius:9999px; margin-bottom:.75rem; width:fit-content; }
                .modal-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:800; color:var(--ink); letter-spacing:-.02em; margin-bottom:.875rem; line-height:1.25; }
                .modal-desc { font-size:.88rem; color:#4a5568; line-height:1.78; flex:1; margin-bottom:1.25rem; }
                .modal-comment { display:flex; align-items:flex-start; gap:.6rem; font-size:.82rem; color:var(--muted); background:var(--blue-lt); padding:.7rem 1rem; border-radius:.65rem; margin-bottom:1.25rem; line-height:1.6; }
                .modal-actions { display:flex; gap:.75rem; margin-top:auto; flex-wrap:wrap; }
                .btn-modal-download { flex:1; padding:.8rem 1rem; background:var(--blue); color:white; font-size:.9rem; font-weight:700; border-radius:.7rem; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(26,86,219,.3); transition:all .25s; display:flex; align-items:center; justify-content:center; gap:.5rem; text-decoration:none; }
                .btn-modal-download:hover { background:var(--blue-dk); box-shadow:0 8px 24px rgba(26,86,219,.4); transform:translateY(-1px); }
                .btn-modal-close-action { padding:.8rem 1.25rem; background:var(--offwhite); color:var(--ink-2); font-size:.9rem; font-weight:600; border-radius:.7rem; border:1.5px solid var(--border); cursor:pointer; transition:all .22s; }
                .btn-modal-close-action:hover { border-color:var(--blue); color:var(--blue); }

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

            {/* MODAL */}
            {selected && (
                <ProjectModal
                    project={selected}
                    onClose={() => setSelected(null)}
                    isLoggedIn={isLoggedIn}
                />
            )}

            {/* ═══ NAV ═══ */}
            <nav className="nav-root">
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

            {/* ═══ HERO ═══ */}
            <div className="page-hero">
                {heroSlides.map((src, i) => (
                    <div key={i} className={`hero-bg-slide ${i === heroIdx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${src})` }} />
                ))}
                <div className="hero-bg-overlay" />
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
                        Explore approved fabrication projects built by our community — from PCB design and CNC machining to embedded systems and 3D printing.
                    </p>
                    <div className="page-hero-stats">
                        {[
                            [loading ? '…' : `${projects.length}+`, 'Approved Projects'],
                            [loading ? '…' : `${contributors}`, 'Contributors'],
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

            {/* ═══ CONTROLS ═══ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    <span className="results-count">
                        {loading ? 'Loading…' : `${displayed.length} project${displayed.length !== 1 ? 's' : ''}`}
                    </span>
                    <div className="search-wrap">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            placeholder="Search projects or authors…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ═══ PROJECTS ═══ */}
            <main className="projects-main">
                <div className="projects-container">
                    <Reveal>
                        <div>
                            <span className="section-label">Gallery</span>
                            <h2 className="section-title">Approved Projects</h2>
                            <p className="section-sub">Community-built fabrication work — reviewed and approved by the Fab Lab team</p>
                            <div className="divider" />
                        </div>
                    </Reveal>

                    {loading ? (
                        <div className="projects-grid">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton" style={{ height: 130 }} />
                                    <div style={{ padding: '1.1rem 1.2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                                        <div className="skeleton" style={{ height: 11, width: '35%' }} />
                                        <div className="skeleton" style={{ height: 18, width: '80%' }} />
                                        <div className="skeleton" style={{ height: 11, width: '50%' }} />
                                        <div className="skeleton" style={{ height: 11, width: '90%' }} />
                                        <div className="skeleton" style={{ height: 11, width: '70%' }} />
                                        <div style={{ display: 'flex', gap: '.6rem', marginTop: '.5rem' }}>
                                            <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: '.65rem' }} />
                                            <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: '.65rem' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayed.length === 0 ? (
                        <div className="empty-state" style={{ marginTop: '3rem' }}>
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No projects found</h3>
                            <p>{search ? 'Try a different search term.' : 'No approved projects yet — check back soon!'}</p>
                        </div>
                    ) : (
                        <div className="projects-grid">
                            {displayed.map((project, idx) => {
                                const col = avatarColor(project.user?.name || '');
                                const hasDoc = !!project.document_path;
                                return (
                                    <Reveal key={project.id} delay={Math.min((idx % 4) * 0.08, 0.3)}>
                                        <div className="project-card" onClick={() => setSelected(project)}>
                                            {/* Avatar banner */}
                                            <div className="project-avatar-wrap" style={{ background: `${col}10` }}>
                                                <div className="avatar-deco" style={{ width: 80, height: 80, background: col, top: -22, right: -22 }} />
                                                <div className="avatar-deco" style={{ width: 44, height: 44, background: col, bottom: 8, left: 14 }} />
                                                <div className="project-avatar" style={{ background: col }}>
                                                    {initials(project.user?.name)}
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="project-body">
                                                {project.submitted_at && (
                                                    <span className="project-date">{formatDate(project.submitted_at)}</span>
                                                )}
                                                <h3 className="project-title">{project.title}</h3>
                                                <div className="project-author">
                                                    <span className="author-dot" />
                                                    {project.user?.name || 'Unknown'}
                                                </div>
                                                {project.description && (
                                                    <p className="project-desc">{project.description}</p>
                                                )}

                                                {/* Spacer pushes buttons to bottom */}
                                                <div className="project-spacer" />

                                                {/* Actions */}
                                                <div className="project-actions">
                                                    <button
                                                        className="btn-read-more-proj"
                                                        onClick={e => { e.stopPropagation(); setSelected(project); }}
                                                    >
                                                        Read More
                                                    </button>
                                                    {hasDoc && (
                                                        isLoggedIn ? (
                                                            <button
                                                                className="btn-download-proj"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    window.open(`${API_BASE}/user/projects/${project.id}/download`, '_blank');
                                                                }}
                                                            >
                                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Docs
                                                            </button>
                                                        ) : (
                                                            <Link
                                                                to="/login"
                                                                className="btn-login-proj"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                Docs
                                                            </Link>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

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