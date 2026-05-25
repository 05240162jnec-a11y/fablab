import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CustomOrders() {
    // Data States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [productionTeam, setProductionTeam] = useState([]);

    // Modal States
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showImageLightbox, setShowImageLightbox] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

    // Selected Order
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Form States
    const [priceData, setPriceData] = useState({ estimated_price: '' });
    const [assignData, setAssignData] = useState({ assigned_to: '' });
    const [paymentAction, setPaymentAction] = useState('approve');
    const [rejectionReason, setRejectionReason] = useState('');

    // UI States
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
        fetchProductionTeam();
    }, []);

    // Fetch orders with filters
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('admin_token');

            let url = 'http://127.0.0.1:8000/api/admin/custom-orders?';
            if (searchTerm) url += `search=${searchTerm}&`;
            if (statusFilter) url += `status=${statusFilter}`;

            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            setOrders(response.data.data.data || response.data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setMessage('❌ Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Fetch production team for dropdown
    const fetchProductionTeam = async () => {
        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/custom-orders/production-team', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setProductionTeam(response.data.data || []);
        } catch (error) {
            console.error('Error fetching production team:', error);
        }
    };

    // ✅ Update price and notify user via email
    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/update-price`,
                { estimated_price: priceData.estimated_price },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            setShowPriceModal(false);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error updating price:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to update price'));
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Verify payment (approve/reject)
    const handleVerifyPayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/verify-payment`,
                {
                    action: paymentAction,
                    rejection_reason: paymentAction === 'reject' ? rejectionReason : null,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            setShowPaymentModal(false);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error verifying payment:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to verify payment'));
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Assign order to production team
    const handleAssign = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/assign`,
                { assigned_to: assignData.assigned_to },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            setShowAssignModal(false);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error assigning order:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to assign order'));
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Update order status (reject, complete, etc.)
    const handleUpdateStatus = async (newStatus) => {
        setSubmitting(true);
        setMessage('');

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/update-status`,
                {
                    status: newStatus,
                    rejection_reason: newStatus === 'rejected' ? rejectionReason : null,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to update status'));
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Delete order
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            const authToken = localStorage.getItem('admin_token');
            await axios.delete(`http://127.0.0.1:8000/api/admin/custom-orders/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setMessage('✅ Order deleted successfully');
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error deleting order:', error);
            setMessage('❌ Failed to delete order');
        }
    };

    // Open order details modal
    const openDetailsModal = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // Open price update modal
    const openPriceModal = (order) => {
        setSelectedOrder(order);
        setPriceData({ estimated_price: order.estimated_price || '' });
        setShowPriceModal(true);
    };

    // Open payment verification modal
    const openPaymentModal = (order) => {
        setSelectedOrder(order);
        setPaymentAction('approve');
        setRejectionReason('');
        setShowPaymentModal(true);
    };

    // Open assign modal
    const openAssignModal = (order) => {
        setSelectedOrder(order);
        setAssignData({ assigned_to: order.assigned_to || '' });
        setShowAssignModal(true);
    };

    // ✅ Open lightbox with specific image index
    const openLightbox = (index = 0) => {
        setLightboxImageIndex(index);
        setShowImageLightbox(true);
    };

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
            'price_updated': 'bg-purple-100 text-purple-800 border-purple-200',
            'payment_pending': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'payment_verified': 'bg-teal-100 text-teal-800 border-teal-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Format price
    const formatPrice = (price) => {
        if (!price) return 'Not set';
        return `Nu. ${parseFloat(price).toFixed(2)}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // ✅ Get all design images (handle both old and new format)
    const getDesignImages = (order) => {
        if (order.design_images && Array.isArray(order.design_images) && order.design_images.length > 0) {
            return order.design_images;
        } else if (order.design_image) {
            // Fallback for old single-image orders
            return [order.design_image];
        }
        return [];
    };

    return (
        // ✅ JUST the main content - sidebar is in AdminLayout now
        <div className="flex-1">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Custom Orders</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage custom design orders from users</p>
                </div>
            </header>

            <main className="p-6">
                {/* Message Display */}
                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                        <button onClick={() => setMessage('')} className="float-right text-sm underline">Dismiss</button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by title or order number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="price_updated">Price Updated</option>
                                <option value="payment_pending">Payment Pending</option>
                                <option value="payment_verified">Payment Verified</option>
                            </select>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading orders...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map((order) => {
                                        const designImages = getDesignImages(order);

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* ✅ Image with lightbox trigger and multiple images indicator */}
                                                        <div
                                                            className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 transition-colors"
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                openLightbox(0);
                                                            }}
                                                            title="Click to view larger"
                                                        >
                                                            {designImages.length > 0 ? (
                                                                <>
                                                                    <img
                                                                        src={`http://127.0.0.1:8000/storage/${designImages[0]}`}
                                                                        alt={order.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    {/* Multiple images indicator */}
                                                                    {designImages.length > 1 && (
                                                                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                                                                            +{designImages.length - 1}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{order.title}</p>
                                                            <p className="text-xs text-gray-500">{order.order_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{order.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className={`text-sm font-medium ${order.estimated_price ? 'text-green-700' : 'text-gray-400'}`}>
                                                        {formatPrice(order.estimated_price)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {order.payment_screenshot ? (
                                                        <button
                                                            onClick={() => openPaymentModal(order)}
                                                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                                                        >
                                                            View Screenshot
                                                        </button>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Not uploaded</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{order.assignedUser?.name || 'Unassigned'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(order.status)}`}>
                                                        {order.status?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openDetailsModal(order)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        {/* ✅ Update Price Button (changes to Edit after first update) */}
                                                        <button
                                                            onClick={() => openPriceModal(order)}
                                                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title={order.estimated_price ? "Edit Price" : "Set Price"}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        {/* ✅ Assign Button (only if payment verified and in_progress) */}
                                                        {order.payment_verified_at && order.status === 'in_progress' && (
                                                            <button
                                                                onClick={() => openAssignModal(order)}
                                                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Assign to Production"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDelete(order.id)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Order"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {orders.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No custom orders found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ✅ Order Details Modal - UPDATED FOR MULTIPLE IMAGES */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* ✅ Design Images - Grid for multiple images */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Design Images</p>
                                {(() => {
                                    const designImages = getDesignImages(selectedOrder);

                                    if (designImages.length === 0) {
                                        return (
                                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                                No images uploaded
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className={`grid gap-3 ${designImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                            {designImages.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-colors"
                                                    onClick={() => openLightbox(idx)}
                                                >
                                                    <img
                                                        src={`http://127.0.0.1:8000/storage/${img}`}
                                                        alt={`${selectedOrder.title} - Design ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {designImages.length > 1 && (
                                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                            {idx + 1} / {designImages.length}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                                <p className="text-xs text-gray-500 mt-1 text-center">Click any image to view larger</p>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order Number</p>
                                    <p className="font-medium">{selectedOrder.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Quantity</p>
                                    <p className="font-medium">{selectedOrder.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-medium">{selectedOrder.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedOrder.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Estimated P X Q Price</p>
                                    <p className={`font-medium ${selectedOrder.estimated_price ? 'text-green-700' : 'text-gray-400'}`}>
                                        {formatPrice(selectedOrder.estimated_price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(selectedOrder.status)}`}>
                                        {selectedOrder.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                            </div>

                            {/* Payment Screenshot */}
                            {selectedOrder.payment_screenshot && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot</p>
                                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                            alt="Payment proof"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Uploaded: {formatDate(selectedOrder.updated_at)}</p>
                                </div>
                            )}

                            {/* Assigned To */}
                            {selectedOrder.assignedUser && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Assigned To</p>
                                    <p className="text-gray-900">{selectedOrder.assignedUser.name} ({selectedOrder.assignedUser.department})</p>
                                    <p className="text-xs text-gray-500">Assigned: {formatDate(selectedOrder.assigned_at)}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>

                            {selectedOrder.payment_screenshot && !selectedOrder.payment_verified_at && (
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        openPaymentModal(selectedOrder);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Verify Payment
                                </button>
                            )}

                            {selectedOrder.estimated_price && selectedOrder.payment_verified_at && selectedOrder.status === 'in_progress' && !selectedOrder.assigned_to && (
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        openAssignModal(selectedOrder);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                >
                                    Assign to Production
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Price Update Modal */}
            {showPriceModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPriceModal(false)}>
                    <form onSubmit={handleUpdatePrice} className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedOrder.estimated_price ? 'Edit Price' : 'Set Price'}
                            </h3>
                            <p className="text-sm text-gray-500">Order: {selectedOrder.order_number}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Price (Nu.) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={priceData.estimated_price}
                                    onChange={(e) => setPriceData({ estimated_price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter price"
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    💡 After updating, the user will receive an email notification with payment instructions.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPriceModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {submitting ? 'Saving...' : (selectedOrder.estimated_price ? 'Update Price' : 'Set Price')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ✅ Payment Verification Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentModal(false)}>
                    <form onSubmit={handleVerifyPayment} className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Verify Payment</h3>
                            <p className="text-sm text-gray-500">Order: {selectedOrder.order_number}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Payment Screenshot */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot</p>
                                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                                    {selectedOrder.payment_screenshot ? (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                            alt="Payment proof"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            No screenshot uploaded
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="payment_action"
                                            value="approve"
                                            checked={paymentAction === 'approve'}
                                            onChange={(e) => setPaymentAction(e.target.value)}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">✅ Approve</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="payment_action"
                                            value="reject"
                                            checked={paymentAction === 'reject'}
                                            onChange={(e) => setPaymentAction(e.target.value)}
                                            className="text-red-600"
                                        />
                                        <span className="text-sm">❌ Reject</span>
                                    </label>
                                </div>
                            </div>

                            {/* Rejection Reason (only if rejecting) */}
                            {paymentAction === 'reject' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                        rows="3"
                                        placeholder="Explain why the payment was rejected..."
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:bg-gray-400 ${paymentAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {submitting ? 'Processing...' : (paymentAction === 'approve' ? 'Approve Payment' : 'Reject Payment')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ✅ Assign to Production Modal */}
            {showAssignModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAssignModal(false)}>
                    <form onSubmit={handleAssign} className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Assign to Production</h3>
                            <p className="text-sm text-gray-500">Order: {selectedOrder.order_number}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Team Member *</label>
                                <select
                                    value={assignData.assigned_to}
                                    onChange={(e) => setAssignData({ assigned_to: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    <option value="">-- Select a team member --</option>
                                    {productionTeam.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} - {member.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <p className="text-sm text-purple-800">
                                    💡 The assigned team member will be notified and can start working on this order.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                            >
                                {submitting ? 'Assigning...' : 'Assign Order'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ✅ Image Lightbox Modal - UPDATED FOR MULTIPLE IMAGES */}
            {showImageLightbox && selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowImageLightbox(false)}
                >
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowImageLightbox(false)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation Arrows */}
                        {(() => {
                            const designImages = getDesignImages(selectedOrder);
                            if (designImages.length <= 1) return null;

                            return (
                                <>
                                    <button
                                        onClick={() => setLightboxImageIndex((prev) => (prev === 0 ? designImages.length - 1 : prev - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setLightboxImageIndex((prev) => (prev === designImages.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            );
                        })()}

                        {/* Image Container */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                            {(() => {
                                const designImages = getDesignImages(selectedOrder);
                                const currentImage = designImages[lightboxImageIndex] || designImages[0];

                                return (
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${currentImage}`}
                                        alt={`${selectedOrder.title} - Design ${lightboxImageIndex + 1}`}
                                        className="w-full h-auto max-h-[80vh] object-contain"
                                    />
                                );
                            })()}
                        </div>

                        {/* Caption and Counter */}
                        <div className="text-center text-white mt-3">
                            <p className="text-sm">
                                {selectedOrder.title} - {selectedOrder.order_number}
                            </p>
                            {(() => {
                                const designImages = getDesignImages(selectedOrder);
                                if (designImages.length > 1) {
                                    return (
                                        <p className="text-xs mt-1">
                                            Image {lightboxImageIndex + 1} of {designImages.length}
                                        </p>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}