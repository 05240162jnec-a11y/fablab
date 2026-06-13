import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ── Modern SVG icons — monochrome, crisp ──
const ICONS = {
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    order: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    money: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    cross: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    assign: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    cart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
    mortarboard: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></>,
    person: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    brush: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
};

const TYPE_META = {
    new_custom_order: { icon: 'brush', bg: '#eff6ff', fg: '#3b82f6' },
    custom_order_price_updated: { icon: 'money', bg: '#f0fdf4', fg: '#16a34a' },
    payment_uploaded: { icon: 'upload', bg: '#eff6ff', fg: '#3b82f6' },
    payment_approved: { icon: 'check', bg: '#f0fdf4', fg: '#16a34a' },
    payment_rejected: { icon: 'cross', bg: '#fef2f2', fg: '#dc2626' },
    design_rejected: { icon: 'refresh', bg: '#fff7ed', fg: '#ea580c' },
    order_assigned: { icon: 'assign', bg: '#faf5ff', fg: '#9333ea' },
    new_booking: { icon: 'calendar', bg: '#eff6ff', fg: '#3b82f6' },
    booking_cancelled: { icon: 'cross', bg: '#fef2f2', fg: '#dc2626' },
    booking_status_updated: { icon: 'calendar', bg: '#f0fdf4', fg: '#16a34a' },
    new_product_order: { icon: 'cart', bg: '#eff6ff', fg: '#3b82f6' },
    product_order_approved: { icon: 'check', bg: '#f0fdf4', fg: '#16a34a' },
    product_order_rejected: { icon: 'cross', bg: '#fef2f2', fg: '#dc2626' },
    product_order_payment_uploaded: { icon: 'upload', bg: '#eff6ff', fg: '#3b82f6' },
    new_project: { icon: 'folder', bg: '#faf5ff', fg: '#9333ea' },
    project_approved: { icon: 'check', bg: '#f0fdf4', fg: '#16a34a' },
    project_rejected: { icon: 'cross', bg: '#fef2f2', fg: '#dc2626' },
    new_enrollment: { icon: 'mortarboard', bg: '#eff6ff', fg: '#3b82f6' },
    course_enrolled: { icon: 'mortarboard', bg: '#f0fdf4', fg: '#16a34a' },
    course_unenrolled: { icon: 'mortarboard', bg: '#fef9c3', fg: '#ca8a04' },
    new_user_registered: { icon: 'person', bg: '#f0fdf4', fg: '#16a34a' },
};

