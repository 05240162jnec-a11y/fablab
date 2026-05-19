import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function BookMachine() {
    // ✅ Initialize React Router navigate hook
    const navigate = useNavigate();

    // API Data States
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ NEW: User enrollment state
    const [userEnrollments, setUserEnrollments] = useState([]);

    // Booking States
    const [bookedDates, setBookedDates] = useState([]);
    const [bookingData, setBookingData] = useState({
        machine_id: '',
        start_date: '',
        end_date: '',
    });
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingMessage, setBookingMessage] = useState('');

    // Fetch machines and user enrollments on component mount
    useEffect(() => {
        fetchMachines();
        fetchUserEnrollments();
    }, []);

    const fetchMachines = async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/machines', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            setMachines(response.data.machines || response.data.data || []);
        } catch (error) {
            console.error('Error fetching machines:', error);
            setMachines([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Fetch user enrollments to check completion status
    const fetchUserEnrollments = async () => {
        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8000/api/user/my-courses', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // Store all enrollments
            setUserEnrollments(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            setUserEnrollments([]);
        }
    };

    // ✅ FIXED: Check if user has completed ANY course (GLOBAL check)
    const hasCompletedAnyCourse = () => {
        return userEnrollments.some(enrollment => enrollment.status === 'completed');
    };

    // ✅ FIXED: Check if user CAN book machines (GLOBAL check, not machine-specific)
    const canBookMachine = (machine) => {
        // Machine must be available
        if (machine.status !== 'available') return false;

        // ✅ User must have completed at least ONE course (any course)
        return hasCompletedAnyCourse();
    };

    const handleViewDetails = (machine) => {
        setSelectedMachine(machine);
        setShowDetailsModal(true);
    };

    const handleBookNow = (machine) => {
        if (!hasCompletedAnyCourse()) {
            alert('❌ You must complete at least one training course before booking machines. Please enroll in and complete a course first.');
            return;
        }

        setSelectedMachine(machine);
        setShowDetailsModal(false);
        setShowBookingModal(true);
        setBookingData({
            machine_id: machine.id,
            start_date: '',
            end_date: '',
        });
        setBookingMessage('');

        // ✅ CRITICAL: Fetch booked dates EVERY time modal opens
        fetchBookedDates(machine.id);
    };

    const fetchBookedDates = async (machineId) => {
        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.get(`http://127.0.0.1:8000/api/user/machines/${machineId}/booked-dates?t=${Date.now()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // ✅ DEBUG: Log the response
            console.log('📅 Fetched booked dates for machine', machineId, ':', response.data.dates);

            setBookedDates(response.data.dates || []);
        } catch (error) {
            console.error('Error fetching booked dates:', error);
            setBookedDates([]);
        }
    };

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const isDateRangeAvailable = (startDate, endDate) => {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            // ✅ Use local date formatting (same as calendar)
            const dateStr = [
                d.getFullYear(),
                String(d.getMonth() + 1).padStart(2, '0'),
                String(d.getDate()).padStart(2, '0')
            ].join('-');
            if (bookedDates.includes(dateStr)) return false;
        }
        return true;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingSubmitting(true);
        setBookingMessage('');

        // ✅ Use GLOBAL check (not machine-specific)
        if (!hasCompletedAnyCourse()) {
            setBookingMessage('❌ You must complete at least one training course before booking machines.');
            setBookingSubmitting(false);
            return;
        }

        if (!isDateRangeAvailable(bookingData.start_date, bookingData.end_date)) {
            setBookingMessage('❌ Selected dates overlap with existing bookings. Please choose different dates.');
            setBookingSubmitting(false);
            return;
        }

        try {
            const authToken = localStorage.getItem('auth_token');
            const payload = {
                machine_id: bookingData.machine_id,
                start_date: bookingData.start_date,
                end_date: bookingData.end_date,
            };

            const response = await axios.post(
                'http://127.0.0.1:8000/api/user/bookings',
                payload,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setBookingMessage('✅ ' + response.data.message);

            // ✅ Close modal FIRST, then navigate using React Router
            setShowBookingModal(false);
            setTimeout(() => {
                // ✅ Use React Router navigate (client-side, no 404)
                navigate('/user/machines?tab=bookings', { replace: true });
            }, 300);
        } catch (error) {
            console.error('Booking error:', error);
            if (error.response?.data?.message) {
                setBookingMessage('❌ ' + error.response.data.message);
            } else {
                setBookingMessage('❌ Booking failed. Please try again.');
            }
        } finally {
            setBookingSubmitting(false);
        }
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedMachine(null);
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedMachine(null);
        setBookingMessage('');
        setBookingData({ machine_id: '', start_date: '', end_date: '' });
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            available: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
            busy: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
            maintenance: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
        };
        return badges[status] || 'bg-gray-200 text-gray-700';
    };

    const isDateBooked = (date) => bookedDates.includes(date);

    const generateCalendarData = () => {
        const calendar = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);

        let currentDate = new Date(today);
        let currentMonth = null;
        let monthData = null;

        while (currentDate <= endDate) {
            const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

            if (monthKey !== currentMonth) {
                if (monthData) calendar.push(monthData);
                currentMonth = monthKey;

                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                monthData = {
                    monthName: firstDay.toLocaleString('default', { month: 'long', year: 'numeric' }),
                    emptyDays: Array(firstDay.getDay()).fill(null),
                    days: []
                };

                for (let d = 1; d <= daysInMonth; d++) {
                    const dateObj = new Date(year, month, d);
                    // ✅ Use local date formatting (YYYY-MM-DD in user's timezone)
                    const dateStr = [
                        dateObj.getFullYear(),
                        String(dateObj.getMonth() + 1).padStart(2, '0'),
                        String(dateObj.getDate()).padStart(2, '0')
                    ].join('-');

                    monthData.days.push({
                        date: dateStr,
                        dayNumber: d,
                        isBooked: bookedDates.includes(dateStr),
                        isPast: dateObj < today, // Mark past days
                        isToday: dateObj.getTime() === today.getTime()
                    });
                }

                // Move to next month
                currentDate = new Date(year, month + 1, 1);
            } else {
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        if (monthData) calendar.push(monthData);
        return calendar;
    };

    return (
        <>
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading machines...</p>
                </div>
            )}

            {!loading && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {machines.map((machine) => (
                            <div
                                key={machine.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                            >
                                {/* Machine Image with Badges */}
                                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    {/* Status Badges */}
                                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                                        {machine.status === 'available' && (
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg animate-pulse">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Available
                                            </span>
                                        )}
                                        {machine.status === 'maintenance' && (
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Maintenance
                                            </span>
                                        )}
                                    </div>

                                    {/* Machine Image */}
                                    {machine.image ? (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${machine.image}`}
                                            alt={machine.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{machine.name}</h3>
                                        <p className="text-sm text-gray-500">{machine.category || 'General Equipment'}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleBookNow(machine)}
                                            // ✅ FIXED: Use GLOBAL canBookMachine logic
                                            disabled={!canBookMachine(machine)}
                                            className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm ${canBookMachine(machine)
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            title={!hasCompletedAnyCourse() ? 'Complete a course first to unlock booking' : ''}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {hasCompletedAnyCourse() ? 'Book Now' : 'Complete Course First'}
                                        </button>

                                        <button
                                            onClick={() => handleViewDetails(machine)}
                                            className="py-2.5 px-3 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {machines.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No machines available right now</p>
                            <p className="text-gray-400 text-sm mt-1">Check back later for new equipment!</p>
                        </div>
                    )}
                </>
            )}

            {/* ✨ MACHINE DETAILS MODAL - White Header */}
            {showDetailsModal && selectedMachine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ✅ WHITE HEADER */}
                        <div className="relative bg-white px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Machine Details</h3>
                                    <p className="text-sm text-gray-500 mt-1">{selectedMachine.category || 'General Equipment'}</p>
                                </div>
                                <button
                                    onClick={closeDetailsModal}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            {/* Machine Image */}
                            <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 overflow-hidden shadow-inner">
                                {selectedMachine.image ? (
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${selectedMachine.image}`}
                                        alt={selectedMachine.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Info Cards Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        <p className="text-xs text-gray-500 font-medium">Name</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{selectedMachine.name}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-gray-500 font-medium">Status</p>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedMachine.status)}`}>
                                        {selectedMachine.status.charAt(0).toUpperCase() + selectedMachine.status.slice(1).replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs text-gray-500 font-medium">Added On</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {selectedMachine.created_at
                                            ? new Date(selectedMachine.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Description
                                </h4>
                                <p className="text-gray-600 bg-white rounded-xl p-4 border border-gray-100 leading-relaxed">
                                    {selectedMachine.description || 'No description available for this machine.'}
                                </p>
                            </div>

                            {/* ✅ FIXED: Training Status - GLOBAL check (any course completed) */}
                            {!hasCompletedAnyCourse() ? (
                                <div className="mb-6 p-5 bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 rounded-2xl border-2 border-red-100 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center shadow-md">
                                                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Training Required
                                            </h4>
                                            <p className="text-sm text-red-700 mb-4 leading-relaxed">
                                                You must complete at least one training course before booking any machines. This ensures safe and proper use of Fab Lab equipment.
                                            </p>
                                            <Link
                                                to="/user/courses"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                Browse Available Courses
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-100 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-md">
                                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Training Completed ✅
                                            </h4>
                                            <p className="text-sm text-green-700 leading-relaxed">
                                                Great job! You've completed your training and are now certified to book any Fab Lab equipment. You can proceed with booking this machine.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ✨ BOOKING MODAL - White Header */}
            {showBookingModal && selectedMachine && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeBookingModal}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ✅ WHITE HEADER */}
                        <div className="relative bg-white px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Book {selectedMachine.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Select your preferred dates below</p>
                                </div>
                                <button
                                    onClick={closeBookingModal}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50">
                                {/* Machine Info Card */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedMachine.name}</p>
                                            <p className="text-sm text-gray-500">{selectedMachine.location || 'Main Fab Lab'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                {bookingMessage && (
                                    <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${bookingMessage.includes('✅')
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200'
                                        : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
                                        }`}>
                                        {bookingMessage.includes('✅') ? (
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        )}
                                        {bookingMessage}
                                    </div>
                                )}

                                {/* Date Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={bookingData.start_date}
                                            onChange={handleBookingChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={bookingData.end_date}
                                            onChange={handleBookingChange}
                                            min={bookingData.start_date || new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Calendar Section */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Available Dates (Next 30 Days)
                                        </label>
                                        {(bookingData.start_date || bookingData.end_date) && (
                                            <button
                                                type="button"
                                                onClick={() => setBookingData({ machine_id: bookingData.machine_id, start_date: '', end_date: '' })}
                                                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="space-y-5">
                                        {generateCalendarData().map((monthData, monthIndex) => (
                                            <div key={monthIndex} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                                <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{monthData.monthName}</h4>
                                                <div className="grid grid-cols-7 gap-1.5">
                                                    {/* Day Headers */}
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                                        <div key={idx} className="text-center text-[10px] font-bold text-gray-400 py-2">
                                                            {day}
                                                        </div>
                                                    ))}

                                                    {/* Empty Cells */}
                                                    {monthData.emptyDays?.map((_, index) => (
                                                        <div key={`empty-${index}`} className="p-2"></div>
                                                    ))}

                                                    {/* Calendar Days */}
                                                    {monthData.days.map((dayInfo) => {
                                                        const isSelected = bookingData.start_date && bookingData.end_date &&
                                                            dayInfo.date >= bookingData.start_date &&
                                                            dayInfo.date <= bookingData.end_date;
                                                        const isBooked = dayInfo.isBooked;
                                                        const isPast = dayInfo.isPast;
                                                        const isStartDate = bookingData.start_date === dayInfo.date;
                                                        const isEndDate = bookingData.end_date === dayInfo.date;

                                                        let dayClass = 'bg-white border-gray-200 text-gray-700';
                                                        let isClickable = false;

                                                        // ✅ Check booked FIRST - booked dates should always show red, even if past
                                                        if (isBooked) {
                                                            // Booked days - red (highest priority)
                                                            dayClass = 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through font-semibold';
                                                        } else if (isPast) {
                                                            // Past days - grayed out (only if not booked)
                                                            dayClass = 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed';
                                                        } else if (isSelected) {
                                                            // Selected days - green
                                                            if (isStartDate || isEndDate) {
                                                                dayClass = 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 text-white font-bold shadow-md ring-2 ring-green-300';
                                                            } else {
                                                                dayClass = 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 text-white';
                                                            }
                                                            isClickable = true;
                                                        } else {
                                                            // Available future days
                                                            dayClass = 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300';
                                                            isClickable = true;
                                                        }

                                                        return (
                                                            <div
                                                                key={dayInfo.date}
                                                                className={`
                p-2.5 text-center text-xs rounded-lg border transition-all duration-200
                ${dayClass}
                ${isClickable && !isBooked ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}
            `}
                                                                onClick={() => {
                                                                    if (isClickable && !isBooked && !isPast) {
                                                                        // ✅ Case 1: No selection yet → set as start date
                                                                        if (!bookingData.start_date) {
                                                                            setBookingData(prev => ({ ...prev, start_date: dayInfo.date, end_date: '' }));
                                                                        }
                                                                        // ✅ Case 2: Start date set, end date empty, clicking SAME date → single-day booking
                                                                        else if (bookingData.start_date === dayInfo.date && !bookingData.end_date) {
                                                                            setBookingData(prev => ({ ...prev, end_date: dayInfo.date })); // ✅ End = Start
                                                                        }
                                                                        // ✅ Case 3: Start date set, end date empty, clicking LATER date → set end date
                                                                        else if (bookingData.start_date && !bookingData.end_date && dayInfo.date >= bookingData.start_date) {
                                                                            setBookingData(prev => ({ ...prev, end_date: dayInfo.date }));
                                                                        }
                                                                        // ✅ Case 4: Start date set, end date empty, clicking EARLIER date → reset start to new date
                                                                        else if (bookingData.start_date && !bookingData.end_date && dayInfo.date < bookingData.start_date) {
                                                                            setBookingData(prev => ({ ...prev, start_date: dayInfo.date, end_date: '' }));
                                                                        }
                                                                        // ✅ Case 5: Both dates set → start new selection
                                                                        else if (bookingData.start_date && bookingData.end_date) {
                                                                            setBookingData(prev => ({ ...prev, start_date: dayInfo.date, end_date: '' }));
                                                                        }
                                                                    }
                                                                }}
                                                                title={isPast ? 'Past date' : isBooked ? 'Already booked' : ''}
                                                            >
                                                                <div className={`font-semibold ${isSelected ? 'text-white' : ''}`}>
                                                                    {dayInfo.dayNumber}
                                                                </div>
                                                                {isBooked && (
                                                                    <div className="text-[9px] mt-0.5 flex items-center justify-center">
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                                {isSelected && !isBooked && (isStartDate || isEndDate) && (
                                                                    <div className="text-[9px] mt-0.5 flex items-center justify-center">
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-white border border-gray-200 rounded-md shadow-sm"></div>
                                            <span className="text-xs text-gray-600">Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-md shadow-sm"></div>
                                            <span className="text-xs text-gray-600">Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md shadow-md ring-2 ring-green-300"></div>
                                            <span className="text-xs text-gray-600">Start/End</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded-md"></div>
                                            <span className="text-xs text-gray-600">Booked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 shadow-lg">
                                <button
                                    type="button"
                                    onClick={closeBookingModal}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingSubmitting}
                                    className={`px-7 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 ${bookingSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                                        }`}
                                >
                                    {bookingSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Confirm Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}