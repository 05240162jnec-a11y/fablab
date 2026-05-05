import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function CustomOrders() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Filter State
    const [activeFilter, setActiveFilter] = useState('all');

    // Form State
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        quantity: '1',
        material: '',
        designImage: null,
    });

    // Selected Order for Details
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stats State
    const [stats, setStats] = useState({
        pending: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
    });

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('user_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/custom-orders', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);
                calculateStats(response.data.data);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Failed to load custom orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from orders
    const calculateStats = (ordersList) => {
        const stats = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
        };

        ordersList.forEach(order => {
            if (order.status === 'pending') stats.pending++;
            else if (order.status === 'in_progress') stats.inProgress++;
            else if (order.status === 'completed') stats.completed++;
            else if (order.status === 'rejected') stats.rejected++;
        });

        setStats(stats);
    };

    // Fetch on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setFormState(prev => ({
            ...prev,
            designImage: e.target.files[0]
        }));
    };

    // Submit new order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('user_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('description', formState.description);
            formData.append('quantity', formState.quantity);
            formData.append('material', formState.material);
            if (formState.designImage) {
                formData.append('design_image', formState.designImage);
            }

            const response = await axios.post(
                'http://127.0.0.1:8000/api/user/custom-orders',
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                setShowCreateModal(false);
                setShowSuccessModal(true);
                resetForm();
                fetchOrders(); // Refresh orders list
            }
        } catch (err) {
            console.error('Submit order error:', err);
            alert('❌ Failed to submit order. Please try again.');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormState({
            title: '',
            description: '',
            quantity: '1',
            material: '',
            designImage: null,
        });
    };

    // View order details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // Get status badge class
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

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending Review';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return order.status === 'pending';
        if (activeFilter === 'in_progress') return order.status === 'in_progress';
        if (activeFilter === 'completed') return order.status === 'completed';
        if (activeFilter === 'rejected') return order.status === 'rejected';
        return true;
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - SAME AS USER DASHBOARD */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                        <p className="text-xs text-slate-400">Student Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>

                    <Link
                        to="/user/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link
                        to="/user/book-machine"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Book a Machine
                    </Link>

                    <Link
                        to="/user/courses"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Course Registration
                    </Link>

                    <Link
                        to="/user/custom-orders"
                        className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Custom Orders
                    </Link>

                    <Link
                        to="/user/my-bookings"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        My Bookings
                    </Link>

                    <Link
                        to="/user/announcements"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Announcements
                    </Link>

                    {/* Support Section */}
                    <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6">Support</p>

                    <Link
                        to="/user/faqs"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        FAQs
                    </Link>

                    <Link
                        to="/user/help"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Help / Contact
                    </Link>

                    {/* Logout */}
                    <Link
                        to="/login"
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-6 border-t border-slate-700/50 pt-4"
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
                            <p className="text-sm text-gray-600">Request custom fabrication for your unique designs and projects</p>
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

                            {/* User Profile */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    PS
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Custom Orders Content */}
                <main className="p-6">
                    {/* Header with New Order Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Custom Orders</h3>
                            <p className="text-sm text-gray-600 mt-1">Request custom fabrication for your unique designs and projects</p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Custom Order
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Pending Review */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                    <p className="text-sm text-gray-600">Pending Review</p>
                                </div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed */}
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

                        {/* Rejected */}
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
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            All ({orders.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'pending'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Pending ({stats.pending})
                        </button>
                        <button
                            onClick={() => setActiveFilter('in_progress')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'in_progress'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            In Progress ({stats.inProgress})
                        </button>
                        <button
                            onClick={() => setActiveFilter('completed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'completed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Completed ({stats.completed})
                        </button>
                        <button
                            onClick={() => setActiveFilter('rejected')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'rejected'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Rejected ({stats.rejected})
                        </button>
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
                                <div
                                    key={order.id}
                                    onClick={() => handleViewDetails(order)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-gray-900">{order.title}</h4>
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{order.description}</p>

                                    {/* Details */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div>
                                            <span className="text-gray-500">Qty:</span> {order.quantity}
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Material:</span> {order.material}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="text-sm text-gray-500">
                                            Submitted: {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                        {order.estimated_price && (
                                            <div className="text-lg font-bold text-blue-600">
                                                Nu. {order.estimated_price.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No custom orders found</p>
                            <p className="text-gray-400 text-sm mt-1">Click "New Custom Order" to create your first request</p>
                        </div>
                    )}
                </main>
            </div>

            {/* ===== CREATE ORDER MODAL ===== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Request Custom Order</h3>
                                <p className="text-sm text-gray-500 mt-1">Fill in the details of your custom fabrication request. Upload a design image if available.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
                            {/* Project Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formState.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Custom Trophy Stand"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formState.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your project in detail - dimensions, colors, specific requirements..."
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    required
                                ></textarea>
                            </div>

                            {/* Quantity & Material */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formState.quantity}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Material</label>
                                    <select
                                        name="material"
                                        value={formState.material}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select material</option>
                                        <option value="Wood">Wood</option>
                                        <option value="Acrylic">Acrylic</option>
                                        <option value="PLA Filament">PLA Filament (3D Print)</option>
                                        <option value="PCB Board">PCB Board</option>
                                        <option value="Metal">Metal</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Design Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Design Image (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="design-image-upload"
                                    />
                                    <label htmlFor="design-image-upload" className="cursor-pointer">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm text-gray-600">Click to upload design image</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                    </label>
                                    {formState.designImage && (
                                        <p className="text-sm text-green-600 mt-2">✅ {formState.designImage.name}</p>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmitOrder}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ORDER DETAILS MODAL ===== */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">{selectedOrder.title}</h3>
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                                    {getStatusLabel(selectedOrder.status)}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Design Image */}
                            {selectedOrder.design_image ? (
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`}
                                        alt={selectedOrder.title}
                                        className="w-full h-64 object-contain rounded"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-lg p-12 text-center">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-500 mt-2">No design image uploaded</p>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                                <p className="text-gray-600 leading-relaxed">{selectedOrder.description}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Quantity</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Material</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.material}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Submitted On</p>
                                    <p className="font-semibold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Estimated Price</p>
                                    <p className="font-semibold text-blue-600">
                                        {selectedOrder.estimated_price ? `Nu. ${selectedOrder.estimated_price.toLocaleString()}` : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Notes (if rejected) */}
                            {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-red-700 mb-2">Rejection Reason</h4>
                                    <p className="text-red-600">{selectedOrder.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SUCCESS MODAL ===== */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Order Submitted Successfully!</h3>
                        <p className="text-gray-600 mb-6">
                            Your custom order request has been submitted. Our team will review it and get back to you within 24-48 hours with a price estimate.
                        </p>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}