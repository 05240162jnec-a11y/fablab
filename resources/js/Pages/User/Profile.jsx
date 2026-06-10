import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CountrySelect from '../../Components/CountrySelect';
import countries from '../../data/countries';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [phoneCountry, setPhoneCountry] = useState('BT');
    const [editForm, setEditForm] = useState({
        name: '', email: '', phone: '',
        department: '', role: '', gender: '',
    });

    const [editingFields, setEditingFields] = useState({
        name: false, email: false, phone: false,
        department: false, role: false, gender: false,
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [passwordForm, setPasswordForm] = useState({
        current_password: '', new_password: '', new_password_confirmation: '',
    });

    // ── Validation errors state ──
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [showCurrPwd, setShowCurrPwd] = useState(false);

    const [editLoading, setEditLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // ── Same validation logic as Register.jsx ──
    const weakPasswords = [
        'password', 'password123', '12345678', '123456789', 'qwerty',
        'abc123', 'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
        'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey',
        'shadow', 'superman', 'qazwsx', '123123', 'admin', 'welcome', 'jennifer', 'login'
    ];

    // Get max digits allowed for selected country
    const getCountryPhoneRules = (code) => {
        const country = countries.find(c => c.code === code);
        if (!country) return { max: 15, hint: '7–15 digits' };
        const d = country.phone_digits;
        const max = Array.isArray(d) ? d[1] : d;
        return { max, hint: country.phone_hint };
    };

    const validatePhone = (phone, code = phoneCountry) => {
        if (!phone) return '';
        if (code === 'BT') {
            if (!/^(17|77)\d{6}$/.test(phone)) return 'Bhutan: must be 8 digits starting with 17 or 77';
            return '';
        }
        const { max, hint } = getCountryPhoneRules(code);
        const country = countries.find(c => c.code === code);
        const d = country?.phone_digits;
        const min = Array.isArray(d) ? d[0] : d;
        if (phone.length < min || phone.length > max) return `Must be ${hint}`;
        if (!/^\d+$/.test(phone)) return 'Digits only';
        return '';
    };

    const validatePassword = (password) => {
        const errs = [];
        if (password.length < 8) errs.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errs.push('one uppercase letter');
        if (!/[a-z]/.test(password)) errs.push('one lowercase letter');
        if (!/[0-9]/.test(password)) errs.push('one number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
            errs.push('one special character (!@#$%^&*)');
        if (weakPasswords.includes(password.toLowerCase())) errs.push('password is too common');
        return errs;
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                const userData = response.data.user;
                setUser(userData);
                setEditForm({
                    name: userData.name || '', email: userData.email || '',
                    phone: userData.phone || '', department: userData.department || '',
                    role: userData.role || '', gender: userData.gender || '',
                });
                setPhotoPreview(userData.profile_photo);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
            setError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
        // Live phone validation
        if (name === 'phone' && value) {
            setPhoneError(validatePhone(value));
        } else if (name === 'phone') {
            setPhoneError('');
        }
    };

    const toggleEdit = (field) => {
        setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
        if (field === 'phone') setPhoneError('');
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'image/png') { setError('Only PNG images are allowed'); return; }
            if (file.size > 2 * 1024 * 1024) { setError('Image size must be less than 2MB'); return; }
            setProfilePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        // Validate phone before saving
        if (editForm.phone && editingFields.phone) {
            const pErr = validatePhone(editForm.phone);
            if (pErr) { setPhoneError(pErr); return; }
        }
        setEditLoading(true);
        setSuccessMessage(null);
        setError(null);
        try {
            const token = sessionStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            formData.append('phone', editForm.phone);
            formData.append('department', editForm.department);
            formData.append('role', editForm.role);
            formData.append('gender', editForm.gender);
            if (profilePhoto) formData.append('profile_photo', profilePhoto);

            const response = await axios.post('http://127.0.0.1:8000/api/user/profile/update', formData, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                const updatedUser = response.data.user;
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                setSuccessMessage('✅ Profile updated successfully!');
                setEditingFields({ name: false, email: false, phone: false, department: false, role: false, gender: false });
                setProfilePhoto(null);
                setPhoneError('');
                fetchProfile();
            }
        } catch (err) {
            console.error('Update profile error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        // Validate new password
        const pwdErrs = validatePassword(passwordForm.new_password);
        if (pwdErrs.length > 0) {
            setPasswordError('Password must contain: ' + pwdErrs.join(', '));
            return;
        }
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setConfirmError('New passwords do not match');
            return;
        }
        setPasswordLoading(true);
        setSuccessMessage(null);
        setError(null);
        try {
            const token = sessionStorage.getItem('auth_token');
            await axios.post('http://127.0.0.1:8000/api/user/profile/change-password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setSuccessMessage('✅ Password changed successfully!');
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
            setPasswordError('');
            setConfirmError('');
        } catch (err) {
            console.error('Change password error:', err);
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const getRoleDisplay = (role) => {
        const roles = { student: 'Student', faculty: 'Faculty', outsider: 'Outsider', production_team: 'Production Team', admin: 'Administrator' };
        return roles[role] || role;
    };

    const getRoleBadgeColor = (role) => {
        const colors = { student: 'bg-blue-100 text-blue-700 border-blue-200', faculty: 'bg-purple-100 text-purple-700 border-purple-200', outsider: 'bg-amber-100 text-amber-700 border-amber-200', production_team: 'bg-green-100 text-green-700 border-green-200', admin: 'bg-red-100 text-red-700 border-red-200' };
        return colors[role] || 'bg-blue-100 text-blue-700 border-blue-200';
    };

    // Eye icon SVGs
    const EyeOpen = () => (
        <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
    const EyeOff = () => (
        <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );

    if (loading) return (
        <div className="p-6 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error && !user) return (
        <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">⚠️ {error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Page Header */}
            <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 border-b border-gray-200">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
                    <p className="text-sm text-gray-600">Manage your personal information and account security</p>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{successMessage}</div>
                )}
                {error && user && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">⚠️ {error}</div>
                )}

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden cursor-pointer"
                                style={{ background: photoPreview ? 'transparent' : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
                                onClick={() => fileInputRef.current?.click()}>
                                {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || 'U'}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/png" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors" title="Upload photo (PNG only)">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                                {getRoleDisplay(user?.role)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h4>
                        <form onSubmit={handleSaveProfile} className="space-y-4">

                            {/* Name */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                    {!editingFields.name && <button type="button" onClick={() => toggleEdit('name')} className="text-xs text-blue-600 hover:text-blue-700">✏️ Edit</button>}
                                </div>
                                {editingFields.name
                                    ? <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                                    : <p className="text-sm font-medium text-gray-900">{user?.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                    {!editingFields.email && <button type="button" onClick={() => toggleEdit('email')} className="text-xs text-blue-600 hover:text-blue-700">✏️ Edit</button>}
                                </div>
                                {editingFields.email
                                    ? <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                                    : <p className="text-sm font-medium text-gray-900">{user?.email}</p>}
                            </div>

                            {/* ── PHONE — with validation ── */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                    {!editingFields.phone && <button type="button" onClick={() => toggleEdit('phone')} className="text-xs text-blue-600 hover:text-blue-700">✏️ Edit</button>}
                                </div>
                                {editingFields.phone ? (
                                    <>
                                        {/* Country selector + number input */}
                                        <div style={{ display: 'flex', gap: '.625rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                            <div style={{ flexShrink: 0, minWidth: 0 }}>
                                                <CountrySelect
                                                    value={phoneCountry}
                                                    onChange={(code) => {
                                                        setPhoneCountry(code);
                                                        if (editForm.phone) setPhoneError(validatePhone(editForm.phone, code));
                                                    }}
                                                    error={!!phoneError}
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 140 }}>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={editForm.phone}
                                                    onChange={(e) => {
                                                        const { max } = getCountryPhoneRules(phoneCountry);
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, max);
                                                        setEditForm(prev => ({ ...prev, phone: val }));
                                                        setPhoneError(val ? validatePhone(val, phoneCountry) : '');
                                                    }}
                                                    placeholder={getCountryPhoneRules(phoneCountry).hint}
                                                    maxLength={getCountryPhoneRules(phoneCountry).max}
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${phoneError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                                />
                                            </div>
                                        </div>
                                        {phoneError
                                            ? <p className="text-xs text-red-600 mt-1">⚠️ {phoneError}</p>
                                            : <p className="text-xs text-gray-500 mt-1">
                                                {countries.find(c => c.code === phoneCountry)?.flag} {getCountryPhoneRules(phoneCountry).hint}
                                            </p>}
                                    </>
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{user?.phone || 'Not set'}</p>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Department</label>
                                    {!editingFields.department && <button type="button" onClick={() => toggleEdit('department')} className="text-xs text-blue-600 hover:text-blue-700">✏️ Edit</button>}
                                </div>
                                {editingFields.department
                                    ? <input type="text" name="department" value={editForm.department} onChange={handleEditChange} placeholder="e.g., Computer Science" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                    : <p className="text-sm font-medium text-gray-900">{user?.department || 'Not set'}</p>}
                            </div>

                            {/* Role */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Role</label>
                                    {!editingFields.role && <button type="button" onClick={() => toggleEdit('role')} className="text-xs text-blue-600 hover:text-blue-700">✏️ Edit</button>}
                                </div>
                                {editingFields.role
                                    ? <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="outsider">Outsider</option>
                                        <option value="production_team">Production Team</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    : <p className="text-sm font-medium text-gray-900">{getRoleDisplay(user?.role)}</p>}
                            </div>

                            {/* Gender */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Gender</label>
                                    {!editingFields.gender && <button type="button" onClick={() => toggleEdit('gender')} className="text-xs text-blue-600 hover:text-blue-700">✏️ Edit</button>}
                                </div>
                                {editingFields.gender
                                    ? <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                    : <p className="text-sm font-medium text-gray-900">{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).replace('-', ' ') : 'Not set'}</p>}
                            </div>

                            <button type="submit" disabled={editLoading}
                                className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold ${editLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                {editLoading ? (<><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>) : '💾 Save All Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Account Information</h4>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Member Since</p>
                                <p className="text-sm font-medium text-gray-900">{user?.created_at}</p>
                            </div>
                        </div>

                        {/* ── Change Password — with full constraints ── */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Change Password</h4>
                            <form onSubmit={handlePasswordChange} className="space-y-4">

                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showCurrPwd ? 'text' : 'password'} name="current_password"
                                            value={passwordForm.current_password}
                                            onChange={e => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                            placeholder="Enter current password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                            style={{ paddingRight: '2.75rem' }} required />
                                        <button type="button" onClick={() => setShowCurrPwd(p => !p)}
                                            style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                            {showCurrPwd ? <EyeOpen /> : <EyeOff />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password — with live validation */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showNewPwd ? 'text' : 'password'} name="new_password"
                                            value={passwordForm.new_password}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setPasswordForm(prev => ({ ...prev, new_password: val }));
                                                if (val) {
                                                    const errs = validatePassword(val);
                                                    setPasswordError(errs.length > 0 ? 'Must contain: ' + errs.join(', ') : '');
                                                } else { setPasswordError(''); }
                                                if (passwordForm.new_password_confirmation)
                                                    setConfirmError(val !== passwordForm.new_password_confirmation ? 'Passwords do not match' : '');
                                            }}
                                            placeholder="Enter new password"
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all ${passwordError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                            style={{ paddingRight: '2.75rem' }} required />
                                        <button type="button" onClick={() => setShowNewPwd(p => !p)}
                                            style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                            {showNewPwd ? <EyeOpen /> : <EyeOff />}
                                        </button>
                                    </div>
                                    {passwordError
                                        ? <p className="text-xs text-red-600 mt-1">⚠️ {passwordError}</p>
                                        : <p className="text-xs text-gray-500 mt-1">Min 8 chars · uppercase · lowercase · number · special character</p>}
                                </div>

                                {/* Confirm New Password — with live match check */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showConfirmPwd ? 'text' : 'password'} name="new_password_confirmation"
                                            value={passwordForm.new_password_confirmation}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setPasswordForm(prev => ({ ...prev, new_password_confirmation: val }));
                                                setConfirmError(val && val !== passwordForm.new_password ? 'Passwords do not match' : '');
                                            }}
                                            placeholder="Confirm new password"
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all ${confirmError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                            style={{ paddingRight: '2.75rem' }} required />
                                        <button type="button" onClick={() => setShowConfirmPwd(p => !p)}
                                            style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                            {showConfirmPwd ? <EyeOpen /> : <EyeOff />}
                                        </button>
                                    </div>
                                    {passwordForm.new_password && passwordForm.new_password_confirmation && (
                                        <p className={`text-xs mt-1 ${confirmError ? 'text-red-600' : 'text-green-600'}`}>
                                            {confirmError ? `⚠️ ${confirmError}` : '✓ Passwords match'}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" disabled={passwordLoading || !!passwordError || !!confirmError}
                                    className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold ${passwordLoading || passwordError || confirmError ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    {passwordLoading ? (<><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating...</>) : '🔐 Change Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}