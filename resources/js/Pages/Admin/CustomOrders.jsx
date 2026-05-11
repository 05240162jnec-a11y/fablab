import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function CustomOrders() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: true,
        operations: true,
        resources: false,
        contentMedia: false,
    });

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Backend State
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0,
        unassigned: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Production Team for Assignment
    const [productionTeam, setProductionTeam] = useState([]);

    // Assign Form State
    const [assignForm, setAssignForm] = useState({
        assigned_to: '',
    });

    // Status Form State
    const [statusForm, setStatusForm] = useState({
        status: '',
        estimated_price: '',
        rejection_reason: '',
    });

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/custom-orders', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    status: statusFilter !== 'all' ? statusFilter : null,
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);
                setStats(response.data.stats);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch production team
    const fetchProductionTeam = async () => {
        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/custom-orders/production-team', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setProductionTeam(response.data.data);
            }
        } catch (err) {
            console.error('Fetch team error:', err);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchOrders();
        fetchProductionTeam();
    }, [statusFilter]);

    // Filter orders (client-side search)
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `#${order.id}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'Not quoted';
        return `Nu. ${parseFloat(amount).toFixed(2)}`;
    };

    // Open View Modal
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    // Open Assign Modal
    const handleOpenAssign = (order) => {
        setSelectedOrder(order);
        setAssignForm({ assigned_to: order.assigned_to || '' });
        setShowViewModal(false);
        setShowAssignModal(true);
    };

    // Open Status Modal
    const handleOpenStatus = (order) => {
        setSelectedOrder(order);
        setStatusForm({
            status: order.status,
            estimated_price: order.estimated_price || '',
            rejection_reason: order.rejection_reason || '',
        });
        setShowViewModal(false);
        setShowStatusModal(true);
    };

    // Submit Assignment
    const handleSubmitAssign = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/assign`,
                assignForm,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                alert('✅ Order assigned successfully!');
                closeAllModals();
                fetchOrders();
            }
        } catch (err) {
            console.error('Assign error:', err);
            alert('❌ Failed to assign order.');
        }
    };

    // Submit Status Update
    const handleSubmitStatus = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/update-status`,
                statusForm,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                alert('✅ Status updated successfully!');
                closeAllModals();
                fetchOrders();
            }
        } catch (err) {
            console.error('Status error:', err);
            alert('❌ Failed to update status.');
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowViewModal(false);
        setShowAssignModal(false);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setAssignForm({ assigned_to: '' });
        setStatusForm({ status: '', estimated_price: '', rejection_reason: '' });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
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
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {/* Dashboard */}
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
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
                                <Link to="/admin/users" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Users</Link>
                                <Link to="/admin/production-team" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Production Team</Link>
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
                                <Link to="/admin/machines" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Machines</Link>
                                <Link to="/admin/bookings" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Bookings</Link>
                                <Link to="/admin/courses" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Courses</Link>
                                <Link to="/admin/custom-orders" className="block px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium">Custom Orders</Link>
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
                                <Link to="/admin/inventory" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Inventory</Link>
                                <Link to="/admin/projects" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Projects</Link>
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
                                <Link to="/admin/gallery" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Gallery</Link>
                                <Link to="/admin/faq" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">FAQ</Link>
                                <Link to="/admin/feedback" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Feedback</Link>
                            </div>
                        )}
                    </div>

                    {/* Transactions */}
                    <Link
                        to="/admin/transactions"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
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

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Custom Orders</h2>
                            <p className="text-sm text-gray-600">Review, assign, and manage custom fabrication requests</p>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Admin Profile */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Custom Orders Content */}
                <main className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                    <p className="text-sm text-gray-600">Pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                                    <p className="text-sm text-gray-600">Completed</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.unassigned}</p>
                                    <p className="text-sm text-gray-600">Unassigned</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Orders Grid */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Order Image */}
                                    {order.design_image ? (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${order.design_image}`}
                                            alt={order.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Order Content */}
                                    <div className="p-5">
                                        {/* Order Number & Status */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-600">#{order.id}</span>
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                {capitalize(order.status)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{order.title}</h3>

                                        {/* Customer */}
                                        <p className="text-sm text-gray-600 mb-3">
                                            <span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}
                                        </p>

                                        {/* Assigned To */}
                                        <p className="text-sm text-gray-600 mb-4">
                                            <span className="font-medium">Assigned:</span>{' '}
                                            {order.assignedUser?.name || <span className="text-orange-500">Unassigned</span>}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleViewOrder(order)}
                                                className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Details
                                            </button>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleOpenAssign(order)}
                                                    className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Assign
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStatus(order)}
                                                    className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>

                                        {/* Rejection Reason (if rejected) */}
                                        {order.status === 'rejected' && order.rejection_reason && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800">
                                                    <span className="font-semibold">Reason:</span> {order.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredOrders.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No orders found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </main>
            </div>

            {/* ===== VIEW ORDER MODAL ===== */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Order #{selectedOrder.id}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Order Image */}
                            {selectedOrder.design_image && (
                                <img
                                    src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`}
                                    alt={selectedOrder.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            )}

                            {/* Title & Status */}
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedOrder.title}</h4>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                                    {capitalize(selectedOrder.status)}
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                                <p className="text-gray-600 leading-relaxed">{selectedOrder.description}</p>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Customer</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.user?.name || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.user?.email || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.quantity}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.assignedUser?.name || 'Not assigned'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Estimated Price</p>
                                    <p className="font-bold text-blue-600">{formatCurrency(selectedOrder.estimated_price)}</p>
                                </div>
                            </div>

                            {/* Rejection Reason (if rejected) */}
                            {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">
                                        <span className="font-semibold">Rejection Reason:</span> {selectedOrder.rejection_reason}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                onClick={closeAllModals}
                                className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ASSIGN MODAL ===== */}
            {showAssignModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold">Assign Order</h3>
                            <p className="text-sm text-gray-500">Order #{selectedOrder.id} - {selectedOrder.title}</p>
                        </div>
                        <form onSubmit={handleSubmitAssign} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                                <select
                                    value={assignForm.assigned_to}
                                    onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select production team member</option>
                                    {productionTeam.map(member => (
                                        <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={closeAllModals} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== STATUS UPDATE MODAL ===== */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold">Update Status</h3>
                            <p className="text-sm text-gray-500">Order #{selectedOrder.id} - {selectedOrder.title}</p>
                        </div>
                        <form onSubmit={handleSubmitStatus} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Price (Nu.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={statusForm.estimated_price}
                                    onChange={(e) => setStatusForm({ ...statusForm, estimated_price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            {statusForm.status === 'rejected' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                                    <textarea
                                        value={statusForm.rejection_reason}
                                        onChange={(e) => setStatusForm({ ...statusForm, rejection_reason: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows="3"
                                        required
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button type="button" onClick={closeAllModals} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}