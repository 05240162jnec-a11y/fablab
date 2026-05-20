import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function ProductionTeamSidebar({ expandedMenus, toggleSubmenu }) {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const linkClass = (path) =>
        `block px-4 py-2 text-sm rounded-lg transition-all ${isActive(path)
            ? 'text-purple-400 bg-purple-600/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`;

    // ✅ Handle logout - clear token and redirect to unified login
    const handleLogout = () => {
        // Clear ALL tokens and data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');
        sessionStorage.clear();

        // Redirect to unified login
        navigate('/login', { replace: true });
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
            {/* Logo/Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                <img src="../images/logo.png" className="w-12 h-12 rounded-full object-cover" alt="Logo" />
                <div>
                    <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                    <p className="text-xs text-slate-400">Production Team</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {/* Dashboard */}
                <Link
                    to="/production-team/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/production-team/dashboard')
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400 font-medium'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </Link>

                {/* ✅ Custom Orders (Replaces old Assigned Orders link) */}
                <Link
                    to="/production-team/custom-orders"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/production-team/custom-orders')
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400 font-medium'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Custom Orders
                </Link>

                {/* Book Machine */}
                <Link
                    to="/user/book-machine"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/user/book-machine')
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400 font-medium'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Book Machine
                </Link>

                {/* Inventory */}
                <Link
                    to="/production-team/inventory"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/production-team/inventory')
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400 font-medium'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Inventory
                </Link>

                {/* Profile */}
                <Link
                    to="/production-team/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/production-team/profile')
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400 font-medium'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                </Link>
            </nav>

            {/* Logout Button */}
            <div className="px-3 py-4 border-t border-slate-700/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}