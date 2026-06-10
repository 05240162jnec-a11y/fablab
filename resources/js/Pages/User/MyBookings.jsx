import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyBookings() {
    // Booking States
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // ✅ NEW: Toast Notification State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Highlight state (from notification click)
    const location = useLocation();
    const hlParams = new URLSearchParams(location.search);
    const [highlightId, setHighlightId] = useState(hlParams.get('highlight') ? Number(hlParams.get('highlight')) : null);
    const [dismissedDot, setDismissedDot] = useState(null);

    useEffect(() => {
        if (!highlightId) return;
        setFilterStatus('booked');
        const el = document.getElementById(`card-${highlightId}`);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
    }, []);

    // Inject highlight CSS
    useEffect(() => {
        const s = document.createElement('style');
        s.id = 'hl-style-bk';
        s.textContent = `
            @keyframes hlPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0)} }
            .hl-card { border:2px solid #2563eb !important; animation:hlPulse 1.2s ease-in-out infinite; }
        `;
        if (!document.getElementById('hl-style-bk')) document.head.appendChild(s);
    }, []);

    // Filter & Search States
    const [filterStatus, setFilterStatus] = useState('booked');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch bookings on mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // ✅ NEW: Toast Functions
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get(`http://127.0.0.1:8000/api/user/my-bookings?t=${Date.now()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            const apiBookings = response?.data?.bookings || [];

            setBookings(apiBookings.map((b) => ({
                id: b.id,
                start_date: b.start_date,
                end_date: b.end_date,
                status: b.status === 'confirmed' ? 'booked' : b.status,
                created_at: b.created_at,
                machine: {
                    id: b.machine_id,
                    name: b.machine_name,
                    type: b.machine_type || '',
                    location: b.machine_location || '',
                    image: b.machine_image || null,
                },
            })));

        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedBooking(null);
    };

    const openCancelConfirm = (bookingId) => {
        setSelectedBooking(bookings.find(b => b.id === bookingId));
        setShowCancelConfirm(true);
    };

    const confirmCancelBooking = async () => {
        if (!selectedBooking) return;

        try {
            setCancelling(true);
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/user/bookings/${selectedBooking.id}/cancel`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data.success) {
                setBookings(bookings.map(b =>
                    b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
                ));

                setShowCancelConfirm(false);
                closeDetailsModal();

                // ✅ Show Success Toast
                showToast('Booking cancelled successfully!', 'success');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showToast('Failed to cancel booking. Please try again.', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'booked':
                return 'bg-blue-100/70 backdrop-blur-md border border-blue-200/60 text-gray-900';
            case 'cancelled':
                return 'bg-red-100/70 backdrop-blur-md border border-red-200/60 text-gray-900';
            default:
                return 'bg-gray-100/70 backdrop-blur-md border border-gray-200/60 text-gray-900';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return formatDate(startDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (startDate === endDate) return formatDate(startDate);
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} - ${endStr}`;
    };

    const filteredBookings = bookings.filter(booking => {
        if (filterStatus === 'booked' && booking.status !== 'booked') return false;
        if (filterStatus === 'cancelled' && booking.status !== 'cancelled') return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return String(booking.id).toLowerCase().includes(query) ||
                booking.machine?.name?.toLowerCase().includes(query);
        }
        return true;
    });

    const statusCounts = {
        booked: bookings.filter(b => b.status === 'booked').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    return (
        <>
            {/* ✅ Toast Notification */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[100] animate-slide-in-right">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border-2 min-w-[320px] max-w-[500px] ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div className="flex-shrink-0">
                            {toast.type === 'success' ? (
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                        </div>
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button onClick={() => setToast({ ...toast, show: false })} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading bookings...</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Search by booking ID or machine name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-sm" />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <button onClick={() => setFilterStatus('booked')} className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterStatus === 'booked' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>Booked ({statusCounts.booked})</button>
                            <button onClick={() => setFilterStatus('cancelled')} className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterStatus === 'cancelled' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>Cancelled ({statusCounts.cancelled})</button>
                        </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-gray-500 text-lg font-medium">{filterStatus === 'booked' ? 'No booked machines' : 'No cancelled bookings'}</p>
                            <p className="text-gray-400 text-sm mt-1">{filterStatus === 'booked' ? 'Book a machine to see your bookings here' : 'Cancelled bookings will appear here'}</p>
                            {filterStatus === 'booked' && (
                                <Link to="/user/machines?tab=book" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium">Book a Machine</Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <div key={booking.id} id={`card-${booking.id}`}
                                    onClick={() => { handleViewDetails(booking); setHighlightId(null); }}
                                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 relative ${highlightId === booking.id ? 'hl-card' : 'border-gray-100'}`}>
                                    {highlightId === booking.id && dismissedDot !== booking.id && (
                                        <div onClick={e => { e.stopPropagation(); setDismissedDot(booking.id); }}
                                            style={{ position: 'absolute', top: 12, right: 12, width: 10, height: 10, background: '#2563eb', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 2px #2563eb', cursor: 'pointer', zIndex: 10 }} />
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {booking.machine.image ? (
                                                        <img src={booking.machine.image} alt={booking.machine.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.machine.name}</h3>
                                                    <p className="text-sm text-gray-500 mb-3">{booking.machine.type} • {booking.machine.location}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <span>{formatDateRange(booking.start_date, booking.end_date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">View Details <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeDetailsModal}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="relative bg-white px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                    <p className="text-sm text-gray-500 mt-1">Booking ID: {selectedBooking.id}</p>
                                </div>
                                <button onClick={closeDetailsModal} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 shadow-sm mb-6">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                    {selectedBooking.machine.image ? (
                                        <img src={selectedBooking.machine.image} alt={selectedBooking.machine.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{selectedBooking.machine.name}</h3>
                                    <p className="text-sm text-gray-600">{selectedBooking.machine.type}</p>
                                    <p className="text-sm text-gray-500">{selectedBooking.machine.location}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedBooking.status)}`}>{selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-xs text-gray-500 font-medium">Reserved Dates</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{formatDateRange(selectedBooking.start_date, selectedBooking.end_date)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-xs text-gray-500 font-medium">Reservation Made On</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedBooking.created_at)}</p>
                                </div>
                            </div>

                            {selectedBooking.status === 'booked' && (
                                <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-amber-900 mb-2">Important Notice</h4>
                                            <p className="text-sm text-amber-700 leading-relaxed">Please arrive on your reserved dates. You can cancel your booking anytime. Once cancelled, the dates will become available for other users.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedBooking.status === 'booked' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button onClick={() => openCancelConfirm(selectedBooking.id)} disabled={cancelling} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCancelConfirm && selectedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Cancel Booking?</h3>
                                    <p className="text-sm text-blue-700 mt-1">This action cannot be undone.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">Are you sure you want to cancel your booking for <span className="font-bold text-gray-900">"{selectedBooking.machine.name}"</span>?</p>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div className="text-sm text-gray-800">
                                        <p className="font-semibold mb-1 text-gray-900">What will happen:</p>
                                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                                            <li>Your booking will be <strong className="text-gray-900">cancelled</strong>.</li>
                                            <li>The reserved dates will become <strong className="text-gray-900">available for other users</strong>.</li>
                                            <li>You can book again anytime if needed.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Do you want to continue?</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <button onClick={() => setShowCancelConfirm(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={confirmCancelBooking} disabled={cancelling} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                                {cancelling ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Cancelling...
                                    </>
                                ) : 'Yes, Cancel Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}