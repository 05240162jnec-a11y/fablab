import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
}
function calcDuration(start, end) {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (days < 7) return `${days} Day${days !== 1 ? 's' : ''}`;
    if (days < 30) { const w = Math.round(days / 7); return `${w} Week${w !== 1 ? 's' : ''}`; }
    const m = Math.round(days / 30); return `${m} Month${m !== 1 ? 's' : ''}`;
}
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const FALLBACK_MACHINE = '../images/3D-Printer.avif';
const FALLBACK_COURSE = '../images/workshop.jpg';

/* ── Scroll-reveal ─────────────────────────────────────────────────────── */
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.12 }
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
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            ...style
        }}>{children}</div>
    );
}

/* ── Machine Modal ──────────────────────────────────────────────────────── */
function MachineModal({ machine, onClose, isLoggedIn, onRestrict }) {
    const navigate = useNavigate();
    if (!machine) return null;
    const imgSrc = getImageUrl(machine.image) || FALLBACK_MACHINE;
    const isAvail = machine.status === 'available';
    const handleBook = () => {
        onClose();
        if (!isLoggedIn) { navigate('/login'); return; }
        const role = (() => { try { return JSON.parse(sessionStorage.getItem('user') || '{}')?.role; } catch { return null; } })();
        if (role === 'admin') { onRestrict(); return; }
        if (role === 'production_team') { navigate('/production-team/book-machine'); return; }
        navigate('/user/machines');
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="modal-inner">
                    <div className="modal-img-wrap">
                        <img src={imgSrc} alt={machine.name} onError={e => { e.currentTarget.src = FALLBACK_MACHINE; }} />
                    </div>
                    <div className="modal-content">
                        <h2 className="modal-title">{machine.name}</h2>
                        <div className="modal-status">
                            {isAvail
                                ? <><span className="status-dot green" />Operational</>
                                : <><span className="status-dot red" />{machine.status === 'maintenance' ? 'Under Maintenance' : 'Offline'}</>
                            }
                        </div>
                        {machine.type && <p className="modal-type">{machine.type}</p>}
                        <p className="modal-desc">{machine.description || 'High-precision fabrication machine available for booking.'}</p>
                        {isAvail
                            ? <button className="btn-modal-book" onClick={handleBook}>Book</button>
                            : <button className="btn-modal-disabled" disabled>{machine.status === 'maintenance' ? 'Under Maintenance' : 'Unavailable'}</button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function Home() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [slideIdx, setSlideIdx] = useState(0);
    const [machines, setMachines] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [isPaused, setIsPaused] = useState(false);

    const isLoggedIn = !!sessionStorage.getItem('auth_token');
    const userRole = (() => { try { return JSON.parse(sessionStorage.getItem('user') || '{}')?.role; } catch { return null; } })();
    const isRegularUser = !isLoggedIn || (userRole !== 'admin' && userRole !== 'production_team');
    const getProjectsLink = () => {
        if (!isLoggedIn) return '/projects';
        if (userRole === 'admin') return '/admin/projects';
        if (userRole === 'production_team') return '/production-team/projects';
        return '/user/projects';
    };
    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
    };

    const [menuOpen, setMenuOpen] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const restrictAlert = () => setShowRoleModal(true);


    const heroSlides = [
        { bg: '../images/home.jpg' },
        { bg: '../images/home2.jpg' },
        { bg: '../images/home3.jpg' },
    ];

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setSlideIdx(p => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const [mRes, cRes, uRes] = await Promise.allSettled([
                    fetch(`${API_BASE}/home/machines`),
                    fetch(`${API_BASE}/home/courses`),
                    fetch(`${API_BASE}/home/users`),
                ]);
                if (mRes.status === 'fulfilled' && mRes.value.ok) {
                    const d = await mRes.value.json(); setMachines((d.data || d).slice(0, 5));
                }
                if (cRes.status === 'fulfilled' && cRes.value.ok) {
                    const d = await cRes.value.json(); setCourses((d.data || d).slice(0, 4));
                }
                if (uRes.status === 'fulfilled' && uRes.value.ok) {
                    const d = await uRes.value.json(); setUsers(d.data || d);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') setSelectedMachine(null); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []);

    const totalUsers = users.length || 200;
    const handleBookClick = useCallback(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        if (userRole === 'admin') { restrictAlert(); return; }
        if (userRole === 'production_team') { navigate('/production-team/book-machine'); return; }
        navigate('/user/machines');
    }, [isLoggedIn, userRole, navigate]);
    const handleEnrollClick = useCallback(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        if (!isRegularUser) { restrictAlert(); return; }
        navigate('/user/learning');
    }, [isLoggedIn, isRegularUser, navigate]);

    /* duplicate machines for infinite scroll illusion */
    const displayMachines = [...machines, ...machines];

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#1a1a2e', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

                :root {
                    --blue:       #1a56db;
                    --blue-dk:    #1446b8;
                    --blue-lt:    #e8f0fe;
                    --red:        #e02020;
                    --red-dk:     #c01a1a;
                    --red-lt:     #fdecea;
                    --green:      #16a34a;
                    --green-dk:   #0f7a38;
                    --green-lt:   #dcfce7;
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
                .nav-inner { max-width:82rem; margin:0 auto; padding:0 1.25rem; display:flex; align-items:center; justify-content:space-between; height:72px; }
                .nav-logo-wrap { display:flex; align-items:center; gap:.75rem; text-decoration:none; }
                .nav-logo-circle { width:46px; height:46px; border-radius:50%; background:var(--blue); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(26,86,219,.35); overflow:hidden; flex-shrink:0; transition:transform .3s,box-shadow .3s; }
                .nav-logo-circle:hover { transform:scale(1.06); box-shadow:0 6px 24px rgba(26,86,219,.45); }
                .nav-logo-circle img { width:100%; height:100%; object-fit:cover; }
                .nav-logo-circle .logo-letter { font-family:'Playfair Display',serif; font-weight:900; font-size:1.5rem; color:white; }
                .nav-brand-text .name { font-size:.95rem; font-weight:700; color:var(--ink); letter-spacing:-.01em; display:block; line-height:1.2; }
                .nav-brand-text .sub  { font-size:.6rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.1em; display:block; }
                .nav-root.top .nav-brand-text .name { color:white; }
                .nav-root.top .nav-brand-text .sub  { color:rgba(255,255,255,.6); }
                .nav-root.top .nav-link             { color:rgba(255,255,255,.85); }
                .nav-root.top .nav-link:hover       { color:white; }
                .nav-root.top .nav-login { background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.35); color:white; backdrop-filter:blur(6px); }
                .nav-root.top .nav-login:hover { background:rgba(255,255,255,.25); }
                /* desktop links */
                .nav-links { display:flex; gap:1.5rem; align-items:center; }
                .nav-link { font-size:.875rem; font-weight:500; color:var(--ink-2); text-decoration:none; position:relative; padding-bottom:2px; transition:color .2s; }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--blue); border-radius:2px; transition:width .25s; }
                .nav-link:hover { color:var(--blue); }
                .nav-link:hover::after { width:100%; }
                .nav-link.active { color:var(--blue); font-weight:600; }
                .nav-link.active::after { width:100%; }
                .nav-login { padding:.5rem 1.25rem; font-size:.875rem; font-weight:600; color:var(--blue); background:var(--blue-lt); border:1.5px solid rgba(26,86,219,.2); border-radius:9999px; text-decoration:none; transition:all .25s; }
                .nav-login:hover { background:var(--blue); color:white; border-color:var(--blue); box-shadow:0 4px 16px rgba(26,86,219,.3); }
                .nav-logout { padding:.5rem 1.25rem; font-size:.875rem; font-weight:600; color:#dc2626; background:#fef2f2; border:1.5px solid rgba(220,38,38,.2); border-radius:9999px; text-decoration:none; transition:all .25s; cursor:pointer; white-space:nowrap; }
                .nav-logout:hover { background:#dc2626; color:white; border-color:#dc2626; box-shadow:0 4px 16px rgba(220,38,38,.3); }
                .nav-mobile-logout { display:block; margin-top:.75rem; padding:.85rem; background:#dc2626; color:white; font-weight:700; font-size:1rem; border-radius:.75rem; text-align:center; cursor:pointer; border:none; width:100%; font-family:inherit; }
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
                @media (max-width:1024px) {
                    .nav-links { gap:1rem; }
                    .nav-link { font-size:.8rem; }
                }
                @media (max-width:860px) {
                    .nav-links { display:none; }
                    .nav-hamburger { display:flex; }
                }

                /* ── HERO ── */
                .hero { position:relative; height:100vh; min-height:560px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
                .hero-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; }
                .hero-slide.active { opacity:1; }
                .hero-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.72) 0%,rgba(5,10,25,.55) 50%,rgba(0,40,130,.3) 100%); }
                .hero-content { position:relative; z-index:2; text-align:center; padding:0 1.25rem; max-width:860px; width:100%; }
                .hero-eyebrow {
                    display:inline-flex; align-items:center; gap:.5rem;
                    padding:.35rem 1rem; border-radius:9999px;
                    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
                    color:rgba(255,255,255,.9); font-size:.72rem; font-weight:600;
                    letter-spacing:.12em; text-transform:uppercase;
                    margin-bottom:1.5rem; backdrop-filter:blur(8px);
                    animation: fadeUp .8s ease both, gentleBounce 3s ease-in-out 1s infinite;
                }
                @keyframes gentleBounce {
                    0%,100% { transform:translateY(0); }
                    40%     { transform:translateY(-8px); }
                    60%     { transform:translateY(-4px); }
                }
                .hero-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#4af; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)} }
                .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,7vw,5.5rem); font-weight:900; color:white; line-height:1.08; letter-spacing:-.03em; margin-bottom:1.25rem; animation:fadeUp .9s .15s ease both; }
                .hero-title .accent { color:#7abaff; font-style:italic; }
                .hero-sub { font-size:clamp(.9rem,2.5vw,1.1rem); font-weight:400; color:rgba(255,255,255,.75); max-width:520px; margin:0 auto 2rem; line-height:1.75; animation:fadeUp 1s .3s ease both; }
                .hero-actions { display:flex; gap:.875rem; justify-content:center; flex-wrap:wrap; animation:fadeUp 1s .45s ease both; }
                .btn-hero-primary { padding:.8rem 2rem; background:var(--blue); color:white; font-weight:700; font-size:.95rem; border-radius:9999px; text-decoration:none; display:inline-block; box-shadow:0 8px 32px rgba(26,86,219,.45); transition:all .3s; border:none; cursor:pointer; }
                .btn-hero-primary:hover { background:var(--blue-dk); transform:translateY(-3px); box-shadow:0 14px 40px rgba(26,86,219,.55); }
                .btn-hero-ghost { padding:.8rem 2rem; background:rgba(255,255,255,.12); color:white; font-weight:600; font-size:.95rem; border-radius:9999px; text-decoration:none; display:inline-block; border:1.5px solid rgba(255,255,255,.35); backdrop-filter:blur(8px); transition:all .3s; }
                .btn-hero-ghost:hover { background:rgba(255,255,255,.22); border-color:rgba(255,255,255,.6); }
                .hero-dots { position:absolute; bottom:1.75rem; left:50%; transform:translateX(-50%); z-index:3; display:flex; gap:.5rem; }
                .hero-dot { width:8px; height:8px; border-radius:9999px; background:rgba(255,255,255,.35); border:none; cursor:pointer; transition:all .3s; padding:0; }
                .hero-dot.active { background:white; width:24px; }
                .scroll-hint { position:absolute; bottom:1.75rem; right:2rem; z-index:3; display:flex; flex-direction:column; align-items:center; gap:.4rem; color:rgba(255,255,255,.5); font-size:.65rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; animation:scrollBounce 2.5s ease-in-out infinite; }
                @keyframes scrollBounce { 0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(6px);opacity:1} }
                @media (max-width:640px) { .scroll-hint { display:none; } }

                /* ── SHARED ── */
                .section { padding:4rem 0; }
                @media (min-width:768px) { .section { padding:6rem 0; } }
                .section-alt { background:var(--offwhite); }
                .container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px) { .container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .container { padding:0 2rem; } }
                .section-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2.5rem; gap:1rem; flex-wrap:wrap; }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.75rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,3vw,2.5rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; line-height:1.15; }
                .section-sub { font-size:.9rem; color:var(--muted); margin-top:.4rem; }
                .view-all-link { display:inline-flex; align-items:center; gap:.35rem; font-size:.875rem; font-weight:600; color:var(--blue); text-decoration:none; white-space:nowrap; transition:gap .2s; flex-shrink:0; }
                .view-all-link:hover { gap:.6rem; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }

                /* ── STATS BAR ── */
                .stats-bar { background:var(--blue); padding:2.5rem 0; }
                .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; text-align:center; }
                @media (max-width:480px) {
                    .stats-grid { grid-template-columns:1fr; gap:2rem; }
                }
                .stat-num { font-family:'Playfair Display',serif; font-size:clamp(1.75rem,5vw,2.5rem); font-weight:900; color:white; display:block; line-height:1; }
                .stat-label { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.7); letter-spacing:.08em; text-transform:uppercase; margin-top:.4rem; display:block; }

                /* ── MACHINE CAROUSEL ── */
                .machine-carousel-outer {
                    overflow: hidden;
                    width: 100%;
                    cursor: default;
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
                    mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
                }
                .machine-carousel-track {
                    display: flex;
                    gap: 1.5rem;
                    width: max-content;
                    animation: slideLeft 32s linear infinite;
                    animation-play-state: running;
                }
                .machine-carousel-track.paused { animation-play-state: paused; }
                @keyframes slideLeft {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                /* ── MACHINE CARD — exact image-2 layout ── */
                .machine-card {
                    background: #ffffff;
                    border-radius: 1.25rem;
                    border: 1px solid rgba(0,0,0,.08);
                    box-shadow: 0 2px 16px rgba(0,0,0,.07);
                    display: flex;
                    flex-direction: column;
                    width: 300px;
                    flex-shrink: 0;
                    padding: 1rem;
                    gap: .85rem;
                    transition: box-shadow .3s, transform .3s;
                }
                .machine-card:hover {
                    box-shadow: 0 18px 48px rgba(0,0,0,.13);
                    transform: translateY(-5px);
                }

                /* inner image box — bordered, rounded, light bg, exactly like image 2 */
                .machine-img-wrap {
                    width: 100%;
                    height: 210px;
                    background: #f0f4f8;
                    border: 1px solid rgba(0,0,0,.07);
                    border-radius: .85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .machine-img-wrap img {
                    width: 90%;
                    height: 90%;
                    object-fit: contain;
                    transition: transform .5s ease;
                }
                .machine-card:hover .machine-img-wrap img { transform: scale(1.05); }

                .machine-tag {
                    position: absolute; top: .6rem; left: .6rem;
                    font-size: .6rem; font-weight: 700; letter-spacing: .1em;
                    text-transform: uppercase; padding: .2rem .6rem; border-radius: 9999px;
                }
                .tag-available   { background: var(--green); color: white; }
                .tag-maintenance { background: var(--red);   color: white; }
                .tag-offline     { background: #64748b;      color: white; }

                /* card body below the image box */
                .machine-body {
                    display: flex;
                    flex-direction: column;
                    gap: .4rem;
                    flex: 1;
                }
                .machine-type  { font-size: .65rem; color: #a0aec0; text-transform: uppercase; letter-spacing: .07em; }
                .machine-title { font-size: .95rem; font-weight: 700; color: var(--ink); line-height: 1.35; }
                .machine-desc  {
                    font-size: .825rem; color: var(--muted); line-height: 1.7;
                    display: -webkit-box; -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical; overflow: hidden;
                    flex: 1;
                }

                /* Read More — green text link directly above Book btn, like image 2 */
                .btn-read-more-link {
                    display: inline-block;
                    font-size: .825rem;
                    font-weight: 700;
                    color: var(--green);
                    background: none;
                    border: none;
                    padding: .1rem 0;
                    cursor: pointer;
                    text-align: left;
                    transition: color .2s;
                }
                .btn-read-more-link:hover { color: var(--green-dk); text-decoration: underline; }

                /* Book — full width, rounded pill-ish, blue */
                .btn-book {
                    display: block;
                    width: 100%;
                    padding: .75rem;
                    background: var(--blue);
                    color: white;
                    font-size: .9rem;
                    font-weight: 700;
                    border-radius: .75rem;
                    border: none;
                    cursor: pointer;
                    text-align: center;
                    box-shadow: 0 3px 12px rgba(26,86,219,.25);
                    transition: all .22s;
                }
                .btn-book:hover { background: var(--blue-dk); box-shadow: 0 6px 20px rgba(26,86,219,.35); transform: translateY(-1px); }
                .btn-book-disabled {
                    display: block; width: 100%; padding: .75rem;
                    background: #e2e8f0; color: #94a3b8;
                    font-size: .9rem; font-weight: 700; border-radius: .75rem;
                    border: none; text-align: center; cursor: not-allowed;
                }

                /* ── COURSE CARDS (responsive grid) ── */
                .grid-4 { display:grid; grid-template-columns:1fr; gap:1.25rem; }
                @media (min-width:540px) { .grid-4 { grid-template-columns:repeat(2,1fr); } }
                @media (min-width:1024px) { .grid-4 { grid-template-columns:repeat(4,1fr); } }
                .course-card {
                    background:var(--card-bg); border-radius:var(--radius); overflow:hidden;
                    border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.04);
                    transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s;
                    display:flex; flex-direction:column;
                }
                .course-card:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(0,0,0,.09); }
                .course-img-wrap { height:140px; overflow:hidden; position:relative; flex-shrink:0; }
                .course-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .6s ease; }
                .course-card:hover .course-img-wrap img { transform:scale(1.06); }
                .course-img-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(5,10,25,.45) 0%,transparent 60%); }
                .course-body { padding:1rem; flex:1; display:flex; flex-direction:column; }
                .course-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:.6rem; }
                .badge-open   { display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .6rem; background:var(--green-lt); color:var(--green-dk); font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; border-radius:9999px; }
                .badge-open::before { content:''; width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulse 2s ease-in-out infinite; }
                .badge-closed { display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .6rem; background:var(--red-lt); color:var(--red-dk); font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; border-radius:9999px; }
                .badge-dur { font-size:.7rem; color:var(--muted); background:var(--offwhite); padding:.2rem .55rem; border-radius:.45rem; font-weight:600; }
                .course-title { font-size:.95rem; font-weight:700; color:var(--ink); margin-bottom:.2rem; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                .course-instructor { font-size:.78rem; color:var(--muted); margin-bottom:.6rem; font-style:italic; }
                .course-meta-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.875rem; flex-wrap:wrap; }
                .cmeta { display:flex; align-items:center; gap:.3rem; font-size:.72rem; color:var(--muted); font-weight:500; background:var(--offwhite); padding:.3rem .6rem; border-radius:.45rem; }
                .cmeta svg { color:var(--blue); flex-shrink:0; }
                .btn-enroll { display:block; width:100%; padding:.65rem; background:var(--blue); color:white; font-size:.825rem; font-weight:700; border-radius:.6rem; border:none; cursor:pointer; text-align:center; box-shadow:0 3px 12px rgba(26,86,219,.25); transition:all .22s; margin-top:auto; }
                .btn-enroll:hover { background:var(--blue-dk); box-shadow:0 6px 20px rgba(26,86,219,.35); transform:translateY(-1px); }
                .btn-enroll-disabled { display:block; width:100%; padding:.65rem; background:#e2e8f0; color:#94a3b8; font-size:.825rem; font-weight:700; border-radius:.6rem; border:none; text-align:center; cursor:not-allowed; margin-top:auto; }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
                .skeleton-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden; }

                /* ── SERVICES ── */
                .grid-3 { display:grid; grid-template-columns:1fr; gap:1.25rem; }
                @media (min-width:640px) { .grid-3 { grid-template-columns:repeat(2,1fr); } }
                @media (min-width:900px) { .grid-3 { grid-template-columns:repeat(3,1fr); gap:1.75rem; } }
                .service-card { position:relative; overflow:hidden; border-radius:var(--radius-lg); display:block; text-decoration:none; }
                .service-img-wrap { height:240px; overflow:hidden; border-radius:var(--radius-lg); position:relative; }
                @media (min-width:768px) { .service-img-wrap { height:280px; } }
                .service-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .6s ease; display:block; }
                .service-card:hover .service-img-wrap img { transform:scale(1.07); }
                .service-img-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(5,10,25,.7) 0%,transparent 55%); border-radius:var(--radius-lg); }
                .service-content { position:absolute; bottom:0; left:0; right:0; padding:1.75rem; }
                .service-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:800; color:white; margin-bottom:.35rem; letter-spacing:-.02em; }
                .service-desc  { font-size:.8rem; color:rgba(255,255,255,.8); line-height:1.6; }

                /* ── CTA ── */
                .cta-section { background:var(--ink); padding:4rem 0; position:relative; overflow:hidden; }
                @media (min-width:768px) { .cta-section { padding:6rem 0; } }
                .cta-glow { position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(26,86,219,.18) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
                .cta-grid { display:grid; grid-template-columns:1fr; gap:2.5rem; align-items:center; text-align:center; }
                @media (min-width:768px) { .cta-grid { grid-template-columns:1fr auto; gap:4rem; text-align:left; } }
                .cta-eyebrow { font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#7abaff; margin-bottom:.75rem; display:block; }
                .cta-title { font-family:'Playfair Display',serif; font-size:clamp(1.75rem,4vw,3rem); font-weight:900; color:white; letter-spacing:-.03em; line-height:1.1; margin-bottom:1rem; }
                .cta-body { font-size:.95rem; color:rgba(255,255,255,.6); line-height:1.75; max-width:460px; margin:0 auto; }
                @media (min-width:768px) { .cta-body { margin:0; } }
                .cta-actions { display:flex; flex-direction:column; gap:.875rem; align-items:center; flex-shrink:0; width:100%; }
                @media (min-width:768px) { .cta-actions { width:auto; } }
                .btn-cta-primary { padding:.9rem 2.5rem; background:var(--blue); color:white; font-weight:700; font-size:1rem; border-radius:9999px; text-decoration:none; display:inline-block; box-shadow:0 8px 32px rgba(26,86,219,.45); transition:all .3s; white-space:nowrap; border:none; cursor:pointer; width:100%; text-align:center; }
                @media (min-width:768px) { .btn-cta-primary { width:auto; } }
                .btn-cta-primary:hover { background:var(--blue-dk); transform:translateY(-3px); box-shadow:0 14px 40px rgba(26,86,219,.55); }
                .btn-cta-outline { padding:.9rem 2.5rem; background:transparent; color:rgba(255,255,255,.8); font-weight:600; font-size:1rem; border-radius:9999px; text-decoration:none; display:inline-block; border:1.5px solid rgba(255,255,255,.2); transition:all .3s; white-space:nowrap; width:100%; text-align:center; }
                @media (min-width:768px) { .btn-cta-outline { width:auto; } }
                .btn-cta-outline:hover { border-color:rgba(255,255,255,.5); color:white; background:rgba(255,255,255,.05); }

                /* ── MODAL ── */
                .modal-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease; }
                @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                .modal-box { background:white; border-radius:1.25rem; width:100%; max-width:820px; position:relative; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:slideUp .25s ease; max-height:90vh; overflow-y:auto; }
                @keyframes slideUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
                .modal-close { position:absolute; top:1rem; right:1rem; z-index:2; width:36px; height:36px; border-radius:50%; background:#f1f5f9; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .2s; }
                .modal-close:hover { background:#e2e8f0; color:var(--ink); }
                .modal-inner { display:grid; grid-template-columns:1fr; min-height:auto; }
                @media (min-width:600px) { .modal-inner { grid-template-columns:1fr 1.1fr; min-height:360px; } }
                .modal-img-wrap { background:#f8fafc; display:flex; align-items:center; justify-content:center; padding:2rem; min-height:200px; }
                @media (min-width:600px) { .modal-img-wrap { min-height:auto; } }
                .modal-img-wrap img { width:100%; max-height:260px; object-fit:contain; border-radius:1rem; }
                @media (min-width:600px) { .modal-img-wrap img { max-height:320px; } }
                .modal-content { padding:1.75rem 1.5rem; display:flex; flex-direction:column; }
                @media (min-width:600px) { .modal-content { padding:2.5rem 2rem 2.5rem 1.5rem; } }
                .modal-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:800; color:var(--ink); letter-spacing:-.02em; margin-bottom:.6rem; line-height:1.2; }
                @media (min-width:600px) { .modal-title { font-size:1.6rem; } }
                .modal-status { display:flex; align-items:center; gap:.5rem; font-size:.875rem; font-weight:600; color:var(--muted); margin-bottom:.5rem; }
                .status-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
                .status-dot.green { background:var(--green); box-shadow:0 0 0 3px rgba(22,163,74,.15); }
                .status-dot.red   { background:var(--red);   box-shadow:0 0 0 3px rgba(224,32,32,.15); }
                .modal-type { font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.1em; color:var(--blue); background:var(--blue-lt); display:inline-block; padding:.2rem .65rem; border-radius:9999px; margin-bottom:.875rem; }
                .modal-desc { font-size:.9rem; color:#4a5568; line-height:1.75; flex:1; margin-bottom:1.25rem; }
                .btn-modal-book { display:block; width:100%; padding:.85rem; background:var(--blue); color:white; font-size:.95rem; font-weight:700; border-radius:.75rem; border:none; cursor:pointer; box-shadow:0 4px 16px rgba(26,86,219,.3); transition:all .25s; }
                .btn-modal-book:hover { background:var(--blue-dk); box-shadow:0 8px 28px rgba(26,86,219,.4); transform:translateY(-1px); }
                .btn-modal-disabled { display:block; width:100%; padding:.85rem; background:#e2e8f0; color:#94a3b8; font-size:.95rem; font-weight:700; border-radius:.75rem; border:none; cursor:not-allowed; }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:3rem; color:var(--muted); }
                .empty-state p { font-size:.925rem; margin-top:.75rem; }

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

            {/* MODAL */}
            {selectedMachine && (
                <MachineModal machine={selectedMachine} onClose={() => setSelectedMachine(null)} isLoggedIn={isLoggedIn} onRestrict={restrictAlert} />
            )}

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
                        <a href="/" className="nav-link active">Home</a>
                        <a href="/machines" className="nav-link">Machines</a>
                        <a href="/shop" className="nav-link">Shop</a>
                        <a href="/training" className="nav-link">Training</a>
                        <a href={getProjectsLink()} className="nav-link">Projects</a>
                        <a href="/about" className="nav-link">About</a>
                        <a href="/gallery" className="nav-link">Gallery</a>
                        <a href="/faq" className="nav-link">FAQ</a>
                        {isLoggedIn
                            ? <button className="nav-logout" onClick={handleLogout}>Logout</button>
                            : <Link to="/login" className="nav-login">Login</Link>
                        }
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
                    <a href="/" className="nav-mobile-link active" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="/machines" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Machines</a>
                    <a href="/shop" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Shop</a>
                    <a href="/training" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Training</a>
                    <a href={getProjectsLink()} className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Projects</a>
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
            <section className="hero">
                {heroSlides.map((s, i) => (
                    <div key={i} className={`hero-slide ${i === slideIdx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${s.bg})` }} />
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
                <div className="hero-dots">
                    {heroSlides.map((_, i) => (
                        <button key={i} className={`hero-dot ${i === slideIdx ? 'active' : ''}`}
                            onClick={() => setSlideIdx(i)} aria-label={`Slide ${i + 1}`} />
                    ))}
                </div>
                <div className="scroll-hint">
                    <span>Scroll</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <Reveal>
                <div className="stats-bar">
                    <div className="container">
                        <div className="stats-grid">
                            {[
                                [loading ? '…' : `${machines.length}+`, 'Machines Available'],
                                [loading ? '…' : `${courses.length}+`, 'Active Courses'],
                                [loading ? '…' : `${totalUsers}+`, 'Registered Members'],
                            ].map(([n, l]) => (
                                <div key={l}>
                                    <span className="stat-num">{n}</span>
                                    <span className="stat-label">{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* ═══ MACHINES — auto-scrolling carousel ═══ */}
            <section className="section">
                <div className="container">
                    <Reveal>
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
                    </Reveal>

                    {loading ? (
                        /* skeleton row */
                        <div style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton-card" style={{ width: 280, flexShrink: 0 }}>
                                    <div className="skeleton" style={{ height: 220 }} />
                                    <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                                        <div className="skeleton" style={{ height: 12, width: '35%' }} />
                                        <div className="skeleton" style={{ height: 16, width: '70%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '90%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '60%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '40%', marginTop: '.2rem' }} />
                                        <div className="skeleton" style={{ height: 38, borderRadius: '.65rem', marginTop: '.25rem' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : machines.length === 0 ? (
                        <div className="empty-state">
                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto', opacity: .4 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            </svg>
                            <p>No machines available right now.</p>
                        </div>
                    ) : (
                        /* ── Carousel ── */
                        <div
                            className="machine-carousel-outer"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <div className={`machine-carousel-track ${isPaused ? 'paused' : ''}`}>
                                {displayMachines.map((m, idx) => {
                                    const imgSrc = getImageUrl(m.image) || FALLBACK_MACHINE;
                                    const isAvail = m.status === 'available';
                                    const tagCls = m.status === 'available' ? 'tag-available' : m.status === 'maintenance' ? 'tag-maintenance' : 'tag-offline';
                                    const tagLbl = m.status === 'available' ? 'Available' : m.status === 'maintenance' ? 'Maintenance' : 'Offline';
                                    return (
                                        <div key={`${m.id}-${idx}`} className="machine-card">
                                            <div className="machine-img-wrap">
                                                <img src={imgSrc} alt={m.name}
                                                    onError={e => { e.currentTarget.src = FALLBACK_MACHINE; }} />
                                                <span className={`machine-tag ${tagCls}`}>{tagLbl}</span>
                                            </div>
                                            <div className="machine-body">
                                                {m.type && <span className="machine-type">{m.type}</span>}
                                                <h3 className="machine-title">{m.name}</h3>
                                                <p className="machine-desc">{m.description || 'High-precision fabrication machine available for booking.'}</p>
                                                <button
                                                    className="btn-read-more-link"
                                                    onClick={() => setSelectedMachine(m)}
                                                >
                                                    Read More
                                                </button>
                                                {isAvail
                                                    ? <button className="btn-book" onClick={handleBookClick}>Book</button>
                                                    : <span className="btn-book-disabled">{m.status === 'maintenance' ? 'Under Maintenance' : 'Unavailable'}</span>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ TRAINING ═══ */}
            <section className="section section-alt">
                <div className="container">
                    <Reveal>
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
                    </Reveal>

                    {loading ? (
                        <div className="grid-4">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton" style={{ height: 140 }} />
                                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                                        <div className="skeleton" style={{ height: 12, width: '30%' }} />
                                        <div className="skeleton" style={{ height: 16, width: '80%' }} />
                                        <div className="skeleton" style={{ height: 36, borderRadius: '.6rem', marginTop: '.3rem' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="empty-state">
                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto', opacity: .4 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p>No courses available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid-4">
                            {courses.map((c, idx) => {
                                const imgSrc = getImageUrl(c.image) || FALLBACK_COURSE;
                                const duration = calcDuration(c.start_date, c.end_date);
                                const seatsLeft = Math.max(0, (c.seat_limit || 0) - (c.enrollment || 0));
                                const canEnroll = c.registration_open && seatsLeft > 0;
                                return (
                                    <Reveal key={c.id} delay={idx * 0.08}>
                                        <div className="course-card">
                                            <div className="course-img-wrap">
                                                <img src={imgSrc} alt={c.title} onError={e => { e.currentTarget.src = FALLBACK_COURSE; }} />
                                                <div className="course-img-overlay" />
                                            </div>
                                            <div className="course-body">
                                                <div className="course-top">
                                                    {c.registration_open ? <span className="badge-open">Open</span> : <span className="badge-closed">Closed</span>}
                                                    {duration && <span className="badge-dur">{duration}</span>}
                                                </div>
                                                <h3 className="course-title">{c.title}</h3>
                                                {c.instructor && <p className="course-instructor">— {c.instructor}</p>}
                                                <div className="course-meta-row">
                                                    {c.start_date && (
                                                        <div className="cmeta">
                                                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {formatDate(c.start_date)}
                                                        </div>
                                                    )}
                                                    <div className="cmeta">
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {seatsLeft === 0 ? 'Full' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
                                                    </div>
                                                </div>
                                                {canEnroll
                                                    ? <button className="btn-enroll" onClick={handleEnrollClick}>Enroll Now</button>
                                                    : <span className="btn-enroll-disabled">{seatsLeft === 0 ? 'Course Full' : 'Registration Closed'}</span>
                                                }
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ SERVICES ═══ */}
            <section className="section">
                <div className="container">
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                            <span className="section-label">What We Offer</span>
                            <h2 className="section-title">Our Services</h2>
                            <p className="section-sub" style={{ maxWidth: '40rem', margin: '.4rem auto 0' }}>
                                Everything you need to design, prototype, and bring your ideas to life
                            </p>
                        </div>
                    </Reveal>
                    <div className="grid-3">
                        {[
                            { img: '../images/custom.jpg', title: 'Machine Booking', desc: 'Reserve industry-grade fabrication equipment — 3D printers, CNC routers, laser cutters and more — on your schedule.', link: '/machines' },
                            { img: '../images/workshop.jpg', title: 'Workshops & Training', desc: 'Expert-led, hands-on sessions covering CNC, laser cutting, 3D printing, electronics, and more.', link: '/training' },
                            { img: '../images/collaborative.jpg', title: 'Custom Fabrication Orders', desc: 'Submit a design brief and our production team turns your concept into a precision-fabricated physical product.', link: (!isLoggedIn) ? '/login' : (userRole === 'admin') ? null : (userRole === 'production_team') ? '/production-team/custom-orders' : '/user/shop-orders?tab=custom' },
                        ].map((s, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <a href={s.link || undefined} onClick={s.link === null ? (e) => { e.preventDefault(); restrictAlert(); } : undefined} className="service-card">
                                    <div className="service-img-wrap">
                                        <img src={s.img} alt={s.title} />
                                        <div className="service-img-overlay" />
                                        <div className="service-content">
                                            <h3 className="service-title">{s.title}</h3>
                                            <p className="service-desc">{s.desc}</p>
                                        </div>
                                    </div>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="cta-section">
                <div className="cta-glow" />
                <div className="container">
                    <Reveal>
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
                    </Reveal>
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
                            <p className="footer-about">
                                The JNEC Fabrication Lab provides access to digital fabrication tools and hands-on training for students, faculty, and the wider community.
                            </p>
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
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                            </a>
                            <a href="https://www.facebook.com/share/18HY9mpzDF/" target="_blank" rel="noreferrer" className="social-btn" aria-label="Facebook">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="http://www.youtube.com/@JNECFabLab" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
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