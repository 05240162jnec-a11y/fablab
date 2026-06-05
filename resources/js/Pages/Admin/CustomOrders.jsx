import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDialog } from '../../Components/UniformDialogManager';

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
    const [showPaymentLightbox, setShowPaymentLightbox] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Selected Order
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Form States
    const [priceData, setPriceData] = useState({ estimated_price: '', price_breakdown: '' }); // ✅ Added breakdown
    const [assignData, setAssignData] = useState({ assigned_to: '' });
    const [paymentAction, setPaymentAction] = useState('approve');
    const [rejectionReason, setRejectionReason] = useState('');
    const [designRejectionReason, setDesignRejectionReason] = useState('');

    // UI States
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Bulk Delete States
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [isSelectAll, setIsSelectAll] = useState(false);

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
        fetchProductionTeam();
    }, []);

    useEffect(() => {
        setSelectedOrderIds([]);
        setIsSelectAll(false);
    }, [statusFilter, searchTerm]);

    // ✅ UPDATED: Fetch orders (Accepts override status to fix dropdown bug)
    const fetchOrders = async (overrideStatus = null) => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('admin_token');

            // Use overrideStatus if provided, otherwise use state
            const currentStatus = overrideStatus !== null ? overrideStatus : statusFilter;

            let url = 'http://127.0.0.1:8000/api/admin/custom-orders?';
            if (searchTerm) url += `search=${searchTerm}&`;
            if (currentStatus) url += `status=${currentStatus}`;

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

    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/update-price`,
                {
                    estimated_price: priceData.estimated_price,
                    price_breakdown: priceData.price_breakdown // ✅ Send breakdown
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            setShowPriceModal(false);
            fetchOrders();
        } catch (error) {
            console.error('Error updating price:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to update price'));
        } finally {
            setSubmitting(false);
        }
    };

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

            // ✅ Auto-open Assign Modal if approved
            if (paymentAction === 'approve') {
                // Refresh orders first to get updated status
                await fetchOrders();
                // Slight delay to ensure state is updated, then open assign modal
                setTimeout(() => {
                    openAssignModal(selectedOrder);
                }, 300);
            } else {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to verify payment'));
        } finally {
            setSubmitting(false);
        }
    };

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
            fetchOrders();
        } catch (error) {
            console.error('Error assigning order:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to assign order'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectDesign = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/custom-orders/${selectedOrder.id}/reject-design`,
                {
                    rejection_reason: designRejectionReason,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            setShowRejectModal(false);
            setShowDetailsModal(false);
            fetchOrders();
        } catch (error) {
            console.error('Error rejecting design:', error);
            setMessage('❌ ' + (error.response?.data?.message || 'Failed to reject design'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedOrderIds.length === 0) return;

        const { showConfirm } = useDialog();
        const confirmed = await showConfirm({
            title: 'Confirm bulk delete',
            message: `Are you sure you want to delete ${selectedOrderIds.length} order(s)? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });

        if (!confirmed) return;

        try {
            const authToken = localStorage.getItem('admin_token');
            const response = await axios.post(
                'http://127.0.0.1:8000/api/admin/custom-orders/bulk-delete',
                { order_ids: selectedOrderIds },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            setMessage('✅ ' + response.data.message);
            setSelectedOrderIds([]);
            setIsSelectAll(false);
            fetchOrders();
        } catch (error) {
            console.error('Error bulk deleting orders:', error);
            setMessage('❌ Failed to delete orders');
        }
    };

    const toggleSelectAll = () => {
        if (isSelectAll) {
            setSelectedOrderIds([]);
            setIsSelectAll(false);
        } else {
            setSelectedOrderIds(orders.map(order => order.id));
            setIsSelectAll(true);
        }
    };

    const toggleSelectOrder = (orderId) => {
        if (selectedOrderIds.includes(orderId)) {
            setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
            setIsSelectAll(false);
        } else {
            setSelectedOrderIds([...selectedOrderIds, orderId]);
            if (selectedOrderIds.length + 1 === orders.length) {
                setIsSelectAll(true);
            }
        }
    };

    const openDetailsModal = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const openPriceModal = (order) => {
        setSelectedOrder(order);
        setPriceData({
            estimated_price: order.estimated_price || '',
            price_breakdown: order.price_breakdown || '' // ✅ Load existing breakdown
        });
        setShowPriceModal(true);
    };

    const openPaymentModal = (order) => {
        setSelectedOrder(order);
        setPaymentAction('approve');
        setRejectionReason('');
        setShowPaymentModal(true);
    };

    const openAssignModal = (order) => {
        setSelectedOrder(order);
        setAssignData({ assigned_to: order.assigned_to || '' });
        setShowAssignModal(true);
    };

    const openLightbox = (index = 0) => {
        setLightboxImageIndex(index);
        setShowImageLightbox(true);
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
            'payment_rejected': 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatPrice = (price) => {
        if (!price) return 'Not set';
        return `Nu. ${parseFloat(price).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDesignImages = (order) => {
        if (order.design_images && Array.isArray(order.design_images) && order.design_images.length > 0) {
            return order.design_images;
        } else if (order.design_image) {
            return [order.design_image];
        }
        return [];
    };

    return (
        <div className="flex-1">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Custom Orders</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage custom design orders from users</p>
                </div>
            </header>

            <main className="p-6">
                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                        <button onClick={() => setMessage('')} className="float-right text-sm underline">Dismiss</button>
                    </div>
                )}

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by title or order number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => fetchOrders()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>

                        {/* ✅ FIXED: Status Dropdown Bug */}
                        <div className="w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    const newStatus = e.target.value;
                                    setStatusFilter(newStatus);
                                    fetchOrders(newStatus); // ✅ Pass directly to fetch
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="payment_rejected">Payment Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                            <input
                                                type="checkbox"
                                                checked={isSelectAll && orders.length > 0}
                                                onChange={toggleSelectAll}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map((order) => {
                                        const designImages = getDesignImages(order);

                                        return (
                                            <tr
                                                key={order.id}
                                                onClick={() => openDetailsModal(order)}
                                                className="hover:bg-gray-50 cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrderIds.includes(order.id)}
                                                        onChange={() => toggleSelectOrder(order.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                                            {designImages.length > 0 ? (
                                                                <>
                                                                    <img
                                                                        src={`http://127.0.0.1:8000/storage/${designImages[0]}`}
                                                                        alt={order.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
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
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className={`text-sm font-medium ${order.estimated_price ? 'text-green-700' : 'text-gray-400'}`}>
                                                        {formatPrice(order.estimated_price)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(order.assigned_user || order.assignedUser) ? (
                                                        <div>
                                                            <p className="text-sm text-gray-900">{(order.assigned_user || order.assignedUser).name}</p>
                                                            <p className="text-xs text-gray-500">{(order.assigned_user || order.assignedUser).email}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">Unassigned</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(order.status)}`}>
                                                        {order.status?.replace('_', ' ').toUpperCase()}
                                                    </span>
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

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
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
                                        <div className="relative">
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
                                        </div>
                                    );
                                })()}
                            </div>

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
                                    <p className="text-sm text-gray-500">Estimated Price</p>
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

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                            </div>

                            {(selectedOrder.assigned_user || selectedOrder.assignedUser) && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Assigned To</p>
                                    <p className="text-gray-900">{(selectedOrder.assigned_user || selectedOrder.assignedUser).name}</p>
                                    <p className="text-xs text-gray-500">{(selectedOrder.assigned_user || selectedOrder.assignedUser).email}</p>
                                    <p className="text-xs text-gray-500">Assigned: {formatDate(selectedOrder.assigned_at)}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>

                            {/* ✅ Hide buttons if order is rejected */}
                            {selectedOrder.status !== 'rejected' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            openPriceModal(selectedOrder);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                    >
                                        {selectedOrder.estimated_price ? 'Edit Price' : 'Set Price'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDesignRejectionReason('');
                                            setShowRejectModal(true);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                                    >
                                        Reject Design
                                    </button>
                                </>
                            )}

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

                            {selectedOrder.payment_verified_at && selectedOrder.status === 'in_progress' && !selectedOrder.assigned_to && (
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

            {/* Reject Design Modal */}
            {showRejectModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
                    <form onSubmit={handleRejectDesign} className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Reject Design</h3>
                            <p className="text-sm text-gray-500">Order: {selectedOrder.order_number}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                                <textarea
                                    value={designRejectionReason}
                                    onChange={(e) => setDesignRejectionReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    rows="4"
                                    placeholder="Explain why the design cannot be made..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
                                {submitting ? 'Rejecting...' : 'Reject Design'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ✅ UPDATED: Price Update Modal with Breakdown */}
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
                                    onChange={(e) => setPriceData({ ...priceData, estimated_price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter total price"
                                    required
                                />
                            </div>

                            {/* ✅ NEW: Price Breakdown Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Breakdown / Explanation</label>
                                <textarea
                                    value={priceData.price_breakdown}
                                    onChange={(e) => setPriceData({ ...priceData, price_breakdown: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    placeholder="e.g., For your total quantity of 5 items, the material cost is X and labor is Y, making the total Nu. 1500.00!"
                                />
                                <p className="text-xs text-gray-500 mt-1">This explanation will be sent to the user in the email.</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    💡 After updating, the user will receive an email notification with payment instructions.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setShowPriceModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                                {submitting ? 'Saving...' : (selectedOrder.estimated_price ? 'Update Price' : 'Set Price')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Payment Verification Modal - FIXED */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentModal(false)}>
                    <form onSubmit={handleVerifyPayment} className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Verify Payment</h3>
                            <p className="text-sm text-gray-500">Order: {selectedOrder.order_number}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot</p>
                                {selectedOrder.payment_screenshot ? (
                                    <>
                                        <div
                                            className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
                                            onClick={() => {
                                                // ✅ Open payment screenshot in lightbox
                                                setShowPaymentLightbox(true);
                                            }}
                                        >
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                                alt="Payment proof"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                                    </>
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            No screenshot uploaded
                                        </div>
                                    </div>
                                )}
                            </div>

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

            {/* ✅ NEW: Payment Screenshot Lightbox */}
            {showPaymentLightbox && selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
                    onClick={() => setShowPaymentLightbox(false)}
                >
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowPaymentLightbox(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                            <img
                                src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                alt="Payment Screenshot"
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        </div>

                        <div className="text-center text-white mt-4">
                            <p className="text-lg font-semibold">Payment Screenshot</p>
                            <p className="text-sm text-gray-300">{selectedOrder.order_number}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign to Production Modal */}
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
                                            {member.name} - {member.email}
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
                            <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400">
                                {submitting ? 'Assigning...' : 'Assign Order'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {showImageLightbox && selectedOrder && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowImageLightbox(false)}>
                    <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowImageLightbox(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {(() => {
                            const designImages = getDesignImages(selectedOrder);
                            if (designImages.length <= 1) return null;

                            return (
                                <>
                                    <button onClick={() => setLightboxImageIndex((prev) => (prev === 0 ? designImages.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all hover:scale-110 shadow-2xl">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={() => setLightboxImageIndex((prev) => (prev === designImages.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all hover:scale-110 shadow-2xl">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            );
                        })()}

                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                            {(() => {
                                const designImages = getDesignImages(selectedOrder);
                                const currentImage = designImages[lightboxImageIndex] || designImages[0];
                                return (
                                    <img src={`http://127.0.0.1:8000/storage/${currentImage}`} alt={`${selectedOrder.title} - Design ${lightboxImageIndex + 1}`} className="w-full h-auto max-h-[80vh] object-contain" />
                                );
                            })()}
                        </div>

                        <div className="text-center text-white mt-4">
                            <p className="text-lg font-semibold">{selectedOrder.title} - {selectedOrder.order_number}</p>
                            {(() => {
                                const designImages = getDesignImages(selectedOrder);
                                if (designImages.length > 1) {
                                    return <p className="text-sm mt-1 text-gray-300">Image {lightboxImageIndex + 1} of {designImages.length}</p>;
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