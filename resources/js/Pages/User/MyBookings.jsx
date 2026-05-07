import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';

export default function MyBookings() {
    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: false,
        machines: true,
        learning: false,
        explore: false,
        support: false,
    });

    // Booking States
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
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

    // Fetch bookings on mount
    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await axios.get('http://127.0.0.1:8000/api/user/my-bookings', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // setBookings(response.data.bookings);

            // Sample data for now
            setBookings([
                {
                    id: 'BKG-2026-001',
                    booking_date: '2026-05-08',
                    start_time: '09:00 AM',
                    end_time: '05:00 PM',
                    machine: {
                        id: 1,
                        name: 'Ultimaker S5',
                        type: '3D Printer',
                        location: 'Lab A - Station 1',
                        image: null
                    },
                    status: 'upcoming',
                    purpose: 'Final year project prototype',
                    created_at: '2026-05-05'
                },
                {
                    id: 'BKG-2026-002',
                    booking_date: '2026-05-03',
                    start_time: '10:00 AM',
                    end_time: '02:00 PM',
                    machine: {
                        id: 3,
                        name: 'Glowforge Pro',
                        type: 'Laser Cutter',
                        location: 'Lab B - Station 2',
                        image: null
                    },
                    status: 'completed',
                    purpose: 'Laser cut acrylic keychains',
                    created_at: '2026-05-01'
                },
                {
                    id: 'BKG-2026-003',
                    booking_date: '2026-05-10',
                    start_time: '01:00 PM',
                    end_time: '04:00 PM',
                    machine: {
                        id: 2,
                        name: 'Prusa MK4',
                        type: '3D Printer',
                        location: 'Lab A - Station 3',
                        image: null
                    },
                    status: 'upcoming',
                    purpose: 'Phone stand prototype',
                    created_at: '2026-05-06'
                },
                {
                    id: 'BKG-2026-004',
                    booking_date: '2026-04-28',
                    start_time: '09:00 AM',
                    end_time: '12:00 PM',
                    machine: {
                        id: 5,
                        name: 'Shapeoko 5 Pro',
                        type: 'CNC Router',
                        location: 'Lab C - Station 1',
                        image: null
                    },
                    status: 'cancelled',
                    purpose: 'Wooden prayer wheel',
                    created_at: '2026-04-25'
                },
                {
                    id: 'BKG-2026-005',
                    booking_date: '2026-05-01',
                    start_time: '02:00 PM',
                    end_time: '06:00 PM',
                    machine: {
                        id: 4,
                        name: 'Form 3L',
                        type: 'Resin 3D Printer',
                        location: 'Lab A - Station 2',
                        image: null
                    },
                    status: 'completed',
                    purpose: 'High detail figurine print',
                    created_at: '2026-04-29'
                },
            ]);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Open booking details modal
    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const badges = {
            upcoming: 'bg-blue-100 text-blue-700 border border-blue-200',
            completed: 'bg-green-100 text-green-700 border border-green-200',
            cancelled: 'bg-red-100 text-red-700 border border-red-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time
    const formatTime = (timeString) => {
        return timeString;
    };

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        // Filter by status
        if (filterStatus !== 'all' && booking.status !== filterStatus) {
            return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return booking.id.toLowerCase().includes(query) ||
                booking.machine.name.toLowerCase().includes(query) ||
                booking.purpose.toLowerCase().includes(query);
        }

        return true;
    });

    // Get status counts
    const statusCounts = {
        all: bookings.length,
        upcoming: bookings.filter(b => b.status === 'upcoming').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
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
                        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-sm text-gray-600 mt-1">View and manage your machine bookings</p>
                    </div>
                </header>

                {/* Bookings Content */}
                <main className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading bookings...</p>
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
                                        placeholder="Search by booking ID, machine, or purpose..."
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
                                        onClick={() => setFilterStatus('upcoming')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'upcoming'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Upcoming ({statusCounts.upcoming})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('completed')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'completed'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Completed ({statusCounts.completed})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('cancelled')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'cancelled'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        Cancelled ({statusCounts.cancelled})
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{statusCounts.upcoming}</p>
                                            <p className="text-sm text-gray-600">Upcoming Bookings</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{statusCounts.completed}</p>
                                            <p className="text-sm text-gray-600">Completed</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{statusCounts.cancelled}</p>
                                            <p className="text-sm text-gray-600">Cancelled</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bookings List */}
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No bookings found</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {searchQuery ? 'Try a different search term' : 'Book a machine to see your bookings here'}
                                    </p>
                                    {!searchQuery && (
                                        <Link
                                            to="/user/book-machine"
                                            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Book a Machine
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            onClick={() => handleViewDetails(booking)}
                                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    {/* Left Side - Machine & Date */}
                                                    <div className="flex items-start gap-4">
                                                        {/* Machine Icon */}
                                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            {booking.machine.image ? (
                                                                <img src={booking.machine.image} alt={booking.machine.name} className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* Booking Info */}
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg">{booking.machine.name}</h3>
                                                            <p className="text-sm text-gray-500 mb-2">{booking.machine.type} • {booking.machine.location}</p>

                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>{formatDate(booking.booking_date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-gray-600 mt-2">
                                                                <span className="font-medium">Purpose:</span> {booking.purpose}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Right Side - Status & Action */}
                                                    <div className="flex flex-col items-end gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                        </span>

                                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                            View Details →
                                                        </button>
                                                    </div>
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

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                                <p className="text-sm text-gray-500">{selectedBooking.id}</p>
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
                            {/* Machine Info */}
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                    {selectedBooking.machine.image ? (
                                        <img src={selectedBooking.machine.image} alt={selectedBooking.machine.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{selectedBooking.machine.name}</h3>
                                    <p className="text-sm text-gray-600">{selectedBooking.machine.type}</p>
                                    <p className="text-sm text-gray-500">{selectedBooking.machine.location}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedBooking.status)}`}>
                                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                </span>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedBooking.booking_date)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Time Slot</p>
                                    <p className="font-semibold text-gray-900">{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Booked On</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedBooking.created_at)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                                    <p className="font-semibold text-gray-900">{selectedBooking.id}</p>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Purpose of Booking</p>
                                <p className="text-gray-900">{selectedBooking.purpose}</p>
                            </div>

                            {/* Status Timeline */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-4">Booking Status</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBooking.status !== 'cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Booked</p>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${selectedBooking.status === 'upcoming' || selectedBooking.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBooking.status === 'upcoming' || selectedBooking.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Upcoming</p>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${selectedBooking.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBooking.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Completed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notice */}
                            {selectedBooking.status === 'upcoming' && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800">Important Notice</p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Please arrive 10 minutes before your booking time. You can cancel up to 24 hours before the booking date.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {selectedBooking.status === 'upcoming' && (
                                    <button className="flex-1 px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                        Cancel Booking
                                    </button>
                                )}
                                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                    Download Confirmation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}