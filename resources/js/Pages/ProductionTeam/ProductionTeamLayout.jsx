import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ProductionTeamSidebar from '../../Components/ProductionTeamSidebar';
import NotificationBell from '../../Components/NotificationBell';

export default function ProductionTeamLayout() {
    const [expandedMenus, setExpandedMenus] = useState({});
    const navigate = useNavigate();

    // ✅ FIXED: Production team member data state
    const [teamMember, setTeamMember] = useState(null);

    // Profile dropdown state
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);

    // Logout confirmation
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // ✅ FIXED: Fetch production team member data from sessionStorage
    useEffect(() => {
        // Try sessionStorage first (unified login)
        const storedUser = sessionStorage.getItem('user');

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setTeamMember(parsed);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        } else {
            // Fallback to localStorage for backward compatibility
            const legacyData = localStorage.getItem('production_team_data');
            if (legacyData) {
                try {
                    const parsed = JSON.parse(legacyData);
                    setTeamMember(parsed);
                } catch (e) {
                    console.error('Error parsing legacy data:', e);
                }
            }
        }
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

    // ✅ FIXED: Clear sessionStorage on logout
    const confirmLogout = () => {
        // Clear session storage (unified auth)
        sessionStorage.clear();

        // Also clear any legacy localStorage keys
        localStorage.removeItem('production_team_token');
        localStorage.removeItem('production_team_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_data');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');

        navigate('/login', { replace: true });
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleProfileClick = () => {
        setShowProfileDropdown(false);
        navigate('/production-team/profile');
    };

    // Get team member initials
    const getInitials = () => {
        if (teamMember?.name) {
            const names = teamMember.name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[names.length - 1][0]).toUpperCase();
            }
            return names[0].substring(0, 2).toUpperCase();
        }
        return 'PT';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar with persistent state */}
            <ProductionTeamSidebar
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Global Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Production Team Portal</h2>
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
                                    {/* ✅ Blue gradient avatar */}
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-md transition-shadow">
                                        {getInitials()}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{teamMember?.name?.split(' ')[0] || 'Team Member'}</p>
                                        <p className="text-xs text-gray-500">Production Team</p>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileDropdown && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[110] animate-fade-in">
                                        {/* Team Member Info */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-semibold text-gray-900">{teamMember?.name || 'Team Member'}</p>
                                            <p className="text-sm text-gray-500 truncate">{teamMember?.email || 'team@fablab.jnec.rub.edu.bt'}</p>
                                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                Production Team
                                            </span>
                                        </div>

                                        {/* Menu Items */}
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

                                        {/* Logout */}
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

                {/* Page Content - Child routes render here via Outlet */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>

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