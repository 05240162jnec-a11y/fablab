import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar({ expandedMenus, toggleSubmenu }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                <img src="../images/logo.png" className="w-15 h-15 rounded-full object-cover" alt="Logo" />
                <div>
                    <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                    <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {/* Dashboard */}
                <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/dashboard')
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </Link>

                {/* User Management */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('userManagement')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            User Management
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.userManagement ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.userManagement && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/admin/users"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/users')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Users
                            </Link>
                            <Link
                                to="/admin/production-team"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/production-team')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Production Team
                            </Link>
                        </div>
                    )}
                </div>

                {/* Operations */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('operations')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Operations
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.operations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.operations && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/admin/machines"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/machines')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Machines
                            </Link>
                            <Link
                                to="/admin/bookings"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/bookings')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Bookings
                            </Link>
                            <Link
                                to="/admin/products"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/products')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Products
                            </Link>
                            <Link
                                to="/admin/courses"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/courses')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Courses
                            </Link>
                            <Link
                                to="/admin/custom-orders"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/custom-orders')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Custom Orders
                            </Link>
                        </div>
                    )}
                </div>

                {/* Resources */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('resources')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Resources
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.resources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.resources && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/admin/inventory"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/inventory')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Inventory
                            </Link>
                            <Link
                                to="/admin/projects"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/projects')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Projects
                            </Link>
                        </div>
                    )}
                </div>

                {/* Content & Media */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('contentMedia')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Content & Media
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.contentMedia ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.contentMedia && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/admin/gallery"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/gallery')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Gallery
                            </Link>
                            <Link
                                to="/admin/faq"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/faq')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                FAQ
                            </Link>
                            <Link
                                to="/admin/feedback"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/admin/feedback')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Feedback
                            </Link>
                        </div>
                    )}
                </div>

                {/* Transactions */}
                <Link
                    to="/admin/transactions"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/transactions')
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Transactions
                </Link>

                {/* Logout */}
                <Link
                    to="/admin/login"
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-4 border-t border-slate-700/50 pt-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </Link>
            </nav>
        </aside>
    );
}