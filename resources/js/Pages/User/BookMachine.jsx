import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';

export default function BookMachine() {
    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: false,
        machines: false,
        learning: false,
        explore: false,
        support: false,
    });

    // API Data States
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Booking States
    const [bookedDates, setBookedDates] = useState([]);
    const [bookingData, setBookingData] = useState({
        machine_id: '',
        start_date: '',
        end_date: '',
    });
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingMessage, setBookingMessage] = useState('');

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch machines on component mount
    useEffect(() => {
        fetchMachines();
    }, []);

    // ✅ FIXED: Fetch machines with correct response structure
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

            console.log('Machines response:', response.data);

            // ✅ FIXED: User endpoint returns {machines: [...]}, not {data: [...]}
            setMachines(response.data.machines || response.data.data || []);
        } catch (error) {
            console.error('Error fetching machines:', error);
            setMachines([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW LOGIC: Check if user has completed ANY course (general eligibility)
    // Not machine-specific - Fab Lab has ONE general training course
    const hasTrainingForMachine = (machine) => {
        return machine.has_required_training === true;
    };

    const handleViewDetails = (machine) => {
        setSelectedMachine(machine);
        setShowDetailsModal(true);
    };

    const handleBookNow = () => {
        setShowDetailsModal(false);
        setShowBookingModal(true);
        setBookingData({
            machine_id: selectedMachine.id,
            start_date: '',
            end_date: '',
        });
        setBookingMessage('');
        fetchBookedDates(selectedMachine.id);
    };

    const fetchBookedDates = async (machineId) => {
        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.get(`http://127.0.0.1:8000/api/user/machines/${machineId}/booked-dates`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
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
            const dateStr = d.toISOString().split('T')[0];
            if (bookedDates.includes(dateStr)) {
                return false;
            }
        }
        return true;
    };

    // ✅ Submit booking
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingSubmitting(true);
        setBookingMessage('');

        // Check training using API-provided has_required_training field
        if (selectedMachine && !hasTrainingForMachine(selectedMachine)) {
            setBookingMessage('❌ You must complete the Fab Lab training course before booking machines.');
            setBookingSubmitting(false);
            return;
        }

        // Validate date range
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

            console.log('Sending booking payload:', payload);

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
            setTimeout(() => {
                setShowBookingModal(false);
                window.location.href = '/user/my-bookings';
            }, 1500);
        } catch (error) {
            console.error('Booking error:', error);
            console.error('Error response:', error.response?.data);
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
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            available: 'bg-green-100 text-green-800 border-green-200',
            busy: 'bg-red-100 text-red-800 border-red-200',
            maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const isDateBooked = (date) => {
        return bookedDates.includes(date);
    };

    // ✅ Generate calendar with correct day/date alignment
    const generateCalendarData = () => {
        const calendar = [];
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);

        let currentDate = new Date(today);
        let currentMonth = null;
        let monthData = null;

        while (currentDate <= endDate) {
            const month = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (month !== currentMonth) {
                if (monthData) {
                    calendar.push(monthData);
                }
                currentMonth = month;
                monthData = {
                    monthName: month,
                    emptyDays: [],
                    days: []
                };

                // Calculate empty days before 1st of month
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const dayOfWeek = firstDayOfMonth.getDay();

                if (currentDate.getDate() === 1 || monthData.days.length === 0) {
                    for (let i = 0; i < dayOfWeek; i++) {
                        monthData.emptyDays.push(i);
                    }
                }
            }

            const dateStr = currentDate.toISOString().split('T')[0];
            monthData.days.push({
                date: dateStr,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: currentDate.getDate(),
                dayOfWeek: currentDate.getDay(),
                isBooked: isDateBooked(dateStr)
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (monthData) {
            calendar.push(monthData);
        }

        return calendar;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            <div className="flex-1">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Book a Machine</h1>
                        <p className="text-sm text-gray-600 mt-1">Reserve a machine for your project</p>
                    </div>
                </header>

                <main className="p-6">
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading machines...</p>
                        </div>
                    )}

                    {!loading && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {machines.map((machine) => (
                                    <div key={machine.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                                        {/* Machine Image */}
                                        <div className="h-64 bg-gray-100 overflow-hidden">
                                            {machine.image ? (
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${machine.image}`}
                                                    alt={machine.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.error('Image failed to load:', machine.image);
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="h-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                                                <svg class="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                                    <svg className="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{machine.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{machine.category || 'General'}</p>

                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getStatusBadgeClass(machine.status)}`}>
                                                {machine.status.charAt(0).toUpperCase() + machine.status.slice(1).replace('-', ' ')}
                                            </span>

                                            {/* ✅ Training Badge - General Eligibility */}
                                            <div className="mb-3">
                                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${hasTrainingForMachine(machine)
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {hasTrainingForMachine(machine) ? '✅ Trained' : '🚫 Training Required'}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleViewDetails(machine)}
                                                disabled={machine.status !== 'available'}
                                                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${machine.status === 'available'
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {machine.status === 'available' ? 'View Details' :
                                                    machine.status === 'in_use' ? 'In Use' : 'Maintenance'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {machines.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">No machines available</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Machine Details Modal */}
            {showDetailsModal && selectedMachine && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeDetailsModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="text-xl font-bold text-gray-900">Machine Details</h3>
                            <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="h-64 bg-gray-100 rounded-lg mb-6 overflow-hidden">
                                {selectedMachine.image ? (
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${selectedMachine.image}`}
                                        alt={selectedMachine.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                        <svg className="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Machine Name</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Machine Type</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.type || selectedMachine.category || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(selectedMachine.status)}`}>
                                        {selectedMachine.status.charAt(0).toUpperCase() + selectedMachine.status.slice(1).replace('-', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Added On</p>
                                    <p className="font-semibold text-gray-900">{new Date(selectedMachine.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-gray-900">{selectedMachine.description || 'No description available.'}</p>
                            </div>

                            {/* ✅ Training Requirement - General Eligibility */}
                            <div className={`mb-6 p-4 rounded-lg border ${hasTrainingForMachine(selectedMachine)
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-start gap-3">
                                    <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${hasTrainingForMachine(selectedMachine) ? 'text-green-600' : 'text-red-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                                            hasTrainingForMachine(selectedMachine)
                                                ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        } />
                                    </svg>
                                    <div>
                                        <p className={`text-sm font-semibold ${hasTrainingForMachine(selectedMachine) ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {hasTrainingForMachine(selectedMachine) ? '✅ Training Completed' : '🚫 Training Required'}
                                        </p>
                                        <p className={`text-xs mt-1 ${hasTrainingForMachine(selectedMachine) ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            {hasTrainingForMachine(selectedMachine)
                                                ? 'You are eligible to book any machine.'
                                                : 'Complete the Fab Lab training course to book machines.'}
                                        </p>
                                        {!hasTrainingForMachine(selectedMachine) && (
                                            <Link to="/user/courses" className="inline-block mt-2 text-xs font-medium text-red-700 underline hover:text-red-800">
                                                View Available Courses →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedMachine.status === 'available' && (
                            <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
                                <button
                                    onClick={handleBookNow}
                                    disabled={!hasTrainingForMachine(selectedMachine)}
                                    className={`w-full py-3 font-semibold rounded-lg transition-colors ${hasTrainingForMachine(selectedMachine)
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {hasTrainingForMachine(selectedMachine)
                                        ? 'Book This Machine'
                                        : 'Complete Required Training First'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ✅ Booking Modal - Single scrollbar with calendar colors */}
            {showBookingModal && selectedMachine && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeBookingModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Book {selectedMachine.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Select your booking dates</p>
                            </div>
                            <button onClick={closeBookingModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm font-medium text-blue-900">{selectedMachine.name}</p>
                                    <p className="text-xs text-blue-700 mt-1">{selectedMachine.location || 'Main Lab'}</p>
                                </div>

                                {bookingMessage && (
                                    <div className={`p-3 rounded-lg text-sm ${bookingMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {bookingMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={bookingData.start_date}
                                            onChange={handleBookingChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={bookingData.end_date}
                                            onChange={handleBookingChange}
                                            min={bookingData.start_date || new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* ✅ Calendar with Green (selected) and Red (booked) colors */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">Available Dates (Next 30 Days)</label>
                                        {(bookingData.start_date || bookingData.end_date) && (
                                            <button
                                                type="button"
                                                onClick={() => setBookingData({ machine_id: bookingData.machine_id, start_date: '', end_date: '' })}
                                                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Clear Selection
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {generateCalendarData().map((monthData, monthIndex) => (
                                            <div key={monthIndex} className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">{monthData.monthName}</h4>
                                                <div className="grid grid-cols-7 gap-2">
                                                    {/* Day headers */}
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                                            {day}
                                                        </div>
                                                    ))}

                                                    {/* Empty cells before 1st of month */}
                                                    {monthData.emptyDays && monthData.emptyDays.map((_, index) => (
                                                        <div key={`empty-${index}`} className="p-2"></div>
                                                    ))}

                                                    {/* Calendar days */}
                                                    {monthData.days.map((dayInfo) => {
                                                        const isSelected = bookingData.start_date && bookingData.end_date &&
                                                            dayInfo.date >= bookingData.start_date &&
                                                            dayInfo.date <= bookingData.end_date;

                                                        const isBooked = dayInfo.isBooked;
                                                        const isStartDate = bookingData.start_date === dayInfo.date;
                                                        const isEndDate = bookingData.end_date === dayInfo.date;

                                                        let dayClass = 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50';
                                                        let isDisabled = false;

                                                        if (isBooked) {
                                                            dayClass = 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed';
                                                            isDisabled = true;
                                                        } else if (isSelected) {
                                                            if (isStartDate || isEndDate) {
                                                                dayClass = 'bg-green-600 border-green-700 text-white font-bold ring-2 ring-green-400';
                                                            } else {
                                                                dayClass = 'bg-green-500 border-green-600 text-white';
                                                            }
                                                        }

                                                        return (
                                                            <div
                                                                key={dayInfo.date}
                                                                className={`
                                                                    p-2 text-center text-xs rounded-lg border transition-all duration-200
                                                                    ${dayClass}
                                                                    ${!isBooked ? 'cursor-pointer hover:scale-105' : ''}
                                                                `}
                                                                onClick={() => {
                                                                    if (!isBooked) {
                                                                        if (bookingData.start_date === dayInfo.date && !bookingData.end_date) {
                                                                            setBookingData({ machine_id: bookingData.machine_id, start_date: '', end_date: '' });
                                                                        } else if (bookingData.start_date && bookingData.end_date) {
                                                                            setBookingData(prev => ({
                                                                                ...prev,
                                                                                start_date: dayInfo.date,
                                                                                end_date: ''
                                                                            }));
                                                                        } else if (bookingData.start_date && dayInfo.date >= bookingData.start_date) {
                                                                            setBookingData(prev => ({
                                                                                ...prev,
                                                                                end_date: dayInfo.date
                                                                            }));
                                                                        } else {
                                                                            setBookingData(prev => ({
                                                                                ...prev,
                                                                                start_date: dayInfo.date,
                                                                                end_date: ''
                                                                            }));
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <div className="font-semibold">{dayInfo.dayNumber}</div>

                                                                {isBooked && (
                                                                    <div className="text-[10px] mt-1 flex items-center justify-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </div>
                                                                )}

                                                                {isSelected && !isBooked && (
                                                                    <div className="text-[10px] mt-1 flex items-center justify-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
                                    <div className="flex items-center gap-4 mt-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                                            <span>Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                                            <span>Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-green-600 rounded ring-2 ring-green-400"></div>
                                            <span>Start/End</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                            <span>Booked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fixed footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={closeBookingModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                    {bookingSubmitting ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}