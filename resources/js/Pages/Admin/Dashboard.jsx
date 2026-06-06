import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // ✅ Kept Link for Quick Actions

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeBookings: 0,
        ongoingCourses: 0,
        pendingOrders: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/dashboard/stats');
            setStats(response.data.stats);
            setRecentActivity(response.data.recentActivity);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ totalUsers: 0, activeBookings: 0, ongoingCourses: 0, pendingOrders: 0 });
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => num.toLocaleString();

    return (
        <div className="flex-1">
            {/* ✅ Dashboard Header - Title & Welcome Message KEPT, Avatar REMOVED */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <p className="text-sm text-gray-600">Welcome back, Admin. Here is an overview of your Fab Lab.</p>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="p-6">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                )}

                {/* Stats Cards */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Total Users */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-600">Total Users</span>
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</div>
                        </div>

                        {/* Active Bookings */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-600">Active Bookings</span>
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeBookings)}</div>
                        </div>

                        {/* Ongoing Courses */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-600">Ongoing Courses</span>
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.ongoingCourses)}</div>
                        </div>

                        {/* Pending Orders */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-600">Pending Orders</span>
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingOrders)}</div>
                        </div>
                    </div>
                )}

                {/* Recent Activity & Quick Actions */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            </div>
                            <div className="p-5">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No recent activity</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                                                    {activity.user_initials}
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 text-sm font-medium">
                                                        <span className="font-semibold">{activity.user_name}</span> {activity.action} {activity.target}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">{activity.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                            </div>
                            <div className="p-5">
                                <div className="space-y-3">
                                    <Link to="/admin/bookings" className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Approve Bookings</p>
                                            <p className="text-xs text-gray-500 truncate">Review pending bookings</p>
                                        </div>
                                    </Link>

                                    <Link to="/admin/transactions" className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Verify Transactions</p>
                                            <p className="text-xs text-gray-500 truncate">Check payment verifications</p>
                                        </div>
                                    </Link>

                                    <Link to="/admin/machines" className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Add Machine</p>
                                            <p className="text-xs text-gray-500 truncate">Register a new machine</p>
                                        </div>
                                    </Link>

                                    <Link to="/admin/machines" className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Update Machine Status</p>
                                            <p className="text-xs text-gray-500 truncate">Change machine availability</p>
                                        </div>
                                    </Link>

                                    <Link to="/admin/inventory" className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Add Inventory</p>
                                            <p className="text-xs text-gray-500 truncate">Add materials and supplies</p>
                                        </div>
                                    </Link>

                                    <Link to="/admin/courses" className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Approve Course Enrollment</p>
                                            <p className="text-xs text-gray-500 truncate">Review course registrations</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}