import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Editable fields state
    const [editForm, setEditForm] = useState({
        phone: '',
        gender: '',
    });

    // Password change state
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
                    phone: userData.phone || '',
                    gender: userData.gender || '',
                });
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

    // Auto-hide success messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle editable field changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // Save profile updates
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://127.0.0.1:8000/api/admin/profile/update', {
                phone: editForm.phone,
                gender: editForm.gender,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setSuccessMessage('✅ Profile updated successfully!');
            fetchProfile(); // Refresh to show updated data
        } catch (err) {
            console.error('Update profile error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setSuccessMessage(null);

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
            {/* ✅ Sticky Page Header */}
            <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 border-b border-gray-200">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
                    <p className="text-sm text-gray-600">Manage your personal information and account security</p>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && user && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        ⚠️ {error}
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                            <span className="inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                Administrator
                            </span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ✅ Editable Profile Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h4>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    placeholder="e.g., 17828243"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={editForm.gender}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all bg-white"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>

                            {/* Read-only Info */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Read-only information</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Role</p>
                                        <p className="font-medium text-gray-900">Administrator</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Member Since</p>
                                        <p className="font-medium text-gray-900">
                                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
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
                                    '💾 Save Changes'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ✅ Change Password Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Change Password</h4>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Current Password
                                </label>
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

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>
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

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
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

                            {/* Change Password Button */}
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
    );
}