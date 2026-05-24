import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [token, setToken] = useState(null);  // kept from original

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // ── UNIFIED LOGIN (User + Admin + Production Team) — original logic untouched ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            let response;
            let loginType = 'user';

            try {
                response = await axios.post('http://127.0.0.1:8000/api/login', formData);
            } catch (userError) {
                if (userError.response?.status === 401 ||
                    userError.response?.data?.message?.includes('Invalid credentials')) {
                    response = await axios.post('http://127.0.0.1:8000/api/admin/login', formData);
                    loginType = 'admin';
                } else {
                    throw userError;
                }
            }

            // Clear per-tab old data only (localStorage is shared across tabs)
            sessionStorage.clear();

            sessionStorage.setItem('auth_token', response.data.token);

            if (loginType === 'admin') {
                if (response.data.admin) {
                    sessionStorage.setItem('user', JSON.stringify({ ...response.data.admin, role: 'admin' }));
                }
            } else {
                if (response.data.user) {
                    sessionStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }


            const userData = response.data.user || response.data.admin;
            const userRole = userData?.role || (loginType === 'admin' ? 'admin' : 'student');
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

    // Logout helper (kept from original)
    const handleLogout = () => {
        sessionStorage.clear();
        // Keep existing localStorage cleanup to avoid stale non-auth data affecting UI.
        ['admin_token', 'user_data', 'enrollments', 'courses', 'bookings', 'machines'].forEach(k => localStorage.removeItem(k));
        setToken(null);
        setMessage('👋 You have been logged out.');
        setFormData({ email: '', password: '' });
        window.location.href = '/login';
    };

    return (
        <div style={styles.root}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* ── Background ── */
                .login-bg {
                    position: fixed; inset: 0;
                    background: url('/images/fablab-bg.jpg') no-repeat center center / cover;
                    z-index: 0;
                }
                .login-bg::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.52);
                }

                /* ── Glass card ── */
                .glass-card {
                    background: rgba(255,255,255,0.11);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-radius: 22px;
                    border: 1px solid rgba(255,255,255,0.20);
                    box-shadow: 0 8px 40px rgba(0,0,0,0.45);
                    padding: 40px 36px;
                    width: 100%;
                    max-width: 420px;
                }

                /* ── Logo circle ── */
                .logo-circle {
                    width: 100px; height: 100px; border-radius: 50%;
                    background: rgba(255,255,255,0.95);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 28px;
                    box-shadow: 0 4px 28px rgba(0,0,0,0.35);
                    overflow: hidden;
                    padding: 12px;
                }
                .logo-circle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
                .logo-fallback { font-size: 2.2rem; font-weight: 900; color: #0066FF; }

                /* ── Tabs ── */
                .tabs { display: flex; justify-content: center; gap: 2.5rem; margin-bottom: 28px; }
                .tab-link {
                    color: rgba(255,255,255,0.65);
                    font-size: 1rem; font-weight: 500;
                    text-decoration: none; padding-bottom: 8px;
                    border-bottom: 2px solid transparent;
                    transition: all .25s;
                }
                .tab-link:hover { color: white; }
                .tab-link.active { color: white; border-bottom-color: white; }

                /* ── Message banner ── */
                .msg-banner {
                    padding: 10px 14px; border-radius: 10px;
                    font-size: .85rem; font-weight: 500;
                    margin-bottom: 18px;
                    backdrop-filter: blur(8px);
                    line-height: 1.5;
                }
                .msg-success { background: rgba(22,163,74,.25); color: #bbf7d0; border: 1px solid rgba(22,163,74,.35); }
                .msg-warning { background: rgba(217,119,6,.25);  color: #fde68a; border: 1px solid rgba(217,119,6,.35); }
                .msg-error   { background: rgba(239,68,68,.2);   color: #fecaca; border: 1px solid rgba(239,68,68,.3); }

                /* ── Inputs ── */
                .field { margin-bottom: 18px; position: relative; }
                .login-input {
                    width: 100%;
                    padding: 13px 44px 13px 18px;
                    background: rgba(255,255,255,.15);
                    border: 1px solid rgba(255,255,255,.2);
                    border-radius: 10px;
                    color: white; font-size: .95rem;
                    font-family: 'DM Sans', sans-serif;
                    outline: none; transition: all .25s;
                }
                .login-input::placeholder { color: rgba(255,255,255,.55); }
                .login-input:focus {
                    background: rgba(255,255,255,.24);
                    border-color: rgba(255,255,255,.45);
                    box-shadow: 0 0 0 3px rgba(255,255,255,.08);
                }
                .login-input.err {
                    border-color: rgba(252,165,165,.7);
                    box-shadow: 0 0 0 3px rgba(239,68,68,.12);
                }
                .err-txt { color: #fca5a5; font-size: .75rem; margin-top: 5px; font-weight: 500; }

                /* ── Eye toggle ── */
                .eye-btn {
                    position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: rgba(255,255,255,.55); font-size: 1rem;
                    transition: color .2s; padding: 0; z-index: 10;
                }
                .eye-btn:hover { color: rgba(255,255,255,.9); }

                /* ── Forgot link ── */
                .forgot-wrap { text-align: right; margin-top: 6px; margin-bottom: 6px; }
                .forgot-link {
                    color: rgba(255,255,255,.75); font-size: .82rem;
                    text-decoration: none; transition: color .2s;
                }
                .forgot-link:hover { color: white; text-decoration: underline; }

                /* ── Submit button ── */
                .login-btn {
                    width: 100%; padding: 14px;
                    background: #0066FF;
                    border: none; border-radius: 11px;
                    color: white; font-size: 1rem; font-weight: 700;
                    cursor: pointer; margin-top: 8px;
                    font-family: 'DM Sans', sans-serif;
                    box-shadow: 0 4px 18px rgba(0,102,255,.45);
                    transition: all .3s;
                }
                .login-btn:hover:not(:disabled) {
                    background: #0051cc;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(0,102,255,.55);
                }
                .login-btn:active:not(:disabled) { transform: translateY(0); }
                .login-btn:disabled {
                    background: rgba(255,255,255,.18);
                    cursor: not-allowed; color: rgba(255,255,255,.45);
                    box-shadow: none;
                }

                /* Font Awesome via CDN */
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
            `}</style>

            {/* Background */}
            <div className="login-bg" />

            {/* Card */}
            <div style={styles.wrap}>
                <div className="glass-card">

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

                    {/* Message banner */}
                    {message && (
                        <div className={`msg-banner ${message.startsWith('✅') ? 'msg-success' :
                                message.startsWith('⚠️') ? 'msg-warning' :
                                    'msg-error'
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="field">
                            <input
                                type="email" name="email"
                                value={formData.email} onChange={handleChange}
                                placeholder="Email" required
                                className={`login-input ${errors.email ? 'err' : ''}`}
                            />
                            {errors.email && (
                                <p className="err-txt">
                                    {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="field">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                name="password"
                                value={formData.password} onChange={handleChange}
                                placeholder="Password" required
                                className={`login-input ${errors.password ? 'err' : ''}`}
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)}>
                                <i className={`fas ${showPwd ? 'fa-eye' : 'fa-eye-slash'}`}
                                    style={{ fontFamily: "'Font Awesome 6 Free'", fontWeight: 900 }} />
                            </button>
                            {errors.password && (
                                <p className="err-txt">
                                    {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                                </p>
                            )}
                        </div>

                        {/* Forgot Password */}
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

            {/* Font Awesome CDN */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
        </div>
    );
}

const styles = {
    root: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: "'DM Sans', sans-serif",
        padding: '20px',
    },
    wrap: {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '420px',
    },
};