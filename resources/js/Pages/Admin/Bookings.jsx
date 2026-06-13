import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Bookings() {
    const [activeTab, setActiveTab] = useState('machine-bookings');
    const [admin, setAdmin] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const hlParams = new URLSearchParams(location.search);
    const [highlightId, setHighlightId] = useState(() => {
        const id = hlParams.get('highlight') ? Number(hlParams.get('highlight')) : null;
        if (!id) return null;
        // ✅ If already seen/dismissed, don't show animation again on refresh
        try {
            const seen = JSON.parse(localStorage.getItem('hl_seen_bookings') || '[]');
            if (seen.includes(id)) return null;
        } catch { }
        return id;
    });

    // ✅ Persist dismissed dots in localStorage so they survive refresh
    const [dismissedDots, setDismissedDots] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('hl_dismissed_bookings') || '[]');
        } catch { return []; }
    });

    const dismissDot = (id) => {
        const updated = [...dismissedDots, id];
        setDismissedDots(updated);
        localStorage.setItem('hl_dismissed_bookings', JSON.stringify(updated));
        // ✅ Also mark as seen so border animation doesn't return on refresh
        try {
            const seen = JSON.parse(localStorage.getItem('hl_seen_bookings') || '[]');
            if (!seen.includes(id)) {
                localStorage.setItem('hl_seen_bookings', JSON.stringify([...seen, id]));
            }
        } catch { }
    };

    useEffect(() => {
        if (!highlightId) return;
        const tab = hlParams.get('tab');
        if (tab) setActiveTab(tab);
        const el = document.getElementById(`card-${highlightId}`);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }, []);

    // ✅ Fetch admin data from localStorage
    useEffect(() => {
        const storedAdmin = JSON.parse(localStorage.getItem('admin'));
        if (storedAdmin) {
            setAdmin(storedAdmin);
        }
    }, []);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ Profile click handler
    const handleProfileClick = () => {
        setShowDropdown(false);
        navigate('/admin/profile');
    };

    // ✅ Logout handler
    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_dashboard_data');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');
        sessionStorage.clear();
        navigate('/login', { replace: true });
    };

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // ✅ NEW: Custom Dialog States
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Modal States
    const [showScreenshotModal, setShowScreenshotModal] = useState(false);
    const [showImageLightbox, setShowImageLightbox] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ✅ NEW: Booking Details Modal
    const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [terminateLoading, setTerminateLoading] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [bookingToTerminate, setBookingToTerminate] = useState(null);

    // ✅ LOADING STATES
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState(null);

    // Dropdown States (simplified)
    const [showOrderStatusDropdown, setShowOrderStatusDropdown] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    // Backend State
    const [bookings, setBookings] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [error, setError] = useState(null);

    // Fetch data from API
    const fetchData = async () => {
        try {
            setInitialLoading(true);
            const token = localStorage.getItem('admin_token');

            const bookingsResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/bookings`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    date: dateFilter || null,
                    search: searchTerm || null,
                }
            });

            const ordersResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/product-orders`, {
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

    // Open terminate confirm modal
    const handleTerminateBooking = (bookingId) => {
        setBookingToTerminate(bookingId);
        setShowTerminateModal(true);
    };

    // Actually terminate after confirmation
    const confirmTerminate = async () => {
        if (!bookingToTerminate) return;
        setTerminateLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/bookings/${bookingToTerminate}/terminate`,
                {},
                { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }
            );
            setActionMessage('✅ Booking terminated. User notified via email.');
            fetchData();
            setShowTerminateModal(false);
            setShowBookingDetailsModal(false);
            setBookingToTerminate(null);
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
        return `${(import.meta.env.VITE_API_URL || 'http://192.168.255.97/api').replace('/api','')}/storage/${order.payment_screenshot}`;
    };

    const handleViewScreenshot = async (order) => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/product-orders/${order.id}/screenshot`, {
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

    // ✅ UPDATED: Show custom approve dialog
    const handleApproveOrder = (order) => {
        setSelectedOrder(order);
        setShowApproveDialog(true);
    };

    // ✅ UPDATED: Show custom reject dialog
    const handleRejectOrder = (order) => {
        setSelectedOrder(order);
        setRejectionReason('');
        setShowRejectDialog(true);
    };

    // ✅ NEW: Confirm approve action
    const confirmApproveOrder = async () => {
        if (!selectedOrder) return;

        setApproveLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/product-orders/${selectedOrder.id}/approve`, {}, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setActionMessage(`✅ Order ${selectedOrder.order_number} approved!`);
            fetchData();
            setShowScreenshotModal(false);
            setShowApproveDialog(false);
            setSelectedOrder(null);
        } catch (err) {
            console.error('Approve error:', err);
            if (err.response?.data?.message?.includes('not pending')) {
                setActionMessage(`✅ Order ${selectedOrder.order_number} was already approved!`);
                fetchData();
                setShowScreenshotModal(false);
                setShowApproveDialog(false);
                setSelectedOrder(null);
            } else {
                alert('❌ Failed to approve order');
            }
        } finally {
            setApproveLoading(false);
        }
    };

    // ✅ NEW: Confirm reject action
    const confirmRejectOrder = async () => {
        if (!selectedOrder || !rejectionReason.trim()) {
            alert('Please enter a rejection reason');
            return;
        }

        setRejectLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/product-orders/${selectedOrder.id}/reject`, {
                rejection_reason: rejectionReason
            }, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setActionMessage(`✅ Order ${selectedOrder.order_number} rejected!`);
            fetchData();
            setShowScreenshotModal(false);
            setShowRejectDialog(false);
            setSelectedOrder(null);
            setRejectionReason('');
        } catch (err) {
            console.error('Reject error:', err);
            if (err.response?.data?.message?.includes('not pending')) {
                setActionMessage(`✅ Order ${selectedOrder.order_number} was already rejected!`);
                fetchData();
                setShowScreenshotModal(false);
                setShowRejectDialog(false);
                setSelectedOrder(null);
            } else {
                alert('❌ Failed to reject order');
            }
        } finally {
            setRejectLoading(false);
        }
    };

    const handleDeleteOrder = (order) => {
        if (actionLoading) return;
        setOrderToDelete(order);
        setShowDeleteDialog(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/product-orders/${orderToDelete.id}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setActionMessage(`✅ Order ${orderToDelete.order_number} deleted!`);
            setShowDeleteDialog(false);
            setOrderToDelete(null);
            fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            setShowDeleteDialog(false);
            setOrderToDelete(null);
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
        setShowImageLightbox(false);
        setSelectedOrder(null);
        setShowBookingDetailsModal(false);
        setSelectedBooking(null);
    };

    // Highlight CSS
    useEffect(() => {
        const s = document.createElement('style');
        s.id = 'hl-style';
        s.textContent = `
            @keyframes hlPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0)} }
            .hl-card { border:2px solid #2563eb !important; animation:hlPulse 1.2s ease-in-out infinite; position:relative; }
            .hl-dot { position:absolute; top:10px; right:10px; width:10px; height:10px; background:#2563eb; border-radius:50%; border:2px solid white; box-shadow:0 0 0 2px #2563eb; cursor:pointer; z-index:10; }
        `;
        if (!document.getElementById('hl-style')) document.head.appendChild(s);
    }, []);

    return (
        <div className="flex-1">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Bookings & Orders</h2>
                        <p className="text-sm text-gray-600">Manage Machine Bookings and Product orders</p>
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
                                        <tr
                                            key={booking.id}
                                            id={`card-${booking.id}`}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer relative ${highlightId === booking.id ? 'hl-card' : ''}`}
                                            onClick={() => {
                                                handleViewBookingDetails(booking);
                                                if (highlightId === booking.id) {
                                                    setHighlightId(null);
                                                    try {
                                                        const seen = JSON.parse(localStorage.getItem('hl_seen_bookings') || '[]');
                                                        if (!seen.includes(booking.id)) localStorage.setItem('hl_seen_bookings', JSON.stringify([...seen, booking.id]));
                                                    } catch { }
                                                }
                                            }}
                                        >
                                            {highlightId === booking.id && !dismissedDots.includes(booking.id) && (
                                                <td style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, background: '#2563eb', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 2px #2563eb', cursor: 'pointer', zIndex: 10 }}
                                                    onClick={e => { e.stopPropagation(); dismissDot(booking.id); }} />
                                            )}
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.machine?.name}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{booking.user?.name}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{formatDate(booking.booking_date)}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{formatTimeSlot(booking.start_time, booking.end_time)}</td>
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

                {/* ✅ PRODUCT ORDERS TAB */}
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
                                <div key={order.id} id={`card-${order.id}`}
                                    className={`bg-white border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col relative ${highlightId === order.id ? 'hl-card' : 'border-gray-200'}`}
                                    onClick={() => {
                                        if (highlightId === order.id) {
                                            setHighlightId(null);
                                            try {
                                                const seen = JSON.parse(localStorage.getItem('hl_seen_bookings') || '[]');
                                                if (!seen.includes(order.id)) localStorage.setItem('hl_seen_bookings', JSON.stringify([...seen, order.id]));
                                            } catch { }
                                        }
                                    }}>
                                    {highlightId === order.id && !dismissedDots.includes(order.id) && (
                                        <div className="hl-dot" onClick={e => { e.stopPropagation(); dismissDot(order.id); }} />
                                    )}
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
                                        <img
                                            src={getScreenshotUrl(order)}
                                            alt={getProductName(order)}
                                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => handleViewScreenshot(order)}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                        />
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

            {/* ✅ Screenshot Modal - CORRECTED */}
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
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2">Payment Screenshot</p>
                                <img
                                    src={selectedOrder.image}
                                    alt={getProductName(selectedOrder)}
                                    className="w-full h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                                    onClick={() => setShowImageLightbox(true)}
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">Click image to view full size</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                    <button
                                        onClick={() => handleApproveOrder(selectedOrder)}
                                        disabled={approveLoading}
                                        className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${approveLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {approveLoading ? (<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Approve Order</>)}
                                    </button>
                                    <button
                                        onClick={() => handleRejectOrder(selectedOrder)}
                                        disabled={rejectLoading}
                                        className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${rejectLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                    >
                                        {rejectLoading ? (<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>Reject Order</>)}
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

            {/* ✅ NEW: Full-Size Image Lightbox */}
            {showImageLightbox && selectedOrder && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4" onClick={() => setShowImageLightbox(false)}>
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowImageLightbox(false)} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <img src={selectedOrder.image} alt={getProductName(selectedOrder)} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
                    </div>
                </div>
            )}

            {/* ✅ NEW: Custom Approve Dialog */}
            {showApproveDialog && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4" onClick={() => setShowApproveDialog(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center pt-8 pb-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        </div>
                        <div className="px-6 pb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Approve Order?</h3>
                            <p className="text-gray-600 mb-2">{selectedOrder.order_number}</p>
                            <p className="text-sm text-gray-500">This will confirm the payment and notify the user via email.</p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowApproveDialog(false)} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold">Cancel</button>
                            <button onClick={confirmApproveOrder} disabled={approveLoading} className={`flex-1 px-4 py-3 rounded-xl transition-colors font-semibold text-white ${approveLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                                {approveLoading ? 'Processing...' : 'Approve Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: Custom Reject Dialog */}
            {showRejectDialog && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4" onClick={() => setShowRejectDialog(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center pt-8 pb-4">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Reject Order</h3>
                            <p className="text-gray-600 mb-4 text-center">{selectedOrder.order_number}</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter reason for rejection..." rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" autoFocus />
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => { setShowRejectDialog(false); setRejectionReason(''); }} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold">Cancel</button>
                            <button onClick={confirmRejectOrder} disabled={rejectLoading || !rejectionReason.trim()} className={`flex-1 px-4 py-3 rounded-xl transition-colors font-semibold text-white ${rejectLoading || !rejectionReason.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                                {rejectLoading ? 'Processing...' : 'Reject Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: Booking Details Modal */}
            {showBookingDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedBooking.machine?.name}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-3">User Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-blue-600">Name</p><p className="font-medium text-gray-900">{selectedBooking.user?.name}</p></div>
                                    <div><p className="text-blue-600">Email</p><p className="font-medium text-gray-900">{selectedBooking.user?.email}</p></div>
                                    {selectedBooking.user?.phone && <div><p className="text-blue-600">Phone</p><p className="font-medium text-gray-900">{selectedBooking.user?.phone}</p></div>}
                                </div>
                            </div>
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Booking Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-gray-500">Machine</p><p className="font-medium text-gray-900">{selectedBooking.machine?.name}</p></div>
                                    <div><p className="text-gray-500">Type</p><p className="font-medium text-gray-900">{selectedBooking.machine?.type || 'N/A'}</p></div>
                                    <div><p className="text-gray-500">Date</p><p className="font-medium text-gray-900">{formatDate(selectedBooking.booking_date)}</p></div>
                                    <div><p className="text-gray-500">Time Slot</p><p className="font-medium text-gray-900">{formatTimeSlot(selectedBooking.start_time, selectedBooking.end_time)}</p></div>
                                    <div><p className="text-gray-500">Status</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusBadgeClass(selectedBooking.status)}`}>
                                            {selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming' ? 'Booked' : selectedBooking.status === 'cancelled' ? 'Cancelled' : selectedBooking.status === 'terminated' ? 'Terminated' : 'Booked'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming') && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div>
                                            <p className="text-sm font-semibold text-orange-900"></p>
                                            <p className="text-xs text-orange-700 mt-1">Use this if the user did not arrive for their scheduled time. They will receive an email notification.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
                            {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming') ? (
                                <button onClick={() => handleTerminateBooking(selectedBooking.id)} disabled={terminateLoading} className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${terminateLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-rose-700 text-white hover:bg-rose-800'}`}>
                                    {terminateLoading ? (<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Terminate Booking</>)}
                                </button>
                            ) : (
                                <div className="text-center text-sm text-gray-500">
                                    {selectedBooking.status === 'cancelled' ? 'This booking was cancelled by the user.' : selectedBooking.status === 'terminated' ? 'This booking was terminated due to no-show.' : 'No actions available.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Terminate Booking Confirmation Modal */}
            {showTerminateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={() => setShowTerminateModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tbModalIn .2s cubic-bezier(.16,1,.3,1) both' }}>
                        <style>{`@keyframes tbModalIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
                        <div className="flex justify-center pt-8 pb-2">
                            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            </div>
                        </div>
                        <div className="px-6 pt-3 pb-5 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Terminate Booking?</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">The user will be notified via email that they did not show up for their scheduled time.<br /><span className="text-rose-600 font-medium">This action cannot be undone.</span></p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => { setShowTerminateModal(false); setBookingToTerminate(null); }} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm">Cancel</button>
                            <button onClick={confirmTerminate} disabled={terminateLoading} className={`flex-1 py-3 rounded-xl transition-colors font-semibold text-sm text-white flex items-center justify-center gap-2 ${terminateLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-700 hover:bg-rose-800'}`}>
                                {terminateLoading ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Terminating…</>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>Yes, Terminate</>)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Custom Delete Order Confirmation Modal */}
            {showDeleteDialog && orderToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={() => { setShowDeleteDialog(false); setOrderToDelete(null); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'delModalIn .2s cubic-bezier(.16,1,.3,1) both' }}>
                        <style>{`@keyframes delModalIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
                        <div className="flex justify-center pt-8 pb-2">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                        </div>
                        <div className="px-6 pt-3 pb-5 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Are you sure you want to delete order <span className="font-semibold text-gray-900">{orderToDelete.order_number}</span>?<br /><span className="text-red-600 font-medium">This action cannot be undone.</span></p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => { setShowDeleteDialog(false); setOrderToDelete(null); }} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm">Cancel</button>
                            <button onClick={confirmDeleteOrder} disabled={actionLoading} className={`flex-1 py-3 rounded-xl transition-colors font-semibold text-sm text-white flex items-center justify-center gap-2 ${actionLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                                {actionLoading ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Deleting…</>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Yes, Delete</>)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}