import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function BookMachine() {
    const [expandedMenus, setExpandedMenus] = useState({
        bookings: false,
        courses: false,
        support: false,
    });

    // API Data States
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Training & Booking States
    const [userCourses, setUserCourses] = useState([]);
    const [hasRequiredTraining, setHasRequiredTraining] = useState(false);
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

    // Fetch machines and user data on component mount
    useEffect(() => {
        fetchMachines();
        fetchUserCourses();
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

            setMachines(response.data.machines);
        } catch (error) {
            console.error('Error fetching machines:', error);
            // Sample data for testing
            setMachines([
                {
                    id: 1,
                    name: 'Ultimaker S5',
                    category: '3D Printing',
                    type: '3D Printer',
                    status: 'available',
                    description: 'Professional grade FDM 3D printer with dual extrusion',
                    location: 'Lab A - Station 1',
                    specs: 'Build volume: 330 x 240 x 300mm',
                    added_on: '2026-04-20',
                    required_course: 'Introduction to 3D Printing',
                },
                {
                    id: 2,
                    name: 'Prusa MK4',
                    category: '3D Printing',
                    type: '3D Printer',
                    status: 'available',
                    description: 'Reliable FDM printer, great for beginners',
                    location: 'Lab B - Station 3',
                    specs: 'Build volume: 250 x 210 x 220mm',
                    added_on: '2026-04-21',
                    required_course: 'Introduction to 3D Printing',
                },
                {
                    id: 3,
                    name: 'Epilog Zing 24',
                    category: 'Laser Cutting',
                    type: 'Laser Cutter',
                    status: 'available',
                    description: 'CO2 laser cutter for wood, acrylic, and paper',
                    location: 'Lab A - Station 5',
                    specs: 'Bed size: 610 x 305mm, Power: 30W',
                    added_on: '2026-04-22',
                    required_course: 'Laser Cutting Safety & Operation',
                },
                {
                    id: 4,
                    name: 'Shapeoko 5 Pro',
                    category: 'CNC Machining',
                    type: 'CNC Router',
                    status: 'available',
                    description: 'Desktop CNC router for wood and soft metals',
                    location: 'Lab B - Station 1',
                    specs: 'Work area: 508 x 508 x 114mm',
                    added_on: '2026-04-23',
                    required_course: 'CNC Machining Fundamentals',
                },
                {
                    id: 5,
                    name: 'Bantam Tools PCB Mill',
                    category: 'PCB Fabrication',
                    type: 'PCB Mill',
                    status: 'maintenance',
                    description: 'Desktop PCB milling machine',
                    location: 'Lab A - Station 7',
                    specs: 'Precision: 0.025mm',
                    added_on: '2026-04-24',
                    required_course: 'PCB Design & Fabrication',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCourses = async () => {
        try {
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/my-courses', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // Get completed courses
            const completed = response.data.courses
                .filter(course => course.status === 'completed' || course.status === 'enrolled')
                .map(course => course.title);

            setUserCourses(completed);
        } catch (error) {
            console.error('Error fetching user courses:', error);
            // Sample completed courses for testing
            setUserCourses([
                'Introduction to 3D Printing',
                'Laser Cutting Safety & Operation',
            ]);
        }
    };

    // Check if user has required training for a machine
    const checkTrainingRequirement = (machine) => {
        if (!machine.required_course) return true; // No requirement

        const hasTraining = userCourses.includes(machine.required_course);
        setHasRequiredTraining(hasTraining);
        return hasTraining;
    };

    // Open details modal
    const handleViewDetails = (machine) => {
        setSelectedMachine(machine);
        checkTrainingRequirement(machine);
        setShowDetailsModal(true);
    };

    // Open booking modal
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

    // Fetch booked dates for the machine
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
            // Sample booked dates
            setBookedDates([
                '2026-05-01',
                '2026-05-02',
                '2026-05-05',
            ]);
        }
    };

    // Handle booking form input changes
    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Check if date range overlaps with booked dates
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

    // Submit booking
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingSubmitting(true);
        setBookingMessage('');

        // Check training requirement
        if (!hasRequiredTraining) {
            setBookingMessage('❌ You must complete the required training before booking this machine.');
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

            const response = await axios.post(
                'http://127.0.0.1:8000/api/user/bookings',
                bookingData,
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
            if (error.response?.data?.message) {
                setBookingMessage('❌ ' + error.response.data.message);
            } else {
                setBookingMessage('❌ Booking failed. Please try again.');
            }
        } finally {
            setBookingSubmitting(false);
        }
    };

    // Close modals
    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedMachine(null);
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedMachine(null);
        setBookingMessage('');
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const badges = {
            available: 'bg-green-100 text-green-800 border-green-200',
            busy: 'bg-red-100 text-red-800 border-red-200',
            maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Check if a specific date is booked
    const isDateBooked = (date) => {
        return bookedDates.includes(date);
    };

    // Generate next 30 days for calendar
    const generateNext30Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                    <img src="../images/logo.png" className="w-15 h-15 rounded-full object-cover" alt="Logo" />
                    <div>
                        <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                        <p className="text-xs text-slate-400">User Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {/* Menu Section */}
                    <div className="mb-4">
                        <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>

                        <Link to="/user/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                        </Link>

                        <Link to="/user/book-machine" className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Book a Machine
                        </Link>

                        <Link to="/user/courses" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            Course Registration
                        </Link>

                        <Link to="/user/my-bookings" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            My Bookings
                        </Link>

                        <Link to="/user/announcements" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Announcements
                        </Link>
                    </div>

                    {/* Support Section */}
                    <div className="border-t border-slate-700/50 pt-4">
                        <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Support</p>

                        <Link to="/user/faqs" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            FAQs
                        </Link>

                        <Link to="/user/contact" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Help / Contact
                        </Link>
                    </div>

                    {/* Logout */}
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-4 border-t border-slate-700/50 pt-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Book a Machine</h1>
                        <p className="text-sm text-gray-600 mt-1">Reserve a machine for your project</p>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading machines...</p>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Machines Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {machines.map((machine) => (
                                    <div key={machine.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                                        {/* Machine Image */}
                                        <div className="h-48 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>

                                        {/* Machine Info */}
                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{machine.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{machine.category}</p>

                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getStatusBadgeClass(machine.status)}`}>
                                                {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                                            </span>

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
                                                {machine.status === 'available' ? 'Book Now' :
                                                    machine.status === 'busy' ? 'In Use' : 'Maintenance'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Machine Details</h3>
                            <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Machine Image */}
                            <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg mb-6 flex items-center justify-center">
                                <svg className="w-24 h-24 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>

                            {/* Machine Info Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Machine Name</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Machine Type</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.type || selectedMachine.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(selectedMachine.status)}`}>
                                        {selectedMachine.status.charAt(0).toUpperCase() + selectedMachine.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Added On</p>
                                    <p className="font-semibold text-gray-900">{new Date(selectedMachine.added_on).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-gray-900">{selectedMachine.description}</p>
                            </div>

                            {/* Specs */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2">Specifications</p>
                                <p className="text-gray-900">{selectedMachine.specs}</p>
                            </div>

                            {/* Training Requirement Warning */}
                            {!hasRequiredTraining && selectedMachine.required_course && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-red-800">Training Required</p>
                                            <p className="text-xs text-red-700 mt-1">
                                                You must complete <strong>"{selectedMachine.required_course}"</strong> before booking this machine.
                                            </p>
                                            <Link to="/user/courses" className="inline-block mt-2 text-xs font-medium text-red-700 underline hover:text-red-800">
                                                View Available Courses →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Book Now Button */}
                            {selectedMachine.status === 'available' && (
                                <button
                                    onClick={handleBookNow}
                                    disabled={!hasRequiredTraining && selectedMachine.required_course}
                                    className={`w-full py-3 font-semibold rounded-lg transition-colors ${hasRequiredTraining || !selectedMachine.required_course
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {hasRequiredTraining || !selectedMachine.required_course
                                        ? 'Book This Machine'
                                        : 'Complete Required Training First'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal with Date Selection */}
            {showBookingModal && selectedMachine && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeBookingModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
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

                        {/* Modal Body */}
                        <form onSubmit={handleBookingSubmit}>
                            <div className="p-6 space-y-6">
                                {/* Machine Info */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm font-medium text-blue-900">{selectedMachine.name}</p>
                                    <p className="text-xs text-blue-700 mt-1">{selectedMachine.location}</p>
                                </div>

                                {bookingMessage && (
                                    <div className={`p-3 rounded-lg text-sm ${bookingMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {bookingMessage}
                                    </div>
                                )}

                                {/* Date Selection */}
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

                                {/* Available Dates Calendar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Dates (Next 30 Days)</label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {generateNext30Days().map((date) => {
                                            const isBooked = isDateBooked(date);
                                            const isSelected = bookingData.start_date && bookingData.end_date &&
                                                date >= bookingData.start_date && date <= bookingData.end_date;

                                            return (
                                                <div
                                                    key={date}
                                                    className={`
                                                        p-2 text-center text-xs rounded-lg border transition-colors
                                                        ${isBooked
                                                            ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50'
                                                        }
                                                    `}
                                                >
                                                    <div>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                    <div className="font-semibold mt-1">{new Date(date).getDate()}</div>
                                                    {isBooked && <div className="text-[10px] mt-1">Booked</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                                            <span>Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                            <span>Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                            <span>Booked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0">
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