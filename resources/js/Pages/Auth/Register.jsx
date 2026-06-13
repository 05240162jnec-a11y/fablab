import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CountrySelect from '../../Components/CountrySelect';

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', password_confirmation: '',
        gender: '', phone: '', role: 'student', department: '', year_of_study: '',
    });
    const [countryCode, setCountryCode] = useState('BT');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const weakPasswords = [
        'password', 'password123', '12345678', '123456789', 'qwerty',
        'abc123', 'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
        'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey',
        'shadow', 'superman', 'qazwsx', '123123', 'admin', 'welcome', 'jennifer', 'login'
    ];

    const validatePhone = (phone, country) => {
        if (country === 'BT') return /^(17|77)\d{6}$/.test(phone);
        return /^\d{7,15}$/.test(phone);
    };

    const validatePassword = (password) => {
        const errs = [];
        if (password.length < 8) errs.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errs.push('one uppercase letter');
        if (!/[a-z]/.test(password)) errs.push('one lowercase letter');
        if (!/[0-9]/.test(password)) errs.push('one number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errs.push('one special character (!@#$%^&*)');
        if (weakPasswords.includes(password.toLowerCase())) errs.push('password is too common');
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (name === 'role' && value === 'outsider')
            setFormData(prev => ({ ...prev, department: '', year_of_study: '', role: value }));
        if (name === 'phone') {
            if (value && !validatePhone(value, countryCode)) {
                setErrors(prev => ({
                    ...prev, phone: countryCode === 'BT'
                        ? 'Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)'
                        : 'Phone number must be 7-15 digits'
                }));
            } else {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
        }
        if (name === 'password' && value) {
            const pwdErrs = validatePassword(value);
            setErrors(prev => ({ ...prev, password: pwdErrs.length > 0 ? 'Password must contain: ' + pwdErrs.join(', ') : '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});
        if (!validatePhone(formData.phone, countryCode)) {
            setErrors({
                phone: [countryCode === 'BT'
                    ? 'Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)'
                    : 'Phone number must be 7-15 digits']
            });
            setLoading(false); return;
        }
        const pwdErrs = validatePassword(formData.password);
        if (pwdErrs.length > 0) {
            setErrors({ password: ['Password must contain: ' + pwdErrs.join(', ')] });
            setLoading(false); return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/register`, formData);
            setMessage('✅ ' + response.data.message);
            setFormData({ name: '', email: '', password: '', password_confirmation: '', gender: '', phone: '', role: 'student', department: '', year_of_study: '' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            if (error.response?.status === 422) {
                if (error.response.data.errors) setErrors(error.response.data.errors);
                else setMessage('❌ ' + error.response.data.message);
            } else if (error.response?.status === 403) {
                setMessage('❌ ' + error.response.data.message);
            } else {
                setMessage('❌ Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // SVG eye icons — no Font Awesome needed
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
    const ChevDown = () => (
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontFamily: "'DM Sans', sans-serif", padding: '16px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                * { box-sizing:border-box; margin:0; padding:0; }

                .reg-bg { position:fixed; inset:0; background:url('/images/fablab-bg.jpg') no-repeat center center / cover; z-index:0; }
                .reg-bg::after { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.58); }

                .glass-card {
                    background:rgba(255,255,255,0.10);
                    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
                    border-radius:22px; border:1px solid rgba(255,255,255,0.18);
                    box-shadow:0 8px 40px rgba(0,0,0,0.45);
                    padding:28px 20px;
                    width:100%; max-width:460px;
                }
                @media (min-width:480px) { .glass-card { padding:32px 28px; } }

                .logo-circle {
                    width:76px; height:76px; border-radius:50%;
                    background:rgba(255,255,255,0.95);
                    display:flex; align-items:center; justify-content:center;
                    margin:0 auto 18px;
                    box-shadow:0 4px 24px rgba(0,0,0,0.3);
                    overflow:hidden; padding:8px;
                }
                @media (min-width:480px) { .logo-circle { width:88px; height:88px; margin-bottom:22px; } }
                .logo-circle img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
                .logo-fallback { font-size:1.8rem; font-weight:900; color:#0066FF; }

                .tabs { display:flex; justify-content:center; gap:2rem; margin-bottom:16px; }
                .tab-link { color:rgba(255,255,255,0.65); font-size:.95rem; font-weight:500; text-decoration:none; padding-bottom:6px; border-bottom:2px solid transparent; transition:all .25s; }
                .tab-link:hover { color:white; }
                .tab-link.active { color:white; border-bottom-color:white; }

                .form-title { color:white; text-align:center; font-size:1.05rem; font-weight:600; margin-bottom:16px; letter-spacing:.01em; }
                @media (min-width:480px) { .form-title { font-size:1.15rem; margin-bottom:18px; } }

                .msg-banner { padding:10px 14px; border-radius:10px; font-size:.85rem; font-weight:500; margin-bottom:14px; backdrop-filter:blur(8px); line-height:1.5; word-break:break-word; }
                .msg-success { background:rgba(22,163,74,.25); color:#bbf7d0; border:1px solid rgba(22,163,74,.35); }
                .msg-error   { background:rgba(239,68,68,.2);  color:#fecaca; border:1px solid rgba(239,68,68,.3); }

                .field { margin-bottom:12px; }
                @media (min-width:480px) { .field { margin-bottom:13px; } }
                .reg-label { display:block; color:rgba(255,255,255,.88); font-size:.8rem; font-weight:500; margin-bottom:5px; }

                .reg-input, .reg-select {
                    width:100%; padding:10px 36px 10px 13px;
                    background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.2);
                    border-radius:9px; color:white; font-size:.875rem;
                    font-family:'DM Sans',sans-serif; outline:none; transition:all .25s;
                }
                @media (min-width:480px) { .reg-input, .reg-select { padding:11px 36px 11px 14px; font-size:.9rem; } }
                .reg-input::placeholder { color:rgba(255,255,255,.5); }
                .reg-input:focus, .reg-select:focus { background:rgba(255,255,255,.22); border-color:rgba(255,255,255,.45); box-shadow:0 0 0 3px rgba(255,255,255,.08); }
                .reg-input.err, .reg-select.err { border-color:rgba(252,165,165,.7); box-shadow:0 0 0 3px rgba(239,68,68,.12); }
                .reg-select { appearance:none; -webkit-appearance:none; cursor:pointer; color:rgba(255,255,255,.85); }
                .reg-select option { background:#1a1a2e; color:white; }

                .sel-wrap { position:relative; }
                .sel-wrap .chev { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,.55); pointer-events:none; display:flex; }

                .pwd-wrap { position:relative; }
                .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.55); transition:color .2s; padding:0; display:flex; align-items:center; }
                .eye-btn:hover { color:white; }

                /* Phone row — stacks on very small screens */
                .phone-row { display:flex; gap:8px; flex-wrap:wrap; align-items:flex-start; }
                .phone-row .country-col { width:100%; }
                .phone-row .num-col { width:100%; }
                @media (min-width:360px) { .phone-row { flex-wrap:nowrap; } .phone-row .country-col { width:44%; flex-shrink:0; } .phone-row .num-col { flex:1; min-width:0; } }
                .phone-row .reg-input { padding-right:13px; }

                /* Restyle the CountrySelect button to match the dark glass theme */
                .phone-row .country-col button {
                    width:100% !important;
                    padding:10px 14px !important;
                    background:rgba(255,255,255,.14) !important;
                    border:1px solid rgba(255,255,255,.2) !important;
                    border-radius:9px !important;
                    color:white !important;
                    font-size:.875rem !important;
                    transition:all .25s !important;
                }
                @media (min-width:480px) { .phone-row .country-col button { padding:11px 14px !important; font-size:.9rem !important; } }
                .phone-row .country-col button:hover,
                .phone-row .country-col button:focus {
                    background:rgba(255,255,255,.22) !important;
                    border-color:rgba(255,255,255,.45) !important;
                    box-shadow:0 0 0 3px rgba(255,255,255,.08) !important;
                    outline:none !important;
                }
                .phone-row .country-col button span {
                    color:white !important;
                    font-weight:500 !important;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                }
                .phone-row .country-col button svg { color:rgba(255,255,255,.65) !important; flex-shrink:0; }

                .help-txt { color:rgba(255,255,255,.45); font-size:.72rem; margin-top:4px; }
                .err-txt  { color:#fca5a5; font-size:.75rem; margin-top:4px; font-weight:500; }
                .ok-txt   { color:#86efac; font-size:.75rem; margin-top:4px; font-weight:500; }

                .reg-btn { width:100%; padding:12px; background:#0066FF; border:none; border-radius:11px; color:white; font-size:.95rem; font-weight:700; cursor:pointer; margin-top:8px; font-family:'DM Sans',sans-serif; box-shadow:0 4px 18px rgba(0,102,255,.45); transition:all .3s; }
                @media (min-width:480px) { .reg-btn { padding:13px; font-size:1rem; } }
                .reg-btn:hover:not(:disabled) { background:#0051cc; transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,102,255,.55); }
                .reg-btn:active:not(:disabled) { transform:translateY(0); }
                .reg-btn:disabled { background:rgba(255,255,255,.2); cursor:not-allowed; color:rgba(255,255,255,.5); box-shadow:none; }
            `}</style>

            <div className="reg-bg" />

            <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '460px' }}>
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
                        <Link to="/login" className="tab-link">Login</Link>
                        <Link to="/register" className="tab-link active">Register</Link>
                    </div>

                    <div className="form-title">Create Account</div>

                    {message && (
                        <div className={`msg-banner ${message.startsWith('✅') ? 'msg-success' : 'msg-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div className="field">
                            <input type="text" name="name" value={formData.name} onChange={handleChange}
                                placeholder="Full Name" required
                                className={`reg-input ${errors.name ? 'err' : ''}`} />
                            {errors.name && <p className="err-txt">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
                        </div>

                        {/* Gender */}
                        <div className="field sel-wrap">
                            <select name="gender" value={formData.gender} onChange={handleChange} required
                                className={`reg-select ${errors.gender ? 'err' : ''}`}>
                                <option value="" disabled>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <span className="chev"><ChevDown /></span>
                            {errors.gender && <p className="err-txt">{Array.isArray(errors.gender) ? errors.gender[0] : errors.gender}</p>}
                        </div>

                        {/* Phone */}
                        <div className="field">
                            <label className="reg-label">Phone Number</label>
                            <div className="phone-row">
                                <div className="country-col">
                                    <CountrySelect value={countryCode} onChange={setCountryCode} error={errors.phone} />
                                </div>
                                <div className="num-col">
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        placeholder={countryCode === 'BT' ? '17XXXXXX' : 'Phone number'}
                                        className={`reg-input ${errors.phone ? 'err' : ''}`} required />
                                </div>
                            </div>
                            {errors.phone
                                ? <p className="err-txt">{Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}</p>
                                : <p className="help-txt">{countryCode === 'BT'
                                    ? 'Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)'
                                    : 'Enter your phone number without country code'}</p>
                            }
                        </div>

                        {/* Email */}
                        <div className="field">
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="Email Address" required
                                className={`reg-input ${errors.email ? 'err' : ''}`} />
                            {errors.email && <p className="err-txt">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
                        </div>

                        {/* Role */}
                        <div className="field sel-wrap">
                            <select name="role" value={formData.role} onChange={handleChange} required
                                className={`reg-select ${errors.role ? 'err' : ''}`}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="outsider">Outsider</option>
                            </select>
                            <span className="chev"><ChevDown /></span>
                            {errors.role && <p className="err-txt">{Array.isArray(errors.role) ? errors.role[0] : errors.role}</p>}
                        </div>

                        {/* Department — student / faculty only */}
                        {(formData.role === 'student' || formData.role === 'faculty') && (
                            <div className="field sel-wrap">
                                <select name="department" value={formData.department} onChange={handleChange}
                                    className={`reg-select ${errors.department ? 'err' : ''}`}>
                                    <option value="" disabled>Select Department</option>
                                    <option value="Department of Civil Engineering &amp; Surveying">Department of Civil Engineering &amp; Surveying</option>
                                    <option value="Department of Electrical Engineering">Department of Electrical Engineering</option>
                                    <option value="Department of Mechanical Engineering">Department of Mechanical Engineering</option>
                                    <option value="Department of Information Technology">Department of Information Technology</option>
                                    <option value="Department of Humanities and Management">Department of Humanities and Management</option>
                                    <option value="Department of Electronics & Communication Egineering">Department of Electronics &amp; Communication Engineering</option>
                                </select>
                                <span className="chev"><ChevDown /></span>
                                {errors.department && <p className="err-txt">{Array.isArray(errors.department) ? errors.department[0] : errors.department}</p>}
                            </div>
                        )}

                        {/* Year — student only */}
                        {formData.role === 'student' && (
                            <div className="field sel-wrap">
                                <select name="year_of_study" value={formData.year_of_study} onChange={handleChange}
                                    className={`reg-select ${errors.year_of_study ? 'err' : ''}`}>
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                                <span className="chev"><ChevDown /></span>
                                {errors.year_of_study && <p className="err-txt">{Array.isArray(errors.year_of_study) ? errors.year_of_study[0] : errors.year_of_study}</p>}
                            </div>
                        )}

                        {/* Password */}
                        <div className="field">
                            <div className="pwd-wrap">
                                <input type={showPassword ? 'text' : 'password'} name="password"
                                    value={formData.password} onChange={handleChange}
                                    placeholder="Password" required
                                    className={`reg-input ${errors.password ? 'err' : ''}`} />
                                <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)} aria-label="Toggle password">
                                    {showPassword ? <EyeOpen /> : <EyeOff />}
                                </button>
                            </div>
                            {errors.password && <p className="err-txt">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="field">
                            <div className="pwd-wrap">
                                <input type={showConfirm ? 'text' : 'password'} name="password_confirmation"
                                    value={formData.password_confirmation} onChange={handleChange}
                                    placeholder="Confirm Password" required
                                    className={`reg-input ${formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation ? 'err' : ''}`} />
                                <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} aria-label="Toggle confirm password">
                                    {showConfirm ? <EyeOpen /> : <EyeOff />}
                                </button>
                            </div>
                            {formData.password && formData.password_confirmation && (
                                <p className={formData.password === formData.password_confirmation ? 'ok-txt' : 'err-txt'}>
                                    {formData.password === formData.password_confirmation ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="reg-btn">
                            {loading ? 'Registering…' : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}