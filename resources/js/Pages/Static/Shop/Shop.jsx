import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
}
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=800&q=80';

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

function ProductModal({ product, onClose, isLoggedIn, onAddToCart, onBuyNow }) {
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    useEffect(() => { setImgIdx(0); setQty(1); }, [product]);
    if (!product) return null;
    const images = (product.images || []).map(p => getImageUrl(p)).filter(Boolean);
    if (images.length === 0) images.push(FALLBACK_IMG);
    const inStock = (product.stock || 0) > 0 && product.status === 'active';
    const maxQty = Math.min(product.stock || 1, 99);
    const prev = () => setImgIdx(i => (i - 1 + images.length) % images.length);
    const next = () => setImgIdx(i => (i + 1) % images.length);
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="modal-inner">
                    {/* gallery */}
                    <div className="modal-gallery-side">
                        <div className="modal-main-img-wrap">
                            <img key={imgIdx} src={images[imgIdx]} alt={product.name} className="modal-main-img"
                                onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
                            <span className="modal-img-counter">{imgIdx + 1} / {images.length}</span>
                            {images.length > 1 && (
                                <>
                                    <button className="modal-arrow modal-arrow-left" onClick={prev} aria-label="Previous">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button className="modal-arrow modal-arrow-right" onClick={next} aria-label="Next">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="modal-thumbs">
                                {images.map((src, i) => (
                                    <button key={i} className={`modal-thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                                        <img src={src} alt={`${product.name} ${i + 1}`} onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* info */}
                    <div className="modal-info-side">
                        {product.description && <p className="modal-tag-line">{product.description}</p>}
                        <h2 className="modal-prod-title">{product.name}</h2>
                        <div className="modal-price-stock">
                            <span className="modal-price">Nu. {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            {inStock ? <span className="modal-badge-stock in">{product.stock} available</span>
                                : <span className="modal-badge-stock out">Out of stock</span>}
                        </div>
                        {product.size && <p className="modal-size-line">Size: {product.size}</p>}
                        <hr className="modal-divider" />
                        {inStock && (
                            <div className="modal-qty-row">
                                <span className="modal-qty-label">Quantity:</span>
                                <div className="qty-control">
                                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                    <span className="qty-val">{qty}</span>
                                    <button className="qty-btn" onClick={() => setQty(q => Math.min(maxQty, q + 1))}>+</button>
                                </div>
                            </div>
                        )}
                        <div className="modal-actions">
                            {inStock ? (
                                <>
                                    <button className="btn-add-to-cart-modal" onClick={() => onAddToCart(product, qty)}>Add to Cart</button>
                                    <button className="btn-buy-now-modal" onClick={() => { onBuyNow(product, qty); onClose(); }}>Buy Now</button>
                                </>
                            ) : (
                                <span className="btn-modal-disabled">Out of Stock</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Shop() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState(null);
    const [heroIdx, setHeroIdx] = useState(0);
    const [cart, setCart] = useState([]);

    const isLoggedIn = !!sessionStorage.getItem('auth_token');
    const handleLogout = () => {
        sessionStorage.clear();
        ['auth_token', 'user', 'enrollments', 'courses', 'bookings', 'machines', 'cart_items'].forEach(k => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        window.location.href = '/';
    };

    const heroSlides = ['../images/home.jpg', '../images/home2.jpg', '../images/home3.jpg'];

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
        const fn = e => { if (e.key === 'Escape') setSelected(null); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []);
    useEffect(() => {
        (async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                let res = await fetch(`${API_BASE}/home/products`, { headers: { 'Accept': 'application/json' } });
                if (res.status === 401 && token) {
                    res = await fetch(`${API_BASE}/user/products`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
                }
                if (!res.ok) { setLoading(false); return; }
                const d = await res.json();
                const all = d.products || d.data || d;
                setProducts(Array.isArray(all) ? all.filter(p => p.status === 'active') : []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const handleAddToCart = useCallback((product, qty = 1) => {
        if (!isLoggedIn) { showToast('Please login to add to cart', 'warn'); return; }
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
            return [...prev, { ...product, qty }];
        });
        showToast(`"${product.name}" added to cart`, 'success');
    }, [isLoggedIn, showToast]);

    const handleBuyNow = useCallback((product, qty = 1) => {
        if (!isLoggedIn) { showToast('Please login to place an order', 'warn'); return; }
        navigate('/user/shop-orders', { state: { product, qty } });
    }, [isLoggedIn, navigate, showToast]);

    let displayed = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'low') displayed = [...displayed].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sort === 'high') displayed = [...displayed].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

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
                    --border:   rgba(0,0,0,0.08);
                    --offwhite: #f9fafb;
                    --card-bg:  #ffffff;
                    --radius:   .875rem;
                    --radius-lg:1.25rem;
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
                .nav-cart { position:relative; display:flex; align-items:center; cursor:pointer; flex-shrink:0; }
                .nav-cart-count { position:absolute; top:-7px; right:-8px; width:18px; height:18px; border-radius:50%; background:var(--red); color:white; font-size:.6rem; font-weight:800; display:flex; align-items:center; justify-content:center; }
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
                .page-subtitle { font-size:clamp(.875rem,2vw,1rem); color:rgba(255,255,255,.6); max-width:480px; line-height:1.75; animation:eyebrowIn 1s .3s ease both; }
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
                /* controls-right stacks on very small screens */
                .controls-right { display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; flex:1; justify-content:flex-end; min-width:0; }
                .search-wrap { display:flex; align-items:center; gap:.6rem; background:var(--offwhite); border:1.5px solid var(--border); border-radius:9999px; padding:.45rem 1rem; flex:1; min-width:0; max-width:280px; transition:border-color .2s; }
                @media (max-width:480px) { .search-wrap { max-width:100%; } }
                .search-wrap:focus-within { border-color:var(--blue); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
                .search-wrap svg { flex-shrink:0; color:var(--muted); }
                .search-wrap input { border:none; background:transparent; outline:none; font-size:.875rem; color:var(--ink); font-family:inherit; width:100%; min-width:0; }
                .search-wrap input::placeholder { color:#a0aec0; }
                .sort-select { padding:.45rem .9rem; border-radius:9999px; border:1.5px solid var(--border); background:var(--offwhite); font-size:.8rem; font-weight:600; color:var(--muted); outline:none; cursor:pointer; font-family:inherit; transition:border-color .2s; flex-shrink:0; }
                .sort-select:focus { border-color:var(--blue); }
                @media (max-width:360px) { .sort-select { display:none; } }

                /* ── PRODUCTS SECTION ── */
                .products-section { padding:2.5rem 0 4rem; }
                @media (min-width:768px) { .products-section { padding:4rem 0 6rem; } }
                .products-container { max-width:82rem; margin:0 auto; padding:0 1.25rem; }
                @media (min-width:640px)  { .products-container { padding:0 1.75rem; } }
                @media (min-width:1024px) { .products-container { padding:0 2rem; } }
                .section-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
                @media (min-width:640px) { .section-header { margin-bottom:2.5rem; } }
                .section-label { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue); background:var(--blue-lt); padding:.25rem .75rem; border-radius:9999px; margin-bottom:.65rem; }
                .section-title { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2rem); font-weight:800; color:var(--ink); letter-spacing:-.02em; }
                .divider { width:3rem; height:3px; background:var(--blue); border-radius:9999px; margin-top:.75rem; }

                /* ── PRODUCTS GRID — responsive ── */
                .products-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
                @media (min-width:640px)  { .products-grid { gap:1.25rem; } }
                @media (min-width:900px)  { .products-grid { grid-template-columns:repeat(3,1fr); gap:1.5rem; } }
                @media (min-width:1200px) { .products-grid { grid-template-columns:repeat(4,1fr); } }

                /* ── PRODUCT CARD ── */
                .product-card { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:0 2px 10px rgba(0,0,0,.05); display:flex; flex-direction:column; overflow:hidden; transition:transform .3s,box-shadow .3s; cursor:pointer; }
                .product-card:hover { transform:translateY(-5px); box-shadow:0 18px 40px rgba(0,0,0,.1); }
                .product-img-wrap { position:relative; height:160px; overflow:hidden; background:#e8ecf0; flex-shrink:0; }
                @media (min-width:480px) { .product-img-wrap { height:180px; } }
                @media (min-width:640px) { .product-img-wrap { height:200px; } }
                .product-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .55s ease; display:block; }
                .product-card:hover .product-img-wrap img { transform:scale(1.06); }
                .product-price-tag { position:absolute; top:.65rem; right:.65rem; z-index:2; background:var(--red); color:white; font-family:'Playfair Display',serif; font-size:.7rem; font-weight:900; padding:.22rem .55rem; border-radius:.4rem; box-shadow:0 2px 8px rgba(224,32,32,.35); transform:rotate(2deg); }
                @media (min-width:480px) { .product-price-tag { font-size:.75rem; padding:.25rem .6rem; } }
                .oos-overlay { position:absolute; inset:0; background:rgba(5,10,25,.45); display:flex; align-items:center; justify-content:center; z-index:3; }
                .oos-label { background:var(--red); color:white; font-size:.8rem; font-weight:800; padding:.45rem 1rem; border-radius:9999px; }
                .product-hover-overlay { position:absolute; inset:0; background:rgba(5,10,25,.4); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .25s; z-index:4; }
                .product-card:hover .product-hover-overlay { opacity:1; }
                .view-detail-pill { padding:.4rem 1rem; background:white; color:var(--ink); font-size:.75rem; font-weight:700; border-radius:9999px; border:none; cursor:pointer; transition:all .2s; }
                .view-detail-pill:hover { background:var(--blue); color:white; }
                .product-body { padding:.75rem .875rem .875rem; display:flex; flex-direction:column; gap:.2rem; flex:1; }
                @media (min-width:480px) { .product-body { padding:.9rem 1rem 1rem; } }
                .product-name { font-size:.82rem; font-weight:700; color:var(--ink); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                @media (min-width:480px) { .product-name { font-size:.9rem; } }
                .product-size { font-size:.72rem; color:var(--muted); }
                .product-bottom { display:flex; align-items:center; justify-content:space-between; gap:.4rem; margin-top:.5rem; }
                .product-price { font-family:'Playfair Display',serif; font-size:.9rem; font-weight:900; color:var(--blue); white-space:nowrap; }
                @media (min-width:480px) { .product-price { font-size:1rem; } }
                .btn-add-cart { padding:.4rem .75rem; background:var(--blue); color:white; font-size:.72rem; font-weight:700; border-radius:.5rem; border:none; cursor:pointer; white-space:nowrap; box-shadow:0 3px 10px rgba(26,86,219,.25); transition:all .22s; flex-shrink:0; }
                @media (min-width:480px) { .btn-add-cart { padding:.45rem 1rem; font-size:.78rem; border-radius:.55rem; } }
                .btn-add-cart:hover { background:var(--blue-dk); transform:translateY(-1px); }
                .btn-add-cart-disabled { padding:.4rem .75rem; background:#e2e8f0; color:#94a3b8; font-size:.72rem; font-weight:700; border-radius:.5rem; border:none; white-space:nowrap; cursor:not-allowed; flex-shrink:0; }
                @media (min-width:480px) { .btn-add-cart-disabled { padding:.45rem 1rem; font-size:.78rem; border-radius:.55rem; } }

                /* ── SKELETON ── */
                .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:.5rem; }
                @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

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
                .modal-backdrop { position:fixed; inset:0; z-index:999; background:rgba(5,10,25,.6); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease; }
                @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                .modal-box { background:white; border-radius:1.125rem; width:100%; max-width:820px; max-height:90vh; position:relative; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.3); animation:modalUp .25s ease; display:flex; flex-direction:column; }
                @keyframes modalUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
                .modal-close { position:absolute; top:1rem; right:1rem; z-index:10; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.9); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .2s; }
                .modal-close:hover { background:#f1f5f9; color:var(--ink); }
                /* stack on mobile, side-by-side on 580px+ */
                .modal-inner { display:grid; grid-template-columns:1fr; flex:1; overflow-y:auto; }
                @media (min-width:580px) { .modal-inner { grid-template-columns:1.05fr 1fr; overflow:hidden; } }
                .modal-gallery-side { background:#f8fafc; display:flex; flex-direction:column; gap:.75rem; padding:1.25rem; }
                @media (min-width:580px) { .modal-gallery-side { padding:1.5rem; } }
                .modal-main-img-wrap { position:relative; min-height:220px; max-height:280px; border-radius:.75rem; overflow:hidden; background:#edf0f4; display:flex; align-items:center; justify-content:center; }
                @media (min-width:580px) { .modal-main-img-wrap { flex:1; min-height:240px; max-height:340px; border-radius:.85rem; } }
                .modal-main-img { width:100%; height:100%; object-fit:cover; display:block; animation:imgFade .25s ease; }
                @keyframes imgFade { from{opacity:0}to{opacity:1} }
                .modal-img-counter { position:absolute; top:.6rem; right:.65rem; background:rgba(0,0,0,.55); color:white; font-size:.7rem; font-weight:700; padding:.2rem .55rem; border-radius:9999px; }
                .modal-arrow { position:absolute; top:50%; transform:translateY(-50%); width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.9); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--ink); box-shadow:0 2px 10px rgba(0,0,0,.15); transition:all .2s; }
                @media (min-width:580px) { .modal-arrow { width:36px; height:36px; } }
                .modal-arrow:hover { background:white; box-shadow:0 4px 16px rgba(0,0,0,.2); }
                .modal-arrow-left  { left:.5rem; }
                .modal-arrow-right { right:.5rem; }
                @media (min-width:580px) { .modal-arrow-left { left:.65rem; } .modal-arrow-right { right:.65rem; } }
                .modal-thumbs { display:flex; gap:.5rem; flex-wrap:wrap; }
                .modal-thumb { width:52px; height:52px; border-radius:.45rem; overflow:hidden; border:2.5px solid transparent; padding:0; cursor:pointer; background:#e2e8f0; flex-shrink:0; transition:border-color .2s; }
                @media (min-width:580px) { .modal-thumb { width:58px; height:58px; border-radius:.5rem; } }
                .modal-thumb.active { border-color:var(--blue); }
                .modal-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
                .modal-info-side { padding:1.5rem; display:flex; flex-direction:column; overflow-y:auto; }
                @media (min-width:580px) { .modal-info-side { padding:2rem 1.75rem 2rem 1.5rem; } }
                .modal-tag-line { font-size:.82rem; color:var(--muted); margin-bottom:.5rem; line-height:1.5; }
                .modal-prod-title { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:800; color:var(--ink); letter-spacing:-.02em; margin-bottom:.875rem; line-height:1.25; }
                @media (min-width:580px) { .modal-prod-title { font-size:1.5rem; } }
                .modal-price-stock { display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem; flex-wrap:wrap; }
                .modal-price { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--blue); }
                @media (min-width:580px) { .modal-price { font-size:1.5rem; } }
                .modal-badge-stock { font-size:.72rem; font-weight:700; padding:.25rem .7rem; border-radius:9999px; }
                .modal-badge-stock.in  { background:var(--green-lt); color:var(--green-dk); }
                .modal-badge-stock.out { background:var(--red-lt); color:var(--red-dk); }
                .modal-size-line { font-size:.875rem; color:var(--muted); margin-bottom:.5rem; }
                .modal-divider { border:none; border-top:1px solid var(--border); margin:.875rem 0; }
                .modal-qty-row { display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; }
                .modal-qty-label { font-size:.875rem; font-weight:600; color:var(--ink-2); }
                .qty-control { display:flex; align-items:center; border:1.5px solid var(--border); border-radius:.55rem; overflow:hidden; }
                .qty-btn { width:32px; height:32px; background:var(--offwhite); border:none; cursor:pointer; font-size:1.1rem; font-weight:600; color:var(--ink-2); transition:background .2s; display:flex; align-items:center; justify-content:center; }
                .qty-btn:hover { background:#e2e8f0; }
                .qty-val { min-width:34px; text-align:center; font-size:.9rem; font-weight:700; color:var(--ink); padding:0 .25rem; }
                .modal-actions { display:flex; gap:.75rem; flex-wrap:wrap; margin-top:auto; padding-top:.5rem; }
                .btn-add-to-cart-modal { flex:1; padding:.75rem 1rem; background:white; color:var(--blue); font-size:.875rem; font-weight:700; border-radius:.65rem; border:2px solid var(--blue); cursor:pointer; transition:all .22s; text-align:center; min-width:0; }
                .btn-add-to-cart-modal:hover { background:var(--blue-lt); }
                .btn-buy-now-modal { flex:1; padding:.75rem 1rem; background:var(--blue); color:white; font-size:.875rem; font-weight:700; border-radius:.65rem; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(26,86,219,.3); transition:all .22s; text-align:center; min-width:0; }
                .btn-buy-now-modal:hover { background:var(--blue-dk); transform:translateY(-1px); }
                .btn-modal-disabled { display:block; width:100%; padding:.75rem; background:#e2e8f0; color:#94a3b8; font-size:.875rem; font-weight:700; border-radius:.65rem; border:none; text-align:center; cursor:not-allowed; }

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

            {selected && (
                <ProductModal product={selected} onClose={() => setSelected(null)} isLoggedIn={isLoggedIn}
                    onAddToCart={(p, qty) => { handleAddToCart(p, qty); setSelected(null); }}
                    onBuyNow={handleBuyNow} />
            )}

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
                        <a href="/shop" className="nav-link active">Shop</a>
                        <a href="/training" className="nav-link">Training</a>
                        <a href="/projects" className="nav-link">Projects</a>
                        <a href="/about" className="nav-link">About</a>
                        <a href="/gallery" className="nav-link">Gallery</a>
                        <a href="/faq" className="nav-link">FAQ</a>
                        <div className="nav-cart" onClick={() => isLoggedIn ? navigate('/user/shop-orders') : showToast('Please login to view your cart', 'warn')}>
                            <svg width="22" height="22" fill="none" stroke="#1e2a3a" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
                        </div>
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
                    <a href="/shop" className="nav-mobile-link active" onClick={() => setMenuOpen(false)}>Shop</a>
                    <a href="/training" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Training</a>
                    <a href="/projects" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Projects</a>
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
                    <div className="page-eyebrow"><span className="page-eyebrow-dot" />Fabrication Store</div>
                    <h1 className="page-title">Our <span className="accent">Products</span></h1>
                    <p className="page-subtitle">Handcrafted goods, precision-made items, and one-of-a-kind pieces — all made right here in the Fab Lab.</p>
                    <div className="page-hero-stats">
                        {[[loading ? '…' : `${products.length}+`, 'Products'], [loading ? '…' : `${totalStock}`, 'Units in Stock'], ['Nu.', 'Local Currency']].map(([n, l]) => (
                            <div key={l}><span className="phero-stat-num">{n}</span><span className="phero-stat-label">{l}</span></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ CONTROLS ═══ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    <span className="results-count">{loading ? 'Loading…' : `${displayed.length} product${displayed.length !== 1 ? 's' : ''}`}</span>
                    <div className="controls-right">
                        <div className="search-wrap">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="default">Default</option>
                            <option value="low">Price: Low → High</option>
                            <option value="high">Price: High → Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ═══ PRODUCTS ═══ */}
            <section className="products-section">
                <div className="products-container">
                    <Reveal>
                        <div className="section-header">
                            <div>
                                <span className="section-label">Store</span>
                                <h2 className="section-title">All Products</h2>
                                <div className="divider" />
                            </div>
                        </div>
                    </Reveal>
                    {loading ? (
                        <div className="products-grid">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,.08)', overflow: 'hidden' }}>
                                    <div className="skeleton" style={{ height: 180 }} />
                                    <div style={{ padding: '.9rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                        <div className="skeleton" style={{ height: 14, width: '85%' }} />
                                        <div className="skeleton" style={{ height: 11, width: '40%' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.4rem' }}>
                                            <div className="skeleton" style={{ height: 20, width: '38%' }} />
                                            <div className="skeleton" style={{ height: 32, width: '44%', borderRadius: '.55rem' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayed.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h3>No products found</h3>
                            <p>Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {displayed.map((product, idx) => {
                                const images = (product.images || []).map(p => getImageUrl(p)).filter(Boolean);
                                const thumbSrc = images[0] || FALLBACK_IMG;
                                const inStock = (product.stock || 0) > 0;
                                const price = parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                return (
                                    <Reveal key={product.id} delay={Math.min((idx % 4) * 0.08, 0.3)}>
                                        <div className="product-card" onClick={() => setSelected(product)}>
                                            <div className="product-img-wrap">
                                                <img src={thumbSrc} alt={product.name} onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
                                                <span className="product-price-tag">Nu.{price}</span>
                                                {!inStock && <div className="oos-overlay"><span className="oos-label">Out of Stock</span></div>}
                                                <div className="product-hover-overlay">
                                                    <button className="view-detail-pill" onClick={e => { e.stopPropagation(); setSelected(product); }}>View Details</button>
                                                </div>
                                            </div>
                                            <div className="product-body">
                                                <h3 className="product-name">{product.name}</h3>
                                                {product.size && <span className="product-size">{product.size}</span>}
                                                <div className="product-bottom">
                                                    <span className="product-price">Nu. {price}</span>
                                                    {inStock ? (
                                                        <button className="btn-add-cart" onClick={e => { e.stopPropagation(); handleAddToCart(product); }}>Add to Cart</button>
                                                    ) : (
                                                        <span className="btn-add-cart-disabled">Out of Stock</span>
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