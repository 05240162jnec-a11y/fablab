import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [formData, setFormData] = useState({ email: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

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
            const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', formData);
            setMessage('✅ ' + response.data.message);
            setFormData({ email: '' });
        } catch (error) {
            if (error.response?.status === 422) {
                if (error.response.data.errors) setErrors(error.response.data.errors);
                else if (error.response.data.message) setMessage('❌ ' + error.response.data.message);
            } else if (error.response?.status === 404) {
                setMessage('❌ Email not found. Please check your email address.');
            } else {
                setMessage('❌ Failed to send reset link. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontFamily: "'DM Sans', sans-serif", padding: '16px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                * { box-sizing:border-box; margin:0; padding:0; }

                .fp-bg { position:fixed; inset:0; background:url('/images/fablab-bg.jpg') no-repeat center center / cover; z-index:0; }
                .fp-bg::after { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.52); }

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
                    margin:0 auto 20px;
                    box-shadow:0 4px 28px rgba(0,0,0,0.35);
                    overflow:hidden; padding:10px;
                }
                @media (min-width:480px) { .logo-circle { width:100px; height:100px; padding:12px; margin-bottom:28px; } }
                .logo-circle img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
                .logo-fallback { font-size:2rem; font-weight:900; color:#0066FF; }

                .fp-heading { color:white; text-align:center; font-size:1.3rem; font-weight:700; margin-bottom:.5rem; letter-spacing:-.01em; }
                @media (min-width:480px) { .fp-heading { font-size:1.5rem; } }
                .fp-sub { color:rgba(255,255,255,.6); text-align:center; font-size:.85rem; line-height:1.6; margin-bottom:24px; }
                @media (min-width:480px) { .fp-sub { margin-bottom:28px; } }

                .msg-banner { padding:10px 14px; border-radius:10px; font-size:.85rem; font-weight:500; margin-bottom:18px; backdrop-filter:blur(8px); line-height:1.5; word-break:break-word; }
                .msg-success { background:rgba(22,163,74,.25); color:#bbf7d0; border:1px solid rgba(22,163,74,.35); }
                .msg-error   { background:rgba(239,68,68,.2);  color:#fecaca; border:1px solid rgba(239,68,68,.3); }

                .field { margin-bottom:18px; }
                .fp-input {
                    width:100%; padding:12px 16px;
                    background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.2);
                    border-radius:10px; color:white; font-size:.9rem;
                    font-family:'DM Sans',sans-serif; outline:none; transition:all .25s;
                }
                @media (min-width:480px) { .fp-input { padding:13px 18px; font-size:.95rem; } }
                .fp-input::placeholder { color:rgba(255,255,255,.55); }
                .fp-input:focus { background:rgba(255,255,255,.24); border-color:rgba(255,255,255,.45); box-shadow:0 0 0 3px rgba(255,255,255,.08); }
                .fp-input.err { border-color:rgba(252,165,165,.7); box-shadow:0 0 0 3px rgba(239,68,68,.12); }
                .err-txt { color:#fca5a5; font-size:.75rem; margin-top:5px; font-weight:500; }

                .fp-btn {
                    width:100%; padding:13px;
                    background:#0066FF; border:none; border-radius:11px;
                    color:white; font-size:.95rem; font-weight:700;
                    cursor:pointer; font-family:'DM Sans',sans-serif;
                    box-shadow:0 4px 18px rgba(0,102,255,.45); transition:all .3s;
                }
                @media (min-width:480px) { .fp-btn { padding:14px; font-size:1rem; } }
                .fp-btn:hover:not(:disabled) { background:#0051cc; transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,102,255,.55); }
                .fp-btn:active:not(:disabled) { transform:translateY(0); }
                .fp-btn:disabled { background:rgba(255,255,255,.18); cursor:not-allowed; color:rgba(255,255,255,.45); box-shadow:none; }

                .back-link-wrap { text-align:center; margin-top:20px; }
                .back-link { color:rgba(255,255,255,.7); font-size:.875rem; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem; transition:color .2s; }
                .back-link:hover { color:white; }

                /* Lock icon animation */
                .lock-icon { display:flex; justify-content:center; margin-bottom:4px; color:rgba(255,255,255,.35); }
            `}</style>

            <div className="fp-bg" />

            <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>
                <div className="glass-card">

                    {/* Logo */}
                    <div className="logo-circle">
                        <img src="/images/logo.png" alt="JNEC Fab Lab"
                            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                        <span className="logo-fallback" style={{ display: 'none' }}>J</span>
                    </div>

                    {/* Lock icon + heading */}
                    <div className="lock-icon">
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="fp-heading">Forgot Password?</h2>
                    <p className="fp-sub">Enter your email and we'll send you a link to reset your password.</p>

                    {/* Message */}
                    {message && (
                        <div className={`msg-banner ${message.startsWith('✅') ? 'msg-success' : 'msg-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <input
                                type="email" name="email"
                                value={formData.email} onChange={handleChange}
                                placeholder="Enter your email address" required
                                className={`fp-input ${errors.email ? 'err' : ''}`}
                            />
                            {errors.email && (
                                <p className="err-txt">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="fp-btn">
                            {loading ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12a8 8 0 018-8" />
                                    </svg>
                                    Sending…
                                </span>
                            ) : 'Send Reset Link'}
                        </button>
                    </form>

                    {/* Back to login */}
                    <div className="back-link-wrap">
                        <Link to="/login" className="back-link">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
    );
}