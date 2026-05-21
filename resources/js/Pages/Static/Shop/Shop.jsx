import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Shop() {
    const [scrolled, setScrolled]   = useState(false);
    const [search, setSearch]       = useState('');
    const [filter, setFilter]       = useState('All');
    const [sort, setSort]           = useState('default');
    const [wishlist, setWishlist]   = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [toast, setToast]         = useState(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const addToCart = (product) => {
        setCartItems(prev => [...prev, product]);
        showToast(`"${product.name}" added to cart`);
    };

    const toggleWishlist = (id) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const products = [
        { id: 1,  name: 'Jangchub Chorten 8-Inch',         price: 2000, originalPrice: null, image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=400', sale: false, category: 'Crafts' },
        { id: 2,  name: 'Birch Plywood Mobile Stand',       price: 150,  originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Woodwork' },
        { id: 3,  name: 'Accessories Tray',                 price: 200,  originalPrice: null, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=400', sale: false, category: 'Woodwork' },
        { id: 4,  name: 'Janghuk Chorten 9-Inch',           price: 299,  originalPrice: 299,  image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=400', sale: false, category: 'Crafts' },
        { id: 5,  name: 'Hair Clips Set',                   price: 165,  originalPrice: 259,  image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: true,  category: 'Accessories', discount: 36 },
        { id: 6,  name: 'Birch Plywood Mobile Stand II',    price: 150,  originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Woodwork' },
        { id: 7,  name: 'Mini Wood Container',              price: 100,  originalPrice: null, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=400', sale: false, category: 'Woodwork' },
        { id: 8,  name: 'Mini Chorten',                     price: 200,  originalPrice: null, image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=400', sale: false, category: 'Crafts' },
        { id: 9,  name: 'Janghuk Chorten 9-Inch (Mini)',    price: 50,   originalPrice: 80,   image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=400', sale: true,  category: 'Crafts',    discount: 38 },
        { id: 10, name: 'Accessories Tray (Small)',         price: 56,   originalPrice: 60,   image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=400', sale: true,  category: 'Woodwork',  discount: 7 },
        { id: 11, name: 'Dairy Milk Crispello',             price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 12, name: "Banchharam's Kesar Bhog 1kg",      price: 230,  originalPrice: null, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 13, name: "Banchharam's Kesar Bhog 500g",     price: 130,  originalPrice: null, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 14, name: "Banchharam's Kesar Bhog 250g",     price: 75,   originalPrice: null, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 15, name: 'Dairy Milk Crispello Pack',        price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 16, name: 'Dairy Milk Crispello Box',         price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 17, name: 'Dairy Milk Crispello Gift',        price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 18, name: 'Dairy Milk Crispello Mini',        price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 19, name: 'Dairy Milk Crispello Twin',        price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 20, name: 'Dairy Milk Crispello Dark',        price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 21, name: 'Dairy Milk Crispello White',       price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
        { id: 22, name: 'Dairy Milk Crispello Value',       price: 40,   originalPrice: null, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=400', sale: false, category: 'Other' },
    ];

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    let filtered = products.filter(p => {
        const matchCat    = filter === 'All' || p.category === filter;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (sort === 'low')  filtered = [...filtered].sort((a,b) => a.price - b.price);
    if (sort === 'high') filtered = [...filtered].sort((a,b) => b.price - a.price);
    if (sort === 'sale') filtered = [...filtered].filter(p => p.sale);

    const totalSaleItems = products.filter(p => p.sale).length;

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', color: '#0d1117', overflowX: 'hidden' }}>
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
                    --card-bg: #ffffff;
                    --offwhite:#f9fafb;
                    --red:     #ef4444;
                    --radius:  1rem;
                    --radius-lg: 1.5rem;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* ── Nav ── */
                .nav-root { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; transition: all .35s ease; }
                .nav-root.scrolled { background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06); }
                .nav-root.top      { background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
                .nav-inner { max-width: 82rem; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 76px; }
                .nav-logo-wrap { display: flex; align-items: center; gap: .875rem; text-decoration: none; }
                .nav-logo-circle { width: 52px; height: 52px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(0,102,255,0.35); overflow: hidden; flex-shrink: 0; transition: transform .3s, box-shadow .3s; }
                .nav-logo-circle:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,102,255,0.45); }
                .nav-logo-circle img { width: 100%; height: 100%; object-fit: cover; }
                .nav-logo-circle .logo-letter { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.5rem; color: white; }
                .nav-brand-text .name { font-size: 1rem; font-weight: 700; color: var(--ink); display: block; line-height: 1.2; }
                .nav-brand-text .sub  { font-size: .65rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; display: block; }
                .nav-links { display: flex; gap: 1.75rem; align-items: center; }
                .nav-link { font-size: .875rem; font-weight: 500; color: var(--ink-2); text-decoration: none; position: relative; padding-bottom: 2px; transition: color .2s; }
                .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: var(--blue); border-radius: 2px; transition: width .25s; }
                .nav-link:hover { color: var(--blue); }
                .nav-link:hover::after { width: 100%; }
                .nav-link.active { color: var(--blue); font-weight: 600; }
                .nav-link.active::after { width: 100%; }
                .nav-login { padding: .5rem 1.4rem; font-size: .875rem; font-weight: 600; color: var(--blue); background: var(--blue-lt); border: 1.5px solid rgba(0,102,255,.2); border-radius: 9999px; text-decoration: none; transition: all .25s; }
                .nav-login:hover { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,102,255,.3); }
                .cart-badge { position: relative; }
                .cart-count { position: absolute; top: -6px; right: -8px; width: 18px; height: 18px; border-radius: 50%; background: var(--red); color: white; font-size: .62rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }

                /* ── Page Hero ── */
                .page-hero { padding-top: 76px; background: var(--ink); position: relative; overflow: hidden; }
                .page-hero-grid { position: absolute; inset: 0; z-index: 0; opacity: .04; background-image: linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size: 48px 48px; }
                .page-hero-glow  { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle,rgba(0,102,255,.2) 0%,transparent 70%); top: -200px; right: -100px; pointer-events: none; z-index: 1; }
                .page-hero-glow2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle,rgba(90,172,255,.1) 0%,transparent 70%); bottom: -100px; left: 5%; pointer-events: none; z-index: 1; }
                .page-hero-inner { max-width: 82rem; margin: 0 auto; padding: 5rem 2rem 4rem; position: relative; z-index: 2; }
                .page-eyebrow { display: inline-flex; align-items: center; gap: .5rem; padding: .3rem .9rem; border-radius: 9999px; background: rgba(0,102,255,.15); border: 1px solid rgba(0,102,255,.3); color: #5aacff; font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.25rem; }
                .page-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #5aacff; animation: pulse 2s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.4; transform:scale(1.5); } }
                .page-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem,5vw,4rem); font-weight: 900; color: white; letter-spacing: -.03em; line-height: 1.05; margin-bottom: 1rem; }
                .page-title .accent { color: #5aacff; font-style: italic; }
                .page-subtitle { font-size: 1rem; color: rgba(255,255,255,.6); max-width: 480px; line-height: 1.75; }
                .page-hero-stats { display: flex; gap: 2.5rem; margin-top: 3rem; }
                .phero-stat-num   { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: white; display: block; line-height: 1; }
                .phero-stat-label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.45); letter-spacing: .1em; text-transform: uppercase; margin-top: .25rem; display: block; }

                /* ── Banner ── */
                .shop-banner { position: relative; overflow: hidden; margin: 0; }
                .shop-banner img { width: 100%; height: 380px; object-fit: cover; display: block; filter: brightness(.7); }
                .shop-banner-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(5,10,25,.8) 0%, rgba(5,10,25,.3) 60%, transparent 100%); display: flex; align-items: center; padding: 0 4rem; }
                .shop-banner-text h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem,4vw,3.2rem); font-weight: 900; color: white; letter-spacing: -.03em; line-height: 1.1; margin-bottom: .75rem; }
                .shop-banner-text p  { color: rgba(255,255,255,.7); font-size: 1rem; max-width: 380px; line-height: 1.7; margin-bottom: 1.5rem; }
                .btn-banner { display: inline-block; padding: .75rem 2rem; background: var(--blue); color: white; font-weight: 700; font-size: .9rem; border-radius: 9999px; text-decoration: none; box-shadow: 0 8px 24px rgba(0,102,255,.4); transition: all .3s; border: none; cursor: pointer; }
                .btn-banner:hover { background: var(--blue-dk); transform: translateY(-2px); }

                /* ── Controls ── */
                .controls-bar { background: var(--card-bg); border-bottom: 1px solid var(--border); position: sticky; top: 76px; z-index: 50; box-shadow: 0 4px 24px rgba(0,0,0,.05); }
                .controls-inner { max-width: 82rem; margin: 0 auto; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
                .filter-pills { display: flex; gap: .5rem; flex-wrap: wrap; }
                .pill { padding: .4rem 1rem; border-radius: 9999px; font-size: .8rem; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--offwhite); color: var(--muted); transition: all .2s; }
                .pill:hover { border-color: var(--blue); color: var(--blue); }
                .pill.active { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 4px 12px rgba(0,102,255,.25); }
                .controls-right { display: flex; align-items: center; gap: 1rem; }
                .search-wrap { display: flex; align-items: center; gap: .6rem; background: var(--offwhite); border: 1.5px solid var(--border); border-radius: 9999px; padding: .45rem 1rem; min-width: 200px; transition: border-color .2s; }
                .search-wrap:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,102,255,.1); }
                .search-wrap input { border: none; background: transparent; outline: none; font-size: .875rem; color: var(--ink); font-family: inherit; width: 100%; }
                .search-wrap input::placeholder { color: #a0aec0; }
                .sort-select { padding: .45rem .9rem; border-radius: 9999px; border: 1.5px solid var(--border); background: var(--offwhite); font-size: .8rem; font-weight: 600; color: var(--muted); outline: none; cursor: pointer; font-family: inherit; transition: border-color .2s; }
                .sort-select:focus { border-color: var(--blue); }
                .results-count { font-size: .8rem; color: var(--muted); font-weight: 500; white-space: nowrap; }

                /* ── Products section ── */
                .products-section { padding: 4rem 0 6rem; }
                .products-container { max-width: 82rem; margin: 0 auto; padding: 0 2rem; }
                .section-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
                .section-label { display: inline-block; font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--blue); background: var(--blue-lt); padding: .25rem .75rem; border-radius: 9999px; margin-bottom: .65rem; }
                .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem,2.5vw,2rem); font-weight: 800; color: var(--ink); letter-spacing: -.02em; }
                .view-all-link { display: inline-flex; align-items: center; gap: .35rem; font-size: .875rem; font-weight: 600; color: var(--blue); text-decoration: none; transition: gap .2s; }
                .view-all-link:hover { gap: .6rem; }
                .divider { width: 3rem; height: 3px; background: var(--blue); border-radius: 9999px; margin-top: .75rem; }

                /* ── Product grid ── */
                .products-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 1.5rem; }

                /* ── Product card ── */
                .product-card { background: var(--card-bg); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,.04); display: flex; flex-direction: column; transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s; }
                .product-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,.1); }
                .product-img-wrap { position: relative; height: 180px; overflow: hidden; background: #f3f4f6; flex-shrink: 0; }
                .product-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .55s ease; }
                .product-card:hover .product-img-wrap img { transform: scale(1.07); }

                /* Sale badge */
                .sale-badge { position: absolute; top: .7rem; left: .7rem; background: var(--red); color: white; font-size: .65rem; font-weight: 800; padding: .2rem .55rem; border-radius: 9999px; letter-spacing: .04em; z-index: 2; }

                /* Wishlist btn */
                .wish-btn { position: absolute; top: .65rem; right: .65rem; z-index: 2; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,.9); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .25s; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
                .wish-btn:hover { transform: scale(1.1); }
                .wish-btn.active svg { fill: var(--red); stroke: var(--red); }

                /* Quick view overlay */
                .product-overlay { position: absolute; inset: 0; background: rgba(13,17,23,.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .3s; }
                .product-card:hover .product-overlay { opacity: 1; }
                .quick-view-btn { padding: .45rem 1.1rem; background: white; color: var(--ink); font-size: .75rem; font-weight: 700; border-radius: 9999px; border: none; cursor: pointer; transition: all .2s; }
                .quick-view-btn:hover { background: var(--blue); color: white; }

                /* Body */
                .product-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
                .product-cat   { font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--blue); margin-bottom: .25rem; }
                .product-name  { font-size: .875rem; font-weight: 700; color: var(--ink); margin-bottom: .5rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
                .price-row     { display: flex; align-items: baseline; gap: .4rem; margin-bottom: .9rem; }
                .price-current { font-size: 1rem; font-weight: 800; color: var(--ink); font-family: 'Playfair Display', serif; }
                .price-original{ font-size: .8rem; font-weight: 500; color: #a0aec0; text-decoration: line-through; }
                .price-save    { font-size: .65rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: .15rem .45rem; border-radius: 9999px; }

                /* Add to cart button */
                .btn-cart { display: flex; align-items: center; justify-content: center; gap: .45rem; width: 100%; padding: .65rem; background: var(--ink); color: white; font-size: .8rem; font-weight: 700; border-radius: .65rem; border: none; cursor: pointer; transition: all .25s; }
                .btn-cart:hover { background: var(--blue); box-shadow: 0 8px 24px rgba(0,102,255,.35); transform: translateY(-1px); }

                /* ── Toast ── */
                .toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: var(--ink); color: white; padding: .75rem 1.75rem; border-radius: 9999px; font-size: .875rem; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,.3); z-index: 9999; display: flex; align-items: center; gap: .6rem; white-space: nowrap; animation: slideUp .3s ease; }
                @keyframes slideUp { from { opacity:0; transform:translate(-50%,16px); } to { opacity:1; transform:translate(-50%,0); } }
                .toast-dot { width: 8px; height: 8px; border-radius: 50%; background: #4af; flex-shrink: 0; }

                /* ── Empty state ── */
                .empty-state { text-align: center; padding: 5rem 0; color: var(--muted); }
                .empty-state svg { color: #cbd5e1; margin: 0 auto 1.25rem; display: block; }
                .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--ink); margin-bottom: .5rem; }

                /* ── Footer ── */
                .footer { background: #080d14; padding: 5rem 0 0; }
                .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.4fr; gap: 3rem; padding-bottom: 3.5rem; }
                .footer-brand-logo { width: 56px; height: 56px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 1.25rem; box-shadow: 0 4px 18px rgba(0,102,255,.35); }
                .footer-brand-logo img { width: 100%; height: 100%; object-fit: cover; }
                .footer-brand-logo .logo-letter { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.6rem; color: white; }
                .footer-brand-name { font-size: 1.1rem; font-weight: 700; color: white; display: block; margin-bottom: .15rem; }
                .footer-brand-sub  { font-size: .68rem; font-weight: 500; color: #475569; letter-spacing: .1em; text-transform: uppercase; display: block; margin-bottom: 1rem; }
                .footer-about { font-size: .85rem; color: #64748b; line-height: 1.75; }
                .footer-col-title { font-size: .7rem; font-weight: 700; color: #cbd5e1; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.25rem; display: block; }
                .footer-link { display: block; font-size: .875rem; color: #64748b; text-decoration: none; padding: .3rem 0; transition: color .2s; }
                .footer-link:hover { color: white; }
                .footer-contact-item { display: flex; align-items: flex-start; gap: .75rem; margin-bottom: 1rem; }
                .footer-contact-item svg { flex-shrink: 0; margin-top: .15rem; }
                .footer-contact-text { font-size: .85rem; color: #64748b; line-height: 1.6; }
                .footer-bottom { border-top: 1px solid #1a2332; padding: 1.5rem 0; display: flex; justify-content: space-between; align-items: center; }
                .footer-copy { font-size: .78rem; color: #334155; }
                .footer-socials { display: flex; gap: .875rem; }
                .social-btn { width: 38px; height: 38px; border-radius: 50%; background: #0d1a2e; border: 1px solid #1e2d42; display: flex; align-items: center; justify-content: center; color: #64748b; text-decoration: none; transition: all .25s; }
                .social-btn:hover { background: var(--blue); border-color: var(--blue); color: white; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,102,255,.35); }
            `}</style>

            {/* ════════ NAV ════════ */}
            <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
                <div className="nav-inner">
                    <a href="/" className="nav-logo-wrap">
                        <div className="nav-logo-circle">
                            <img src="/images/logo.png" alt="JNEC Fab Lab"
                                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                            <span className="logo-letter" style={{ display:'none' }}>J</span>
                        </div>
                        <div className="nav-brand-text">
                            <span className="name">JNEC Fab Lab</span>
                            <span className="sub">Fabrication Laboratory</span>
                        </div>
                    </a>

                    <div className="nav-links">
                        <a href="/"         className="nav-link">Home</a>
                        <a href="/machines" className="nav-link">Machines</a>
                        <a href="/shop"     className="nav-link active">Shop</a>
                        <a href="/training" className="nav-link">Training</a>
                        <a href="/projects" className="nav-link">Projects</a>
                        <a href="/about"    className="nav-link">About</a>
                        <a href="/gallery"  className="nav-link">Gallery</a>
                        <a href="/faq"      className="nav-link">FAQ</a>

                        {/* Cart icon with badge */}
                        <div className="cart-badge" style={{ display:'flex', alignItems:'center', cursor:'pointer' }}>
                            <svg width="22" height="22" fill="none" stroke="#1e2a3a" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
                        </div>

                        <Link to="/login" className="nav-login">Login</Link>
                    </div>
                </div>
            </nav>

            {/* ════════ PAGE HERO ════════ */}
            <div className="page-hero">
                <div className="page-hero-grid" />
                <div className="page-hero-glow" />
                <div className="page-hero-glow2" />
                <div className="page-hero-inner">
                    <div className="page-eyebrow">
                        <span className="page-eyebrow-dot" />
                        Fabrication Store
                    </div>
                    <h1 className="page-title">
                        Our <span className="accent">Products</span>
                    </h1>
                    <p className="page-subtitle">
                        Handcrafted goods, precision-made items, and one-of-a-kind pieces — all made right here in the Fab Lab.
                    </p>
                    <div className="page-hero-stats">
                        {[
                            [products.length + '+', 'Products'],
                            [categories.length - 1,  'Categories'],
                            [totalSaleItems,          'On Sale'],
                            ['Nu.',                   'Local Currency'],
                        ].map(([n,l]) => (
                            <div key={l}>
                                <span className="phero-stat-num">{n}</span>
                                <span className="phero-stat-label">{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════ SHOP BANNER ════════ */}
            <div className="shop-banner">
                <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=85"
                    alt="JNEC Fab Lab Products"
                />
                <div className="shop-banner-overlay">
                    <div className="shop-banner-text">
                        <h2>Made in the Lab,<br />Built for You</h2>
                        <p>Every product is designed and fabricated by our students and staff using the Fab Lab's equipment.</p>
                        <button className="btn-banner">Browse All Products ↓</button>
                    </div>
                </div>
            </div>

            {/* ════════ CONTROLS ════════ */}
            <div className="controls-bar">
                <div className="controls-inner">
                    <div className="filter-pills">
                        {categories.map(cat => (
                            <button key={cat} className={`pill ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="controls-right">
                        <span className="results-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
                        <div className="search-wrap">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="default">Default</option>
                            <option value="low">Price: Low → High</option>
                            <option value="high">Price: High → Low</option>
                            <option value="sale">On Sale Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ════════ PRODUCTS ════════ */}
            <section className="products-section">
                <div className="products-container">
                    <div className="section-row">
                        <div>
                            <span className="section-label">Store</span>
                            <h2 className="section-title">Best Selling Products</h2>
                            <div className="divider" />
                        </div>
                        <a href="#" className="view-all-link">
                            View All
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                        </a>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <h3>No products found</h3>
                            <p>Try a different search or category filter.</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filtered.map(product => (
                                <div key={product.id} className="product-card">
                                    {/* Image area */}
                                    <div className="product-img-wrap">
                                        <img src={product.image} alt={product.name} />

                                        {product.sale && (
                                            <span className="sale-badge">-{product.discount}%</span>
                                        )}

                                        <button
                                            className={`wish-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                                            onClick={() => toggleWishlist(product.id)}
                                            aria-label="Wishlist"
                                        >
                                            <svg width="14" height="14" fill="none" stroke={wishlist.includes(product.id) ? '#ef4444' : '#64748b'} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    fill={wishlist.includes(product.id) ? '#ef4444' : 'none'}/>
                                            </svg>
                                        </button>

                                        <div className="product-overlay">
                                            <button className="quick-view-btn">Quick View</button>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="product-body">
                                        <span className="product-cat">{product.category}</span>
                                        <h3 className="product-name">{product.name}</h3>

                                        <div className="price-row">
                                            <span className="price-current">Nu. {product.price}</span>
                                            {product.sale && product.originalPrice && (
                                                <>
                                                    <span className="price-original">Nu. {product.originalPrice}</span>
                                                    <span className="price-save">Save {product.discount}%</span>
                                                </>
                                            )}
                                        </div>

                                        <button className="btn-cart" onClick={() => addToCart(product)}>
                                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                            </svg>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ════════ TOAST ════════ */}
            {toast && (
                <div className="toast">
                    <span className="toast-dot" />
                    {toast}
                </div>
            )}

            {/* ════════ FOOTER ════════ */}
            <footer className="footer">
                <div style={{ maxWidth:'82rem', margin:'0 auto', padding:'0 2rem' }}>
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand-logo">
                                <img src="/images/logo.png" alt="JNEC Fab Lab"
                                    onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='block'; }} />
                                <span className="logo-letter" style={{ display:'none' }}>J</span>
                            </div>
                            <span className="footer-brand-name">JNEC Fab Lab</span>
                            <span className="footer-brand-sub">Fabrication Laboratory</span>
                            <p className="footer-about">The JNEC Fabrication Lab provides access to digital fabrication tools and hands-on training for students, faculty, and the wider community.</p>
                        </div>
                        <div>
                            <span className="footer-col-title">Quick Links</span>
                            {[['Machines','/machines'],['Training','/training'],['Projects','/projects'],['Gallery','/gallery'],['About Us','/about'],['FAQ','/faq']].map(([l,h]) => (
                                <a key={l} href={h} className="footer-link">{l}</a>
                            ))}
                        </div>
                        <div>
                            <span className="footer-col-title">Support</span>
                            <a href="/faq"     className="footer-link">FAQ</a>
                            <a href="/contact" className="footer-link">Contact Us</a>
                            <Link to="/login"  className="footer-link">Login / Register</Link>
                        </div>
                        <div>
                            <span className="footer-col-title">Contact</span>
                            <div className="footer-contact-item">
                                <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                <span className="footer-contact-text">Fab Lab, JNEC Campus, Dewathang, Samdrupjongkhar, Bhutan.</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                <span className="footer-contact-text">fablab@jnec.ac.in</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                <span className="footer-contact-text">+975 77653429</span>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="footer-copy">© 2026 JNEC Fab Lab, Jigme Namgyel Engineering College. All rights reserved.</p>
                        <div className="footer-socials">
                            <a href="https://www.tiktok.com/@jnec_fablab" target="_blank" rel="noreferrer" className="social-btn" aria-label="TikTok">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
                            </a>
                            <a href="https://www.facebook.com/share/18HY9mpzDF/" target="_blank" rel="noreferrer" className="social-btn" aria-label="Facebook">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="http://www.youtube.com/@JNECFabLab" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}