function NotifIcon({ type }) {
    const meta = TYPE_META[type] || { icon: 'bell', bg: '#f3f4f6', fg: '#6b7280' };
    const path = ICONS[meta.icon] || ICONS.bell;
    return (
        <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <svg width="18" height="18" fill="none" stroke={meta.fg} viewBox="0 0 24 24">
                {path}
            </svg>
        </div>
    );
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const getPortal = () => {
        const p = window.location.pathname;
        if (p.startsWith('/admin')) return 'admin';
        if (p.startsWith('/production-team')) return 'production-team';
        return 'user';
    };
    const getToken = () =>
        sessionStorage.getItem('auth_token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('auth_token');
    const apiBase = () => `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/${getPortal()}`;
    const authHdr = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${getToken()}` });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            if (!getToken()) return;
            const res = await axios.get(`${apiBase()}/notifications`, { headers: authHdr() });
            setNotifications(res.data.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchUnreadCount = async () => {
        try {
            if (!getToken()) return;
            const res = await axios.get(`${apiBase()}/notifications/unread-count`, { headers: authHdr() });
            setUnreadCount(res.data.count);
        } catch (e) { console.error(e); }
    };

    const markAsRead = async (id) => {
        try {
            if (!getToken()) return;
            await axios.post(`${apiBase()}/notifications/${id}/read`, {}, { headers: authHdr() });
            setNotifications(n => n.map(x => x.id === id ? { ...x, read_at: new Date().toISOString() } : x));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (e) { console.error(e); }
    };

    const clearAll = async () => {
        try {
            if (!getToken()) return;
            await axios.delete(`${apiBase()}/notifications/clear-all`, { headers: authHdr() });
            setNotifications([]);
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        try {
            if (!getToken()) return;
            await axios.post(`${apiBase()}/notifications/mark-all-read`, {}, { headers: authHdr() });
            setNotifications(n => n.map(x => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        const t = setInterval(() => { fetchNotifications(); fetchUnreadCount(); }, 30000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fn = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const handleClick = (notif) => {
        if (!notif.read_at) markAsRead(notif.id);
        const data = notif.data;
        const portal = getPortal();
        const id = data.booking_id || data.order_id || data.project_id || data.course_id || data.user_id || '';
        const h = id ? `&highlight=${id}` : '';

        // ✅ FIXED: product_order_payment_uploaded → Bookings & Orders (Product Orders tab)
        // ✅ FIXED: payment_uploaded → Custom Orders only (for custom order payments)
        if (['new_custom_order', 'payment_uploaded'].includes(data.type))
            window.location.href = `/admin/custom-orders?tab=custom${h}`;
        else if (['new_product_order', 'product_order_payment_uploaded'].includes(data.type))
            window.location.href = `/admin/bookings?tab=product-orders${h}`;
        else if (['new_booking', 'booking_cancelled'].includes(data.type))
            window.location.href = `/admin/bookings?tab=machine-bookings${h}`;
        else if (data.type === 'new_project' && portal === 'admin')
            window.location.href = `/admin/projects${h ? '?' + h.slice(1) : ''}`;
        else if (data.type === 'new_enrollment')
            window.location.href = `/admin/courses${h ? '?' + h.slice(1) : ''}`;
        else if (data.type === 'new_user_registered')
            window.location.href = `/admin/users${h ? '?' + h.slice(1) : ''}`;
        else if (['custom_order_price_updated', 'payment_approved', 'payment_rejected', 'design_rejected'].includes(data.type))
            window.location.href = `/user/shop-orders?tab=custom${h}`;
        else if (['product_order_approved', 'product_order_rejected'].includes(data.type))
            window.location.href = `/user/shop-orders?tab=orders${h}`;
        else if (data.type === 'booking_status_updated')
            window.location.href = `/user/machines?tab=bookings${h}`;
        else if (['project_approved', 'project_rejected'].includes(data.type))
            window.location.href = `/user/projects${h ? '?' + h.slice(1) : ''}`;
        else if (['course_enrolled', 'course_unenrolled'].includes(data.type))
            window.location.href = `/user/learning${h ? '?' + h.slice(1) : ''}`;
        else if (data.type === 'order_assigned')
            window.location.href = `/production-team/assigned-orders${h ? '?' + h.slice(1) : ''}`;

        setIsOpen(false);
    };

    const relTime = (d) => {
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return 'Just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        if (s < 172800) return 'Yesterday';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            <style>{`
                .nb-dropdown {
                    position:absolute; right:0; margin-top:10px;
                    width:380px; background:#fff;
                    border-radius:16px;
                    box-shadow:0 8px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
                    border:1px solid rgba(0,0,0,.07);
                    z-index:9999; overflow:hidden;
                    animation:nbDrop .18s cubic-bezier(.16,1,.3,1) both;
                }
                @keyframes nbDrop {
                    from { opacity:0; transform:translateY(-8px) scale(.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                .nb-item {
                    display:flex; align-items:flex-start; gap:12px;
                    padding:12px 16px; cursor:pointer;
                    border-bottom:1px solid #f3f4f6;
                    transition:background .15s;
                    position:relative;
                }
                .nb-item:last-child { border-bottom:none; }
                .nb-item:hover { background:#f9fafb; }
                .nb-item.unread { background:#f0f7ff; }
                .nb-item.unread:hover { background:#e8f2ff; }
                .nb-msg {
                    font-size:.8rem; line-height:1.5; color:#374151;
                    display:-webkit-box; -webkit-line-clamp:2;
                    -webkit-box-orient:vertical; overflow:hidden;
                }
                .nb-item.unread .nb-msg { color:#0f172a; font-weight:600; }
                .nb-time { font-size:.7rem; color:#9ca3af; margin-top:3px; }
                .nb-badge {
                    position:absolute; top:-4px; right:-4px;
                    background:#ef4444; color:#fff;
                    font-size:.65rem; font-weight:700;
                    min-width:18px; height:18px; border-radius:9999px;
                    display:flex; align-items:center; justify-content:center;
                    padding:0 4px;
                    box-shadow:0 0 0 2px #fff;
                }
                .nb-bell-btn {
                    position:relative; padding:8px; border-radius:10px;
                    background:none; border:none; cursor:pointer;
                    color:#6b7280; transition:background .15s, color .15s;
                    display:flex; align-items:center; justify-content:center;
                }
                .nb-bell-btn:hover { background:#f3f4f6; color:#111827; }
                .nb-bell-btn.open  { background:#eff6ff; color:#3b82f6; }
                .nb-empty {
                    padding:2.5rem 1rem; display:flex; flex-direction:column;
                    align-items:center; gap:.5rem; color:#9ca3af;
                }
                .nb-empty-icon { opacity:.3; margin-bottom:.25rem; }
                .nb-spin {
                    width:22px; height:22px; border:2.5px solid #e5e7eb;
                    border-top-color:#6b7280; border-radius:50%;
                    animation:nbSpin .6s linear infinite; margin:0 auto;
                }
                @keyframes nbSpin { to { transform:rotate(360deg); } }
            `}</style>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                    className={`nb-bell-btn ${isOpen ? 'open' : ''}`}
                    onClick={() => { setIsOpen(o => !o); if (!isOpen) fetchNotifications(); }}
                    aria-label="Notifications"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {ICONS.bell}
                    </svg>
                    {unreadCount > 0 && (
                        <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                </button>

                {isOpen && (
                    <div className="nb-dropdown">
                        <div style={{
                            padding: '14px 16px 12px', borderBottom: '1px solid #f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                                {unreadCount > 0 && (
                                    <span style={{ fontSize: '.65rem', fontWeight: 700, background: '#eff6ff', color: '#3b82f6', padding: '2px 7px', borderRadius: 9999, border: '1px solid #bfdbfe' }}>
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} style={{ fontSize: '.72rem', fontWeight: 600, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: 6, transition: 'background .15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} style={{ fontSize: '.72rem', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: 6, transition: 'background .15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', maxHeight: 420 }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <div className="nb-spin" />
                                    <p style={{ fontSize: '.75rem', color: '#9ca3af', marginTop: 8 }}>Loading…</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="nb-empty">
                                    <svg className="nb-empty-icon" width="40" height="40" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">{ICONS.bell}</svg>
                                    <p style={{ fontSize: '.8rem', fontWeight: 600, color: '#6b7280' }}>All caught up!</p>
                                    <p style={{ fontSize: '.72rem' }}>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notif => {
                                    const unread = !notif.read_at;
                                    return (
                                        <div key={notif.id} className={`nb-item ${unread ? 'unread' : ''}`} onClick={() => handleClick(notif)}>
                                            <NotifIcon type={notif.data.type} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p className="nb-msg">{notif.data.message}</p>
                                                <p className="nb-time">{relTime(notif.created_at)}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                                <span style={{ fontSize: '.72rem', color: '#9ca3af' }}>
                                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}