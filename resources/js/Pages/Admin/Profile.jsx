import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AdminProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
    });

    // Track which fields are being edited
    const [editingFields, setEditingFields] = useState({
        name: false,
        email: false,
        phone: false,
        gender: false,
    });

    // Profile photo upload
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [editLoading, setEditLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Fetch current admin profile
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/profile', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                const userData = response.data.user;
                setUser(userData);
                setEditForm({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    gender: userData.gender || '',
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

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // Toggle edit mode for a field
    const toggleEdit = (field) => {
        setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'image/png') {
                setError('Only PNG images are allowed');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2MB');
                return;
            }
            setProfilePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Save profile updates
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            formData.append('phone', editForm.phone);
            formData.append('gender', editForm.gender);

            if (profilePhoto) {
                formData.append('profile_photo', profilePhoto);
            }

            await axios.post('http://127.0.0.1:8000/api/admin/profile/update', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            setSuccessMessage('✅ Profile updated successfully!');
            setEditingFields({
                name: false,
                email: false,
                phone: false,
                gender: false,
            });
            setProfilePhoto(null);
            fetchProfile();
        } catch (err) {
            console.error('Update profile error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setError('New passwords do not match');
            setPasswordLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://127.0.0.1:8000/api/admin/profile/change-password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setSuccessMessage('✅ Password changed successfully!');
            setPasswordForm({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (err) {
            console.error('Change password error:', err);
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 border-b border-gray-200">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
                    <p className="text-sm text-gray-600">Manage your personal information and account security</p>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {error && user && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        ⚠️ {error}
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        {/* Profile Photo Upload */}
                        <div className="relative">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden cursor-pointer"
                                style={{
                                    background: photoPreview
                                        ? 'transparent'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || 'A'
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                accept="image/png"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                                title="Upload photo (PNG only)"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                            <span className="inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                Administrator
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Editable Profile Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h4>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            {/* Name */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                    {!editingFields.name && (
                                        <button
                                            type="button"
                                            onClick={() => toggleEdit('name')}
                                            className="text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                                {editingFields.name ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                    {!editingFields.email && (
                                        <button
                                            type="button"
                                            onClick={() => toggleEdit('email')}
                                            className="text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                                {editingFields.email ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                    {!editingFields.phone && (
                                        <button
                                            type="button"
                                            onClick={() => toggleEdit('phone')}
                                            className="text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                                {editingFields.phone ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={handleEditChange}
                                        placeholder="e.g., 17828243"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{user?.phone || 'Not set'}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Gender</label>
                                    {!editingFields.gender && (
                                        <button
                                            type="button"
                                            onClick={() => toggleEdit('gender')}
                                            className="text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                                {editingFields.gender ? (
                                    <select
                                        name="gender"
                                        value={editForm.gender}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).replace('-', ' ') : 'Not set'}
                                    </p>
                                )}
                            </div>

                            {/* Save Button */}
                            <button
                                type="submit"
                                disabled={editLoading}
                                className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold ${editLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {editLoading ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    '💾 Save All Changes'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Account Info & Password Section */}
                    <div className="space-y-6">
                        {/* Member Since - Separate Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Account Information</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Member Since</p>
                                    <p className="text-sm font-medium text-gray-900">{user?.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Role</p>
                                    <p className="text-sm font-medium text-gray-900">Administrator</p>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Change Password</h4>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                        placeholder="Enter current password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                        required
                                        minLength="8"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="new_password_confirmation"
                                        value={passwordForm.new_password_confirmation}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                        placeholder="Confirm new password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold ${passwordLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        '🔐 Change Password'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}