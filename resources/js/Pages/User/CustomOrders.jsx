import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function CustomOrders() {
    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Selected Order State
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ✅ NEW: Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);

    // Filter State
    const [filter, setFilter] = useState('all');

    // ✅ UPDATED: Form State for multiple images
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        quantity: '1',
        design_images: [],
    });

    // ✅ UPDATED: Image Previews State (Array)
    const [imagePreviews, setImagePreviews] = useState([]);

    // Checkout State
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCost] = useState(150);

    // Form Loading State
    const [submitting, setSubmitting] = useState(false);

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ NEW: Bulk Delete Selection State
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);

    // ✅ NEW: Custom Alert State
    const [customAlert, setCustomAlert] = useState({
        show: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null,
    });

    // ✅ NEW: Show custom alert helper
    const showAlert = (type, title, message, onConfirm = null) => {
        setCustomAlert({
            show: true,
            type,
            title,
            message,
            onConfirm,
        });
    };

    // ✅ NEW: Countdown timer state
    const [currentTime, setCurrentTime] = useState(new Date());

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

            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load custom orders.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Highlight (from notification click)
    const location = useLocation();
    const hlParams = new URLSearchParams(location.search);
    const [highlightId, setHighlightId] = useState(hlParams.get('highlight') ? Number(hlParams.get('highlight')) : null);
    const [dismissedDot, setDismissedDot] = useState(null);

    useEffect(() => {
        const s = document.createElement('style');
        s.id = 'hl-style-uco';
        s.textContent = `
            @keyframes hlPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0)} }
            .hl-card { border:2px solid #2563eb !important; animation:hlPulse 1.2s ease-in-out infinite; }
        `;
        if (!document.getElementById('hl-style-uco')) document.head.appendChild(s);
        if (highlightId) {
            const el = document.getElementById(`card-${highlightId}`);
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
        }
    }, []);

    // ✅ NEW: Update current time every minute for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // ✅ NEW: Clear selection when filter changes
    useEffect(() => {
        setSelectedOrderIds([]);
    }, [filter]);

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
            design_images: [],
        });
        setImagePreviews([]);
        setIsEditMode(false);
        setShowCreateModal(true);
    };

    // ✅ NEW: Open Edit Modal with pre-filled data
    const handleEditOrder = (order) => {
        setFormState({
            title: order.title || '',
            description: order.description || '',
            quantity: order.quantity?.toString() || '1',
            design_images: [],
        });

        const existingImgs = order.design_images || (order.design_image ? [order.design_image] : []);
        const existingPreviews = existingImgs.map(img => `http://127.0.0.1:8000/storage/${img}`);
        setImagePreviews(existingPreviews);

        setIsEditMode(true);
        setShowViewModal(false);
        setShowCreateModal(true);
    };

    // Open View Modal
    const handleViewOrder = (order) => {
        console.log('Selected Order Data:', order);
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
            design_images: [],
        });
        setDeliveryOption('pickup');
        setShippingAddress('');
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
        setIsEditMode(false);
    };

    // ✅ UPDATED: Handle multiple image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 5 - formState.design_images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        if (filesToAdd.length > 0) {
            const newImages = [...formState.design_images, ...filesToAdd];
            const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
            const existingPreviews = [...imagePreviews, ...newPreviews];

            setFormState(prev => ({ ...prev, design_images: newImages }));
            setImagePreviews(existingPreviews);
        }
    };

    // ✅ NEW: Remove specific image
    const removeImage = (index) => {
        const newImages = formState.design_images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        URL.revokeObjectURL(imagePreviews[index]);

        setFormState(prev => ({ ...prev, design_images: newImages }));
        setImagePreviews(newPreviews);
    };

    // Submit New Order OR Update Existing Order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!isEditMode && formState.design_images.length === 0) {
            showAlert('error', 'Error', 'Please upload at least one design image');
            setSubmitting(false);
            return;
        }

        if (isEditMode) {
            showAlert(
                'confirm',
                'Save Changes',
                'Are you sure you want to save changes?',
                async () => {
                    await submitOrder();
                }
            );
            setSubmitting(false);
            return;
        }

        await submitOrder();
    };

    // ✅ NEW: Actual submission logic
    const submitOrder = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('description', formState.description);
            formData.append('quantity', formState.quantity);

            formState.design_images.forEach((file, index) => {
                formData.append(`design_images[${index}]`, file);
            });

            const url = isEditMode
                ? `http://127.0.0.1:8000/api/user/custom-orders/${selectedOrder.id}`
                : 'http://127.0.0.1:8000/api/user/custom-orders';

            const method = isEditMode ? 'put' : 'post';

            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setShowCreateModal(false);

                if (isEditMode) {
                    showAlert('success', 'Success', 'Order updated successfully!');
                } else {
                    setShowSuccessModal(true);
                }

                fetchOrders();
                imagePreviews.forEach(url => URL.revokeObjectURL(url));
                setIsEditMode(false);
            }
        } catch (err) {
            console.error('Submit order error:', err);
            showAlert('error', 'Error', 'Failed to submit order. Please try again.');
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
            showAlert('error', 'Error', 'Please enter shipping address');
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
            showAlert('error', 'Error', 'Please select payment screenshot');
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
            showAlert('error', 'Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ UPDATED: Cancel Order with custom alert
    const handleCancelOrder = async (orderId) => {
        showAlert(
            'confirm',
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            async () => {
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

                    showAlert('success', 'Success', response.data.message);
                    setShowViewModal(false);
                    await fetchOrders();
                } catch (err) {
                    console.error('Cancel error:', err);
                    const message = err.response?.data?.message || 'Failed to cancel order';
                    showAlert('error', 'Error', message);
                }
            }
        );
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

    // ✅ UPDATED: Handle Bulk Delete with custom alert
    const handleBulkDelete = () => {
        if (selectedOrderIds.length === 0) return;

        showAlert(
            'confirm',
            'Delete Orders',
            `Are you sure you want to delete ${selectedOrderIds.length} order(s)? This action cannot be undone.`,
            async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await axios.post(
                        'http://127.0.0.1:8000/api/user/custom-orders/bulk-delete',
                        { order_ids: selectedOrderIds },
                        {
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (response.data.success) {
                        showAlert('success', 'Success', 'Orders deleted successfully!');
                        setSelectedOrderIds([]);
                        fetchOrders();
                    } else {
                        showAlert('error', 'Error', response.data.message || 'Failed to delete orders.');
                    }
                } catch (err) {
                    console.error('Bulk delete error:', err);
                    showAlert('error', 'Error', 'Failed to delete orders. Please try again.');
                }
            }
        );
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'payment_rejected': return 'bg-purple-100 text-purple-700 border border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'in_progress':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
            case 'completed':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'rejected':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'payment_rejected':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            default: return null;
        }
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Filter orders
    const filteredOrders = (orders || []).filter(order => {
        if (filter === 'all') return true;
        if (filter === 'payment_rejected') return order.status === 'payment_rejected';
        if (filter === 'cancelled') return order.status === 'cancelled';
        return order.status === filter;
    });

    const formatCurrency = (amount) => {
        if (!amount) return 'Pending';
        return `Nu. ${parseFloat(amount).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateTotal = () => {
        const orderTotal = parseFloat(selectedOrder?.estimated_price || 0);
        return deliveryOption === 'shipping' ? orderTotal + shippingCost : orderTotal;
    };

    return (
        <>
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
                    {/* Filter Tabs & New Order Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                All ({orders.length})
                            </button>
                            <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                Pending ({orders.filter(o => o.status === 'pending').length})
                            </button>
                            <button onClick={() => setFilter('in_progress')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                In Progress ({orders.filter(o => o.status === 'in_progress').length})
                            </button>
                            <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                Completed ({orders.filter(o => o.status === 'completed').length})
                            </button>
                            {/* ✅ NEW: Payment Rejected Tab */}
                            <button onClick={() => setFilter('payment_rejected')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'payment_rejected' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                Payment Rejected ({orders.filter(o => o.status === 'payment_rejected').length})
                            </button>
                            {/* ✅ CANCELLED Tab - Already there! */}
                            <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cancelled' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                Cancelled ({orders.filter(o => o.status === 'cancelled').length})
                            </button>
                            <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                                Rejected ({orders.filter(o => o.status === 'rejected').length})
                            </button>
                        </div>

                        <button onClick={handleCreateOrder} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            New Custom Order
                        </button>
                    </div>

                    {/* ✅ NEW: Bulk Delete Toolbar */}
                    {selectedOrderIds.length > 0 && (
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

                    {/* Orders Grid */}
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <p className="text-gray-500 text-lg font-medium">No orders found</p>
                            <button onClick={handleCreateOrder} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Create Your First Order</button>
                        </div>
                    ) : (
                        <>
                            {/* ✅ NEW: Select All Checkbox */}
                            <div className="mb-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">Select All</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} id={`card-${order.id}`}
                                        className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group relative ${highlightId === order.id ? 'hl-card' : 'border border-gray-100'}`}>
                                        {highlightId === order.id && dismissedDot !== order.id && (
                                            <div onClick={e => { e.stopPropagation(); setDismissedDot(order.id); }}
                                                style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, background: '#2563eb', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 2px #2563eb', cursor: 'pointer', zIndex: 20 }} />
                                        )}
                                        {/* ✅ NEW: Checkbox */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrderIds.includes(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer bg-white shadow-md"
                                            />
                                        </div>

                                        <div onClick={() => handleViewOrder(order)} className="cursor-pointer">
                                            <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                                                {order.design_images && order.design_images.length > 0 ? (
                                                    <img src={`http://127.0.0.1:8000/storage/${order.design_images[0]}`} alt={order.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : order.design_image ? (
                                                    <img src={`http://127.0.0.1:8000/storage/${order.design_image}`} alt={order.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                                {(order.design_images && order.design_images.length > 1) && (
                                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">+{order.design_images.length - 1}</div>
                                                )}
                                                <div className="absolute bottom-2 left-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {capitalize(order.status.replace('_', ' '))}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{order.title}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Quantity:</span>
                                                        <span className="font-semibold text-gray-900">{order.quantity}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Price:</span>
                                                        <span className="font-bold text-blue-600">
                                                            {order.estimated_price ? formatCurrency(order.estimated_price) : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500">Submitted:</span>
                                                        <span className="text-gray-700">{formatDate(order.created_at)}</span>
                                                    </div>
                                                </div>
                                                {order.payment_verified_at && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                            Payment Verified
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ===== CREATE/EDIT ORDER MODAL ===== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isEditMode ? 'Edit Custom Order' : 'Request Custom Order'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {isEditMode ? 'Update your custom fabrication request' : 'Fill in your custom fabrication request'}
                                </p>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Title *</label>
                                    <input type="text" placeholder="e.g., Custom Trophy Stand" value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                    <textarea placeholder="Describe your project..." rows="4" value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={formState.quantity}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Only allow numbers
                                            if (value === '' || /^\d+$/.test(value)) {
                                                setFormState({ ...formState, quantity: value });
                                            }
                                        }}
                                        placeholder="Enter quantity"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Design Images <span className="text-red-500">*</span>
                                        <span className="text-xs text-gray-500 ml-2">(Up to 5 images)</span>
                                    </label>

                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                                    <img src={preview} alt={`Design ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">Image {index + 1}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {formState.design_images.length < 5 && (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
                                            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="design-images-upload" />
                                            <label htmlFor="design-images-upload" className="cursor-pointer block p-6 text-center">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                                                <p className="text-xs text-gray-500 mt-1">{formState.design_images.length}/5 uploaded</p>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0">
                                <button type="button" onClick={closeAllModals} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {submitting ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? '💾 Save Changes' : 'Submit Request')}
                                </button>
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
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            {selectedOrder.design_images && selectedOrder.design_images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedOrder.design_images.map((img, idx) => (
                                        <div key={idx} className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={`http://127.0.0.1:8000/storage/${img}`} alt={`${selectedOrder.title} - Design ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : selectedOrder.design_image ? (
                                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`} alt={selectedOrder.title} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-sm text-gray-500">No design image uploaded</p>
                                    </div>
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

                            {(selectedOrder.status === 'rejected' || selectedOrder.status === 'payment_rejected') && selectedOrder.rejection_reason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm font-semibold text-red-800 mb-1">
                                        {selectedOrder.status === 'payment_rejected' ? '⚠️ Payment Rejection Reason:' : '❌ Design Rejection Reason:'}
                                    </p>
                                    <p className="text-sm text-red-700">{selectedOrder.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                            <div className="flex items-center justify-end gap-3">
                                {!selectedOrder.payment_verified_at && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                                    <button onClick={() => handleCancelOrder(selectedOrder.id)} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                        Cancel Order
                                    </button>
                                )}

                                {!selectedOrder.estimated_price &&
                                    selectedOrder.status !== 'payment_rejected' &&
                                    selectedOrder.status !== 'completed' &&
                                    selectedOrder.status !== 'cancelled' && (
                                        <button
                                            onClick={() => handleEditOrder(selectedOrder)}
                                            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                    )}

                                {selectedOrder.status === 'payment_rejected' && (
                                    <button onClick={handleOpenCheckout} className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Re-upload Payment
                                    </button>
                                )}

                                {selectedOrder.estimated_price &&
                                    !selectedOrder.payment_verified_at &&
                                    selectedOrder.status !== 'cancelled' &&
                                    selectedOrder.status !== 'payment_rejected' && (
                                        <button onClick={handleOpenCheckout} className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                            Make Payment
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CHECKOUT MODAL ===== */}
            {showCheckoutModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Checkout</h3>
                                <p className="text-sm text-gray-500 mt-1">Select delivery option</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="px-6 pt-6">
                            <div className="flex items-center justify-center">
                                <div className="flex items-center w-full max-w-md">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">1</div>
                                    <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold">2</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Delivery Option</h4>
                                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${deliveryOption === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setDeliveryOption('pickup')}>
                                        <div className="flex items-start gap-3">
                                            <input type="radio" name="delivery" checked={deliveryOption === 'pickup'} onChange={() => { }} className="w-4 h-4 text-blue-600 mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <p className="font-medium text-gray-900">Self Pick Up</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 ml-7">Pick up your order from JNEC Fab Lab during working hours (9 AM - 5 PM)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${deliveryOption === 'shipping' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setDeliveryOption('shipping')}>
                                        <div className="flex items-start gap-3">
                                            <input type="radio" name="delivery" checked={deliveryOption === 'shipping'} onChange={() => { }} className="w-4 h-4 text-blue-600 mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                                    <p className="font-medium text-gray-900">Ship to Address</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 ml-7">We will ship your order to your provided address. Shipping cost must be bare by you</p>
                                            </div>
                                        </div>
                                    </div>

                                    {deliveryOption === 'shipping' && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
                                            <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Enter your current address" required />
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                                            {selectedOrder.design_images && selectedOrder.design_images.length > 0 ? (
                                                <img src={`http://127.0.0.1:8000/storage/${selectedOrder.design_images[0]}`} alt={selectedOrder.title} className="w-12 h-12 rounded object-cover" />
                                            ) : selectedOrder.design_image ? (
                                                <img src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`} alt={selectedOrder.title} className="w-12 h-12 rounded object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                                                <span className="text-gray-600">Total:</span>
                                                <span className="font-bold text-blue-600 text-lg">{formatCurrency(selectedOrder.estimated_price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button onClick={closeAllModals} className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
                            <button onClick={handleContinueToPayment} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Continue to Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PAYMENT MODAL ===== */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <form onSubmit={handleUploadPayment} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Payment</h3>
                                <p className="text-sm text-gray-500 mt-1">Upload payment screenshot</p>
                            </div>
                            <button type="button" onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="px-6 pt-6 flex-shrink-0">
                            <div className="flex items-center justify-center">
                                <div className="flex items-center w-full max-w-md">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">1</div>
                                    <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">2</div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-600">Bank Name:</span><span className="font-medium">BOB Bank</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">Account Name:</span><span className="font-medium">JNEC Fab Lab</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">Account Number:</span><span className="font-medium">200123456789</span></div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot *</label>
                                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-blue-50">
                                            <input type="file" accept="image/*" className="hidden" id="payment-screenshot-upload" required />
                                            <label htmlFor="payment-screenshot-upload" className="cursor-pointer block">
                                                <svg className="w-16 h-16 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
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
                                            {selectedOrder.design_images && selectedOrder.design_images.length > 0 ? (
                                                <img src={`http://127.0.0.1:8000/storage/${selectedOrder.design_images[0]}`} alt={selectedOrder.title} className="w-12 h-12 rounded object-cover" />
                                            ) : selectedOrder.design_image ? (
                                                <img src={`http://127.0.0.1:8000/storage/${selectedOrder.design_image}`} alt={selectedOrder.title} className="w-12 h-12 rounded object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{selectedOrder.title}</p>
                                                <p className="text-xs text-gray-500">Qty: {selectedOrder.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.estimated_price)}</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-bold text-blue-600 text-lg">{formatCurrency(selectedOrder.estimated_price)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                            <button type="button" onClick={() => { setShowPaymentModal(false); setShowCheckoutModal(true); }} className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium">{submitting ? 'Submitting...' : 'Submit Order'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== SUCCESS MODAL ===== */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-600 text-sm mb-6">Thank you for your order. We are verifying your payment details and will update you soon.</p>
                        <button onClick={closeAllModals} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
                    </div>
                </div>
            )}

            {/* ✅ Custom Alert Modal */}
            {customAlert.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 animate-fade-in">
                        <div className={`px-6 py-4 border-b ${customAlert.type === 'success' ? 'bg-green-50 border-green-100' :
                            customAlert.type === 'error' ? 'bg-red-50 border-red-100' :
                                customAlert.type === 'warning' ? 'bg-yellow-50 border-yellow-100' :
                                    'bg-blue-50 border-blue-100'
                            }`}>
                            <h3 className="text-lg font-bold text-gray-900">{customAlert.title}</h3>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${customAlert.type === 'success' ? 'bg-green-100' :
                                    customAlert.type === 'error' ? 'bg-red-100' :
                                        customAlert.type === 'warning' ? 'bg-yellow-100' :
                                            'bg-blue-100'
                                    }`}>
                                    {customAlert.type === 'success' ? (
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : customAlert.type === 'error' ? (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : customAlert.type === 'warning' ? (
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 leading-relaxed">{customAlert.message}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                            {customAlert.type === 'confirm' && (
                                <button
                                    onClick={() => setCustomAlert({ ...customAlert, show: false })}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (customAlert.onConfirm) {
                                        customAlert.onConfirm();
                                    }
                                    setCustomAlert({ ...customAlert, show: false });
                                }}
                                className={`px-6 py-2 rounded-lg transition-colors font-medium ${customAlert.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                    customAlert.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                        customAlert.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                                            'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {customAlert.type === 'confirm' ? 'Confirm' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}