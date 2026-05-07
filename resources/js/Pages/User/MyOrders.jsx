import React, { useState, useEffect } from 'react';
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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Filter & Search States
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await axios.get('http://127.0.0.1:8000/api/user/my-product-orders', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // setOrders(response.data.orders);

            // Sample data for now
            setOrders([
                {
                    id: 'ORD-2026-001',
                    order_date: '2026-05-05',
                    items: [
                        {
                            id: 1,
                            name: 'Jangchub Chorten',
                            size: '8 inch',
                            quantity: 2,
                            price: 1000,
                            image: null
                        }
                    ],
                    total_amount: 2000,
                    status: 'processing',
                    payment_status: 'paid',
                    delivery_option: 'pickup',
                    shipping_address: null,
                    payment_screenshot: 'payment_001.jpg'
                },
                {
                    id: 'ORD-2026-002',
                    order_date: '2026-05-03',
                    items: [
                        {
                            id: 8,
                            name: 'Phone Stand',
                            size: '4 x 3 inch',
                            quantity: 3,
                            price: 350,
                            image: null
                        },
                        {
                            id: 3,
                            name: 'Takin Figurine',
                            size: '4 inch',
                            quantity: 1,
                            price: 600,
                            image: null
                        }
                    ],
                    total_amount: 1650,
                    status: 'delivered',
                    payment_status: 'paid',
                    delivery_option: 'shipping',
                    shipping_address: 'House No. 123, Thimphu, Bhutan',
                    payment_screenshot: 'payment_002.jpg'
                },
                {
                    id: 'ORD-2026-003',
                    order_date: '2026-05-06',
                    items: [
                        {
                            id: 7,
                            name: 'Lotus Flower Lamp',
                            size: '7 inch',
                            quantity: 1,
                            price: 1200,
                            image: null
                        }
                    ],
                    total_amount: 1200,
                    status: 'pending',
                    payment_status: 'pending',
                    delivery_option: 'pickup',
                    shipping_address: null,
                    payment_screenshot: 'payment_003.jpg'
                },
                {
                    id: 'ORD-2026-004',
                    order_date: '2026-04-28',
                    items: [
                        {
                            id: 6,
                            name: 'Prayer Wheel',
                            size: '5 inch',
                            quantity: 2,
                            price: 750,
                            image: null
                        }
                    ],
                    total_amount: 1500,
                    status: 'cancelled',
                    payment_status: 'refunded',
                    delivery_option: 'pickup',
                    shipping_address: null,
                    payment_screenshot: 'payment_004.jpg'
                },
                {
                    id: 'ORD-2026-005',
                    order_date: '2026-05-01',
                    items: [
                        {
                            id: 5,
                            name: 'Dzong Model',
                            size: '10 inch',
                            quantity: 1,
                            price: 1500,
                            image: null
                        }
                    ],
                    total_amount: 1500,
                    status: 'shipped',
                    payment_status: 'paid',
                    delivery_option: 'shipping',
                    shipping_address: 'College of Engineering, Jigmi Namgyel Wangchuck, Serbithang, Thimphu',
                    payment_screenshot: 'payment_005.jpg'
                },
            ]);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Open order details modal
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            processing: 'bg-blue-100 text-blue-700 border border-blue-200',
            shipped: 'bg-purple-100 text-purple-700 border border-purple-200',
            delivered: 'bg-green-100 text-green-700 border border-green-200',
            cancelled: 'bg-red-100 text-red-700 border border-red-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    // Get payment status badge class
    const getPaymentStatusBadgeClass = (status) => {
        const badges = {
            paid: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            refunded: 'bg-gray-100 text-gray-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `Nu. ${amount.toLocaleString()}`;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        // Filter by status
        if (filterStatus !== 'all' && order.status !== filterStatus) {
            return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return order.id.toLowerCase().includes(query) ||
                order.items.some(item => item.name.toLowerCase().includes(query));
        }

        return true;
    });

    // Get status counts
    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-sm text-gray-600 mt-1">Track and manage your product orders</p>
                    </div>
                </header>

                {/* Orders Content */}
                <main className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading orders...</p>
                        </div>
                    ) : (
                        <>
                            {/* Search & Filter */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by order ID or product..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Status Filter Tabs */}
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        All ({statusCounts.all})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('pending')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'pending'
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Pending ({statusCounts.pending})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('processing')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'processing'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Processing ({statusCounts.processing})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('shipped')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'shipped'
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Shipped ({statusCounts.shipped})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('delivered')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'delivered'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Delivered ({statusCounts.delivered})
                                    </button>
                                </div>
                            </div>

                            {/* Orders List */}
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No orders found</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {searchQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}
                                    </p>
                                    {!searchQuery && (
                                        <Link
                                            to="/user/shop-products"
                                            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Browse Products
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            onClick={() => handleViewDetails(order)}
                                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            {/* Order Header */}
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Order ID</p>
                                                        <p className="font-semibold text-gray-900">{order.id}</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-gray-200"></div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Order Date</p>
                                                        <p className="font-medium text-gray-900">{formatDate(order.order_date)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Product Thumbnails */}
                                                    <div className="flex -space-x-2">
                                                        {order.items.slice(0, 3).map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center"
                                                            >
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                                ) : (
                                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="w-12 h-12 bg-gray-200 rounded-lg border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                                                +{order.items.length - 3}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Item Count & Total */}
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-600">
                                                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                        </p>
                                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(order.total_amount)}</p>
                                                    </div>

                                                    {/* View Details Button */}
                                                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                        View Details →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                <p className="text-sm text-gray-500">{selectedOrder.id} • {formatDate(selectedOrder.order_date)}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status Timeline */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Placed</p>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${['processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Processing</p>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${['shipped', 'delivered'].includes(selectedOrder.status)
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['shipped', 'delivered'].includes(selectedOrder.status)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Shipped</p>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${selectedOrder.status === 'delivered'
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.status === 'delivered'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Delivered</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-500">{item.size}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-blue-600">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Method</h4>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {selectedOrder.delivery_option === 'pickup' ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            )}
                                        </svg>
                                        <span>
                                            {selectedOrder.delivery_option === 'pickup'
                                                ? 'Self Pick Up'
                                                : 'Ship to Address'
                                            }
                                        </span>
                                    </div>
                                    {selectedOrder.shipping_address && (
                                        <p className="text-sm text-gray-600 mt-2">{selectedOrder.shipping_address}</p>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Payment Status</h4>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeClass(selectedOrder.payment_status)}`}>
                                        {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedOrder.total_amount)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {selectedOrder.status === 'pending' && (
                                    <button className="flex-1 px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                        Cancel Order
                                    </button>
                                )}
                                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                    Download Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}