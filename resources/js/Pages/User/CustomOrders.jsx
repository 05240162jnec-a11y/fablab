import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';

export default function CustomOrders() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: false,
        machines: false,
        learning: false,
        explore: false,
        support: false,
    });

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Selected Order State
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter State
    const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed, rejected

    // Form State - ✅ Material removed
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        quantity: '1',
        design_image: null,
    });

    // Image Preview State
    const [imagePreview, setImagePreview] = useState(null);

    // Form Loading State
    const [submitting, setSubmitting] = useState(false);

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stats State
    const [stats, setStats] = useState({
        pending: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0,
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
            const token = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/custom-orders', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);
                setStats(response.data.stats);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Failed to load custom orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Open Create Modal - ✅ Material removed from reset
    const handleCreateOrder = () => {
        setFormState({
            title: '',
            description: '',
            quantity: '1',
            design_image: null,
        });
        setImagePreview(null);
        setShowCreateModal(true);
    };

    // Open View Modal
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    // Close all modals - ✅ Material removed from reset
    const closeAllModals = () => {
        setShowCreateModal(false);
        setShowViewModal(false);
        setShowSuccessModal(false);
        setSelectedOrder(null);
        setFormState({
            title: '',
            description: '',
            quantity: '1',
            design_image: null,
        });

        // ✅ Clean up preview URL
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    // Submit New Order - ✅ Image required validation added
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // ✅ Validate design image is uploaded
        if (!formState.design_image) {
            alert('❌ Please upload a design image');
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('description', formState.description);
            formData.append('quantity', formState.quantity);
            // ✅ Material removed
            if (formState.design_image) {
                formData.append('design_image', formState.design_image);
            }

            const response = await axios.post('http://127.0.0.1:8000/api/user/custom-orders', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setShowCreateModal(false);
                setShowSuccessModal(true);
                fetchOrders(); // Refresh list
            }
        } catch (err) {
            console.error('Submit order error:', err);
            alert('❌ Failed to submit order. Please try again.');
        } finally {
            setSubmitting(false);
        }
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

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'in_progress':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'completed':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    // Format currency
    const formatCurrency = (amount) => {
        return `Nu. ${amount?.toLocaleString() || '0'}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ Shared Sidebar Component */}
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Custom Orders</h2>
                                <p className="text-sm text-gray-600">Request custom fabrication for your unique designs and projects</p>
                            </div>
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

                    {!loading && !error && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                                            <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
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

                            {/* Filter Tabs & New Order Button */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        All ({orders.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('pending')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Pending ({stats.pending})
                                    </button>
                                    <button
                                        onClick={() => setFilter('in_progress')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'in_progress'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        In Progress ({stats.in_progress})
                                    </button>
                                    <button
                                        onClick={() => setFilter('completed')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Completed ({stats.completed})
                                    </button>
                                </div>

                                <button
                                    onClick={handleCreateOrder}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    New Custom Order
                                </button>
                            </div>

                            {/* Orders Grid */}
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No orders found</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {filter === 'all'
                                            ? 'Click "New Custom Order" to get started'
                                            : `No ${filter.replace('_', ' ')} orders`}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            onClick={() => handleViewOrder(order)}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-900">{order.title}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {capitalize(order.status.replace('_', ' '))}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{order.description}</p>

                                            {/* Details - ✅ Material removed */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Qty:</span> {order.quantity}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="text-xs text-gray-500">
                                                    Submitted: {formatDate(order.created_at)}
                                                </div>
                                                {order.estimated_price && (
                                                    <div className="text-sm font-bold text-blue-600">
                                                        {formatCurrency(order.estimated_price)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* ===== CREATE ORDER MODAL - ✅ SCROLLABLE & FIXED SIZE ===== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header - Fixed */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Request Custom Order</h3>
                                <p className="text-sm text-gray-500 mt-1">Fill in the details of your custom fabrication request. Upload a design image to proceed.</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* ✅ Form wraps entire scrollable content + footer */}
                        <form onSubmit={handleSubmitOrder} className="flex flex-col flex-1 overflow-hidden">
                            {/* Modal Body - Scrollable */}
                            <div className="overflow-y-auto flex-1 p-6 space-y-4">
                                {/* Project Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Custom Trophy Stand"
                                        value={formState.title}
                                        onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                    <textarea
                                        placeholder="Describe your project in detail - dimensions, colors, specific requirements..."
                                        rows="4"
                                        value={formState.description}
                                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    ></textarea>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formState.quantity}
                                        onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Design Image Upload - ✅ NOW REQUIRED with PERFECT FIT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Design Image <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setFormState({ ...formState, design_image: file });

                                                // ✅ Create preview URL
                                                if (file) {
                                                    const previewUrl = URL.createObjectURL(file);
                                                    setImagePreview(previewUrl);
                                                }
                                            }}
                                            className="hidden"
                                            id="design-image-upload"
                                            required
                                        />
                                        <label htmlFor="design-image-upload" className="cursor-pointer block">
                                            {/* ✅ Show preview if image selected */}
                                            {imagePreview ? (
                                                <div className="relative">
                                                    {/* ✅ Image fills entire dash boundary */}
                                                    <div className="w-full h-64">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {/* ✅ Overlay with file info */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-2">
                                                        <p className="text-sm font-medium truncate">✅ {formState.design_image?.name}</p>
                                                        <p className="text-xs text-gray-300">Click to change image</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ✅ Show upload prompt if no image */
                                                <div className="p-8 text-center">
                                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600 font-medium">Click to upload design image <span className="text-red-500">*</span></p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {/* Validation message */}
                                    {!formState.design_image && submitting && (
                                        <p className="text-xs text-red-500 mt-1">Design image is required</p>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer - Fixed with Submit Button INSIDE form */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== VIEW ORDER MODAL ===== */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">{selectedOrder.title}</h3>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    {capitalize(selectedOrder.status.replace('_', ' '))}
                                </span>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Design Image - ✅ Perfect fit */}
                            {selectedOrder.design_image ? (
                                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${selectedOrder.image || selectedOrder.design_image}`}
                                        alt={selectedOrder.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}

                            {/* Description */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                                <p className="text-gray-600 text-sm">{selectedOrder.description}</p>
                            </div>

                            {/* Details Grid - ✅ Material removed */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Submitted On</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 mb-1">Estimated Price</p>
                                    <p className="font-bold text-blue-600">
                                        {selectedOrder.estimated_price ? formatCurrency(selectedOrder.estimated_price) : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Rejection Reason (if rejected) */}
                            {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                                    <p className="text-sm text-red-700">{selectedOrder.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Order Submitted Successfully!</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Your custom order request has been submitted. Our team will review it and get back to you within 24-48 hours with a price estimate.
                        </p>
                        <button
                            onClick={closeAllModals}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}