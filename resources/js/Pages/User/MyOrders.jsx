import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';

export default function MyOrders() {
    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: true,
        machines: false,
        learning: false,
        explore: false,
        support: false,
    });

    // Order States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal States
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showScreenshotModal, setShowScreenshotModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Separate close functions
    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedOrder(null);
    };

    const closeScreenshotModal = () => {
        setShowScreenshotModal(false);
        // Keep selectedOrder for details modal
    };

    const closeAllModals = () => {
        setShowDetailsModal(false);
        setShowScreenshotModal(false);
        setSelectedOrder(null);
    };

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('auth_token');

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

    // Filter orders
    const filteredOrders = orders.filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const orderNumber = order.order_number?.toLowerCase() || '';
            const productName = order.items?.[0]?.name?.toLowerCase() || '';

            if (!orderNumber.includes(search) && !productName.includes(search)) {
                return false;
            }
        }

        // Date range filter
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

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
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

    // ✅ UPDATED: Images use /storage/ path
    const getProductImage = (order, item = null) => {
        let imagePath = null;

        // Get image path from item or order
        if (item) {
            imagePath = item.image || (item.images?.[0] ?? null);
        } else if (order.items?.[0]) {
            imagePath = order.items[0].image || (order.items[0].images?.[0] ?? null);
        }

        if (!imagePath) return null;

        // ✅ Add /storage/ prefix
        return `http://127.0.0.1:8000/storage/${imagePath}`;
    };

    // View order details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // View payment screenshot
    const handleViewScreenshot = async (order) => {
        try {
            const token = localStorage.getItem('auth_token');
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
            alert('❌ Failed to load payment screenshot');
        }
    };

    // ✅ Handle Reorder - Add items to cart
    const handleReorder = async (order) => {
        try {
            // Get current cart from localStorage
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

            // Add items from this order to cart
            const newItems = order.items.map(item => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                image: item.image || null,
                size: item.size || null,
            }));

            // Merge with existing cart (avoid duplicates by id)
            const updatedCart = [...currentCart];
            newItems.forEach(newItem => {
                const existingIndex = updatedCart.findIndex(cartItem => cartItem.id === newItem.id);
                if (existingIndex >= 0) {
                    // Update quantity if already in cart
                    updatedCart[existingIndex].quantity += newItem.quantity;
                } else {
                    // Add new item
                    updatedCart.push(newItem);
                }
            });

            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            // Show success message
            alert(`✅ ${newItems.length} item(s) added to cart!`);

        } catch (err) {
            console.error('Reorder error:', err);
            alert('❌ Failed to add items to cart');
        }
    };

    // ✅ Handle Cancel Order - Only for pending orders
    const handleCancelOrder = async (order) => {
        // Confirm cancellation
        const confirmed = window.confirm(
            `Are you sure you want to cancel order ${order.order_number}?\n\n` +
            `This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('auth_token');

            // Call backend API to cancel order
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
                alert('✅ Order cancelled successfully!');

                // Refresh orders list
                fetchOrders();

                // Close modal
                closeDetailsModal();
            }
        } catch (err) {
            console.error('Cancel error:', err);

            if (err.response?.data?.message) {
                alert(`❌ ${err.response.data.message}`);
            } else {
                alert('❌ Failed to cancel order. Please try again.');
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            <div className="flex-1">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-sm text-gray-600 mt-1">Track your Fab Lab product orders</p>
                        </div>
                    </div>
                </header>

                <main className="p-6">
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
                                to="/user/shop-products"
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
                            {/* Filters */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Search */}
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

                                {/* Clear Filters */}
                                {(statusFilter !== 'all' || searchTerm || dateFrom || dateTo) && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => {
                                                setStatusFilter('all');
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

                            {/* Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                        <p>No orders found matching your filters</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredOrders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        onClick={() => handleViewDetails(order)}
                                                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                                                    >
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
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="mt-4 text-sm text-gray-600">
                                Showing {filteredOrders.length} of {orders.length} order(s)
                            </div>
                        </>
                    )}
                </main>
            </div>

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
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Products Total:</span>
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(selectedOrder.total_amount - (selectedOrder.shipping_cost || 0))}
                                            </span>
                                        </div>
                                        {selectedOrder.shipping_cost > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Shipping Cost:</span>
                                                <span className="font-medium text-purple-600">{formatCurrency(selectedOrder.shipping_cost)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-blue-200 pt-2 flex justify-between">
                                            <span className="font-semibold text-gray-900">Total Paid:</span>
                                            <span className="text-xl font-bold text-blue-600">{formatCurrency(selectedOrder.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason (if applicable) */}
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
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                            alt="Payment Screenshot"
                                            className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setShowScreenshotModal(true)}
                                        />
                                        <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="text-center mt-6 flex gap-3 justify-center">
                                {/* Reorder Button - Show for all orders */}
                                <button
                                    onClick={() => handleReorder(selectedOrder)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reorder
                                </button>

                                {/* Cancel Button - Only for pending orders */}
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

                                {/* Close Button */}
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
        </div>
    );
}