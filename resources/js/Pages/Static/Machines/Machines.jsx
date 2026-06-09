import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
}

const FALLBACK = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';

function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
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
            minWidth: 0, width: '100%',
            ...style
        }}>{children}</div>
    );
}

function MachineModal({ machine, onClose, isLoggedIn }) {
    const navigate = useNavigate();
    if (!machine) return null;
    const imgSrc = getImageUrl(machine.image) || FALLBACK;
    const isAvail = machine.status === 'available';
    const handleBook = () => { onClose(); navigate(isLoggedIn ? '/dashboard/bookings' : '/login'); };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="modal-inner">
                    <div className="modal-img-side">
                        <img src={imgSrc} alt={machine.name} onError={e => { e.currentTarget.src = FALLBACK; }} />
                    </div>
                    <div className="modal-info-side">
                        <h2 className="modal-title">{machine.name}</h2>
                        <div className="modal-status-row">
                            <span className={`modal-status-dot ${isAvail ? 'green' : 'red'}`} />
                            <span className="modal-status-text">
                                {isAvail ? 'Operational' : machine.status === 'maintenance' ? 'Under Maintenance' : 'Offline'}
                            </span>
                        </div>
                        {machine.type && <span className="modal-type-badge">{machine.type}</span>}
                        <p className="modal-desc">{machine.description || 'High-precision fabrication machine available for booking.'}</p>
                        <div className="modal-meta-grid">
                            {machine.runtime_hours != null && (
                                <div className="modal-meta-item">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{machine.runtime_hours} hrs runtime</span>
                                </div>
                            )}
                            {machine.last_used_at && (
                                <div className="modal-meta-item">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Last used: {new Date(machine.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                        {isAvail
                            ? <button className="btn-modal-book" onClick={handleBook}>Book Machine</button>
                            : <button className="btn-modal-disabled" disabled>
                                {machine.status === 'maintenance' ? 'Under Maintenance' : 'Unavailable'}
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Machines() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [machines, setMachines] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, in_use: 0, maintenance: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [heroSlideIdx, setHeroSlideIdx] = useState(0);

    const heroSlides = ['../images/b1.jpg', '../images/b2.jpg', '../images/b3.webp'];
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setHeroSlideIdx(p => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') setSelectedMachine(null); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const params = search ? `?search=${encodeURIComponent(search)}` : '';
                const res = await fetch(`${API_BASE}/home/machines${params}`);
                if (res.ok) {
                    const d = await res.json();
                    setMachines(d.data || d);
                    if (d.stats) setStats(d.stats);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [search]);

    const handleBookClick = useCallback(() => {
        navigate(isLoggedIn ? '/dashboard/bookings' : '/login');
    }, [isLoggedIn, navigate]);

    const statusLabel = (s) => s === 'available' ? 'Available' : s === 'maintenance' ? 'Maintenance' : s === 'in_use' ? 'In Use' : 'Offline';
    const statusClass = (s) => s === 'available' ? 'tag-available' : s === 'maintenance' ? 'tag-maintenance' : s === 'in_use' ? 'tag-in-use' : 'tag-offline';

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
                /* hamburger */
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

                /* ── PAGE HERO ── */
                .page-hero { padding-top:72px; background:var(--ink); position:relative; overflow:hidden; }
                .hero-bg-slide { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; transition:opacity 1.4s ease; z-index:0; }
                .hero-bg-slide.active { opacity:1; }
                .hero-bg-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(165deg,rgba(5,10,25,.82) 0%,rgba(5,10,25,.68) 55%,rgba(10,30,90,.5) 100%); }
                .page-hero-grid { position:absolute; inset:0; z-index:2; opacity:.04; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:48px 48px; }
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
                .page-subtitle { font-size:clamp(.875rem,2vw,1rem); color:rgba(255,255,255,.6); max-width:480px; line-height:1.75; animation:eyebrowIn 1s .3s ease both; }
                .page-hero-stats { display:flex; gap:1.75rem; margin-top:2rem; flex-wrap:wrap; animation:eyebrowIn 1s .45s ease both; }
                @media (min-width:640px) { .page-hero-stats { gap:2.5rem; margin-top:3rem; } }
                .phero-stat-num { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,4vw,2rem); font-weight:900; color:white; display:block; line-height:1; }
                .phero-stat-label { font-size:.68rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.1em; text-transform:uppercase; margin-top:.25rem; display:block; }

                /* ── CONTROLS BAR ── */
                .controls-bar { background:var(--card-bg); border-bottom:1px solid var(--border); position:sticky; top:72px; z-index:50; box-shadow:0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width:82rem; margin:0 auto; padding:.875rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
                @media (min-width:640px)  { .controls-inner { padding:1rem 1.75rem; gap:1.25rem; } }
                @media (min-width:1024px) { .controls-inner { padding:1.1rem 2rem; } }
                .results-count { font-size:.8rem; color:var(--muted); font-weight:500; white-space:nowrap; flex-shrink:0; }
                .search-wrap { display:flex; align-items:center; gap:.6rem; background:var(--offwhite); border:1.5px solid var(--border); border-radius:9999px; padding:.45rem 1rem; flex:1; min-width:0; max-width:320px; transition:border-color .2s; }
                @media (max-width:480px) { .search-wrap { max-width:100%; width:100%; } }
                .search-wrap:focus-within { border-color:var(--blue); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
                .search-wrap svg { flex-shrink:0; color:var(--muted); }
                .search-wrap input { border:none; background:transparent; outline:none; font-size:.875rem; color:var(--ink); font-family:inherit; width:100%; min-width:0; }
                .search-wrap input::placeholder { color:#a0aec0; }

                /* ── MACHINES SECTION ── */
                .machines-section { padding:2.5rem 0 4rem; }
                @media (min-width:768px) { .machines-section { padding:4rem 0 6rem; } }
                .machines-container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px)  { .machines-container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .machines-container { padding:0 2rem; } }
                /* Responsive grid: 1 col → 2 col → 3 col */
                .machines-grid { display:grid; grid-template-columns:1fr; gap:1.25rem; }
                @media (min-width:540px)  { .machines-grid { grid-template-columns:repeat(2,1fr); gap:1.5rem; } }
                @media (min-width:1024px) { .machines-grid { grid-template-columns:repeat(3,1fr); gap:1.75rem; } }

                /* ── MACHINE CARD ── */
                .machine-card { background:#fff; border-radius:1.25rem; border:1px solid rgba(0,0,0,.08); box-shadow:0 2px 16px rgba(0,0,0,.06); display:flex; flex-direction:column; padding:1rem; gap:.85rem; transition:box-shadow .35s,transform .35s; }
                .machine-card:hover { transform:translateY(-6px); box-shadow:0 24px 52px rgba(0,0,0,.12); }
                .machine-img-box { width:100%; height:200px; background:#f0f4f8; border:1px solid rgba(0,0,0,.07); border-radius:.85rem; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; flex-shrink:0; }
                @media (min-width:540px) { .machine-img-box { height:220px; } }
                .machine-img-box img { width:88%; height:88%; object-fit:contain; transition:transform .55s ease; }
                .machine-card:hover .machine-img-box img { transform:scale(1.05); }
                .machine-status-tag { position:absolute; top:.65rem; left:.65rem; font-size:.6rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:.2rem .6rem; border-radius:9999px; }
                .tag-available   { background:var(--green); color:white; }
                .tag-maintenance { background:var(--red);   color:white; }
                .tag-in-use      { background:var(--blue);  color:white; }
                .tag-offline     { background:#64748b;      color:white; }
                .machine-card-body { display:flex; flex-direction:column; gap:.4rem; flex:1; }
                .machine-card-type { font-size:.65rem; color:#a0aec0; text-transform:uppercase; letter-spacing:.07em; }
                .machine-card-name { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:var(--ink); line-height:1.3; letter-spacing:-.01em; }
                @media (min-width:540px) { .machine-card-name { font-size:1.1rem; } }
                .machine-card-desc { font-size:.83rem; color:var(--muted); line-height:1.7; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; flex:1; }
                .machine-card-meta { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; margin-top:.2rem; }
                .meta-chip { display:inline-flex; align-items:center; gap:.3rem; font-size:.7rem; color:var(--muted); font-weight:500; background:var(--offwhite); padding:.25rem .6rem; border-radius:.45rem; }
                .meta-chip svg { color:var(--blue); flex-shrink:0; }
                .btn-read-more { display:inline-block; font-size:.84rem; font-weight:700; color:var(--green); background:none; border:none; padding:.1rem 0; cursor:pointer; text-align:left; transition:color .2s; }
                .btn-read-more:hover { color:var(--green-dk); text-decoration:underline; }
                .btn-book-full { display:block; width:100%; padding:.75rem; background:var(--blue); color:white; font-size:.9rem; font-weight:700; border-radius:.75rem; border:none; cursor:pointer; text-align:center; box-shadow:0 3px 12px rgba(26,86,219,.25); transition:all .22s; }
                .btn-book-full:hover { background:var(--blue-dk); box-shadow:0 6px 20px rgba(26,86,219,.35); transform:translateY(-1px); }
                .btn-book-disabled { display:block; width:100%; padding:.75rem; background:#e2e8f0; color:#94a3b8; font-size:.9rem; font-weight:700; border-radius:.75rem; border:none; text-align:center; cursor:not-allowed; }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

                /* ── EMPTY STATE ── */
                .empty-state { text-align:center; padding:4rem 0; color:var(--muted); }
                .empty-state svg { color:#cbd5e1; margin:0 auto 1.25rem; display:block; }
                .empty-state h3 { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--ink); margin-bottom:.5rem; }
                .empty-state p { font-size:.9rem; }

                /* ── MODAL ── */
                .modal-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease; }
                @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                .modal-box { background:white; border-radius:1.25rem; width:100%; max-width:840px; position:relative; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:slideUp .25s ease; max-height:90vh; overflow-y:auto; }
                @keyframes slideUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
                .modal-close { position:absolute; top:1rem; right:1rem; z-index:2; width:34px; height:34px; border-radius:50%; background:#f1f5f9; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .2s; }
                .modal-close:hover { background:#e2e8f0; color:var(--ink); }
                /* stack on mobile, side-by-side on 600px+ */
                .modal-inner { display:grid; grid-template-columns:1fr; }
                @media (min-width:600px) { .modal-inner { grid-template-columns:1fr 1.15fr; min-height:400px; } }
                .modal-img-side { background:#f0f4f8; display:flex; align-items:center; justify-content:center; padding:2rem; min-height:200px; }
                @media (min-width:600px) { .modal-img-side { min-height:auto; } }
                .modal-img-side img { width:100%; max-height:260px; object-fit:contain; border-radius:1rem; }
                @media (min-width:600px) { .modal-img-side img { max-height:320px; } }
                .modal-info-side { padding:1.75rem 1.5rem; display:flex; flex-direction:column; }
                @media (min-width:600px) { .modal-info-side { padding:2.5rem 2rem 2.5rem 1.75rem; } }
                .modal-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:800; color:var(--ink); letter-spacing:-.02em; margin-bottom:.6rem; line-height:1.2; }
                @media (min-width:600px) { .modal-title { font-size:1.65rem; } }
                .modal-status-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.6rem; }
                .modal-status-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
                .modal-status-dot.green { background:var(--green); box-shadow:0 0 0 3px rgba(22,163,74,.15); }
                .modal-status-dot.red   { background:var(--red);   box-shadow:0 0 0 3px rgba(224,32,32,.15); }
                .modal-status-text { font-size:.875rem; font-weight:600; color:var(--muted); }
                .modal-type-badge { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--blue); background:var(--blue-lt); display:inline-block; padding:.22rem .7rem; border-radius:9999px; margin-bottom:1rem; }
                .modal-desc { font-size:.9rem; color:#4a5568; line-height:1.78; flex:1; margin-bottom:1.25rem; }
                .modal-meta-grid { display:flex; flex-direction:column; gap:.5rem; margin-bottom:1.5rem; }
                .modal-meta-item { display:flex; align-items:center; gap:.5rem; font-size:.8rem; color:var(--muted); font-weight:500; background:var(--offwhite); padding:.45rem .8rem; border-radius:.55rem; }
                .modal-meta-item svg { color:var(--blue); flex-shrink:0; }
                .btn-modal-book { display:block; width:100%; padding:.9rem; background:var(--blue); color:white; font-size:.95rem; font-weight:700; border-radius:.75rem; border:none; cursor:pointer; box-shadow:0 4px 16px rgba(26,86,219,.3); transition:all .25s; }
                .btn-modal-book:hover { background:var(--blue-dk); box-shadow:0 8px 28px rgba(26,86,219,.4); transform:translateY(-1px); }
                .btn-modal-disabled { display:block; width:100%; padding:.9rem; background:#e2e8f0; color:#94a3b8; font-size:.95rem; font-weight:700; border-radius:.75rem; border:none; cursor:not-allowed; }

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

            {selectedMachine && (
                <MachineModal machine={selectedMachine} onClose={() => setSelectedMachine(null)} isLoggedIn={isLoggedIn} />
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
                        <a href="/machines" className="nav-link active">Machines</a>
                        <a href="/shop" className="nav-link">Shop</a>
                        <a href="/training" className="nav-link">Training</a>
                        <a href="/projects" className="nav-link">Projects</a>
                        <a href="/about" className="nav-link">About</a>
                        <a href="/gallery" className="nav-link">Gallery</a>
                        <a href="/faq" className="nav-link">FAQ</a>
                        <Link to="/login" className="nav-login">Login</Link>
                    </div>
                    <button
                        className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        <span /><span /><span />
                    </button>
                </div>
                <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
                    <a href="/" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="/machines" className="nav-mobile-link active" onClick={() => setMenuOpen(false)}>Machines</a>
                    <a href="/shop" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Shop</a>
                    <a href="/training" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Training</a>
                    <a href="/projects" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Projects</a>
                    <a href="/about" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>About</a>
                    <a href="/gallery" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Gallery</a>
                    <a href="/faq" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>FAQ</a>
                    <Link to="/login" className="nav-mobile-login" onClick={() => setMenuOpen(false)}>Login / Register</Link>
                </div>
            </nav>

            {/* ═══ PAGE HERO ═══ */}
            <div className="page-hero">
                {heroSlides.map((src, i) => (
                    <div key={i} className={`hero-bg-slide ${i === heroSlideIdx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${src})` }} />
                ))}
                <div className="hero-bg-overlay" />
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
                        {[
                            [loading ? '…' : `${stats.total || machines.length}+`, 'Total Machines'],
                            [loading ? '…' : `${stats.available}`, 'Available Now'],
                            [loading ? '…' : `${stats.maintenance}`, 'In Maintenance'],
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
                        {loading ? 'Loading…' : `${machines.length} machine${machines.length !== 1 ? 's' : ''}`}
                    </span>
                    <div className="search-wrap">
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            placeholder="Search machines…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ═══ MACHINES GRID ═══ */}
            <section className="machines-section">
                <div className="machines-container">
                    {loading ? (
                        <div className="machines-grid">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,.08)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                                    <div className="skeleton" style={{ height: 210, borderRadius: '.85rem' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                                        <div className="skeleton" style={{ height: 11, width: '30%' }} />
                                        <div className="skeleton" style={{ height: 20, width: '65%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '95%' }} />
                                        <div className="skeleton" style={{ height: 12, width: '80%' }} />
                                        <div className="skeleton" style={{ height: 14, width: '25%', marginTop: '.15rem' }} />
                                        <div className="skeleton" style={{ height: 42, borderRadius: '.75rem', marginTop: '.1rem' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : machines.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No machines found</h3>
                            <p>Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="machines-grid">
                            {machines.map((m, idx) => {
                                const imgSrc = getImageUrl(m.image) || FALLBACK;
                                const isAvail = m.status === 'available';
                                return (
                                    <Reveal key={m.id} delay={Math.min(idx % 3 * 0.1, 0.3)}>
                                        <div className="machine-card">
                                            <div className="machine-img-box">
                                                <img src={imgSrc} alt={m.name} onError={e => { e.currentTarget.src = FALLBACK; }} />
                                                <span className={`machine-status-tag ${statusClass(m.status)}`}>{statusLabel(m.status)}</span>
                                            </div>
                                            <div className="machine-card-body">
                                                {m.type && <span className="machine-card-type">{m.type}</span>}
                                                <h3 className="machine-card-name">{m.name}</h3>
                                                <p className="machine-card-desc">{m.description || 'High-precision fabrication machine available for booking.'}</p>
                                                {(m.runtime_hours > 0 || m.last_used_at) && (
                                                    <div className="machine-card-meta">
                                                        {m.runtime_hours > 0 && (
                                                            <span className="meta-chip">
                                                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                {m.runtime_hours} hrs
                                                            </span>
                                                        )}
                                                        {m.last_used_at && (
                                                            <span className="meta-chip">
                                                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                {new Date(m.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <button className="btn-read-more" onClick={() => setSelectedMachine(m)}>Read More</button>
                                                {isAvail
                                                    ? <button className="btn-book-full" onClick={handleBookClick}>Book Now</button>
                                                    : <span className="btn-book-disabled">{m.status === 'maintenance' ? 'Under Maintenance' : m.status === 'in_use' ? 'Currently In Use' : 'Unavailable'}</span>
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