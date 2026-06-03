import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../Components/AdminSidebar';

export default function AdminLayout() {
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: false,
        operations: false,
        resources: false,
        contentMedia: false,
    });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const navigate = useNavigate();

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_dashboard_data');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');
        sessionStorage.clear();
        navigate('/login', { replace: true });
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
                onLogout={handleLogout}
            />

            {/* Main Content Area - Pages have their own headers */}
            <div className="flex-1">
                <Outlet />
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