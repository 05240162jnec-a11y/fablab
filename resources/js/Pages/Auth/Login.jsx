import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [token, setToken] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/login`, formData);
            sessionStorage.clear();
            sessionStorage.setItem('auth_token', response.data.token);
            if (response.data.user) {
                // ✅ Always ensure role is stored — default to 'user' for regular users
                const userData = {
                    ...response.data.user,
                    role: response.data.user.role || 'user'
                };
                sessionStorage.setItem('user', JSON.stringify(userData));
            }
            const userRole = response.data.user?.role || 'user';
            const redirectPath =
                userRole === 'admin' ? '/admin/dashboard' :
                    userRole === 'production_team' ? '/production-team/dashboard' :
                        '/user/dashboard';
            window.location.href = redirectPath;
        } catch (error) {
            if (error.response?.status === 403) {
                setMessage(error.response.data.message?.includes('verify')
                    ? '⚠️ ' + error.response.data.message + ' Check your inbox.'
                    : '❌ ' + error.response.data.message);
            } else if (error.response?.status === 422) {
                if (error.response.data.errors) setErrors(error.response.data.errors);
                else setMessage('❌ ' + error.response.data.message);
            } else if (error.response?.status === 401) {
                setMessage('❌ Invalid email or password.');
            } else {
                setMessage('❌ Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        ['admin_token', 'user_data', 'enrollments', 'courses', 'bookings', 'machines'].forEach(k => localStorage.removeItem(k));
        setToken(null);
        setMessage('👋 You have been logged out.');
        setFormData({ email: '', password: '' });
        window.location.href = '/login';
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontFamily: "'DM Sans', sans-serif", padding: '16px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                * { box-sizing:border-box; margin:0; padding:0; }

                .login-bg { position:fixed; inset:0; background:url('/images/fablab-bg.jpg') no-repeat center center / cover; z-index:0; }
                .login-bg::after { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.52); }

                .glass-card {
                    background:rgba(255,255,255,0.11);
                    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
                    border-radius:22px; border:1px solid rgba(255,255,255,0.20);
                    box-shadow:0 8px 40px rgba(0,0,0,0.45);
                    padding:32px 24px;
                    width:100%; max-width:420px;
                }
                @media (min-width:480px) { .glass-card { padding:40px 36px; } }

                .logo-circle {
                    width:80px; height:80px; border-radius:50%;
                    background:rgba(255,255,255,0.95);
                    display:flex; align-items:center; justify-content:center;
                    margin:0 auto 22px;
                    box-shadow:0 4px 28px rgba(0,0,0,0.35);
                    overflow:hidden; padding:10px;
                }
                @media (min-width:480px) { .logo-circle { width:100px; height:100px; padding:12px; margin-bottom:28px; } }
                .logo-circle img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
                .logo-fallback { font-size:2rem; font-weight:900; color:#0066FF; }

                .tabs { display:flex; justify-content:center; gap:2rem; margin-bottom:24px; }
                @media (min-width:480px) { .tabs { gap:2.5rem; margin-bottom:28px; } }
                .tab-link { color:rgba(255,255,255,0.65); font-size:.95rem; font-weight:500; text-decoration:none; padding-bottom:8px; border-bottom:2px solid transparent; transition:all .25s; }
                .tab-link:hover { color:white; }
                .tab-link.active { color:white; border-bottom-color:white; }

                .msg-banner { padding:10px 14px; border-radius:10px; font-size:.85rem; font-weight:500; margin-bottom:16px; backdrop-filter:blur(8px); line-height:1.5; word-break:break-word; }
                .msg-success { background:rgba(22,163,74,.25); color:#bbf7d0; border:1px solid rgba(22,163,74,.35); }
                .msg-warning { background:rgba(217,119,6,.25); color:#fde68a; border:1px solid rgba(217,119,6,.35); }
                .msg-error   { background:rgba(239,68,68,.2);  color:#fecaca; border:1px solid rgba(239,68,68,.3); }

                .field { margin-bottom:16px; position:relative; }
                @media (min-width:480px) { .field { margin-bottom:18px; } }
                .login-input { width:100%; padding:12px 44px 12px 16px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.2); border-radius:10px; color:white; font-size:.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .25s; }
                @media (min-width:480px) { .login-input { padding:13px 44px 13px 18px; font-size:.95rem; } }
                .login-input::placeholder { color:rgba(255,255,255,.55); }
                .login-input:focus { background:rgba(255,255,255,.24); border-color:rgba(255,255,255,.45); box-shadow:0 0 0 3px rgba(255,255,255,.08); }
                .login-input.err { border-color:rgba(252,165,165,.7); box-shadow:0 0 0 3px rgba(239,68,68,.12); }
                .err-txt { color:#fca5a5; font-size:.75rem; margin-top:5px; font-weight:500; }

                .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.55); font-size:1rem; transition:color .2s; padding:0; z-index:10; }
                .eye-btn:hover { color:rgba(255,255,255,.9); }

                .forgot-wrap { text-align:right; margin-top:6px; margin-bottom:6px; }
                .forgot-link { color:rgba(255,255,255,.75); font-size:.82rem; text-decoration:none; transition:color .2s; }
                .forgot-link:hover { color:white; text-decoration:underline; }

                .login-btn { width:100%; padding:13px; background:#0066FF; border:none; border-radius:11px; color:white; font-size:.95rem; font-weight:700; cursor:pointer; margin-top:8px; font-family:'DM Sans',sans-serif; box-shadow:0 4px 18px rgba(0,102,255,.45); transition:all .3s; }
                @media (min-width:480px) { .login-btn { padding:14px; font-size:1rem; } }
                .login-btn:hover:not(:disabled) { background:#0051cc; transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,102,255,.55); }
                .login-btn:active:not(:disabled) { transform:translateY(0); }
                .login-btn:disabled { background:rgba(255,255,255,.18); cursor:not-allowed; color:rgba(255,255,255,.45); box-shadow:none; }
            `}</style>

            <div className="login-bg" />

            <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>
                <div className="glass-card">

                    {/* Home button */}
                    <a href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.375rem',
                        fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.7)',
                        textDecoration: 'none', marginBottom: '1rem',
                        padding: '.35rem .75rem', borderRadius: '9999px',
                        background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
                        transition: 'all .2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to Home
                    </a>

                    {/* Logo */}
                    <div className="logo-circle">
                        <img src="/images/logo.png" alt="JNEC Fab Lab"
                            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                        <span className="logo-fallback" style={{ display: 'none' }}>J</span>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        <Link to="/login" className="tab-link active">Login</Link>
                        <Link to="/register" className="tab-link">Register</Link>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`msg-banner ${message.startsWith('✅') ? 'msg-success' : message.startsWith('⚠️') ? 'msg-warning' : 'msg-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        {/* Email */}
                        <div className="field">
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="Email" required autoComplete="new-password" className={`login-input ${errors.email ? 'err' : ''}`} />
                            {errors.email && <p className="err-txt">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="field">
                            <input type={showPwd ? 'text' : 'password'} name="password"
                                value={formData.password} onChange={handleChange}
                                placeholder="Password" required autoComplete="new-password" className={`login-input ${errors.password ? 'err' : ''}`} />
                            <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)} aria-label="Toggle password">
                                {showPwd ? (
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </button>
                            {errors.password && <p className="err-txt">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                        </div>

                        {/* Forgot */}
                        <div className="forgot-wrap">
                            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? 'Logging in…' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}