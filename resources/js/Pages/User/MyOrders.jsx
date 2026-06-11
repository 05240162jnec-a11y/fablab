import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CustomAlert from '../../Components/CustomAlert';

export default function MyOrders() {
    // Order States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Tab State
    const [activeTab, setActiveTab] = useState('verifying');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal States
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showScreenshotModal, setShowScreenshotModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Checkout State
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCost] = useState(150);

    // Form Loading State
    const [submitting, setSubmitting] = useState(false);

    // ✅ Countdown timer state
    const [currentTime, setCurrentTime] = useState(new Date());

    // ✅ Bulk Delete Selection State
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);

    // ✅ Custom Alert State
    const [alert, setAlert] = useState({
        show: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel',
    });

    // Separate close functions
    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedOrder(null);
    };

    const closeScreenshotModal = () => {
        setShowScreenshotModal(false);
    };

    const closeAllModals = () => {
        setShowDetailsModal(false);
        setShowScreenshotModal(false);
        setShowPaymentModal(false);
        setShowSuccessModal(false);
        setSelectedOrder(null);
    };

    // ✅ Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // ✅ Clear selection when tab changes
    useEffect(() => {
        setSelectedOrderIds([]);
    }, [activeTab]);

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = sessionStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/product-orders', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setOrders(response.data.orders || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // ✅ Filter orders by tab and other filters
    const filteredOrders = orders.filter(order => {
        let statusMatch = false;
        switch (activeTab) {
            case 'verifying':
                statusMatch = order.status === 'pending';
                break;
            case 'confirm':
                statusMatch = order.status === 'approved';
                break;
            case 'cancel':
                statusMatch = order.status === 'cancelled';
                break;
            case 'rejected':
                statusMatch = order.status === 'rejected';
                break;
            default:
                statusMatch = true;
        }

        if (!statusMatch) return false;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const orderNumber = order.order_number?.toLowerCase() || '';
            const productName = order.items?.[0]?.name?.toLowerCase() || '';

            if (!orderNumber.includes(search) && !productName.includes(search)) {
                return false;
            }
        }

        if (dateFrom) {
            const orderDate = new Date(order.created_at).toISOString().split('T')[0];
            if (orderDate < dateFrom) {
                return false;
            }
        }

        if (dateTo) {
            const orderDate = new Date(order.created_at).toISOString().split('T')[0];
            if (orderDate > dateTo) {
                return false;
            }
        }

        return true;
    });

    // ✅ Get tab counts
    const getTabCount = (tabName) => {
        return orders.filter(order => {
            switch (tabName) {
                case 'verifying':
                    return order.status === 'pending';
                case 'confirm':
                    return order.status === 'approved';
                case 'cancel':
                    return order.status === 'cancelled';
                case 'rejected':
                    return order.status === 'rejected';
                default:
                    return false;
            }
        }).length;
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-700 border border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `Nu. ${parseFloat(amount || 0).toFixed(2)}`;
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

    // Get product name
    const getProductName = (order) => {
        return order.items?.[0]?.name || 'Unknown Product';
    };

    // ✅ Images use /storage/ path
    const getProductImage = (order, item = null) => {
        let imagePath = null;

        if (item) {
            imagePath = item.image || (item.images?.[0] ?? null);
        } else if (order.items?.[0]) {
            imagePath = order.items[0].image || (order.items[0].images?.[0] ?? null);
        }

        if (!imagePath) return null;

        return `http://127.0.0.1:8000/storage/${imagePath}`;
    };

    // ✅ Calculate time remaining with seconds
    const getTimeRemaining = (deadline) => {
        if (!deadline) return null;
        const total = Date.parse(deadline) - currentTime.getTime();
        if (total <= 0) return { expired: true };

        const hours = Math.floor((total / (1000 * 60 * 60)));
        const minutes = Math.floor((total / (1000 * 60)) % 60);
        const seconds = Math.floor((total / 1000) % 60);

        return {
            expired: false,
            hours,
            minutes,
            seconds
        };
    };

    // ✅ Check if order can re-upload payment
    const canReuploadPayment = (order) => {
        if (order.status !== 'rejected') return false;
        if (order.permanently_rejected) return false;
        if (!order.rejection_deadline) return false;
        const remaining = getTimeRemaining(order.rejection_deadline);
        return !remaining?.expired;
    };

    // ✅ Open payment upload modal
    const handleOpenPaymentModal = (order) => {
        setSelectedOrder(order);
        setDeliveryOption(order.delivery_option || 'pickup');
        setShippingAddress(order.shipping_address || '');
        setShowDetailsModal(false);
        setShowPaymentModal(true);
    };

    // ✅ Upload payment screenshot
    const handleUploadPayment = async (e) => {
        e.preventDefault();
        const fileInput = e.target.querySelector('input[type="file"]');
        const file = fileInput.files[0];

        if (!file) {
            setAlert({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Please select payment screenshot',
                onConfirm: () => setAlert({ ...alert, show: false }),
            });
            return;
        }

        setSubmitting(true);

        try {
            const token = sessionStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('payment_screenshot', file);
            formData.append('delivery_option', deliveryOption);
            if (deliveryOption === 'shipping') {
                formData.append('shipping_address', shippingAddress);
            }

            const response = await axios.post(
                `http://127.0.0.1:8000/api/user/product-orders/${selectedOrder.id}/upload-payment`,
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
            setAlert({
                show: true,
                type: 'error',
                title: 'Error',
                message: message,
                onConfirm: () => setAlert({ ...alert, show: false }),
            });
        } finally {
            setSubmitting(false);
        }
    };

    // View order details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // View payment screenshot
    const handleViewScreenshot = async (order) => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const response = await axios.get(`http://127.0.0.1:8000/api/user/product-orders/${order.id}/screenshot`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setSelectedOrder({ ...order, screenshot_url: response.data.image_url });
                setShowScreenshotModal(true);
            }
        } catch (err) {
            console.error('Screenshot error:', err);
            setAlert({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to load payment screenshot',
                onConfirm: () => setAlert({ ...alert, show: false }),
            });
        }
    };

    // ✅ Handle Cancel Order - Only for pending orders
    const handleCancelOrder = async (order) => {
        setAlert({
            show: true,
            type: 'confirm',
            title: 'Cancel Order',
            message: `Are you sure you want to cancel order ${order.order_number}? This action cannot be undone.`,
            onConfirm: async () => {
                setAlert({ ...alert, show: false });

                try {
                    const token = sessionStorage.getItem('auth_token');

                    const response = await axios.post(
                        `http://127.0.0.1:8000/api/user/product-orders/${order.id}/cancel`,
                        {},
                        {
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            }
                        }
                    );

                    if (response.data.success) {
                        setAlert({
                            show: true,
                            type: 'success',
                            title: 'Success',
                            message: 'Order cancelled successfully!',
                            onConfirm: () => setAlert({ ...alert, show: false }),
                        });
                        fetchOrders();
                        closeDetailsModal();
                    }
                } catch (err) {
                    console.error('Cancel error:', err);
                    const message = err.response?.data?.message || 'Failed to cancel order. Please try again.';
                    setAlert({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: message,
                        onConfirm: () => setAlert({ ...alert, show: false }),
                    });
                }
            },
            onCancel: () => setAlert({ ...alert, show: false }),
            confirmText: 'Yes, Cancel',
            cancelText: 'No, Keep',
        });
    };

    // ✅ NEW: Toggle Select All
    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(order => order.id));
        }
    };

    // ✅ NEW: Toggle Individual Selection
    const toggleSelectOrder = (id) => {
        if (selectedOrderIds.includes(id)) {
            setSelectedOrderIds(selectedOrderIds.filter(orderId => orderId !== id));
        } else {
            setSelectedOrderIds([...selectedOrderIds, id]);
        }
    };

    // ✅ NEW: Handle Bulk Delete
    const handleBulkDelete = () => {
        if (selectedOrderIds.length === 0) return;

        setAlert({
            show: true,
            type: 'confirm',
            title: 'Delete Orders',
            message: `Are you sure you want to delete ${selectedOrderIds.length} order(s)? This action cannot be undone.`,
            onConfirm: async () => {
                setAlert({ ...alert, show: false });

                try {
                    const token = sessionStorage.getItem('auth_token');
                    const response = await axios.post(
                        'http://127.0.0.1:8000/api/user/product-orders/bulk-delete',
                        { order_ids: selectedOrderIds },
                        {
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (response.data.success) {
                        setAlert({
                            show: true,
                            type: 'success',
                            title: 'Success',
                            message: 'Orders deleted successfully!',
                            onConfirm: () => setAlert({ ...alert, show: false }),
                        });
                        setSelectedOrderIds([]);
                        fetchOrders();
                    } else {
                        setAlert({
                            show: true,
                            type: 'error',
                            title: 'Error',
                            message: response.data.message || 'Failed to delete orders.',
                            onConfirm: () => setAlert({ ...alert, show: false }),
                        });
                    }
                } catch (err) {
                    console.error('Bulk delete error:', err);
                    setAlert({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to delete orders. Please try again.',
                        onConfirm: () => setAlert({ ...alert, show: false }),
                    });
                }
            },
            onCancel: () => setAlert({ ...alert, show: false }),
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
    };

    return (
        <>
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                    <button onClick={fetchOrders} className="ml-4 underline hover:text-red-700">
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                    <p className="text-gray-400 text-sm mt-1 mb-4">Start shopping to see your orders here</p>
                    <Link
                        to="/user/shop-orders?tab=products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Start Shopping
                    </Link>
                </div>
            )}

            {/* Orders Table */}
            {!loading && !error && orders.length > 0 && (
                <>
                    {/* ✅ TABS */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('verifying')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'verifying'
                                        ? 'border-yellow-500 text-yellow-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Verifying Order
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'verifying' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getTabCount('verifying')}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('confirm')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'confirm'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Confirm
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'confirm' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getTabCount('confirm')}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('cancel')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'cancel'
                                        ? 'border-gray-500 text-gray-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'cancel' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getTabCount('cancel')}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('rejected')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'rejected'
                                        ? 'border-red-500 text-red-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Rejected
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getTabCount('rejected')}
                                    </span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Order # or product..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {(searchTerm || dateFrom || dateTo) && (
                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setDateFrom('');
                                        setDateTo('');
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ✅ NEW: Bulk Delete Toolbar */}
                    {selectedOrderIds.length > 0 && activeTab !== 'verifying' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between shadow-sm">
                            <p className="text-sm font-medium text-blue-900">
                                {selectedOrderIds.length} order(s) selected
                            </p>
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Selected
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {/* ✅ NEW: Checkbox Header Column */}
                                        {activeTab !== 'verifying' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTab !== 'verifying' ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                                                <p>No orders found matching your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const isPermanentlyRejected = order.status === 'rejected' && order.permanently_rejected;

                                            return (
                                                <tr
                                                    key={order.id}
                                                    onClick={() => handleViewDetails(order)}
                                                    className={`hover:bg-blue-50 transition-colors cursor-pointer ${isPermanentlyRejected ? 'opacity-60' : ''}`}
                                                >
                                                    {/* ✅ NEW: Checkbox Column */}
                                                    {activeTab !== 'verifying' && (
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedOrderIds.includes(order.id)}
                                                                onChange={() => toggleSelectOrder(order.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                            {order.order_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                {getProductImage(order) ? (
                                                                    <img src={getProductImage(order)} alt={getProductName(order)} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{getProductName(order)}</p>
                                                                <p className="text-xs text-gray-500">Qty: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredOrders.length} order(s) in {activeTab === 'verifying' ? 'Verifying Order' : activeTab === 'confirm' ? 'Confirm' : activeTab === 'cancel' ? 'Cancel' : 'Rejected'} tab
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeDetailsModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedOrder.order_number}</p>
                            </div>
                            <button
                                onClick={closeDetailsModal}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Status & Date */}
                            <div className="flex items-center justify-between mb-6">
                                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                </span>
                                <span className="text-sm text-gray-600">
                                    Placed on {formatDate(selectedOrder.created_at)}
                                </span>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                                <div className="space-y-4">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                {getProductImage(selectedOrder, item) ? (
                                                    <img
                                                        src={getProductImage(selectedOrder, item)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900">{item.name}</h5>
                                                <p className="text-sm text-gray-600">Size: {item.size || 'N/A'}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-600">{formatCurrency(item.price * item.quantity)}</p>
                                                <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        {selectedOrder.delivery_option === 'shipping' ? (
                                            <>
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">Shipping</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">Self Pickup</span>
                                            </>
                                        )}
                                    </div>

                                    {selectedOrder.delivery_option === 'shipping' && selectedOrder.shipping_address && (
                                        <div className="text-sm text-gray-700">
                                            <p className="font-medium mb-1">Shipping Address:</p>
                                            <p>{selectedOrder.shipping_address}</p>
                                        </div>
                                    )}

                                    {selectedOrder.delivery_option === 'pickup' && (
                                        <div className="text-sm text-gray-700">
                                            <p className="font-medium mb-1">Pickup Location:</p>
                                            <p>JNEC Fab Lab</p>
                                            <p className="text-gray-600">Working Hours: 9 AM - 5 PM (Sun-Fri)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Breakdown */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h4>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Total Order Amount:</span>
                                        <span className="text-xl font-bold text-blue-600">{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ Real-Time Rejection Deadline Countdown */}
                            {selectedOrder.status === 'rejected' && !selectedOrder.permanently_rejected && selectedOrder.rejection_deadline && (
                                <div className="mb-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-orange-900 mb-2">Time Remaining to Re-upload Payment</h4>
                                            {(() => {
                                                const remaining = getTimeRemaining(selectedOrder.rejection_deadline);
                                                if (remaining?.expired) {
                                                    return (
                                                        <>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-base font-bold text-red-700">
                                                                    Time Expired
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-red-600 leading-relaxed">
                                                                Sorry, your re-uploading payment time is over. Your order has been permanently rejected and items have been returned to stock.
                                                                If you want to order, please place a new order.
                                                            </p>
                                                        </>
                                                    );
                                                }
                                                return (
                                                    <>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="bg-white px-4 py-2 rounded-lg border border-orange-200 shadow-sm">
                                                                <p className="text-2xl font-bold text-orange-700 font-mono">
                                                                    {remaining?.hours}h {remaining?.minutes}m {remaining?.seconds}s
                                                                </p>
                                                            </div>
                                                            <span className="text-sm text-orange-600 font-medium">remaining</span>
                                                        </div>
                                                        <p className="text-sm text-orange-700 leading-relaxed">
                                                            If you don't re-upload payment within the deadline, your order will be permanently rejected and items returned to stock.
                                                        </p>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ✅ Permanent Rejection Message */}
                            {selectedOrder.status === 'rejected' && selectedOrder.permanently_rejected && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-red-900">❌ Order Permanently Rejected</p>
                                            <p className="text-sm text-red-700 mt-1">
                                                Sorry, your re-uploading payment time is over. Your order has been permanently rejected and items have been returned to stock.
                                            </p>
                                            <p className="text-sm text-red-700 mt-1 font-medium">
                                                If you want to order, please place a new order.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800">{selectedOrder.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Screenshot */}
                            {selectedOrder.payment_screenshot && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                            alt="Payment Screenshot"
                                            className="w-48 h-auto max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setShowScreenshotModal(true)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="text-center mt-6 flex gap-3 justify-center">
                                {selectedOrder.status === 'rejected' &&
                                    !selectedOrder.permanently_rejected &&
                                    canReuploadPayment(selectedOrder) && (
                                        <button
                                            onClick={() => handleOpenPaymentModal(selectedOrder)}
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Make Payment
                                        </button>
                                    )}

                                {selectedOrder.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancelOrder(selectedOrder)}
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel Order
                                    </button>
                                )}

                                <button
                                    onClick={closeDetailsModal}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Payment Upload Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <form onSubmit={handleUploadPayment} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Upload Payment</h3>
                                <p className="text-sm text-gray-500 mt-1">Order: {selectedOrder.order_number}</p>
                            </div>
                            <button type="button" onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
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

                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                                            {getProductImage(selectedOrder) ? (
                                                <img
                                                    src={getProductImage(selectedOrder)}
                                                    alt={getProductName(selectedOrder)}
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
                                                <p className="text-sm font-medium text-gray-900 truncate">{getProductName(selectedOrder)}</p>
                                                <p className="text-xs text-gray-500">Qty: {selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.total_amount)}</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total:</span>
                                                <span className="font-bold text-blue-600 text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                            <button
                                type="button"
                                onClick={closeAllModals}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                            >
                                {submitting ? 'Submitting...' : 'Submit Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ✅ Success Modal */}
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

            {/* Screenshot Modal */}
            {showScreenshotModal && selectedOrder && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
                    onClick={closeScreenshotModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Payment Screenshot</h3>
                            <button
                                onClick={closeScreenshotModal}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <img
                                src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                alt="Payment Screenshot"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Custom Alert Modal */}
            <CustomAlert
                show={alert.show}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onConfirm={alert.onConfirm}
                onCancel={alert.onCancel}
                confirmText={alert.confirmText}
                cancelText={alert.cancelText}
            />
        </>
    );
}