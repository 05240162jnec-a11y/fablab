import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function ProductionTeamSidebar({ expandedMenus, toggleSubmenu, onLogout }) {
    const location = useLocation();

    // Check if link is active (matches current path)
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-xl">
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50 bg-slate-900/50">
                <img src="../images/logo.png" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30" alt="Logo" />
                <div>
                    <h1 className="text-lg font-bold text-white tracking-wide">JNEC Fab Lab</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Production Team</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">

                {/* Dashboard */}
                <Link
                    to="/production-team/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/dashboard')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/dashboard') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* ✅ NEW: Machines */}
                <Link
                    to="/production-team/machines"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/machines')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/machines') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="font-medium">Machines</span>
                </Link>

                {/* ✅ NEW: Products List */}
                <Link
                    to="/production-team/products"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/products')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/products') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium">Products List</span>
                </Link>

                {/* Custom Orders */}
                <Link
                    to="/production-team/custom-orders"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/custom-orders')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/custom-orders') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">Custom Orders</span>
                </Link>

                {/* Book Machine */}
                <Link
                    to="/production-team/book-machine"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/book-machine')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/book-machine') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Book Machine</span>
                </Link>

                {/* Inventory */}
                <Link
                    to="/production-team/inventory"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/inventory')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/inventory') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-medium">Inventory</span>
                </Link>

                {/* Profile */}
                <Link
                    to="/production-team/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/production-team/profile')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isActive('/production-team/profile') ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Profile</span>
                </Link>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white-400 hover:text-white-300 hover:bg-white-500/10 rounded-xl transition-all text-left font-medium"
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