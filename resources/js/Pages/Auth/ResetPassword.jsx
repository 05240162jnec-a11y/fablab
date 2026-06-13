import React, { useState } from 'react';
import axios from 'axios';
import { Link, useParams, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        email: email || '',
        token: token,
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/reset-password`, formData);
            setMessage('✅ ' + response.data.message);
            setFormData({ email: '', token: '', password: '', password_confirmation: '' });
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        } catch (error) {
            if (error.response?.status === 422) {
                if (error.response.data.errors) setErrors(error.response.data.errors);
                else if (error.response.data.message) setMessage('❌ ' + error.response.data.message);
            } else if (error.response?.status === 400) {
                setMessage('❌ ' + error.response.data.message);
            } else {
                setMessage('❌ Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const EyeOpen = () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
    const EyeOff = () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontFamily: "'DM Sans', sans-serif", padding: '16px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                * { box-sizing:border-box; margin:0; padding:0; }

                .rp-bg { position:fixed; inset:0; background:url('/images/fablab-bg.jpg') no-repeat center center / cover; z-index:0; }
                .rp-bg::after { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.52); }

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

                .rp-heading { color:white; text-align:center; font-size:1.3rem; font-weight:700; margin-bottom:.5rem; letter-spacing:-.01em; }
                @media (min-width:480px) { .rp-heading { font-size:1.5rem; } }
                .rp-sub { color:rgba(255,255,255,.6); text-align:center; font-size:.85rem; line-height:1.6; margin-bottom:24px; }
                @media (min-width:480px) { .rp-sub { margin-bottom:28px; } }

                /* Email readonly chip */
                .email-chip {
                    display:flex; align-items:center; gap:.6rem;
                    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15);
                    border-radius:10px; padding:10px 14px; margin-bottom:18px;
                }
                .email-chip svg { flex-shrink:0; color:rgba(255,255,255,.5); }
                .email-chip span { font-size:.875rem; color:rgba(255,255,255,.75); word-break:break-all; }

                .msg-banner { padding:10px 14px; border-radius:10px; font-size:.85rem; font-weight:500; margin-bottom:18px; backdrop-filter:blur(8px); line-height:1.5; word-break:break-word; }
                .msg-success { background:rgba(22,163,74,.25); color:#bbf7d0; border:1px solid rgba(22,163,74,.35); }
                .msg-error   { background:rgba(239,68,68,.2);  color:#fecaca; border:1px solid rgba(239,68,68,.3); }

                .field { margin-bottom:16px; position:relative; }
                .rp-input {
                    width:100%; padding:12px 44px 12px 16px;
                    background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.2);
                    border-radius:10px; color:white; font-size:.9rem;
                    font-family:'DM Sans',sans-serif; outline:none; transition:all .25s;
                }
                @media (min-width:480px) { .rp-input { padding:13px 44px 13px 18px; font-size:.95rem; } }
                .rp-input::placeholder { color:rgba(255,255,255,.55); }
                .rp-input:focus { background:rgba(255,255,255,.24); border-color:rgba(255,255,255,.45); box-shadow:0 0 0 3px rgba(255,255,255,.08); }
                .rp-input.err { border-color:rgba(252,165,165,.7); box-shadow:0 0 0 3px rgba(239,68,68,.12); }
                .err-txt { color:#fca5a5; font-size:.75rem; margin-top:5px; font-weight:500; }
                .ok-txt  { color:#86efac; font-size:.75rem; margin-top:5px; font-weight:500; }

                .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.55); transition:color .2s; padding:0; display:flex; align-items:center; }
                .eye-btn:hover { color:white; }

                .rp-btn {
                    width:100%; padding:13px;
                    background:#0066FF; border:none; border-radius:11px;
                    color:white; font-size:.95rem; font-weight:700;
                    cursor:pointer; margin-top:4px; font-family:'DM Sans',sans-serif;
                    box-shadow:0 4px 18px rgba(0,102,255,.45); transition:all .3s;
                }
                @media (min-width:480px) { .rp-btn { padding:14px; font-size:1rem; } }
                .rp-btn:hover:not(:disabled) { background:#0051cc; transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,102,255,.55); }
                .rp-btn:active:not(:disabled) { transform:translateY(0); }
                .rp-btn:disabled { background:rgba(255,255,255,.18); cursor:not-allowed; color:rgba(255,255,255,.45); box-shadow:none; }

                .back-link-wrap { text-align:center; margin-top:20px; }
                .back-link { color:rgba(255,255,255,.7); font-size:.875rem; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem; transition:color .2s; }
                .back-link:hover { color:white; }

                .key-icon { display:flex; justify-content:center; margin-bottom:6px; color:rgba(255,255,255,.35); }

                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>

            <div className="rp-bg" />

            <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>
                <div className="glass-card">

                    {/* Logo */}
                    <div className="logo-circle">
                        <img src="/images/logo.png" alt="JNEC Fab Lab"
                            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                        <span className="logo-fallback" style={{ display: 'none' }}>J</span>
                    </div>

                    {/* Key icon + heading */}
                    <div className="key-icon">
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="rp-heading">Reset Password</h2>
                    <p className="rp-sub">Enter your new password below.</p>

                    {/* Email chip (read-only display) */}
                    {formData.email && (
                        <div className="email-chip">
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{formData.email}</span>
                        </div>
                    )}

                    {/* Hidden fields passed to API */}
                    <input type="hidden" name="email" value={formData.email} />
                    <input type="hidden" name="token" value={formData.token} />

                    {/* Message */}
                    {message && (
                        <div className={`msg-banner ${message.startsWith('✅') ? 'msg-success' : 'msg-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* New Password */}
                        <div className="field">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                name="password" value={formData.password} onChange={handleChange}
                                placeholder="New Password" required
                                className={`rp-input ${errors.password ? 'err' : ''}`}
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)} aria-label="Toggle password">
                                {showPwd ? <EyeOpen /> : <EyeOff />}
                            </button>
                            {errors.password && (
                                <p className="err-txt">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="field">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="password_confirmation" value={formData.password_confirmation} onChange={handleChange}
                                placeholder="Confirm New Password" required
                                className={`rp-input ${formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation ? 'err' : ''}`}
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} aria-label="Toggle confirm password">
                                {showConfirm ? <EyeOpen /> : <EyeOff />}
                            </button>
                            {formData.password && formData.password_confirmation && (
                                <p className={formData.password === formData.password_confirmation ? 'ok-txt' : 'err-txt'}>
                                    {formData.password === formData.password_confirmation ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="rp-btn">
                            {loading ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12a8 8 0 018-8" />
                                    </svg>
                                    Resetting…
                                </span>
                            ) : 'Reset Password'}
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
        </div>
    );
}