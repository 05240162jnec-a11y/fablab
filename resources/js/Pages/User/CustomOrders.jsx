import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';

export default function CustomOrders() {
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
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Selected Order State
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter State
    const [filter, setFilter] = useState('all');

    // Form State
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        quantity: '1',
        design_image: null,
    });

    // Image Preview State
    const [imagePreview, setImagePreview] = useState(null);

    // Checkout State
    const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' or 'shipping'
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCost] = useState(150); // Fixed shipping cost

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

    // Fetch orders with proper parsing
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

            const ordersData = response.data?.data?.data || [];
            setOrders(ordersData);

            // Calculate stats from orders
            const newStats = {
                pending: ordersData.filter(o => o.status === 'pending').length,
                in_progress: ordersData.filter(o => o.status === 'in_progress').length,
                completed: ordersData.filter(o => o.status === 'completed').length,
                rejected: ordersData.filter(o => o.status === 'rejected').length,
            };
            setStats(newStats);

            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load custom orders.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Open Create Modal
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

    // Close all modals
    const closeAllModals = () => {
        setShowCreateModal(false);
        setShowViewModal(false);
        setShowCheckoutModal(false);
        setShowPaymentModal(false);
        setShowSuccessModal(false);
        setSelectedOrder(null);
        setFormState({
            title: '',
            description: '',
            quantity: '1',
            design_image: null,
        });
        setDeliveryOption('pickup');
        setShippingAddress('');

        // Clean up preview URL
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    // Submit New Order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);

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
                fetchOrders();
            }
        } catch (err) {
            console.error('Submit order error:', err);
            alert('❌ Failed to submit order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Open Checkout Modal (Step 1 of payment)
    const handleOpenCheckout = () => {
        setShowViewModal(false);
        setShowCheckoutModal(true);
    };

    // ✅ Continue to Payment (Step 2)
    const handleContinueToPayment = () => {
        if (deliveryOption === 'shipping' && !shippingAddress.trim()) {
            alert('❌ Please enter shipping address');
            return;
        }
        setShowCheckoutModal(false);
        setShowPaymentModal(true);
    };

    // ✅ Upload Payment Screenshot (from Payment Modal)
    const handleUploadPayment = async (e) => {
        e.preventDefault();
        const fileInput = e.target.querySelector('input[type="file"]');
        const file = fileInput.files[0];

        if (!file) {
            alert('❌ Please select payment screenshot');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('payment_screenshot', file);
            formData.append('delivery_option', deliveryOption);
            if (deliveryOption === 'shipping') {
                formData.append('shipping_address', shippingAddress);
            }

            const response = await axios.post(
                `http://127.0.0.1:8000/api/user/custom-orders/${selectedOrder.id}/upload-payment`,
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            setShowPaymentModal(false);
            setShowSuccessModal(true);
            await fetchOrders();
        } catch (err) {
            console.error('Upload payment error:', err);
            const message = err.response?.data?.message || 'Failed to upload payment';
            alert('❌ ' + message);
        } finally {
            setSubmitting(false);
        }
    };

    // Cancel Order
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/user/custom-orders/${orderId}/cancel`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            alert('✅ ' + response.data.message);
            setShowViewModal(false);
            await fetchOrders();
        } catch (err) {
            console.error('Cancel error:', err);
            const message = err.response?.data?.message || 'Failed to cancel order';
            alert('❌ ' + message);
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
    const filteredOrders = (orders || []).filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'Pending';
        return `Nu. ${parseFloat(amount).toFixed(2)}`;
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

    // Calculate total with shipping
    const calculateTotal = () => {
        const orderTotal = parseFloat(selectedOrder?.estimated_price || 0);
        return deliveryOption === 'shipping' ? orderTotal + shippingCost : orderTotal;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            <div className="flex-1">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">Custom Orders</h2>
                        <p className="text-sm text-gray-600">Request custom fabrication for your unique designs</p>
                    </div>
                </header>

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
                            </div>

                            {/* Filter Tabs & New Order Button */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                        All ({orders.length})
                                    </button>
                                    <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                        Pending ({stats.pending})
                                    </button>
                                    <button onClick={() => setFilter('in_progress')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                        In Progress ({stats.in_progress})
                                    </button>
                                    <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                        Completed ({stats.completed})
                                    </button>
                                    <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                        Rejected ({stats.rejected})
                                    </button>
                                </div>

                                <button onClick={handleCreateOrder} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    New Custom Order
                                </button>
                            </div>

                            {/* Orders Grid - SIMPLIFIED CARDS */}
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No orders found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            onClick={() => handleViewOrder(order)}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-bold text-gray-900 truncate flex-1">{order.title}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusBadgeClass(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {capitalize(order.status.replace('_', ' '))}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Qty:</span> {order.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* ===== CREATE ORDER MODAL ===== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Request Custom Order</h3>
                                <p className="text-sm text-gray-500 mt-1">Fill in your custom fabrication request</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitOrder} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto flex-1 p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                                    <input type="text" placeholder="e.g., Custom Trophy Stand" value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                    <textarea placeholder="Describe your project..." rows="4" value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                                    <input type="number" min="1" value={formState.quantity} onChange={(e) => setFormState({ ...formState, quantity: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Design Image <span className="text-red-500">*</span></label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; setFormState({ ...formState, design_image: file }); if (file) { setImagePreview(URL.createObjectURL(file)); } }} className="hidden" id="design-image-upload" required />
                                        <label htmlFor="design-image-upload" className="cursor-pointer block">
                                            {imagePreview ? (
                                                <div className="relative"><div className="w-full h-64"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /></div><div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-2"><p className="text-sm font-medium truncate">✅ {formState.design_image?.name}</p></div></div>
                                            ) : (
                                                <div className="p-8 text-center"><svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="text-sm text-gray-600 font-medium">Click to upload <span className="text-red-500">*</span></p></div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0">
                                <button type="button" onClick={closeAllModals} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{submitting ? 'Submitting...' : 'Submit Request'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== ORDER DETAILS MODAL ===== */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
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

                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            {selectedOrder.design_image && (
                                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`} alt={selectedOrder.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                    <p className="font-bold text-blue-600 text-lg">{formatCurrency(selectedOrder.estimated_price)}</p>
                                </div>
                            </div>

                            {selectedOrder.payment_screenshot && !selectedOrder.payment_verified_at && (
                                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <p className="text-sm text-indigo-700">📤 Payment uploaded - awaiting verification</p>
                                </div>
                            )}
                            {selectedOrder.payment_verified_at && (
                                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                    <p className="text-sm text-teal-700">✅ Payment verified - order in progress</p>
                                </div>
                            )}

                            {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                                    <p className="text-sm text-red-700">{selectedOrder.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                            {!selectedOrder.payment_verified_at && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                                <button onClick={() => handleCancelOrder(selectedOrder.id)} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                    Cancel Order
                                </button>
                            )}

                            {selectedOrder.estimated_price && !selectedOrder.payment_verified_at && selectedOrder.status !== 'cancelled' && (
                                <button onClick={handleOpenCheckout} className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                    Make Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CHECKOUT MODAL (Step 1) ===== */}
            {showCheckoutModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Checkout</h3>
                                <p className="text-sm text-gray-500 mt-1">Select delivery option</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 pt-6">
                            <div className="flex items-center justify-center">
                                <div className="flex items-center w-full max-w-md">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">1</div>
                                    <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold">2</div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Delivery Options */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Delivery Option</h4>

                                    {/* Self Pick Up */}
                                    <div
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${deliveryOption === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setDeliveryOption('pickup')}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="delivery"
                                                checked={deliveryOption === 'pickup'}
                                                onChange={() => { }}
                                                className="w-4 h-4 text-blue-600 mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <p className="font-medium text-gray-900">Self Pick Up</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 ml-7">Pick up your order from JNEC Fab Lab during working hours (9 AM - 5 PM)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ship to Address */}
                                    <div
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${deliveryOption === 'shipping' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setDeliveryOption('shipping')}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="delivery"
                                                checked={deliveryOption === 'shipping'}
                                                onChange={() => { }}
                                                className="w-4 h-4 text-blue-600 mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                    </svg>
                                                    <p className="font-medium text-gray-900">Ship to Address</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 ml-7">We will ship your order to your provided address. Shipping cost must be bare by you</p>
                                                <p className="text-sm font-medium text-purple-600 mt-2 ml-7">Shipping Cost: Nu. {shippingCost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address Input */}
                                    {deliveryOption === 'shipping' && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
                                            <textarea
                                                value={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                rows="3"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                                placeholder="Enter your complete address..."
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Right: Order Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>

                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                                            {selectedOrder.design_image ? (
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`}
                                                    alt={selectedOrder.title}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{selectedOrder.title}</p>
                                                <p className="text-xs text-gray-500">Qty: {selectedOrder.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.estimated_price)}</p>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Items Total:</span>
                                                <span className="font-medium">{formatCurrency(selectedOrder.estimated_price)}</span>
                                            </div>
                                            {deliveryOption === 'shipping' && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Shipping Cost:</span>
                                                    <span className="font-medium text-purple-600">Nu. {shippingCost.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-300 pt-2 flex justify-between">
                                                <span className="font-semibold text-gray-900">Total:</span>
                                                <span className="font-bold text-blue-600 text-lg">
                                                    Nu. {calculateTotal().toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button onClick={closeAllModals} className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
                            <button
                                onClick={handleContinueToPayment}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PAYMENT MODAL (Step 2) ===== */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <form onSubmit={handleUploadPayment} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Payment</h3>
                                <p className="text-sm text-gray-500 mt-1">Upload payment screenshot</p>
                            </div>
                            <button type="button" onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 pt-6 flex-shrink-0">
                            <div className="flex items-center justify-center">
                                <div className="flex items-center w-full max-w-md">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">1</div>
                                    <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">2</div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Bank Details & Upload */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Bank Details */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Bank Name:</span>
                                                <span className="font-medium">BOB Bank</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Account Name:</span>
                                                <span className="font-medium">JNEC Fab Lab</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Account Number:</span>
                                                <span className="font-medium">200123456789</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Screenshot - Perfect Fit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot *</label>
                                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-blue-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="payment-screenshot-upload"
                                                required
                                            />
                                            <label htmlFor="payment-screenshot-upload" className="cursor-pointer block">
                                                <svg className="w-16 h-16 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-700">Click to upload screenshot</p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Order Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>

                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                                            {selectedOrder.design_image ? (
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`}
                                                    alt={selectedOrder.title}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{selectedOrder.title}</p>
                                                <p className="text-xs text-gray-500">Qty: {selectedOrder.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.estimated_price)}</p>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Items Total:</span>
                                                <span className="font-medium">{formatCurrency(selectedOrder.estimated_price)}</span>
                                            </div>
                                            {deliveryOption === 'shipping' && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Shipping:</span>
                                                    <span className="font-medium text-purple-600">Nu. {shippingCost.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-300 pt-2 flex justify-between">
                                                <span className="font-semibold text-gray-900">Total:</span>
                                                <span className="font-bold text-blue-600 text-lg">
                                                    Nu. {calculateTotal().toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => { setShowPaymentModal(false); setShowCheckoutModal(true); }}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                            >
                                {submitting ? 'Submitting...' : 'Submit Order'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== SUCCESS MODAL ===== */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-600 text-sm mb-6">Your payment has been submitted. We will verify it shortly.</p>
                        <button onClick={closeAllModals} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}