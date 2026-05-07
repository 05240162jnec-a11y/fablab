import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../Components/AdminSidebar';

export default function Bookings() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('machine-bookings');
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: true,
        operations: true,
        resources: false,
        contentMedia: false,
    });

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [machineFilter, setMachineFilter] = useState('all');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Modal States
    const [showScreenshotModal, setShowScreenshotModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Dropdown States
    const [showMachineDropdown, setShowMachineDropdown] = useState(false);
    const [showBookingStatusDropdown, setShowBookingStatusDropdown] = useState(false);
    const [showOrderStatusDropdown, setShowOrderStatusDropdown] = useState(false);

    // Backend State
    const [bookings, setBookings] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');

            // Fetch bookings
            const bookingsResponse = await axios.get('http://127.0.0.1:8000/api/admin/bookings', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    machine: machineFilter !== 'all' ? machineFilter : null,
                    status: bookingStatusFilter !== 'all' ? bookingStatusFilter : null,
                    date: dateFilter || null,
                    search: searchTerm || null,
                }
            });

            // Fetch product orders
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
                setBookings(bookingsResponse.data.data);
                setProductOrders(ordersResponse.data.data);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData();
    }, [activeTab, searchTerm, machineFilter, bookingStatusFilter, orderStatusFilter, dateFilter]);

    // Filter bookings (client-side for better UX)
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.machine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMachine = machineFilter === 'all' ||
            (machineFilter === '3d-printer' && booking.machine?.type.includes('3D')) ||
            (machineFilter === 'laser-cutter' && booking.machine?.type.includes('Laser')) ||
            (machineFilter === 'pcb-mill' && booking.machine?.type.includes('PCB')) ||
            (machineFilter === 'cnc-router' && booking.machine?.type.includes('CNC')) ||
            (machineFilter === 'vinyl-cutter' && booking.machine?.type.includes('Vinyl')) ||
            (machineFilter === 'soldering' && booking.machine?.type.includes('Soldering'));
        const matchesStatus = bookingStatusFilter === 'all' || booking.status === bookingStatusFilter;
        return matchesSearch && matchesMachine && matchesStatus;
    });

    // Filter product orders (client-side for better UX)
    const filteredOrders = productOrders.filter(order => {
        const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
        return matchesSearch && matchesStatus;
    });

    // Get status badge color for bookings
    const getBookingStatusBadgeClass = (status) => {
        switch (status) {
            case 'upcoming':
                return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'completed':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Get status badge color for orders
    const getOrderStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'approved':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Format time slot
    const formatTimeSlot = (startTime, endTime) => {
        const formatTime = (time) => {
            const date = new Date(`2000-01-01T${time}`);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        };
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Open screenshot modal
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

    // Approve order
    const handleApproveOrder = async (order) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/product-orders/${order.id}/approve`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchData(); // Refresh list
            alert(`✅ Order ${order.order_number} approved!`);
        } catch (err) {
            console.error('Approve error:', err);
            alert('❌ Failed to approve order');
        }
    };

    // Reject order
    const handleRejectOrder = async (order) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/product-orders/${order.id}/reject`, {
                rejection_reason: reason
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchData(); // Refresh list
            alert(`✅ Order ${order.order_number} rejected. Reason: ${reason}`);
        } catch (err) {
            console.error('Reject error:', err);
            alert('❌ Failed to reject order');
        }
    };

    // Update booking status
    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/bookings/${bookingId}/update-status`, {
                status: newStatus
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchData(); // Refresh list
            alert(`✅ Booking status updated to ${newStatus}`);
        } catch (err) {
            console.error('Update status error:', err);
            alert('❌ Failed to update booking status');
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowScreenshotModal(false);
        setSelectedOrder(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ Sidebar - Using Reusable AdminSidebar Component */}
            <AdminSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Booking Management</h2>
                            <p className="text-sm text-gray-600">Manage machine bookings and product orders</p>
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

                            {/* Admin Profile */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Booking Management Content */}
                <main className="p-6">
                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="flex gap-2 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('machine-bookings')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'machine-bookings'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Machine Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('product-orders')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'product-orders'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Product Orders
                            </button>
                        </div>
                    </div>

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

                    {/* Machine Bookings Tab */}
                    {!loading && !error && activeTab === 'machine-bookings' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Machine Bookings ({filteredBookings.length})</h3>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Date Filter */}
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    {/* All Machines Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMachineDropdown(!showMachineDropdown)}
                                            className="w-full sm:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {machineFilter === 'all' ? 'All Machines' :
                                                    machineFilter === '3d-printer' ? '3D Printer' :
                                                        machineFilter === 'laser-cutter' ? 'Laser Cutter' :
                                                            machineFilter === 'pcb-mill' ? 'PCB Mill' :
                                                                machineFilter === 'cnc-router' ? 'CNC Router' :
                                                                    machineFilter === 'vinyl-cutter' ? 'Vinyl Cutter' : 'Soldering Station'}
                                            </span>
                                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showMachineDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showMachineDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                <button
                                                    onClick={() => { setMachineFilter('all'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    All Machines
                                                    {machineFilter === 'all' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMachineFilter('3d-printer'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === '3d-printer' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    3D Printer
                                                    {machineFilter === '3d-printer' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMachineFilter('laser-cutter'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === 'laser-cutter' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Laser Cutter
                                                    {machineFilter === 'laser-cutter' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMachineFilter('pcb-mill'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === 'pcb-mill' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    PCB Mill
                                                    {machineFilter === 'pcb-mill' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMachineFilter('cnc-router'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === 'cnc-router' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    CNC Router
                                                    {machineFilter === 'cnc-router' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMachineFilter('vinyl-cutter'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === 'vinyl-cutter' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Vinyl Cutter
                                                    {machineFilter === 'vinyl-cutter' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMachineFilter('soldering'); setShowMachineDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${machineFilter === 'soldering' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Soldering Station
                                                    {machineFilter === 'soldering' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* All Status Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowBookingStatusDropdown(!showBookingStatusDropdown)}
                                            className="w-full sm:w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {bookingStatusFilter === 'all' ? 'All Status' : capitalize(bookingStatusFilter)}
                                            </span>
                                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showBookingStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showBookingStatusDropdown && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                <button
                                                    onClick={() => { setBookingStatusFilter('all'); setShowBookingStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${bookingStatusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    All Status
                                                    {bookingStatusFilter === 'all' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setBookingStatusFilter('upcoming'); setShowBookingStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${bookingStatusFilter === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Upcoming
                                                    {bookingStatusFilter === 'upcoming' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setBookingStatusFilter('completed'); setShowBookingStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${bookingStatusFilter === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Completed
                                                    {bookingStatusFilter === 'completed' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setBookingStatusFilter('cancelled'); setShowBookingStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${bookingStatusFilter === 'cancelled' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Cancelled
                                                    {bookingStatusFilter === 'cancelled' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Machine Bookings Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Machine Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Slot</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.machine?.name}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{booking.user?.name}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{formatDate(booking.booking_date)}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{formatTimeSlot(booking.start_time, booking.end_time)}</td>
                                                <td className="py-4 px-4">
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusBadgeClass(booking.status)}`}
                                                    >
                                                        <option value="upcoming">Upcoming</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredBookings.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No bookings found</p>
                                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Product Orders Tab */}
                    {!loading && !error && activeTab === 'product-orders' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* All Status Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowOrderStatusDropdown(!showOrderStatusDropdown)}
                                            className="w-full sm:w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {orderStatusFilter === 'all' ? 'All Status' : capitalize(orderStatusFilter)}
                                            </span>
                                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showOrderStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showOrderStatusDropdown && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                <button
                                                    onClick={() => { setOrderStatusFilter('all'); setShowOrderStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    All Status
                                                    {orderStatusFilter === 'all' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setOrderStatusFilter('pending'); setShowOrderStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Pending
                                                    {orderStatusFilter === 'pending' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setOrderStatusFilter('approved'); setShowOrderStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'approved' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Approved
                                                    {orderStatusFilter === 'approved' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setOrderStatusFilter('rejected'); setShowOrderStatusDropdown(false); }}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${orderStatusFilter === 'rejected' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Rejected
                                                    {orderStatusFilter === 'rejected' && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by user..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Orders Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">{order.order_number}</p>
                                                <h3 className="text-lg font-bold text-gray-900">{order.name}</h3>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusBadgeClass(order.status)}`}>
                                                {capitalize(order.status)}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 mb-1">User</p>
                                                <p className="font-medium text-gray-900">{order.user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Quantity</p>
                                                <p className="font-medium text-gray-900">{order.quantity}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-gray-500 mb-1">Order Date</p>
                                                <p className="font-medium text-gray-900">{formatDate(order.order_date)}</p>
                                            </div>
                                        </div>

                                        {/* Image */}
                                        <div className="mb-4">
                                            <img
                                                src={order.image ? `http://127.0.0.1:8000/storage/${order.image}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                                                alt={order.name}
                                                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                                onClick={() => handleViewScreenshot(order)}
                                            />
                                        </div>

                                        {/* View Screenshot Button */}
                                        <button
                                            onClick={() => handleViewScreenshot(order)}
                                            className="w-full py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-4"
                                        >
                                            View Screenshot
                                        </button>

                                        {/* Action Buttons */}
                                        {order.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveOrder(order)}
                                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectOrder(order)}
                                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {order.status === 'rejected' && order.rejection_reason && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800">
                                                    <span className="font-semibold">Rejection Reason:</span> {order.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {filteredOrders.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No orders found</p>
                                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ===== SCREENSHOT MODAL ===== */}
            {showScreenshotModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Transaction Screenshot</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedOrder.order_number} - {selectedOrder.name}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <img
                                src={selectedOrder.image}
                                alt={selectedOrder.name}
                                className="w-full h-auto rounded-lg"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}