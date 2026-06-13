import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import UserBookMachine from '../User/BookMachine';

export default function ProductionTeamBookMachine() {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'book';

    const [activeTab, setActiveTab] = useState(initialTab);

    // All Bookings Tab State
    const [allBookings, setAllBookings] = useState([]);
    const [allBookingsLoading, setAllBookingsLoading] = useState(false);
    const [allBookingsError, setAllBookingsError] = useState(null);
    const [allBookingsSearch, setAllBookingsSearch] = useState('');
    const [allBookingsDateFilter, setAllBookingsDateFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
    const [terminateLoading, setTerminateLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);

    // My Bookings Tab State
    const [myBookings, setMyBookings] = useState([]);
    const [myBookingsLoading, setMyBookingsLoading] = useState(false);
    const [myBookingsError, setMyBookingsError] = useState(null);
    const [myBookingsFilter, setMyBookingsFilter] = useState('booked');

    // Fetch All Bookings (View-only)
    const fetchAllBookings = async () => {
        try {
            setAllBookingsLoading(true);
            setAllBookingsError(null);
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/bookings`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    search: allBookingsSearch || null,
                    date: allBookingsDateFilter || null,
                }
            });

            if (response.data.success) {
                setAllBookings(response.data.data || []);
            }
        } catch (err) {
            console.error('Fetch all bookings error:', err);
            setAllBookingsError('Failed to load bookings. Please try again.');
        } finally {
            setAllBookingsLoading(false);
        }
    };

    // Fetch My Bookings
    const fetchMyBookings = async () => {
        try {
            setMyBookingsLoading(true);
            setMyBookingsError(null);
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/my-bookings`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success || response.data.bookings) {
                setMyBookings(response.data.bookings || response.data.data || []);
            }
        } catch (err) {
            console.error('Fetch my bookings error:', err);
            setMyBookingsError('Failed to load your bookings. Please try again.');
        } finally {
            setMyBookingsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'all-bookings') {
            fetchAllBookings();
        } else if (activeTab === 'my-bookings') {
            fetchMyBookings();
        }
    }, [activeTab, allBookingsSearch, allBookingsDateFilter]);

    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTimeSlot = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        const formatTime = (time) => {
            const date = new Date(`2000-01-01T${time}`);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        };
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

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

    const filteredMyBookings = myBookings.filter(booking => {
        if (myBookingsFilter === 'booked') return booking.status === 'confirmed' || booking.status === 'upcoming';
        if (myBookingsFilter === 'cancelled') return booking.status === 'cancelled';
        return true;
    });

    const handleViewBookingDetails = (booking) => {
        setSelectedBooking(booking);
        setShowBookingDetailsModal(true);
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('⚠️ Cancel this booking?\n\nThis action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/bookings/${bookingId}/cancel`,
                {},
                { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }
            );
            setActionMessage('✅ Booking cancelled successfully.');
            fetchMyBookings();
            setShowBookingDetailsModal(false);
        } catch (err) {
            console.error('Cancel error:', err);
            alert('❌ Failed to cancel booking: ' + (err.response?.data?.message || err.message));
        }
    };

    const closeAllModals = () => {
        setShowBookingDetailsModal(false);
        setSelectedBooking(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ✅ Sticky Page Header */}
            <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 border-b border-gray-200">
                <div className="p-6 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Book a Machine</h2>
                    <p className="text-sm text-gray-600">Reserve lab equipment for your production tasks</p>
                </div>

                {/* Tab Navigation - Changed Purple to Blue */}
                <div className="px-6 border-b border-gray-200">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('book')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'book'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Book a Machine
                        </button>
                        <button
                            onClick={() => setActiveTab('all-bookings')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all-bookings'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            All Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('my-bookings')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my-bookings'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My Bookings
                        </button>
                    </nav>
                </div>
            </div>

            <div className="px-6 pb-6">
                {/* Action Message */}
                {actionMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{actionMessage}</span>
                        <button onClick={() => setActionMessage(null)} className="text-green-700 hover:text-green-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'book' && <UserBookMachine />}

                {activeTab === 'all-bookings' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-900">All Machine Bookings ({allBookings.length})</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input type="date" value={allBookingsDateFilter} onChange={(e) => setAllBookingsDateFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input type="text" placeholder="Search by machine or user..." value={allBookingsSearch} onChange={(e) => setAllBookingsSearch(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
                                </div>
                            </div>
                        </div>

                        {allBookingsLoading && <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}
                        {allBookingsError && !allBookingsLoading && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">{allBookingsError}</div>}

                        {!allBookingsLoading && !allBookingsError && (
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
                                        {allBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewBookingDetails(booking)}>
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
                        )}

                        {allBookings.length === 0 && !allBookingsLoading && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-gray-500 text-lg font-medium">No bookings found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'my-bookings' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">My Bookings ({filteredMyBookings.length})</h3>
                            <p className="text-sm text-gray-600">Your personal machine reservations</p>
                        </div>

                        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
                            <button onClick={() => setMyBookingsFilter('booked')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${myBookingsFilter === 'booked' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Booked ({myBookings.filter(b => b.status === 'confirmed' || b.status === 'upcoming').length})
                            </button>
                            <button onClick={() => setMyBookingsFilter('cancelled')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${myBookingsFilter === 'cancelled' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Cancelled ({myBookings.filter(b => b.status === 'cancelled').length})
                            </button>
                        </div>

                        {myBookingsLoading && <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}
                        {myBookingsError && !myBookingsLoading && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">{myBookingsError}</div>}

                        {!myBookingsLoading && !myBookingsError && (
                            <div className="space-y-4">
                                {filteredMyBookings.map((booking) => (
                                    <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewBookingDetails(booking)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{booking.machine_name}</h4>
                                                <p className="text-sm text-gray-500">{booking.machine_type || 'Equipment'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                            <div><p className="text-gray-500">Date</p><p className="font-medium text-gray-900">{formatDate(booking.start_date)}</p></div>
                                            <div><p className="text-gray-500">Location</p><p className="font-medium text-gray-900">{booking.machine_location || 'Fab Lab'}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredMyBookings.length === 0 && !myBookingsLoading && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-gray-500 text-lg font-medium">{myBookingsFilter === 'booked' ? 'No active bookings' : 'No cancelled bookings'}</p>
                                <p className="text-gray-400 text-sm mt-1">{myBookingsFilter === 'booked' ? 'Book a machine to see your reservations here' : 'Cancelled bookings will appear here'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ✅ Unified Booking Details Modal */}
            {showBookingDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedBooking.machine?.name || selectedBooking.machine_name}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-3">User Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-blue-600">Name</p><p className="font-medium text-gray-900">{selectedBooking.user?.name || 'You'}</p></div>
                                    <div><p className="text-blue-600">Email</p><p className="font-medium text-gray-900">{selectedBooking.user?.email || '—'}</p></div>
                                    {selectedBooking.user?.phone && <div><p className="text-blue-600">Phone</p><p className="font-medium text-gray-900">{selectedBooking.user?.phone}</p></div>}
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Booking Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-gray-500">Machine</p><p className="font-medium text-gray-900">{selectedBooking.machine?.name || selectedBooking.machine_name}</p></div>
                                    <div><p className="text-gray-500">Type</p><p className="font-medium text-gray-900">{selectedBooking.machine?.type || selectedBooking.machine_type || 'N/A'}</p></div>
                                    <div><p className="text-gray-500">Date</p><p className="font-medium text-gray-900">{formatDate(selectedBooking.booking_date || selectedBooking.start_date)}</p></div>
                                    <div><p className="text-gray-500">Time Slot</p><p className="font-medium text-gray-900">{formatTimeSlot(selectedBooking.start_time, selectedBooking.end_time)}</p></div>
                                    <div><p className="text-gray-500">Status</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusBadgeClass(selectedBooking.status)}`}>
                                            {selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming' ? 'Booked' :
                                                selectedBooking.status === 'cancelled' ? 'Cancelled' :
                                                    selectedBooking.status === 'terminated' ? 'Terminated' : 'Booked'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ Only show Cancel warning if viewing My Bookings */}
                            {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming') && activeTab === 'my-bookings' && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div>
                                            <p className="text-sm font-semibold text-red-900">Cancel Booking</p>
                                            <p className="text-xs text-red-700 mt-1">Cancel your reservation. This action cannot be undone.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ✅ Modal Footer - Hide buttons for All Bookings, Show Cancel for My Bookings */}
                        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
                            {activeTab === 'my-bookings' && (selectedBooking.status === 'confirmed' || selectedBooking.status === 'upcoming') ? (
                                <button
                                    onClick={() => handleCancelBooking(selectedBooking.id)}
                                    className="w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold bg-red-600 text-white hover:bg-red-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Cancel Booking
                                </button>
                            ) : (
                                <div className="text-center text-sm text-gray-500">
                                    {selectedBooking.status === 'cancelled' ? 'This booking was cancelled.' :
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