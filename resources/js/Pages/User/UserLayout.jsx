import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserSidebar from './UserSidebar';
import NotificationBell from '../../Components/NotificationBell';

export default function UserLayout() {
    const navigate = useNavigate();

    // ✅ ROLE GUARD: Block admins and production team from /user/* routes
    useEffect(() => {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        try {
            const role = JSON.parse(sessionStorage.getItem('user') || '{}')?.role;
            if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'production_team') {
                navigate('/production-team/dashboard', { replace: true });
            }
        } catch { }
    }, []);

    // User data state
    const [user, setUser] = useState(null);

    // Profile dropdown state
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);

    // ✅ NEW: Image preview modal state
    const [showImageModal, setShowImageModal] = useState(false);

    // Logout confirmation
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Fetch user data from sessionStorage AND API
    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = sessionStorage.getItem('user');
            const token = sessionStorage.getItem('auth_token');

            if (storedUser && token) {
                try {
                    const parsed = JSON.parse(storedUser);

                    // Fetch fresh data from API to get profile_photo
                    const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        }
                    });

                    if (response.data.success) {
                        const freshUser = response.data.user;
                        setUser(freshUser);
                        // Update sessionStorage with fresh data including profile_photo
                        sessionStorage.setItem('user', JSON.stringify(freshUser));
                    } else {
                        setUser(parsed);
                    }
                } catch (e) {
                    console.error('Error fetching user data:', e);
                    setUser(parsed);
                }
            }
        };

        fetchUserData();
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
        setShowProfileDropdown(false);
    };

    const confirmLogout = () => {
        sessionStorage.clear();
        localStorage.clear(); // ✅ Wipe ALL localStorage on logout
        navigate('/login', { replace: true });
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleProfileClick = () => {
        setShowProfileDropdown(false);
        navigate('/user/profile');
    };

    const openImagePreview = () => {
        if (user?.profile_photo) {
            setShowImageModal(true);
        }
    };

    const getUserInitials = () => {
        if (user?.name) {
            const names = user.name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[names.length - 1][0]).toUpperCase();
            }
            return names[0].substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <UserSidebar onLogout={handleLogout} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Global Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">User Portal</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                    className="flex items-center gap-3 focus:outline-none"
                                >
                                    {user?.profile_photo ? (
                                        <img
                                            src={user.profile_photo}
                                            alt={user.name}
                                            onClick={openImagePreview}
                                            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:shadow-lg transition-shadow"
                                        />
                                    ) : (
                                        <div
                                            onClick={openImagePreview}
                                            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-base cursor-pointer hover:shadow-lg transition-shadow"
                                        >
                                            {getUserInitials()}
                                        </div>
                                    )}
                                    <div className="hidden md:block text-left max-w-[100px]">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name?.split(' ')[0] || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.department || 'Student'}</p>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileDropdown && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[110] animate-fade-in">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                {user?.profile_photo ? (
                                                    <img
                                                        src={user.profile_photo}
                                                        alt={user.name}
                                                        className="w-16 h-16 rounded-full object-cover cursor-pointer"
                                                        onClick={openImagePreview}
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={openImagePreview}
                                                        className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                                                    >
                                                        {getUserInitials()}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                                    <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {user?.department || 'Student'}
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <button
                                                onClick={handleProfileClick}
                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                My Profile
                                            </button>
                                        </div>

                                        <div className="py-1 border-t border-gray-100">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>

            {/* Image Preview Modal */}
            {showImageModal && user?.profile_photo && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-2xl max-h-[90vh]">
                        <img
                            src={user.profile_photo}
                            alt={user.name}
                            className="max-w-full max-h-[90vh] rounded-lg object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                            {user.name}
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelLogout} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border border-slate-200 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6">
                                <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Confirm Logout</h3>
                            <p className="text-slate-600 mb-8">Are you sure you want to log out?</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={cancelLogout}
                                    className="flex-1 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}