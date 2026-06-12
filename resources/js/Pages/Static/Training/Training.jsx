import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
}
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

function calcDuration(start, end) {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (days === 0) return '1 Day';
    if (days < 7) return `${days} Day${days !== 1 ? 's' : ''}`;
    if (days < 30) { const w = Math.round(days / 7); return `${w} Week${w !== 1 ? 's' : ''}`; }
    const m = Math.round(days / 30); return `${m} Month${m !== 1 ? 's' : ''}`;
}
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
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

function CourseModal({ course, onClose, isLoggedIn, onEnroll }) {
    if (!course) return null;
    const imgSrc = getImageUrl(course.image) || FALLBACK_IMG;
    const seatsLeft = Math.max(0, (course.seat_limit || 0) - (course.enrollment || 0));
    const isFull = seatsLeft === 0;
    const canEnroll = course.registration_open && !isFull && course.status !== 'completed';
    const duration = calcDuration(course.start_date, course.end_date);
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="modal-inner">
                    <div className="modal-img-side">
                        <img src={imgSrc} alt={course.title} onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
                        <span className={`modal-status-badge ${course.registration_open && !isFull ? 'badge-open' : isFull ? 'badge-full' : course.status === 'completed' ? 'badge-completed' : 'badge-closed'}`}>
                            {course.registration_open && !isFull ? 'Open' : isFull ? 'Full' : course.status === 'completed' ? 'Completed' : 'Closed'}
                        </span>
                    </div>
                    <div className="modal-info-side">
                        <h2 className="modal-title">{course.title}</h2>
                        {course.instructor && <p className="modal-instructor"><span className="modal-instructor-label">Instructor:</span> {course.instructor}</p>}
                        {course.description && <p className="modal-desc">{course.description}</p>}
                        <div className="modal-meta-grid">
                            {duration && (
                                <div className="modal-meta-item">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>Duration: {duration}</span>
                                </div>
                            )}
                            {course.start_date && (
                                <div className="modal-meta-item">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>Starts: {formatDate(course.start_date)}</span>
                                </div>
                            )}
                            {course.end_date && (
                                <div className="modal-meta-item">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>Ends: {formatDate(course.end_date)}</span>
                                </div>
                            )}
                            <div className={`modal-meta-item ${isFull ? 'warn' : seatsLeft <= 3 ? 'low' : ''}`}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>{isFull ? 'No seats left' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}</span>
                            </div>
                        </div>
                        {course.status === 'completed' ? (
                            <span className="btn-modal-disabled">Course Completed</span>
                        ) : !canEnroll ? (
                            <span className="btn-modal-disabled">{isFull ? 'Course Full' : 'Registration Closed'}</span>
                        ) : (
                            <button className="btn-modal-enroll" onClick={() => { onEnroll(course); onClose(); }}>Enroll Now →</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Training() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroIdx, setHeroIdx] = useState(0);
    const [toast, setToast] = useState(null);
    const [selected, setSelected] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

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
        if (!isRegularUser) { showToast('This feature is only available for regular users.', 'warn'); return; }
        cb();
    };
    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
    };

    const heroSlides = ['../images/home.jpg', '../images/home2.jpg', '../images/home3.jpg'];

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(p => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(t);
    }, []);
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/home/courses`);
                if (res.ok) { const d = await res.json(); setCourses(d.data || d); }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);
    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') setSelected(null); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []);

    const showToast = useCallback((msg, type = 'warn') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);
    const handleEnroll = useCallback((course) => {
        if (!isLoggedIn) { showToast('Please login to enroll in this course', 'warn'); return; }
        if (!isRegularUser) { showToast('This feature is only available for regular users.', 'warn'); return; }
        navigate('/user/learning');
    }, [isLoggedIn, isRegularUser, navigate, showToast]);

    const openCount = courses.filter(c => c.registration_open).length;

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#0d1117', overflowX: 'hidden', maxWidth: '100vw' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

                :root {
                    --blue:     #1a56db;
                    --blue-dk:  #1446b8;
                    --blue-lt:  #e8f0fe;
                    --red:      #e02020;
                    --red-dk:   #c01a1a;
                    --red-lt:   #fdecea;
                    --green:    #16a34a;
                    --green-dk: #0f7a38;
                    --green-lt: #dcfce7;
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
                /* Hero inner: stacks on mobile, side-by-side on 900px+ */
                .page-hero-inner { max-width:82rem; margin:0 auto; padding:3rem 1.25rem 2.5rem; position:relative; z-index:3; display:grid; grid-template-columns:1fr; gap:2rem; align-items:center; }
                @media (min-width:640px)  { .page-hero-inner { padding:4rem 1.75rem 3rem; } }
                @media (min-width:900px)  { .page-hero-inner { grid-template-columns:1fr auto; gap:3rem; } }
                @media (min-width:1024px) { .page-hero-inner { padding:5rem 2rem 4rem; gap:4rem; } }
                .page-eyebrow { display:inline-flex; align-items:center; gap:.5rem; padding:.3rem .9rem; border-radius:9999px; background:rgba(26,86,219,.18); border:1px solid rgba(26,86,219,.35); color:#7abaff; font-size:.7rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.25rem; animation:eyebrowIn .8s ease both, gentleBounce 3s ease-in-out 1s infinite; }
                @keyframes eyebrowIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                @keyframes gentleBounce { 0%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}60%{transform:translateY(-4px)} }
                .page-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#7abaff; animation:pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)} }
                .page-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,5vw,4rem); font-weight:900; color:white; letter-spacing:-.03em; line-height:1.05; margin-bottom:1rem; animation:eyebrowIn .9s .15s ease both; }
                .page-title .accent { color:#7abaff; font-style:italic; }
                .page-subtitle { font-size:clamp(.875rem,2vw,1rem); color:rgba(255,255,255,.6); max-width:480px; line-height:1.75; margin-bottom:2rem; animation:eyebrowIn 1s .3s ease both; }
                .page-hero-stats { display:flex; gap:1.75rem; flex-wrap:wrap; animation:eyebrowIn 1s .45s ease both; }
                @media (min-width:640px) { .page-hero-stats { gap:2.5rem; } }
                .phero-stat-num   { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,4vw,2rem); font-weight:900; color:white; display:block; line-height:1; }
                .phero-stat-label { font-size:.68rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.1em; text-transform:uppercase; margin-top:.25rem; display:block; }
                /* Info card — full width on mobile, fixed width on desktop */
                .hero-info-card { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:var(--radius-lg); padding:1.5rem; backdrop-filter:blur(12px); animation:eyebrowIn 1s .3s ease both; width:100%; }
                @media (min-width:900px) { .hero-info-card { min-width:260px; max-width:300px; padding:2rem 2.25rem; } }
                @media (min-width:1100px) { .hero-info-card { min-width:280px; max-width:320px; } }
                .hero-info-card-icon { font-size:1.75rem; margin-bottom:.75rem; }
                @media (min-width:640px) { .hero-info-card-icon { font-size:2rem; } }
                .hero-info-card h3 { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:white; margin-bottom:.5rem; }
                @media (min-width:640px) { .hero-info-card h3 { font-size:1.1rem; } }
                .hero-info-card p  { font-size:.82rem; color:rgba(255,255,255,.6); line-height:1.7; margin-bottom:1.25rem; }
                .btn-info { display:inline-block; padding:.55rem 1.25rem; background:white; color:var(--ink); font-weight:700; font-size:.8rem; border-radius:9999px; text-decoration:none; border:none; cursor:pointer; transition:all .25s; }
                @media (min-width:640px) { .btn-info { padding:.6rem 1.4rem; font-size:.82rem; } }
                .btn-info:hover { background:var(--blue-lt); color:var(--blue); }

                /* ── COURSES SECTION ── */
                .courses-section { padding:2.5rem 0 4rem; }
                @media (min-width:768px) { .courses-section { padding:4.5rem 0 6rem; } }
                .courses-container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px)  { .courses-container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .courses-container { padding:0 2rem; } }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.65rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; }
                .section-sub { font-size:.9rem; color:var(--muted); margin-top:.4rem; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }

                /* ── COURSES GRID — responsive ── */
                .courses-grid { display:grid; grid-template-columns:1fr; gap:1.25rem; margin-top:2.5rem; }
                @media (min-width:540px)  { .courses-grid { grid-template-columns:repeat(2,1fr); gap:1.5rem; } }
                @media (min-width:1024px) { .courses-grid { grid-template-columns:repeat(4,1fr); margin-top:3rem; } }

                /* ── COURSE CARD ── */
                .course-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.04); overflow:hidden; display:flex; flex-direction:column; height:100%; transition:transform .35s,box-shadow .35s; }
                .course-card:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(0,0,0,.1); }
                .course-img-wrap { height:150px; min-height:150px; overflow:hidden; position:relative; flex-shrink:0; }
                @media (min-width:540px) { .course-img-wrap { height:160px; min-height:160px; } }
                .course-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .6s ease; }
                .course-card:hover .course-img-wrap img { transform:scale(1.06); }
                .course-img-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(5,10,25,.55) 0%,transparent 55%); }
                .course-status-tag { position:absolute; top:.65rem; left:.65rem; font-size:.6rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.22rem .65rem; border-radius:9999px; }
                .tag-open      { background:var(--green);  color:white; }
                .tag-closed    { background:#64748b;       color:white; }
                .tag-full      { background:var(--red);    color:white; }
                .tag-completed { background:#1e293b;       color:#94a3b8; }
                .tag-upcoming  { background:var(--blue);   color:white; }
                .tag-open-dot  { display:inline-block; width:5px; height:5px; border-radius:50%; background:white; margin-right:.3rem; animation:pulse 2s ease-in-out infinite; vertical-align:middle; }
                .course-card-body { padding:1rem 1.1rem 1.2rem; flex:1; display:flex; flex-direction:column; }
                .course-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:800; color:var(--ink); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:.3rem; }
                @media (min-width:540px) { .course-title { font-size:1rem; } }
                .course-instructor-line { font-size:.775rem; color:var(--muted); margin-bottom:.4rem; }
                .course-instructor-line strong { font-weight:600; color:var(--ink-2); }
                .course-meta-row { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; margin-bottom:.4rem; }
                .cmeta { display:inline-flex; align-items:center; gap:.3rem; font-size:.7rem; color:var(--muted); font-weight:500; background:var(--offwhite); padding:.22rem .5rem; border-radius:.4rem; }
                @media (min-width:540px) { .cmeta { font-size:.72rem; padding:.25rem .55rem; } }
                .cmeta svg { color:var(--blue); flex-shrink:0; }
                .cmeta.seats-low  { background:#fef3c7; color:#92400e; }
                .cmeta.seats-low svg { color:#d97706; }
                .cmeta.seats-none { background:var(--red-lt); color:var(--red-dk); }
                .cmeta.seats-none svg { color:var(--red); }
                .course-body-spacer { flex:1; min-height:.5rem; }
                .btn-read-more { display:inline-block; font-size:.82rem; font-weight:700; color:var(--green); background:none; border:none; padding:.4rem 0 .1rem; cursor:pointer; text-align:left; transition:color .2s; }
                .btn-read-more:hover { color:var(--green-dk); text-decoration:underline; }
                .btn-enroll { display:block; width:100%; padding:.7rem; background:var(--blue); color:white; font-size:.82rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; box-shadow:0 3px 12px rgba(26,86,219,.25); transition:all .22s; text-align:center; margin-top:.4rem; }
                @media (min-width:540px) { .btn-enroll { font-size:.845rem; } }
                .btn-enroll:hover { background:var(--blue-dk); transform:translateY(-1px); }
                .btn-enroll-login { display:block; width:100%; padding:.7rem; background:var(--blue); color:white; font-size:.82rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; box-shadow:0 3px 12px rgba(26,86,219,.25); transition:all .22s; text-align:center; margin-top:.4rem; }
                .btn-enroll-login:hover { background:var(--blue-dk); transform:translateY(-1px); }
                .btn-enroll-disabled { display:block; width:100%; padding:.7rem; background:#e2e8f0; color:#94a3b8; font-size:.82rem; font-weight:700; border-radius:.65rem; border:none; text-align:center; cursor:not-allowed; margin-top:.4rem; }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
                .skeleton-card { background:var(--card-bg); border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden; }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:4rem 0; color:var(--muted); }
                .empty-state svg { color:#cbd5e1; margin:0 auto 1.25rem; display:block; }
                .empty-state h3 { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--ink); margin-bottom:.5rem; }
                .empty-state p { font-size:.9rem; }

                /* ── TOAST ── */
                .toast-wrap { position:fixed; top:1.25rem; left:50%; transform:translateX(-50%); z-index:9999; display:flex; align-items:center; gap:.75rem; padding:.8rem 1.25rem; border-radius:.75rem; font-size:.875rem; font-weight:600; box-shadow:0 8px 32px rgba(0,0,0,.3); white-space:nowrap; animation:toastSlide .3s ease; max-width:90vw; }
                .toast-wrap.warn    { background:#3b1219; color:#f4a4a4; border:1px solid rgba(244,164,164,.2); }
                .toast-wrap.success { background:var(--ink); color:white; border:1px solid rgba(255,255,255,.08); }
                .toast-close { margin-left:auto; background:none; border:none; cursor:pointer; color:inherit; opacity:.6; padding:0; display:flex; align-items:center; flex-shrink:0; }
                .toast-close:hover { opacity:1; }
                @keyframes toastSlide { from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)} }

                /* ── MODAL ── */
                .modal-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease; }
                @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                .modal-box { background:white; border-radius:1.25rem; width:100%; max-width:780px; position:relative; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:slideUp .25s ease; max-height:90vh; overflow-y:auto; }
                @keyframes slideUp { from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)} }
                .modal-close { position:absolute; top:1rem; right:1rem; z-index:10; width:32px; height:32px; border-radius:50%; background:#f1f5f9; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .2s; }
                .modal-close:hover { background:#e2e8f0; color:var(--ink); }
                /* stack on mobile, side-by-side on 560px+ */
                .modal-inner { display:grid; grid-template-columns:1fr; }
                @media (min-width:560px) { .modal-inner { grid-template-columns:1fr 1.1fr; min-height:380px; } }
                .modal-img-side { position:relative; overflow:hidden; background:#f0f4f8; display:flex; align-items:center; justify-content:center; min-height:200px; }
                @media (min-width:560px) { .modal-img-side { min-height:auto; } }
                .modal-img-side img { width:100%; height:100%; object-fit:cover; display:block; }
                .modal-status-badge { position:absolute; top:.8rem; left:.8rem; font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.28rem .75rem; border-radius:9999px; }
                .badge-open     { background:var(--green); color:white; }
                .badge-full     { background:var(--red);   color:white; }
                .badge-closed   { background:#64748b;      color:white; }
                .badge-completed{ background:#1e293b;      color:#94a3b8; }
                .modal-info-side { padding:1.75rem 1.5rem; display:flex; flex-direction:column; }
                @media (min-width:560px) { .modal-info-side { padding:2.25rem 2rem 2.25rem 1.75rem; overflow-y:auto; max-height:520px; } }
                .modal-title { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:800; color:var(--ink); letter-spacing:-.02em; margin-bottom:.5rem; line-height:1.25; }
                @media (min-width:560px) { .modal-title { font-size:1.45rem; } }
                .modal-instructor { font-size:.875rem; color:var(--muted); margin-bottom:.875rem; }
                .modal-instructor-label { font-weight:700; color:var(--ink-2); }
                .modal-desc { font-size:.875rem; color:#4a5568; line-height:1.78; margin-bottom:1.25rem; flex:1; }
                .modal-meta-grid { display:flex; flex-direction:column; gap:.5rem; margin-bottom:1.5rem; }
                .modal-meta-item { display:flex; align-items:center; gap:.5rem; font-size:.8rem; color:var(--muted); font-weight:500; background:var(--offwhite); padding:.45rem .85rem; border-radius:.55rem; }
                .modal-meta-item svg { color:var(--blue); flex-shrink:0; }
                .modal-meta-item.warn { background:var(--red-lt); color:var(--red-dk); }
                .modal-meta-item.warn svg { color:var(--red); }
                .modal-meta-item.low  { background:#fef3c7; color:#92400e; }
                .modal-meta-item.low svg { color:#d97706; }
                .btn-modal-enroll { display:block; width:100%; padding:.875rem; background:var(--blue); color:white; font-size:.95rem; font-weight:700; border-radius:.75rem; border:none; cursor:pointer; box-shadow:0 4px 16px rgba(26,86,219,.3); transition:all .25s; text-align:center; }
                .btn-modal-enroll:hover { background:var(--blue-dk); transform:translateY(-1px); }
                .btn-modal-disabled { display:block; width:100%; padding:.875rem; background:#e2e8f0; color:#94a3b8; font-size:.95rem; font-weight:700; border-radius:.75rem; border:none; text-align:center; cursor:not-allowed; }

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

            {selected && <CourseModal course={selected} onClose={() => setSelected(null)} isLoggedIn={isLoggedIn} onEnroll={handleEnroll} />}

            {toast && (
                <div className={`toast-wrap ${toast.type}`}>
                    {toast.type === 'warn' ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.msg}</span>
                    <button className="toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            {/* ═══ NAV ═══ */}
            <nav className="nav-root">
                <div className="nav-inner">
                    <a href="/" className="nav-logo-wrap">
                        <div className="nav-logo-circle">
                            <img src="/images/logo.png" alt="JNEC Fab Lab" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
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
                        <a href="/training" className="nav-link active">Training</a>
                        <a href={getProjectsLink()} className="nav-link">Projects</a>
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
                    <a href="/training" className="nav-mobile-link active" onClick={() => setMenuOpen(false)}>Training</a>
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
            <div className="page-hero">
                {heroSlides.map((src, i) => (
                    <div key={i} className={`hero-bg-slide ${i === heroIdx ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
                ))}
                <div className="hero-bg-overlay" /><div className="page-hero-grid" /><div className="page-hero-glow" /><div className="page-hero-glow2" />
                <div className="page-hero-inner">
                    <div>
                        <div className="page-eyebrow"><span className="page-eyebrow-dot" />Skill Development</div>
                        <h1 className="page-title">Training <span className="accent">Courses</span></h1>
                        <p className="page-subtitle">Build essential fabrication skills with hands-on training from experienced instructors — covering everything from 3D printing to electronics and CNC.</p>
                        <div className="page-hero-stats">
                            {[[loading ? '…' : `${courses.length}`, 'Total Courses'], [loading ? '…' : `${openCount}`, 'Open for Enroll'], ['Free', 'For Members']].map(([n, l]) => (
                                <div key={l}><span className="phero-stat-num">{n}</span><span className="phero-stat-label">{l}</span></div>
                            ))}
                        </div>
                    </div>
                    <div className="hero-info-card">
                        <div className="hero-info-card-icon">🎓</div>
                        <h3>New to the Fab Lab?</h3>
                        <p>All first-time users must complete a mandatory safety orientation before booking any machines.</p>
                        <a href="/about" className="btn-info">Learn about orientation →</a>
                    </div>
                </div>
            </div>

            {/* ═══ COURSES ═══ */}
            <section className="courses-section">
                <div className="courses-container">
                    <Reveal>
                        <div>
                            <span className="section-label">Courses</span>
                            <h2 className="section-title">Available Courses</h2>
                            <p className="section-sub">{isLoggedIn ? 'Click "Read More" for details, then enroll' : 'Login to enroll — seats are limited'}</p>
                            <div className="divider" />
                        </div>
                    </Reveal>
                    {loading ? (
                        <div className="courses-grid">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton" style={{ height: 150 }} />
                                    <div style={{ padding: '1rem 1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                                        <div className="skeleton" style={{ height: 18, width: '80%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '55%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '70%' }} />
                                        <div className="skeleton" style={{ height: 14, width: '30%', marginTop: '.25rem' }} />
                                        <div className="skeleton" style={{ height: 38, borderRadius: '.65rem' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="empty-state" style={{ marginTop: '3rem' }}>
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3>No courses available</h3>
                            <p>Check back soon for upcoming training sessions.</p>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {courses.map((course, idx) => {
                                const imgSrc = getImageUrl(course.image) || FALLBACK_IMG;
                                const seatsLeft = Math.max(0, (course.seat_limit || 0) - (course.enrollment || 0));
                                const isFull = seatsLeft === 0;
                                const canEnroll = course.registration_open && !isFull && course.status !== 'completed';
                                const duration = calcDuration(course.start_date, course.end_date);
                                const seatsClass = isFull ? 'seats-none' : seatsLeft <= 3 ? 'seats-low' : '';
                                let tagLabel = 'Open', tagCls = 'tag-open';
                                if (isFull) { tagLabel = 'Full'; tagCls = 'tag-full'; }
                                else if (course.status === 'completed') { tagLabel = 'Completed'; tagCls = 'tag-completed'; }
                                else if (course.status === 'upcoming') { tagLabel = 'Upcoming'; tagCls = 'tag-upcoming'; }
                                else if (!course.registration_open) { tagLabel = 'Closed'; tagCls = 'tag-closed'; }
                                return (
                                    <Reveal key={course.id} delay={(idx % 4) * 0.07}>
                                        <div className="course-card">
                                            <div className="course-img-wrap">
                                                <img src={imgSrc} alt={course.title} onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
                                                <div className="course-img-overlay" />
                                                <span className={`course-status-tag ${tagCls}`}>
                                                    {tagCls === 'tag-open' && <span className="tag-open-dot" />}
                                                    {tagLabel}
                                                </span>
                                            </div>
                                            <div className="course-card-body">
                                                <h3 className="course-title">{course.title}</h3>
                                                {course.instructor && <p className="course-instructor-line"><strong>Instructor:</strong> {course.instructor}</p>}
                                                <div className="course-meta-row">
                                                    {duration && (
                                                        <span className="cmeta">
                                                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            {duration}
                                                        </span>
                                                    )}
                                                    {course.start_date && (
                                                        <span className="cmeta">
                                                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {formatDate(course.start_date)}
                                                        </span>
                                                    )}
                                                    <span className={`cmeta ${seatsClass}`}>
                                                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {isFull ? 'Full' : `${seatsLeft} left`}
                                                    </span>
                                                </div>
                                                <div className="course-body-spacer" />
                                                <button className="btn-read-more" onClick={() => setSelected(course)}>Read More</button>
                                                {course.status === 'completed' ? (
                                                    <span className="btn-enroll-disabled">Course Completed</span>
                                                ) : !canEnroll ? (
                                                    <span className="btn-enroll-disabled">{isFull ? 'Course Full' : 'Registration Closed'}</span>
                                                ) : isLoggedIn ? (
                                                    <button className="btn-enroll" onClick={() => handleEnroll(course)}>Enroll Now</button>
                                                ) : (
                                                    <button className="btn-enroll-login" onClick={() => handleEnroll(course)}>Enroll Now</button>
                                                )}
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

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
        </div>
    );
}