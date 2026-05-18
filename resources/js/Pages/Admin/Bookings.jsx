import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Bookings() {
    const [activeTab, setActiveTab] = useState('machine-bookings');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    // ✅ REMOVED: machineFilter, bookingStatusFilter (simplified UI)
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Modal States
    const [showScreenshotModal, setShowScreenshotModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ✅ NEW: Booking Details Modal
    const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [terminateLoading, setTerminateLoading] = useState(false);

    // ✅ LOADING STATES
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState(null);

    // Dropdown States (simplified)
    const [showOrderStatusDropdown, setShowOrderStatusDropdown] = useState(false);

    // Backend State
    const [bookings, setBookings] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [error, setError] = useState(null);

    // Fetch data from API
    const fetchData = async () => {
        try {
            setInitialLoading(true);
            const token = localStorage.getItem('admin_token');

            const bookingsResponse = await axios.get('http://127.0.0.1:8000/api/admin/bookings', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    // ✅ REMOVED: machine, status filters (simplified)
                    date: dateFilter || null,
                    search: searchTerm || null,
                }
            });

            const ordersResponse = await axios.get('http://127.0.0.1:8000/api/admin/product-orders', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    status: orderStatusFilter !== 'all' ? orderStatusFilter : null,
                    search: searchTerm || null,
                }
            });

            if (bookingsResponse.data.success && ordersResponse.data.success) {
                setBookings(bookingsResponse.data.data || []);
                setProductOrders(ordersResponse.data.data || []);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    // ✅ CLIENT-SIDE: Simplified booking filter (search + date only)
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = !searchTerm ||
            ((booking.machine?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (booking.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDate = !dateFilter || booking.booking_date === dateFilter;

        return matchesSearch && matchesDate;
    });

    // CLIENT-SIDE: Filter product orders (unchanged)
    const filteredOrders = productOrders.filter(order => {
        const productName = order.items?.[0]?.name || '';
        const userName = order.user?.name || '';
        const orderNumber = order.order_number || '';

        const matchesSearch = !searchTerm ||
            productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;

        return matchesSearch && matchesStatus;
    });

    // ✅ UPDATED: Simplified status badge (only Booked/Cancelled)
    const getBookingStatusBadgeClass = (status) => {
        // Map internal statuses to simple display
        const displayStatus = status === 'confirmed' || status === 'upcoming' ? 'Booked' :
            status === 'cancelled' ? 'Cancelled' :
                status === 'terminated' ? 'Terminated' : 'Booked';

        switch (displayStatus) {
            case 'Booked': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200';
            case 'Terminated': return 'bg-orange-100 text-orange-700 border border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    const getOrderStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'approved': return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1) || '';

    // ✅ UPDATED: Format time slot with real times
    const formatTimeSlot = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        const formatTime = (time) => {
            const date = new Date(`2000-01-01T${time}`);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        };
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ✅ NEW: Open booking details modal
    const handleViewBookingDetails = (booking) => {
        setSelectedBooking(booking);
        setShowBookingDetailsModal(true);
    };

    // ✅ NEW: Terminate booking (admin action for no-shows)
    const handleTerminateBooking = async (bookingId) => {
        if (!window.confirm('⚠️ Terminate this booking?\n\nThe user will be notified via email that they did not show up for their scheduled time.')) {
            return;
        }

        setTerminateLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(
                `http://127.0.0.1:8000/api/admin/bookings/${bookingId}/terminate`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            setActionMessage('✅ Booking terminated. User notified via email.');
            fetchData(); // Refresh list
            setShowBookingDetailsModal(false); // Close modal
        } catch (err) {
            console.error('Terminate error:', err);
            alert('❌ Failed to terminate booking: ' + (err.response?.data?.message || err.message));
        } finally {
            setTerminateLoading(false);
        }
    };

    const getTotalQuantity = (order) => {
        if (!order.items || !Array.isArray(order.items)) return 0;
        return order.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    };

    const getProductName = (order) => {
        return order.items?.[0]?.name || 'Unknown Product';
    };

    const getScreenshotUrl = (order) => {
        if (!order.payment_screenshot) return 'https://via.placeholder.com/400x300?text=No+Image';
        return `http://127.0.0.1:8000/storage/${order.payment_screenshot}`;
    };

    const handleViewScreenshot = async (order) => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/product-orders/${order.id}/screenshot`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setSelectedOrder({ ...order, image: response.data.image_url });
                setShowScreenshotModal(true);
            }
        } catch (err) {
            console.error('Screenshot error:', err);
            alert('❌ Failed to load screenshot');
        }
    };

    const handleApproveOrder = async (order) => {
        if (approveLoading) return;
        const confirmed = window.confirm(`Are you sure you want to approve order ${order.order_number}?`);
        if (!confirmed) return;
        setApproveLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/product-orders/${order.id}/approve`, {}, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setActionMessage(`✅ Order ${order.order_number} approved!`);
            fetchData();
            setShowScreenshotModal(false);
            setSelectedOrder(null);
        } catch (err) {
            console.error('Approve error:', err);
            if (err.response?.data?.message?.includes('not pending')) {
                setActionMessage(`✅ Order ${order.order_number} was already approved!`);
                fetchData();
                setShowScreenshotModal(false);
                setSelectedOrder(null);
            } else {
                alert('❌ Failed to approve order');
            }
        } finally {
            setApproveLoading(false);
        }
    };

    const handleRejectOrder = async (order) => {
        if (rejectLoading) return;
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        const confirmed = window.confirm(`Are you sure you want to reject order ${order.order_number}?\n\nReason: ${reason}`);
        if (!confirmed) return;
        setRejectLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/product-orders/${order.id}/reject`, { rejection_reason: reason }, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setActionMessage(`✅ Order ${order.order_number} rejected!`);
            fetchData();
            setShowScreenshotModal(false);
            setSelectedOrder(null);
        } catch (err) {
            console.error('Reject error:', err);
            if (err.response?.data?.message?.includes('not pending')) {
                setActionMessage(`✅ Order ${order.order_number} was already rejected!`);
                fetchData();
                setShowScreenshotModal(false);
                setSelectedOrder(null);
            } else {
                alert('❌ Failed to reject order');
            }
        } finally {
            setRejectLoading(false);
        }
    };

    const handleDeleteOrder = async (order) => {
        if (actionLoading) return;
        const confirmed = window.confirm(`Are you sure you want to delete order ${order.order_number}? This action cannot be undone.`);
        if (!confirmed) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://127.0.0.1:8000/api/admin/product-orders/${order.id}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setActionMessage(`✅ Order ${order.order_number} deleted!`);
            fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Failed to delete order: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchData();
            e.target.blur();
        }
    };

    const closeAllModals = () => {
        setShowScreenshotModal(false);
        setSelectedOrder(null);
        setShowBookingDetailsModal(false);
        setSelectedBooking(null);
    };

    return (
        <div className="flex-1">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Booking Management</h2>
                        <p className="text-sm text-gray-600">Manage machine bookings and product orders</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AD</div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6">
                <div className="mb-6">
                    <div className="flex gap-2 border-b border-gray-200">
                        <button onClick={() => setActiveTab('machine-bookings')} className={`px-4 py-2 font-medium transition-colors ${activeTab === 'machine-bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>Machine Bookings</button>
                        <button onClick={() => setActiveTab('product-orders')} className={`px-4 py-2 font-medium transition-colors ${activeTab === 'product-orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>Product Orders</button>
                    </div>
                </div>

                {actionMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{actionMessage}</span>
                        <button onClick={() => setActionMessage(null)} className="text-green-700 hover:text-green-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {initialLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && !initialLoading && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
                )}

                {/* ✅ MACHINE BOOKINGS TAB - SIMPLIFIED */}
                {!initialLoading && !error && activeTab === 'machine-bookings' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Machine Bookings ({filteredBookings.length})</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {/* ✅ REMOVED: Machine & Status dropdowns */}
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input type="text" placeholder="Search by machine or user..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearchKeyDown} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Machine</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Slot</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredBookings.map((booking) => (
                                        // ✅ CLICKABLE ROW
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleViewBookingDetails(booking)}
                                        >
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.machine?.name}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{booking.user?.name}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{formatDate(booking.booking_date)}</td>
                                            {/* ✅ REAL TIME SLOT */}
                                            <td className="py-4 px-4 text-sm text-gray-600">{formatTimeSlot(booking.start_time, booking.end_time)}</td>
                                            {/* ✅ SIMPLIFIED STATUS (read-only display) */}
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusBadgeClass(booking.status)}`}>
                                                    {booking.status === 'confirmed' || booking.status === 'upcoming' ? 'Booked' :
                                                        booking.status === 'cancelled' ? 'Cancelled' :
                                                            booking.status === 'terminated' ? 'Terminated' : 'Booked'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredBookings.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-gray-500 text-lg font-medium">No bookings found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ✅ PRODUCT ORDERS TAB (unchanged) */}
                {!initialLoading && !error && activeTab === 'product-orders' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <button onClick={() => setShowOrderStatusDropdown(!showOrderStatusDropdown)} className="w-full sm:w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between">
                                        <span className="text-sm text-gray-700">{orderStatusFilter === 'all' ? 'All Status' : capitalize(orderStatusFilter)}</span>
                                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${showOrderStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {showOrderStatusDropdown && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <button onClick={() => { setOrderStatusFilter('all'); setShowOrderStatusDropdown(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>All Status{orderStatusFilter === 'all' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</button>
                                            <button onClick={() => { setOrderStatusFilter('pending'); setShowOrderStatusDropdown(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Pending{orderStatusFilter === 'pending' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</button>
                                            <button onClick={() => { setOrderStatusFilter('approved'); setShowOrderStatusDropdown(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'approved' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Approved{orderStatusFilter === 'approved' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</button>
                                            <button onClick={() => { setOrderStatusFilter('rejected'); setShowOrderStatusDropdown(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'rejected' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Rejected{orderStatusFilter === 'rejected' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input type="text" placeholder="Search by user, product, or order #..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearchKeyDown} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
                                    {searchTerm && (
                                        <button onClick={fetchData} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600" title="Refresh search from server">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{getProductName(order)}</h3>
                                            <p className="text-sm text-gray-500">{order.order_number}</p>
                                        </div>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusBadgeClass(order.status)}`}>{capitalize(order.status)}</span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">Nu. {parseFloat(order.total_amount || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="mb-4 flex-1">
                                        <img src={getScreenshotUrl(order)} alt={getProductName(order)} className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => handleViewScreenshot(order)} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
                                        <p className="text-xs text-gray-500 mt-2 text-center">Click to view details</p>
                                    </div>
                                    <button onClick={() => handleDeleteOrder(order)} disabled={actionLoading} className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Clear
                                    </button>
                                </div>
                            ))}
                        </div>
                        {filteredOrders.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <p className="text-gray-500 text-lg font-medium">No orders found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ✅ Screenshot Modal (unchanged) */}
            {showScreenshotModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Payment Screenshot</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedOrder.order_number} • {selectedOrder.user?.name || 'Unknown User'}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <img src={selectedOrder.image} alt={getProductName(selectedOrder)} className="w-full h-auto rounded-lg shadow-md" />
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.order_number}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">Delivery Option</p>
                                    <p className="font-semibold text-gray-900 capitalize">{selectedOrder.delivery_option}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">User</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.user?.name || 'Unknown'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                                    <p className="font-semibold text-gray-900">{getTotalQuantity(selectedOrder)}</p>
                                </div>
                                {selectedOrder.shipping_address && (
                                    <div className="col-span-2 bg-white p-4 rounded-lg border border-purple-200 bg-purple-50">
                                        <p className="text-sm text-purple-700 font-semibold mb-1">📦 Shipping Address</p>
                                        <p className="text-gray-900">{selectedOrder.shipping_address}</p>
                                    </div>
                                )}
                                <div className="col-span-2 bg-white p-4 rounded-lg border border-blue-200 bg-blue-50">
                                    <p className="text-sm text-blue-700 font-semibold mb-3">💰 Payment Breakdown</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Products Total:</span>
                                            <span className="font-medium">Nu. {(parseFloat(selectedOrder.total_amount || 0) - parseFloat(selectedOrder.shipping_cost || 0)).toFixed(2)}</span>
                                        </div>
                                        {selectedOrder.delivery_option === 'shipping' && selectedOrder.shipping_cost > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Shipping Cost (Fixed):</span>
                                                <span className="font-medium text-purple-600">Nu. {parseFloat(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-base pt-2 border-t border-blue-200">
                                            <span className="font-semibold text-gray-900">Total Paid:</span>
                                            <span className="font-bold text-blue-600">Nu. {parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-2">Items Ordered</p>
                                    <ul className="space-y-2">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                                                <span className="font-medium">Nu. {parseFloat(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
                            {selectedOrder.status === 'pending' ? (
                                <div className="flex gap-3">
                                    <button onClick={() => handleApproveOrder(selectedOrder)} disabled={approveLoading} className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${approveLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                        {approveLoading ? (<>
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>) : (<>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            Approve Order
                                        </>)}
                                    </button>
                                    <button onClick={() => handleRejectOrder(selectedOrder)} disabled={rejectLoading} className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${rejectLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                        {rejectLoading ? (<>
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>) : (<>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            Reject Order
                                        </>)}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusBadgeClass(selectedOrder.status)}`}>{capitalize(selectedOrder.status)}</span>
                                    {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                                        <p className="text-sm text-red-600 mt-2">Reason: {selectedOrder.rejection_reason}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: Booking Details Modal with Terminate Button */}
            {showBookingDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedBooking.machine?.name}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            {/* User Info */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-3">User Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-blue-600">Name</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600">Email</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.user?.email}</p>
                                    </div>
                                    {selectedBooking.user?.phone && (
                                        <div>
                                            <p className="text-blue-600">Phone</p>
                                            <p className="font-medium text-gray-900">{selectedBooking.user?.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Booking Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Booking Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Machine</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.machine?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Type</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.machine?.type || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date</p>
                                        <p className="font-medium text-gray-900">{formatDate(selectedBooking.booking_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Time Slot</p>
                                        <p className="font-medium text-gray-900">{formatTimeSlot(selectedBooking.start_time, selectedBooking.end_time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusBadgeClass(selectedBooking.status)}`}>
                                            {selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming' ? 'Booked' :
                                                selectedBooking.status === 'cancelled' ? 'Cancelled' :
                                                    selectedBooking.status === 'terminated' ? 'Terminated' : 'Booked'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Termination Warning (only for Booked status) */}
                            {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming') && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-orange-900">No-Show Termination</p>
                                            <p className="text-xs text-orange-700 mt-1">
                                                Use this if the user did not arrive for their scheduled time. They will receive an email notification.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
                            {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming') ? (
                                <button
                                    onClick={() => handleTerminateBooking(selectedBooking.id)}
                                    disabled={terminateLoading}
                                    className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${terminateLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                                >
                                    {terminateLoading ? (<>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>) : (<>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        ⚠️ Terminate Booking (No-Show)
                                    </>)}
                                </button>
                            ) : (
                                <div className="text-center text-sm text-gray-500">
                                    {selectedBooking.status === 'cancelled' ? 'This booking was cancelled by the user.' :
                                        selectedBooking.status === 'terminated' ? 'This booking was terminated due to no-show.' : 'No actions available.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}