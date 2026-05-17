import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function UserSidebar({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if link is active (matches current path)
    const isActive = (path) => {
        // For tabbed pages, check if the path starts with the base URL
        if (path.includes('/shop-orders') || path.includes('/machines') ||
            path.includes('/learning') || path.includes('/explore') || path.includes('/support')) {
            return location.pathname.startsWith(path);
        }
        return location.pathname === path;
    };

    // Handle logout
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('dashboard_data');
        localStorage.removeItem('cart_items');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('booking_data');

        if (onLogout) onLogout();
        navigate('/login', { replace: true });
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-xl">
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50 bg-slate-900/50">
                <img src="../images/logo.png" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30" alt="Logo" />
                <div>
                    <h1 className="text-lg font-bold text-white tracking-wide">JNEC Fab Lab</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">User Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">

                {/* Dashboard */}
                <Link
                    to="/user/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/dashboard')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/dashboard') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* ✅ Shop & Orders (Tabbed Page) */}
                <Link
                    to="/user/shop-orders"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/shop-orders')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/shop-orders') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">Shop & Orders</span>
                </Link>

                {/* ✅ Machines (Tabbed Page) */}
                <Link
                    to="/user/machines"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/machines')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/machines') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Machines</span>
                </Link>

                {/* ✅ Learning (Tabbed Page) */}
                <Link
                    to="/user/learning"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/learning')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/learning') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium">Learning</span>
                </Link>

                {/* ✅ Explore (Tabbed Page) */}
                <Link
                    to="/user/explore"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/explore')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/explore') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="font-medium">Explore</span>
                </Link>

                {/* ✅ Support (Tabbed Page) */}
                <Link
                    to="/user/support"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/support')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/support') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Support</span>
                </Link>

                {/* Divider */}
                <div className="my-4 border-t border-slate-700/50"></div>

                {/* My Transactions */}
                <Link
                    to="/user/transactions"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/transactions')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/transactions') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-medium">My Transactions</span>
                </Link>

                {/* My Profile */}
                <Link
                    to="/user/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/user/profile')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/user/profile') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">My Profile</span>
                </Link>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-left font-medium"
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