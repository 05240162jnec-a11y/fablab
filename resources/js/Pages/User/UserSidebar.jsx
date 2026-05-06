import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function UserSidebar({ expandedMenus, toggleSubmenu }) {
    const location = useLocation();

    // Check if link is active
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
                    <p className="text-xs text-slate-400">User Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {/* Dashboard */}
                <Link
                    to="/user/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/user/dashboard')
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </Link>

                {/* Shop & Orders */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('shopOrders')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Shop & Orders
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.shopOrders ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.shopOrders && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/user/shop-products"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/shop-products')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Shop Products
                            </Link>
                            <Link
                                to="/user/custom-orders"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/custom-orders')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Custom Orders
                            </Link>
                            <Link
                                to="/user/my-orders"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/my-orders')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                My Orders
                            </Link>
                        </div>
                    )}
                </div>

                {/* Machines */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('machines')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Machines
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.machines ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.machines && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/user/book-machine"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/book-machine')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Book a Machine
                            </Link>
                            <Link
                                to="/user/my-bookings"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/my-bookings')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                My Bookings
                            </Link>
                        </div>
                    )}
                </div>

                {/* Learning */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('learning')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            Learning
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.learning ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.learning && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/user/courses"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/courses')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Available Courses
                            </Link>
                            <Link
                                to="/user/my-enrollments"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/my-enrollments')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                My Enrollments
                            </Link>
                        </div>
                    )}
                </div>

                {/* Explore */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('explore')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Explore
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.explore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.explore && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/user/projects-gallery"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/projects-gallery')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Projects Gallery
                            </Link>
                            <Link
                                to="/user/photo-gallery"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/photo-gallery')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Photo Gallery
                            </Link>
                            <Link
                                to="/user/announcements"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/announcements')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Announcements
                            </Link>
                        </div>
                    )}
                </div>

                {/* Support */}
                <div>
                    <button
                        onClick={() => toggleSubmenu('support')}
                        className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Support
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${expandedMenus.support ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedMenus.support && (
                        <div className="ml-4 mt-1 space-y-1">
                            <Link
                                to="/user/faqs"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/faqs')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                FAQs
                            </Link>
                            <Link
                                to="/user/submit-feedback"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/submit-feedback')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Submit Feedback
                            </Link>
                            <Link
                                to="/user/help-center"
                                className={`block px-4 py-2 text-sm rounded-lg transition-all ${isActive('/user/help-center')
                                        ? 'text-blue-400 bg-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Help Center
                            </Link>
                        </div>
                    )}
                </div>

                {/* My Transactions */}
                <Link
                    to="/user/transactions"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/user/transactions')
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    My Transactions
                </Link>

                {/* My Profile */}
                <Link
                    to="/user/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/user/profile')
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                </Link>

                {/* Logout */}
                <Link
                    to="/login"
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