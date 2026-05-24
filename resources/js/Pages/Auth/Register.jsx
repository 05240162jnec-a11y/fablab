import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CountrySelect from '../../Components/CountrySelect';

export default function Register() {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        gender: '',
        phone: '',
        role: 'student',
        department: '',
        year_of_study: '',
    });

    const [countryCode, setCountryCode] = useState('BT');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Weak password list
    const weakPasswords = [
        'password', 'password123', '12345678', '123456789', 'qwerty',
        'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
        'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
        'ashley', 'bailey', 'shadow', 'superman', 'qazwsx',
        '123123', 'admin', 'welcome', 'jennifer', 'login'
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
                    ...prev,
                    phone: countryCode === 'BT'
                        ? 'Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)'
                        : 'Phone number must be 7-15 digits'
                }));
            } else {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
        }

        if (name === 'password' && value) {
            const pwdErrs = validatePassword(value);
            setErrors(prev => ({
                ...prev,
                password: pwdErrs.length > 0 ? 'Password must contain: ' + pwdErrs.join(', ') : ''
            }));
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
            setLoading(false);
            return;
        }

        const pwdErrs = validatePassword(formData.password);
        if (pwdErrs.length > 0) {
            setErrors({ password: ['Password must contain: ' + pwdErrs.join(', ')] });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register', formData);
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

    return (
        <div style={styles.root}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .reg-bg-overlay {
                    position: fixed; inset: 0;
                    background: url('/images/fablab-bg.jpg') no-repeat center center / cover;
                    z-index: 0;
                }
                .reg-bg-overlay::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.58);
                }

                /* ── Glass card ── */
                .glass-card {
                    background: rgba(255,255,255,0.10);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-radius: 22px;
                    border: 1px solid rgba(255,255,255,0.18);
                    box-shadow: 0 8px 40px rgba(0,0,0,0.45);
                    padding: 32px 28px;
                    width: 100%;
                    max-width: 460px;
                }

                /* Logo circle */
                .logo-circle {
                    width: 88px; height: 88px; border-radius: 50%;
                    background: rgba(255,255,255,0.95);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 22px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
                    overflow: hidden;
                    padding: 8px;
                }
                .logo-circle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
                .logo-circle .logo-fallback {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem; font-weight: 900; color: #0066FF;
                }

                /* Tabs */
                .tabs { display: flex; justify-content: center; gap: 2rem; margin-bottom: 18px; }
                .tab-link {
                    color: rgba(255,255,255,0.65);
                    font-size: 1rem; font-weight: 500;
                    text-decoration: none;
                    padding-bottom: 6px;
                    border-bottom: 2px solid transparent;
                    transition: all .25s;
                }
                .tab-link:hover { color: white; }
                .tab-link.active { color: white; border-bottom-color: white; }

                /* Form title */
                .form-title {
                    color: white; text-align: center;
                    font-size: 1.15rem; font-weight: 600;
                    margin-bottom: 18px; letter-spacing: .01em;
                }

                /* Message banner */
                .msg-banner {
                    padding: 10px 14px; border-radius: 10px;
                    font-size: .85rem; font-weight: 500;
                    margin-bottom: 14px;
                    backdrop-filter: blur(8px);
                }
                .msg-success { background: rgba(22,163,74,.25); color: #bbf7d0; border: 1px solid rgba(22,163,74,.35); }
                .msg-error   { background: rgba(239,68,68,.2);  color: #fecaca; border: 1px solid rgba(239,68,68,.3); }

                /* Input field */
                .reg-label {
                    display: block; color: rgba(255,255,255,.88);
                    font-size: .82rem; font-weight: 500; margin-bottom: 6px;
                }
                .reg-input, .reg-select {
                    width: 100%; padding: 11px 36px 11px 14px;
                    background: rgba(255,255,255,.14);
                    border: 1px solid rgba(255,255,255,.2);
                    border-radius: 9px;
                    color: white; font-size: .9rem;
                    font-family: 'DM Sans', sans-serif;
                    outline: none; transition: all .25s;
                }
                .reg-input::placeholder { color: rgba(255,255,255,.5); }
                .reg-input:focus, .reg-select:focus {
                    background: rgba(255,255,255,.22);
                    border-color: rgba(255,255,255,.45);
                    box-shadow: 0 0 0 3px rgba(255,255,255,.08);
                }
                .reg-input.err, .reg-select.err {
                    border-color: rgba(252,165,165,.7);
                    box-shadow: 0 0 0 3px rgba(239,68,68,.12);
                }
                .reg-select {
                    appearance: none; -webkit-appearance: none;
                    cursor: pointer;
                    color: rgba(255,255,255,.85);
                }
                .reg-select option { background: #1a1a2e; color: white; }

                /* Select wrapper */
                .sel-wrap { position: relative; }
                .sel-wrap .chev {
                    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
                    color: rgba(255,255,255,.55); pointer-events: none; font-size: .7rem;
                }

                /* Password wrapper */
                .pwd-wrap { position: relative; }
                .pwd-wrap .reg-input { padding-right: 42px; }
                .eye-btn {
                    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: rgba(255,255,255,.55); font-size: .95rem;
                    transition: color .2s; padding: 0;
                }
                .eye-btn:hover { color: white; }

                /* Phone row */
                .phone-row { display: flex; gap: 10px; }
                .phone-row .country-col { width: 44%; flex-shrink: 0; }
                .phone-row .num-col { flex: 1; }
                .phone-row .reg-input { padding-right: 14px; }

                /* Help text */
                .help-txt { color: rgba(255,255,255,.45); font-size: .72rem; margin-top: 4px; }
                .err-txt  { color: #fca5a5; font-size: .75rem; margin-top: 5px; font-weight: 500; }
                .ok-txt   { color: #86efac; font-size: .75rem; margin-top: 5px; font-weight: 500; }

                /* Field gap */
                .field { margin-bottom: 13px; }

                /* Submit btn */
                .reg-btn {
                    width: 100%; padding: 13px;
                    background: #0066FF;
                    border: none; border-radius: 11px;
                    color: white; font-size: 1rem; font-weight: 700;
                    cursor: pointer; margin-top: 8px;
                    font-family: 'DM Sans', sans-serif;
                    box-shadow: 0 4px 18px rgba(0,102,255,.45);
                    transition: all .3s;
                }
                .reg-btn:hover:not(:disabled) {
                    background: #0051cc;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(0,102,255,.55);
                }
                .reg-btn:disabled { background: rgba(255,255,255,.2); cursor: not-allowed; color: rgba(255,255,255,.5); box-shadow: none; }
            `}</style>

            {/* Background */}
            <div className="reg-bg-overlay" />

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
                        <Link to="/login" className="tab-link">Login</Link>
                        <Link to="/register" className="tab-link active">Register</Link>
                    </div>

                    <div className="form-title">Create Account</div>

                    {/* Message */}
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
                            <i className="fas fa-chevron-down chev" />
                            {errors.gender && <p className="err-txt">{Array.isArray(errors.gender) ? errors.gender[0] : errors.gender}</p>}
                        </div>

                        {/* Phone */}
                        <div className="field">
                            <label className="reg-label">Phone Number</label>
                            <div className="phone-row">
                                <div className="country-col">
                                    <CountrySelect
                                        value={countryCode}
                                        onChange={setCountryCode}
                                        error={errors.phone}
                                    />
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
                            <i className="fas fa-chevron-down chev" />
                            {errors.role && <p className="err-txt">{Array.isArray(errors.role) ? errors.role[0] : errors.role}</p>}
                        </div>

                        {/* Department — only for student / faculty */}
                        {(formData.role === 'student' || formData.role === 'faculty') && (
                            <div className="field sel-wrap">
                                <select name="department" value={formData.department} onChange={handleChange}
                                    className={`reg-select ${errors.department ? 'err' : ''}`}>
                                    <option value="" disabled>Select Department</option>
                                    <option value="civil">Department of Civil Engineering &amp; Surveying</option>
                                    <option value="eee">Department Electrical and Electronics Engineering</option>
                                    <option value="mech">Department Mechanical Engineering</option>
                                    <option value="it">Department Information Technology</option>
                                    <option value="hum">Department Humanities and Management</option>
                                </select>
                                <i className="fas fa-chevron-down chev" />
                                {errors.department && <p className="err-txt">{Array.isArray(errors.department) ? errors.department[0] : errors.department}</p>}
                            </div>
                        )}

                        {/* Year — only for student / faculty */}
                        {(formData.role === 'student' || formData.role === 'faculty') && (
                            <div className="field sel-wrap">
                                <select name="year_of_study" value={formData.year_of_study} onChange={handleChange}
                                    className={`reg-select ${errors.year_of_study ? 'err' : ''}`}>
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                                <i className="fas fa-chevron-down chev" />
                                {errors.year_of_study && <p className="err-txt">{Array.isArray(errors.year_of_study) ? errors.year_of_study[0] : errors.year_of_study}</p>}
                            </div>
                        )}

                        {/* Password */}
                        <div className="field">
                            <div className="pwd-wrap">
                                <input type={showPassword ? 'text' : 'password'}
                                    name="password" value={formData.password} onChange={handleChange}
                                    placeholder="Password" required
                                    className={`reg-input ${errors.password ? 'err' : ''}`} />
                                <button type="button" className="eye-btn"
                                    onClick={() => setShowPwd(p => !p)}>
                                    <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
                                </button>
                            </div>
                            {errors.password && <p className="err-txt">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="field">
                            <div className="pwd-wrap">
                                <input type={showConfirm ? 'text' : 'password'}
                                    name="password_confirmation" value={formData.password_confirmation} onChange={handleChange}
                                    placeholder="Confirm Password" required
                                    className={`reg-input ${formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation ? 'err' : ''}`} />
                                <button type="button" className="eye-btn"
                                    onClick={() => setShowConfirm(p => !p)}>
                                    <i className={`fas ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`} />
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
        maxWidth: '460px',
    },
};