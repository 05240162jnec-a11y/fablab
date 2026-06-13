import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}`;

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}
const AVATAR_COLORS = ['#1a56db', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#dc2626', '#16a34a'];
function avatarColor(name = '') {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

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
            minWidth: 0, width: '100%',
            ...style
        }}>{children}</div>
    );
}

function ProjectModal({ project, onClose, isLoggedIn, isRegularUser, userRole }) {
    if (!project) return null;
    const col = avatarColor(project.user?.name || '');
    const handleDownload = () => {
        if (!isLoggedIn) return;
        if (userRole === 'admin') { window.location.href = '/admin/projects'; return; }
        if (userRole === 'production_team') { window.location.href = '/production-team/projects'; return; }
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
                    <div className="modal-avatar-side" style={{ background: `${col}22` }}>
                        {project.student_photo ? (
                            <img className="modal-avatar-side-img" src={project.student_photo} alt={project.user?.name}
                                onError={e => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                            <div className="modal-avatar-side-fallback" style={{ background: `${col}22` }}>
                                <div className="modal-avatar-circle" style={{ background: col }}>
                                    {initials(project.user?.name)}
                                </div>
                            </div>
                        )}
                        <div className="modal-avatar-gradient" />
                        <div className="modal-avatar-info">
                            <p className="modal-avatar-name">{project.user?.name || 'Unknown'}</p>
                            {project.submitted_at && <p className="modal-avatar-date">Submitted {formatDate(project.submitted_at)}</p>}
                            {project.reviewed_at && <p className="modal-avatar-date">Approved {formatDate(project.reviewed_at)}</p>}
                        </div>
                    </div>
                    <div className="modal-info-side">
                        <span className="modal-approved-badge">✓ Approved</span>
                        <h2 className="modal-title">{project.title}</h2>
                        {project.description && <p className="modal-desc">{project.description}</p>}
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
                                isLoggedIn && isRegularUser ? (
                                    <button className="btn-modal-download" onClick={handleDownload}>
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Document
                                    </button>
                                ) : isLoggedIn && userRole === 'admin' ? (
                                    <a href="/admin/projects" className="btn-modal-download">
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Manage Projects
                                    </a>
                                ) : isLoggedIn && userRole === 'production_team' ? (
                                    <a href="/production-team/projects" className="btn-modal-download">
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Manage Projects
                                    </a>
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

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [heroIdx, setHeroIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    // ✅ Role restriction modal
    const [showRoleModal, setShowRoleModal] = useState(false);
    const restrictAlert = () => setShowRoleModal(true);


    const isLoggedIn = !!sessionStorage.getItem('auth_token');
    const userRole = (() => { try { return JSON.parse(sessionStorage.getItem('user') || '{}')?.role; } catch { return null; } })();
    const isRegularUser = !isLoggedIn || (userRole !== 'admin' && userRole !== 'production_team');
    const getProjectsLink = () => {
        if (!isLoggedIn) return '/projects';
        if (userRole === 'admin') return '/admin/projects';
        if (userRole === 'production_team') return '/production-team/projects';
        return '/user/projects';
    };
    const restrictUser = (cb) => {
        if (!isLoggedIn) { navigate('/login'); return; }
        if (!isRegularUser) { restrictAlert(); return; }
        cb();
    };
    const handleLogout = () => {
        sessionStorage.clear();
        ['auth_token', 'user', 'enrollments', 'courses', 'bookings', 'machines', 'cart_items'].forEach(k => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        window.location.href = '/';
    };

    // ✅ REMOVED: Auto-redirect for logged-in users

    const heroSlides = ['../images/home.jpg', '../images/home2.jpg', '../images/home3.jpg'];

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
                const token = sessionStorage.getItem('auth_token');
                const headers = { 'Accept': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                let res = await fetch(`${API_BASE}/home/projects`, { headers });
                if (!res.ok) res = await fetch(`${API_BASE}/admin/projects`, { headers });
                if (res.ok) {
                    const d = await res.json();
                    const all = d.data || d;
                    setProjects(Array.isArray(all) ? all.filter(p => p.status === 'approved') : []);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const displayed = projects.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        (p.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
    );
    const contributors = new Set(projects.map(p => p.user?.name)).size;

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#0d1117', overflowX: 'hidden', maxWidth: '100vw' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

                :root {
                    --blue:     #1a56db;
                    --blue-dk:  #1446b8;
                    --blue-lt:  #e8f0fe;
                    --red:      #e02020;
                    --green:    #16a34a;
                    --green-lt: #dcfce7;
                    --green-dk: #0f7a38;
                    --ink:      #0d1117;
                    --ink-2:    #1e2a3a;
                    --muted:    #64748b;
                    --border:   rgba(0,0,0,0.07);
                    --offwhite: #f9fafb;
                    --card-bg:  #ffffff;
                    --radius:   1rem;
                    --radius-lg:1.5rem;
                }
                * { box-sizing:border-box; margin:0; padding:0; }

                /* ── NAV ── */
                .nav-root { position:fixed; top:0; left:0; width:100%; z-index:100; background:rgba(255,255,255,.93); backdrop-filter:blur(20px); box-shadow:0 1px 0 rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.06); }
                .nav-inner { max-width:82rem; margin:0 auto; padding:0 1.25rem; display:flex; align-items:center; justify-content:space-between; height:72px; }
                @media (min-width:640px)  { .nav-inner { padding:0 1.75rem; } }
                @media (min-width:1024px) { .nav-inner { padding:0 2rem; } }
                .nav-logo-wrap { display:flex; align-items:center; gap:.75rem; text-decoration:none; }
                .nav-logo-circle { width:44px; height:44px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; transition:transform .3s; }
                .nav-logo-circle:hover { transform:scale(1.06); }
                .nav-logo-circle img { width:100%; height:100%; object-fit:cover; }
                .nav-logo-circle .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.4rem; color:white; }
                .nav-brand-text .name { font-size:.9rem; font-weight:700; color:var(--ink); display:block; line-height:1.2; }
                .nav-brand-text .sub  { font-size:.58rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; display:block; }
                .nav-links { display:flex; gap:1.25rem; align-items:center; }
                @media (min-width:1100px) { .nav-links { gap:1.75rem; } }
                .nav-link { font-size:.8rem; font-weight:500; color:var(--ink-2); text-decoration:none; position:relative; padding-bottom:2px; transition:color .2s; white-space:nowrap; }
                @media (min-width:1100px) { .nav-link { font-size:.875rem; } }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--blue); border-radius:2px; transition:width .25s; }
                .nav-link:hover { color:var(--blue); }
                .nav-link:hover::after { width:100%; }
                .nav-link.active { color:var(--blue); font-weight:600; }
                .nav-link.active::after { width:100%; }
                .nav-login { padding:.45rem 1.1rem; font-size:.8rem; font-weight:600; color:var(--blue); background:var(--blue-lt); border:1.5px solid rgba(26,86,219,.2); border-radius:9999px; text-decoration:none; transition:all .25s; white-space:nowrap; }
                @media (min-width:1100px) { .nav-login { padding:.5rem 1.4rem; font-size:.875rem; } }
                .nav-login:hover { background:var(--blue); color:white; border-color:var(--blue); }
                .nav-logout { padding:.5rem 1.25rem; font-size:.875rem; font-weight:600; color:#dc2626; background:#fef2f2; border:1.5px solid rgba(220,38,38,.2); border-radius:9999px; text-decoration:none; transition:all .25s; cursor:pointer; white-space:nowrap; }
                .nav-logout:hover { background:#dc2626; color:white; border-color:#dc2626; box-shadow:0 4px 16px rgba(220,38,38,.3); }
                .nav-mobile-logout { display:block; margin-top:.75rem; padding:.85rem; background:#dc2626; color:white; font-weight:700; font-size:1rem; border-radius:.75rem; text-align:center; cursor:pointer; border:none; width:100%; font-family:inherit; }
                .nav-hamburger { display:none; flex-direction:column; justify-content:center; gap:5px; width:40px; height:40px; background:none; border:none; cursor:pointer; padding:6px; border-radius:.5rem; transition:background .2s; flex-shrink:0; }
                .nav-hamburger:hover { background:rgba(0,0,0,.06); }
                .nav-hamburger span { display:block; width:100%; height:2px; background:var(--ink); border-radius:2px; transition:all .3s; }
                .nav-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
                .nav-hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
                .nav-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
                .nav-mobile { display:none; position:fixed; top:72px; left:0; width:100%; background:white; border-bottom:1px solid var(--border); box-shadow:0 8px 32px rgba(0,0,0,.1); z-index:99; padding:1.25rem 1.25rem 1.5rem; flex-direction:column; gap:.25rem; }
                .nav-mobile.open { display:flex; }
                .nav-mobile-link { font-size:1rem; font-weight:500; color:var(--ink-2); text-decoration:none; padding:.75rem 1rem; border-radius:.75rem; transition:background .2s,color .2s; display:block; }
                .nav-mobile-link:hover, .nav-mobile-link.active { background:var(--blue-lt); color:var(--blue); font-weight:600; }
                .nav-mobile-login { display:block; margin-top:.75rem; padding:.85rem; background:var(--blue); color:white; font-weight:700; font-size:1rem; border-radius:.75rem; text-decoration:none; text-align:center; }
                @media (max-width:860px) { .nav-links { display:none; } .nav-hamburger { display:flex; } }

                /* ── HERO ── */
                .page-hero { padding-top:72px; background:var(--ink); position:relative; overflow:hidden; }
                .hero-bg-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; z-index:0; }
                .hero-bg-slide.active { opacity:1; }
                .hero-bg-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.82) 0%,rgba(5,10,25,.68) 55%,rgba(10,30,90,.5) 100%); }
                .page-hero-grid  { position:absolute; inset:0; z-index:2; opacity:.04; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:48px 48px; }
                .page-hero-glow  { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(26,86,219,.22) 0%,transparent 70%); top:-200px; right:-100px; pointer-events:none; z-index:2; }
                .page-hero-glow2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(22,163,74,.1) 0%,transparent 70%); bottom:-100px; left:5%; pointer-events:none; z-index:2; }
                .page-hero-inner { max-width:82rem; margin:0 auto; padding:3rem 1.25rem 2.5rem; position:relative; z-index:3; }
                @media (min-width:640px)  { .page-hero-inner { padding:4rem 1.75rem 3rem; } }
                @media (min-width:1024px) { .page-hero-inner { padding:5rem 2rem 4rem; } }
                .page-eyebrow { display:inline-flex; align-items:center; gap:.5rem; padding:.3rem .9rem; border-radius:9999px; background:rgba(26,86,219,.18); border:1px solid rgba(26,86,219,.35); color:#7abaff; font-size:.7rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.25rem; animation:eyebrowIn .8s ease both, gentleBounce 3s ease-in-out 1s infinite; }
                @keyframes eyebrowIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                @keyframes gentleBounce { 0%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}60%{transform:translateY(-4px)} }
                .page-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#7abaff; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)} }
                .page-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,5vw,4rem); font-weight:900; color:white; letter-spacing:-.03em; line-height:1.05; margin-bottom:1rem; animation:eyebrowIn .9s .15s ease both; }
                .page-title .accent { color:#7abaff; font-style:italic; }
                .page-subtitle { font-size:clamp(.875rem,2vw,1rem); color:rgba(255,255,255,.6); max-width:520px; line-height:1.75; animation:eyebrowIn 1s .3s ease both; }
                .page-hero-stats { display:flex; gap:1.75rem; margin-top:2rem; flex-wrap:wrap; animation:eyebrowIn 1s .45s ease both; }
                @media (min-width:640px) { .page-hero-stats { gap:2.5rem; margin-top:3rem; } }
                .phero-stat-num   { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,4vw,2rem); font-weight:900; color:white; display:block; line-height:1; }
                .phero-stat-label { font-size:.68rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.1em; text-transform:uppercase; margin-top:.25rem; display:block; }

                /* ── CONTROLS BAR ── */
                .controls-bar { background:var(--card-bg); border-bottom:1px solid var(--border); position:sticky; top:72px; z-index:50; box-shadow:0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width:82rem; margin:0 auto; padding:.875rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
                @media (min-width:640px)  { .controls-inner { padding:1rem 1.75rem; gap:1.25rem; } }
                @media (min-width:1024px) { .controls-inner { padding:1rem 2rem; } }
                .results-count { font-size:.8rem; color:var(--muted); font-weight:500; white-space:nowrap; flex-shrink:0; }
                .search-wrap { display:flex; align-items:center; gap:.6rem; background:var(--offwhite); border:1.5px solid var(--border); border-radius:9999px; padding:.45rem 1rem; flex:1; min-width:0; max-width:340px; transition:border-color .2s; }
                @media (max-width:480px) { .search-wrap { max-width:100%; } }
                .search-wrap:focus-within { border-color:var(--blue); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
                .search-wrap svg { flex-shrink:0; color:var(--muted); }
                .search-wrap input { border:none; background:transparent; outline:none; font-size:.875rem; color:var(--ink); font-family:inherit; width:100%; min-width:0; }
                .search-wrap input::placeholder { color:#a0aec0; }

                /* ── PROJECTS SECTION ── */
                .projects-main { padding:2.5rem 0 4rem; }
                @media (min-width:768px) { .projects-main { padding:4.5rem 0 6rem; } }
                .projects-container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px)  { .projects-container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .projects-container { padding:0 2rem; } }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.65rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; }
                .section-sub { font-size:.9rem; color:var(--muted); margin-top:.4rem; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }

                /* ── PROJECTS GRID — responsive ── */
                .projects-grid { display:grid; grid-template-columns:1fr; gap:1.25rem; margin-top:2.5rem; }
                @media (min-width:480px)  { .projects-grid { grid-template-columns:repeat(2,1fr); gap:1.5rem; } }
                @media (min-width:900px)  { .projects-grid { grid-template-columns:repeat(3,1fr); } }
                @media (min-width:1200px) { .projects-grid { grid-template-columns:repeat(4,1fr); margin-top:3rem; } }

                /* ── PROJECT CARD ── */
                .project-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.04); overflow:hidden; display:flex; flex-direction:column; height:100%; transition:transform .35s,box-shadow .35s; cursor:pointer; }
                .project-card:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(0,0,0,.1); }
                .project-avatar-wrap { height:110px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; flex-shrink:0; }
                @media (min-width:480px) { .project-avatar-wrap { height:130px; } }
                .avatar-deco { position:absolute; border-radius:50%; opacity:.12; }
                .project-avatar { width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:900; color:white; box-shadow:0 6px 20px rgba(0,0,0,.2); position:relative; z-index:1; flex-shrink:0; }
                @media (min-width:480px) { .project-avatar { width:68px; height:68px; font-size:1.4rem; } }
                .project-body { padding:1rem 1.1rem 1.1rem; flex:1; display:flex; flex-direction:column; }
                @media (min-width:480px) { .project-body { padding:1.1rem 1.2rem 1.25rem; } }
                .project-date  { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--blue); margin-bottom:.3rem; }
                .project-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:800; color:var(--ink); margin-bottom:.35rem; letter-spacing:-.01em; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                @media (min-width:480px) { .project-title { font-size:1rem; } }
                .project-author { display:flex; align-items:center; gap:.4rem; font-size:.78rem; color:var(--muted); margin-bottom:.65rem; }
                .author-dot { width:5px; height:5px; border-radius:50%; background:var(--blue); flex-shrink:0; }
                .project-desc { font-size:.8rem; color:#64748b; line-height:1.65; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; flex:1; margin-bottom:.875rem; }
                .project-spacer { flex:1; min-height:.25rem; }
                .project-actions { display:flex; gap:.5rem; margin-top:.25rem; }
                @media (min-width:480px) { .project-actions { gap:.6rem; } }
                .btn-read-more-proj { background:none; border:none; padding:.1rem 0; color:var(--green); font-size:.84rem; font-weight:700; cursor:pointer; text-align:left; transition:color .2s; }
                .btn-read-more-proj:hover { color:var(--green-dk); text-decoration:underline; }
                .btn-doc-proj { width:100%; padding:.65rem; background:var(--blue); color:white; font-size:.84rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; letter-spacing:.03em; transition:all .22s; display:flex; align-items:center; justify-content:center; gap:.4rem; margin-top:.35rem; box-shadow:0 3px 12px rgba(26,86,219,.28); text-decoration:none; }
                .btn-doc-proj:hover { background:var(--blue-dk); box-shadow:0 6px 20px rgba(26,86,219,.38); transform:translateY(-1px); }

                .btn-download-proj { flex:1; padding:.55rem; text-align:center; background:var(--blue); color:white; font-size:.78rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; box-shadow:0 3px 10px rgba(26,86,219,.25); transition:all .22s; display:flex; align-items:center; justify-content:center; gap:.35rem; }
                @media (min-width:480px) { .btn-download-proj { padding:.58rem; font-size:.8rem; } }
                .btn-download-proj:hover { background:var(--blue-dk); box-shadow:0 6px 18px rgba(26,86,219,.35); transform:translateY(-1px); }
                .btn-login-proj { flex:1; padding:.55rem; text-align:center; background:var(--blue); color:white; font-size:.78rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; box-shadow:0 3px 10px rgba(26,86,219,.25); transition:all .22s; text-decoration:none; display:flex; align-items:center; justify-content:center; }
                @media (min-width:480px) { .btn-login-proj { padding:.58rem; font-size:.8rem; } }
                .btn-login-proj:hover { background:var(--blue-dk); }

                /* ── PROJECT PHOTO ── */
                .project-photo-wrap { width:100%; aspect-ratio:3/4; max-height:260px; overflow:hidden; flex-shrink:0; background:#d4b8a5; }
                .project-photo-wrap img { width:100%; height:100%; object-fit:cover; object-position:top center; transition:transform .55s ease; display:block; }
                .project-card:hover .project-photo-wrap img { transform:scale(1.04); }
                .project-photo-fallback { width:100%; aspect-ratio:3/4; max-height:260px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; flex-shrink:0; background:#d4b8a5; }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
                .skeleton-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden; }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:4rem 0; color:var(--muted); }
                .empty-state svg { color:#cbd5e1; margin:0 auto 1.25rem; display:block; }
                .empty-state h3 { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--ink); margin-bottom:.5rem; }
                .empty-state p { font-size:.9rem; }

                /* ── MODAL ── */
                .modal-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease; }
                @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                .modal-box { background:white; border-radius:1.25rem; width:100%; max-width:780px; position:relative; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:slideUp .25s ease; max-height:90vh; overflow-y:auto; }
                @keyframes slideUp { from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)} }
                .modal-close { position:absolute; top:1rem; right:1rem; z-index:10; width:34px; height:34px; border-radius:50%; background:#f1f5f9; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .2s; }
                .modal-close:hover { background:#e2e8f0; color:var(--ink); }
                /* stacks on mobile, side-by-side on 560px+ */
                .modal-inner { display:grid; grid-template-columns:1fr; }
                @media (min-width:560px) { .modal-inner { grid-template-columns:1fr 1.2fr; min-height:400px; } }
                .modal-avatar-side { position:relative; overflow:hidden; min-height:220px; display:flex; flex-direction:column; justify-content:flex-end; }
                @media (min-width:560px) { .modal-avatar-side { min-height:400px; } }
                .modal-avatar-side-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:top center; display:block; }
                .modal-avatar-side-fallback { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
                .modal-avatar-gradient { position:absolute; inset:0; background:linear-gradient(to top, rgba(5,10,25,.72) 0%, rgba(5,10,25,.1) 55%, transparent 100%); }
                .modal-avatar-info { position:relative; z-index:2; padding:1.25rem 1.25rem 1.5rem; }
                .modal-avatar-name { font-size:1rem; font-weight:800; color:white; text-shadow:0 1px 4px rgba(0,0,0,.4); }
                .modal-avatar-date { font-size:.72rem; color:rgba(255,255,255,.7); margin-top:.2rem; }
                .modal-avatar-circle { width:76px; height:76px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:900; color:white; box-shadow:0 8px 28px rgba(0,0,0,.2); }
                @media (min-width:560px) { .modal-avatar-circle { width:88px; height:88px; font-size:1.8rem; } }
                .modal-info-side { padding:1.75rem 1.5rem; display:flex; flex-direction:column; border-top:1px solid var(--border); }
                @media (min-width:560px) { .modal-info-side { padding:2.25rem 2rem 2.25rem 1.5rem; border-top:none; border-left:1px solid var(--border); } }
                .modal-approved-badge { display:inline-flex; align-items:center; gap:.35rem; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--green-dk); background:var(--green-lt); padding:.25rem .7rem; border-radius:9999px; margin-bottom:.75rem; width:fit-content; }
                .modal-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:800; color:var(--ink); letter-spacing:-.02em; margin-bottom:.875rem; line-height:1.25; }
                @media (min-width:560px) { .modal-title { font-size:1.4rem; } }
                .modal-desc { font-size:.88rem; color:#4a5568; line-height:1.78; flex:1; margin-bottom:1.25rem; }
                .modal-comment { display:flex; align-items:flex-start; gap:.6rem; font-size:.82rem; color:var(--muted); background:var(--blue-lt); padding:.7rem 1rem; border-radius:.65rem; margin-bottom:1.25rem; line-height:1.6; }
                .modal-actions { display:flex; gap:.75rem; margin-top:auto; flex-wrap:wrap; }
                .btn-modal-download { flex:1; padding:.8rem 1rem; background:var(--blue); color:white; font-size:.875rem; font-weight:700; border-radius:.7rem; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(26,86,219,.3); transition:all .25s; display:flex; align-items:center; justify-content:center; gap:.5rem; text-decoration:none; min-width:0; }
                .btn-modal-download:hover { background:var(--blue-dk); transform:translateY(-1px); }
                .btn-modal-close-action { padding:.8rem 1.25rem; background:var(--offwhite); color:var(--ink-2); font-size:.875rem; font-weight:600; border-radius:.7rem; border:1.5px solid var(--border); cursor:pointer; transition:all .22s; white-space:nowrap; }
                .btn-modal-close-action:hover { border-color:var(--blue); color:var(--blue); }

                /* ── FOOTER ── */
                .footer { background:#080d14; padding:4rem 0 0; }
                @media (min-width:768px) { .footer { padding:5rem 0 0; } }
                .footer-container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px)  { .footer-container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .footer-container { padding:0 2rem; } }
                .footer-grid { display:grid; grid-template-columns:1fr; gap:2rem; padding-bottom:3rem; }
                @media (min-width:640px)  { .footer-grid { grid-template-columns:repeat(2,1fr); gap:2.5rem; } }
                @media (min-width:1024px) { .footer-grid { grid-template-columns:1.5fr 1fr 1fr 1.4fr; gap:3rem; } }
                .footer-brand-logo { width:56px; height:56px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:1.25rem; }
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
                .footer-bottom { border-top:1px solid #1a2332; padding:1.5rem 0; display:flex; flex-direction:column; align-items:center; gap:1rem; text-align:center; }
                @media (min-width:640px) { .footer-bottom { flex-direction:row; justify-content:space-between; text-align:left; } }
                .footer-copy { font-size:.78rem; color:#334155; }
                .footer-socials { display:flex; gap:.875rem; }
                .social-btn { width:38px; height:38px; border-radius:50%; background:#0d1a2e; border:1px solid #1e2d42; display:flex; align-items:center; justify-content:center; color:#64748b; text-decoration:none; transition:all .25s; }
                .social-btn:hover { background:var(--blue); border-color:var(--blue); color:white; transform:translateY(-2px); }
            `}</style>

            {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} isLoggedIn={isLoggedIn} isRegularUser={isRegularUser} userRole={userRole} />}

            {/* ═══ NAV ══ */}
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
                        {isLoggedIn
                            ? <button className="nav-logout" onClick={handleLogout}>Logout</button>
                            : <Link to="/login" className="nav-login">Login</Link>
                        }
                    </div>
                    <button className={`nav-hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
                        <span /><span /><span />
                    </button>
                </div>
                <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
                    <a href="/" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="/machines" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Machines</a>
                    <a href="/shop" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Shop</a>
                    <a href="/training" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Training</a>
                    <a href="/projects" className="nav-mobile-link active" onClick={() => setMenuOpen(false)}>Projects</a>
                    <a href="/about" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>About</a>
                    <a href="/gallery" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Gallery</a>
                    <a href="/faq" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>FAQ</a>
                    {isLoggedIn
                        ? <button className="nav-mobile-logout" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
                        : <Link to="/login" className="nav-mobile-login" onClick={() => setMenuOpen(false)}>Login / Register</Link>
                    }
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <div className="page-hero">
                {heroSlides.map((src, i) => (
                    <div key={i} className={`hero-bg-slide ${i === heroIdx ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
                ))}
                <div className="hero-bg-overlay" />
                <div className="page-hero-grid" />
                <div className="page-hero-glow" />
                <div className="page-hero-glow2" />
                <div className="page-hero-inner">
                    <div className="page-eyebrow"><span className="page-eyebrow-dot" />Student & Staff Work</div>
                    <h1 className="page-title">Projects <span className="accent">Centre</span></h1>
                    <p className="page-subtitle">Explore approved fabrication projects built by our community — from PCB design and CNC machining to embedded systems and 3D printing.</p>
                    <div className="page-hero-stats">
                        {[[loading ? '…' : `${projects.length}+`, 'Approved Projects'], [loading ? '…' : `${contributors}`, 'Contributors'], ['Open', 'Source Docs']].map(([n, l]) => (
                            <div key={l}><span className="phero-stat-num">{n}</span><span className="phero-stat-label">{l}</span></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ CONTROLS ═══ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    <span className="results-count">{loading ? 'Loading…' : `${displayed.length} project${displayed.length !== 1 ? 's' : ''}`}</span>
                    <div className="search-wrap">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input placeholder="Search projects or authors…" value={search} onChange={e => setSearch(e.target.value)} />
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
                                <div key={i} style={{ borderRadius: '1rem', background: '#e8d5c4', overflow: 'hidden' }}>
                                    <div className="skeleton" style={{ aspectRatio: '3/4', maxHeight: 260, width: '100%', borderRadius: 0, background: '#d4b8a5' }} />
                                    <div style={{ padding: '.85rem 1rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                                        <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: '.4rem' }} />
                                        <div style={{ display: 'flex', gap: '.35rem' }}>
                                            <div className="skeleton" style={{ height: 18, width: 55, borderRadius: '.3rem' }} />
                                            <div className="skeleton" style={{ height: 18, width: 38, borderRadius: '.3rem' }} />
                                        </div>
                                        <div className="skeleton" style={{ height: 34, width: '100%', borderRadius: '.5rem', marginTop: '.2rem' }} />
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
                                            {project.student_photo ? (
                                                <div className="project-photo-wrap">
                                                    <img
                                                        src={project.student_photo}
                                                        alt={project.title}
                                                        onError={e => {
                                                            e.currentTarget.parentNode.className = 'project-photo-fallback';
                                                            e.currentTarget.parentNode.style.background = `${col}10`;
                                                            e.currentTarget.parentNode.innerHTML = `<div style="width:68px;height:68px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:900;color:white;box-shadow:0 6px 20px rgba(0,0,0,.2);position:relative;z-index:1">${initials(project.user?.name)}</div>`;
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="project-photo-fallback" style={{ background: `${col}10` }}>
                                                    <div className="avatar-deco" style={{ width: 80, height: 80, background: col, top: -22, right: -22 }} />
                                                    <div className="avatar-deco" style={{ width: 44, height: 44, background: col, bottom: 8, left: 14 }} />
                                                    <div className="project-avatar" style={{ background: col }}>{initials(project.user?.name)}</div>
                                                </div>
                                            )}
                                            <div className="project-body">
                                                <p className="project-name">{project.user?.name || 'Unknown'}</p>
                                                <div className="project-tags">
                                                    {project.title && <span className="project-tag tag-primary">{project.title.split(' ').slice(0, 1).join(' ')}</span>}
                                                    {project.submitted_at && <span className="project-tag tag-secondary">{new Date(project.submitted_at).getFullYear()}</span>}
                                                </div>
                                                <button className="btn-read-more-proj" onClick={e => { e.stopPropagation(); setSelected(project); }}>Read More</button>
                                                {hasDoc && (
                                                    isLoggedIn && isRegularUser ? (
                                                        <button className="btn-doc-proj" onClick={e => { e.stopPropagation(); window.open(`${API_BASE}/user/projects/${project.id}/download`, '_blank'); }}>
                                                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            Documentation
                                                        </button>
                                                    ) : isLoggedIn && !isRegularUser ? (
                                                        <a href="/admin/projects" className="btn-doc-proj" onClick={e => e.stopPropagation()}>Manage Projects</a>
                                                    ) : (
                                                        <Link to="/login" className="btn-doc-proj" onClick={e => e.stopPropagation()}>Documentation</Link>
                                                    )
                                                )}
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
                <div className="footer-container">
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand-logo">
                                <img src="/images/logo.png" alt="JNEC Fab Lab" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
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

            {/* ✅ Role Restriction Modal */}
            {showRoleModal && (
                <div className="modal-backdrop" onClick={() => setShowRoleModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(5,10,25,.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '1.25rem', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.25)', animation: 'slideUp .25s ease' }}>
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                <svg width="32" height="32" fill="none" stroke="#d97706" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 800, color: '#0d1117', marginBottom: '.5rem' }}>Access Restricted</h3>
                            <p style={{ fontSize: '.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>This feature is only available for regular users. Please log in with a user account to continue.</p>
                            <button onClick={() => setShowRoleModal(false)} style={{ padding: '.75rem 2rem', background: '#1a56db', color: 'white', fontWeight: 700, fontSize: '.9rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,86,219,.35)' }}>Got it</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}