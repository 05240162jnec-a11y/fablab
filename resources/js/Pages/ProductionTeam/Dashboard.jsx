import React, { useState, useEffect } from 'react';

export default function ProductionTeamDashboard() {
    const [userName, setUserName] = useState('Production Team');

    useEffect(() => {
        // ✅ Fetch user name from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.name) {
            setUserName(user.name);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ✅ Sticky Page Header */}
            <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 border-b border-gray-200">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800">Production Team Dashboard</h2>
                    <p className="text-sm text-gray-600">
                        Welcome back, <span className="font-medium text-blue-600">{userName}</span>! Here's your production overview.
                    </p>
                </div>
            </div>

            <div className="px-6 pb-6">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Assigned Orders */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">Assigned Orders</span>
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <p className="text-xs text-gray-500 mt-1">Active fabrication requests</p>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">In Progress</span>
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <p className="text-xs text-gray-500 mt-1">Currently being fabricated</p>
                    </div>

                    {/* Completed This Month */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">Completed (Month)</span>
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <p className="text-xs text-gray-500 mt-1">Successfully delivered orders</p>
                    </div>
                </div>

                {/* Feature Placeholders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Production Workspace</h2>
                    <p className="text-gray-600 mb-6">Your assigned orders, machine bookings, and inventory tools will appear here.</p>

                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        {/* Assigned Orders Card */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition">
                            <svg className="w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="font-semibold text-blue-800 mb-2">Assigned Orders</h3>
                            <p className="text-sm text-blue-600">View custom fabrication requests assigned to you by admin.</p>
                        </div>

                        {/* Machine Booking Card */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition">
                            <svg className="w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="font-semibold text-blue-800 mb-2">Machine Booking</h3>
                            <p className="text-sm text-blue-600">Reserve lab equipment for your production tasks.</p>
                        </div>

                        {/* Inventory Card */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition">
                            <svg className="w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="font-semibold text-blue-800 mb-2">Inventory Management</h3>
                            <p className="text-sm text-blue-600">Track materials, issue supplies, and monitor stock levels.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}