import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Courses() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: true,
        operations: true,
        resources: false,
        contentMedia: false,
    });

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [registrationClosed, setRegistrationClosed] = useState(false);

    // Create/Edit Form State
    const [formState, setFormState] = useState({
        title: '',
        instructor: '',
        duration: '',
        schedule: '',
        seatLimit: '',
        description: '',
        image: null,
        status: 'upcoming',
        registrationStatus: 'open',
    });

    // Backend State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch courses from API
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/courses', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setCourses(response.data.data);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch courses error:', err);
            setError('Failed to load courses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchCourses();
    }, []);

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'upcoming':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'completed':
                return 'bg-gray-100 text-gray-700 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Open Create Modal
    const handleCreateCourse = () => {
        setFormState({
            title: '',
            instructor: '',
            duration: '',
            schedule: '',
            seatLimit: '',
            description: '',
            image: null,
            status: 'upcoming',
            registrationStatus: 'open',
        });
        setShowCreateModal(true);
    };

    // Open View Modal
    const handleViewCourse = (course) => {
        setSelectedCourse(course);
        setRegistrationClosed(course.registration_status === 'closed');
        setShowViewModal(true);
    };

    // Open Edit Modal
    const handleEditCourse = (course) => {
        setSelectedCourse(course);
        setFormState({
            title: course.title,
            instructor: course.instructor,
            duration: course.duration,
            schedule: course.schedule,
            seatLimit: course.seat_limit,
            description: course.description || '',
            image: null,
            status: course.status,
            registrationStatus: course.registration_status,
        });
        setShowViewModal(false);
        setShowEditModal(true);
    };

    // Open Delete Modal
    const handleDeleteCourse = (course) => {
        setSelectedCourse(course);
        setShowViewModal(false);
        setShowDeleteModal(true);
    };

    // Toggle Registration Status
    const handleToggleRegistration = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/courses/${selectedCourse.id}/toggle-registration`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setRegistrationClosed(!registrationClosed);
            fetchCourses(); // Refresh list
            alert(`✅ Registration for "${selectedCourse.title}" has been ${!registrationClosed ? 'closed' : 'opened'}.`);
        } catch (err) {
            console.error('Toggle registration error:', err);
            alert('❌ Failed to update registration status');
        }
    };

    // Confirm Delete
    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://127.0.0.1:8000/api/admin/courses/${selectedCourse.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowDeleteModal(false);
            setSelectedCourse(null);
            fetchCourses(); // Refresh list
            alert(`✅ Course "${selectedCourse.title}" deleted successfully!`);
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Failed to delete course');
        }
    };

    // Save Create
    const handleSaveCreate = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('instructor', formState.instructor);
            formData.append('duration', formState.duration);
            formData.append('schedule', formState.schedule);
            formData.append('seat_limit', formState.seatLimit);
            formData.append('status', formState.status);
            formData.append('registration_status', formState.registrationStatus);
            formData.append('description', formState.description);
            if (formState.image) {
                formData.append('image', formState.image);
            }

            await axios.post('http://127.0.0.1:8000/api/admin/courses', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowCreateModal(false);
            fetchCourses(); // Refresh list
            alert(`✅ Course "${formState.title}" created successfully!`);
        } catch (err) {
            console.error('Create error:', err);
            alert('❌ Failed to create course');
        }
    };

    // Save Edit
    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('instructor', formState.instructor);
            formData.append('duration', formState.duration);
            formData.append('schedule', formState.schedule);
            formData.append('seat_limit', formState.seatLimit);
            formData.append('status', formState.status);
            formData.append('registration_status', formState.registrationStatus);
            formData.append('description', formState.description);
            if (formState.image) {
                formData.append('image', formState.image);
            }

            await axios.post(`http://127.0.0.1:8000/api/admin/courses/${selectedCourse.id}?_method=PUT`, formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowEditModal(false);
            setSelectedCourse(null);
            fetchCourses(); // Refresh list
            alert(`✅ Course "${formState.title}" updated successfully!`);
        } catch (err) {
            console.error('Update error:', err);
            alert('❌ Failed to update course');
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowCreateModal(false);
        setShowViewModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedCourse(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - SAME AS YOUR ORIGINAL */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                    <img src="../images/logo.png" className="w-15 h-15 rounded-full object-cover" alt="Logo" />
                    <div>
                        <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                        <p className="text-xs text-slate-400">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation - SAME AS YOUR ORIGINAL */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {/* Dashboard */}
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    {/* User Management */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('userManagement')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                User Management
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.userManagement ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.userManagement && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/users" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Users</Link>
                                <Link to="/admin/production-team" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Production Team</Link>
                            </div>
                        )}
                    </div>

                    {/* Operations */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('operations')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Operations
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.operations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.operations && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/machines" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Machines</Link>
                                <Link to="/admin/bookings" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Bookings</Link>
                                <Link to="/admin/courses" className="block px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium">Courses</Link>
                                <Link to="/admin/custom-orders" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Custom Orders</Link>
                            </div>
                        )}
                    </div>

                    {/* Resources */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('resources')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Resources
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.resources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.resources && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/inventory" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Inventory</Link>
                                <Link to="/admin/projects" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Projects</Link>
                            </div>
                        )}
                    </div>

                    {/* Content & Media */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('contentMedia')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Content & Media
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.contentMedia ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.contentMedia && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/gallery" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Gallery</Link>
                                <Link to="/admin/faq" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">FAQ</Link>
                                <Link to="/admin/feedback" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Feedback</Link>
                            </div>
                        )}
                    </div>

                    {/* Transactions */}
                    <Link
                        to="/admin/transactions"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Transactions
                    </Link>

                    {/* Logout */}
                    <Link
                        to="/admin/login"
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-4 border-t border-slate-700/50 pt-4"
                    >
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
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Course & Training Management</h2>
                            <p className="text-sm text-gray-600">Create and manage Fab Lab training courses</p>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Create Course Button */}
                            <button
                                onClick={handleCreateCourse}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Course
                            </button>

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

                {/* Course Management Content */}
                <main className="p-6">
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

                    {/* Courses Grid */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Course Image */}
                                    {course.image ? (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${course.image}`}
                                            alt={course.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Course Content */}
                                    <div className="p-5">
                                        {/* Course Title */}
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">{course.title}</h3>

                                        {/* Enrollment */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-600">Enrollment</span>
                                            <span className="font-semibold text-gray-900">{course.enrollment}/{course.seat_limit}</span>
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => handleViewCourse(course)}
                                            className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && courses.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No courses found</p>
                            <p className="text-gray-400 text-sm mt-1">Click "Create Course" to get started</p>
                        </div>
                    )}
                </main>
            </div>

            {/* ===== VIEW COURSE DETAILS MODAL - YOUR DESIGN PRESERVED ===== */}
            {showViewModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
                                <p className="text-sm text-gray-500 mt-1">View and manage this course</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Course Image */}
                            {selectedCourse.image && (
                                <img
                                    src={`http://127.0.0.1:8000/storage/${selectedCourse.image}`}
                                    alt={selectedCourse.title}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            )}

                            {/* Title & Status */}
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h4>
                                <div className="flex gap-2">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedCourse.status)}`}>
                                        {capitalize(selectedCourse.status)}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${registrationClosed ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                        {registrationClosed ? 'Closed' : 'Open'}
                                    </span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center gap-3 text-gray-700">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">{selectedCourse.instructor}</span>
                            </div>

                            {/* Description */}
                            <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                                <p className="text-gray-600 leading-relaxed">{selectedCourse.description || 'No description available'}</p>
                            </div>

                            {/* Course Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">Duration</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{selectedCourse.duration}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium">Schedule</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{selectedCourse.schedule}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">Enrollment</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{selectedCourse.enrollment}/{selectedCourse.seat_limit} seats</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">Status</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{capitalize(selectedCourse.status)}</p>
                                </div>
                            </div>

                            {/* Close Registration Toggle */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900">Close Registration</p>
                                            <p className="text-sm text-gray-500">Prevent new enrollments</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleToggleRegistration}
                                        className={`w-14 h-7 rounded-full transition-colors relative ${registrationClosed ? 'bg-red-600' : 'bg-green-600'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${registrationClosed ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ModalFooter */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                onClick={() => handleEditCourse(selectedCourse)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Course
                            </button>
                            <button
                                onClick={() => handleDeleteCourse(selectedCourse)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CREATE COURSE MODAL - YOUR DESIGN PRESERVED ===== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Create New Course</h3>
                                <p className="text-sm text-gray-500 mt-1">Set up a new training course for the Fab Lab.</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Course Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormState({ ...formState, image: e.target.files[0] })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                            </div>

                            {/* Course Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Advanced 3D Printing Techniques"
                                    value={formState.title}
                                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Instructor & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                                    <input
                                        type="text"
                                        placeholder="Instructor name"
                                        value={formState.instructor}
                                        onChange={(e) => setFormState({ ...formState, instructor: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 4 weeks"
                                        value={formState.duration}
                                        onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Schedule & Seat Limit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mon & Wed, 10-12"
                                        value={formState.schedule}
                                        onChange={(e) => setFormState({ ...formState, schedule: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Seat Limit</label>
                                    <input
                                        type="number"
                                        placeholder="30"
                                        value={formState.seatLimit}
                                        onChange={(e) => setFormState({ ...formState, seatLimit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Status & Registration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration</label>
                                    <select
                                        value={formState.registrationStatus}
                                        onChange={(e) => setFormState({ ...formState, registrationStatus: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    placeholder="Course description..."
                                    rows="3"
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Course
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT COURSE MODAL - YOUR DESIGN PRESERVED ===== */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Edit Course</h3>
                                <p className="text-sm text-gray-500 mt-1">Update course information</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Course Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                                <input
                                    type="text"
                                    value={formState.title}
                                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Instructor & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                                    <input
                                        type="text"
                                        value={formState.instructor}
                                        onChange={(e) => setFormState({ ...formState, instructor: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={formState.duration}
                                        onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Schedule & Seat Limit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                                    <input
                                        type="text"
                                        value={formState.schedule}
                                        onChange={(e) => setFormState({ ...formState, schedule: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Seat Limit</label>
                                    <input
                                        type="number"
                                        value={formState.seatLimit}
                                        onChange={(e) => setFormState({ ...formState, seatLimit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Status & Registration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration</label>
                                    <select
                                        value={formState.registrationStatus}
                                        onChange={(e) => setFormState({ ...formState, registrationStatus: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows="3"
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                ></textarea>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormState({ ...formState, image: e.target.files[0] })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {selectedCourse.image && (
                                    <p className="text-xs text-gray-400 mt-1">Current: {selectedCourse.image.split('/').pop()}</p>
                                )}
                                <p className="text-xs text-gray-400">PNG, JPG up to 5MB (optional)</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL - YOUR DESIGN PRESERVED ===== */}
            {showDeleteModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
                        {/* Modal Header */}
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Course?</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete <span className="font-semibold">{selectedCourse.title}</span>? This action cannot be undone.
                            </p>
                        </div>

                        {/* ModalFooter */}
                        <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}