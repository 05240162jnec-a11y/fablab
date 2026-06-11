import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Courses() {
    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAbsentConfirm, setShowAbsentConfirm] = useState(false);
    const [pendingAbsentId, setPendingAbsentId] = useState(null);

    // Custom Alert/Confirm Modal States
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [customAlertData, setCustomAlertData] = useState({
        type: 'success',
        title: '',
        message: '',
        onConfirm: null,
    });

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [registrationClosed, setRegistrationClosed] = useState(false);

    // Enrolled Users States
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentFilter, setEnrollmentFilter] = useState('all');
    const [enrollmentSearch, setEnrollmentSearch] = useState('');
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [enrollmentError, setEnrollmentError] = useState(null);

    // Completion tracking state
    const [completionStatus, setCompletionStatus] = useState({});
    const [savingCompletion, setSavingCompletion] = useState(false);

    // ✅ NEW: Production Team State (for dynamic instructor dropdown)
    const [productionTeam, setProductionTeam] = useState([]);
    const [loadingProductionTeam, setLoadingProductionTeam] = useState(false);

    // Create/Edit Form State - ✅ REMOVED status and registrationStatus
    const [formState, setFormState] = useState({
        title: '',
        instructor: '',
        start_date: '',
        end_date: '',
        seatLimit: '',
        description: '',
        image: null,
    });

    // Backend State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ NEW: Fetch production team from API
    const fetchProductionTeam = async () => {
        try {
            setLoadingProductionTeam(true);
            const token = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/courses/production-team', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setProductionTeam(response.data.data);
            }
        } catch (err) {
            console.error('Fetch production team error:', err);
            showCustomModal('error', 'Error', 'Failed to load production team members.');
        } finally {
            setLoadingProductionTeam(false);
        }
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

    // Fetch enrolled users for a course
    const fetchEnrollments = async (courseId) => {
        try {
            setEnrollmentsLoading(true);
            setEnrollmentError(null);
            const token = localStorage.getItem('admin_token');

            const response = await axios.get(`http://127.0.0.1:8000/api/admin/courses/${courseId}/enrollments`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setEnrollments(response.data.data);
                const initialStatus = {};
                response.data.data.forEach(user => {
                    initialStatus[user.enrollment_id] = user.status === 'completed' ? 'completed' : null;
                });
                setCompletionStatus(initialStatus);
            }
        } catch (err) {
            console.error('Fetch enrollments error:', err);
            setEnrollmentError('Failed to load enrolled users.');
        } finally {
            setEnrollmentsLoading(false);
        }
    };

    // Show custom alert/confirm
    const showCustomModal = (type, title, message, onConfirm = null) => {
        setCustomAlertData({ type, title, message, onConfirm });
        setShowCustomAlert(true);
    };

    // Mark all as completed
    const handleMarkAllCompleted = () => {
        const newStatus = {};
        filteredEnrollments.forEach(user => {
            newStatus[user.enrollment_id] = 'completed';
        });
        setCompletionStatus({ ...completionStatus, ...newStatus });
    };

    // Toggle individual completion status
    const handleToggleStatus = (enrollmentId, status) => {
        if (status === 'absent') {
            setPendingAbsentId(enrollmentId);
            setShowAbsentConfirm(true);
        } else {
            setCompletionStatus(prev => ({
                ...prev,
                [enrollmentId]: status
            }));
        }
    };

    // Confirm absent marking
    const confirmMarkAbsent = () => {
        if (pendingAbsentId) {
            setCompletionStatus(prev => ({
                ...prev,
                [pendingAbsentId]: 'absent'
            }));
            setPendingAbsentId(null);
            setShowAbsentConfirm(false);
        }
    };

    // Save completion changes
    const handleSaveCompletion = async () => {
        try {
            setSavingCompletion(true);
            const token = localStorage.getItem('admin_token');

            const updates = Object.entries(completionStatus)
                .filter(([_, status]) => status === 'completed' || status === 'absent')
                .map(([enrollment_id, status]) => ({
                    enrollment_id: parseInt(enrollment_id),
                    status: status
                }));

            if (updates.length === 0) {
                showCustomModal('info', 'No Changes', 'No changes to save.');
                setSavingCompletion(false);
                return;
            }

            const response = await axios.put(
                `http://127.0.0.1:8000/api/admin/courses/${selectedCourse.id}/enrollments/bulk-update`,
                { updates },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                showCustomModal('success', 'Success', response.data.message);
                await fetchEnrollments(selectedCourse.id);
                fetchCourses();
            }
        } catch (err) {
            console.error('Save completion error:', err);
            if (err.response?.data?.message) {
                showCustomModal('error', 'Error', err.response.data.message);
            } else {
                showCustomModal('error', 'Error', 'Failed to save completion status. Please try again.');
            }
        } finally {
            setSavingCompletion(false);
        }
    };

    // Remove user from course
    const handleRemoveUser = (courseId, userId, userName, enrollmentId) => {
        showCustomModal(
            'confirm',
            'Remove User',
            `Are you sure you want to remove "${userName}" from this course?`,
            async () => {
                try {
                    const token = localStorage.getItem('admin_token');

                    await axios.delete(`http://127.0.0.1:8000/api/admin/courses/${courseId}/enrollments/${enrollmentId}`, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        }
                    });

                    setEnrollments(prev => prev.filter(u => u.enrollment_id !== enrollmentId));
                    showCustomModal('success', 'Success', `"${userName}" has been removed from the course.`);
                    fetchCourses();
                } catch (err) {
                    console.error('Remove user error:', err);
                    if (err.response?.data?.message) {
                        showCustomModal('error', 'Error', err.response.data.message);
                    } else {
                        showCustomModal('error', 'Error', 'Failed to remove user. Please try again.');
                    }
                }
            }
        );
    };

    // Download enrollments as CSV
    const handleDownloadEnrollments = async (courseId, courseTitle) => {
        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.get(
                `http://127.0.0.1:8000/api/admin/courses/${courseId}/enrollments/download`,
                {
                    headers: {
                        'Accept': 'text/csv',
                        'Authorization': `Bearer ${token}`,
                    },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = courseTitle.replace(/[^a-z0-9]/gi, '_');
            link.setAttribute('download', `${safeTitle}_enrollments.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Download error:', err);
            showCustomModal('error', 'Error', 'Failed to download enrollments. Please try again.');
        }
    };

    // Clear active enrollments
    const handleClearEnrollments = (courseId, courseTitle) => {
        showCustomModal(
            'confirm',
            'Clear Enrollments',
            `Are you sure you want to CLEAR all active enrollments for "${courseTitle}"?\n\n✅ Completion records will be PRESERVED for machine booking.\n✅ Only active (enrolled) users will be cleared.\n\nThis action cannot be undone.`,
            async () => {
                try {
                    const token = localStorage.getItem('admin_token');

                    const response = await axios.post(
                        `http://127.0.0.1:8000/api/admin/courses/${courseId}/enrollments/clear`,
                        {},
                        {
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.data.success) {
                        showCustomModal('success', 'Success', response.data.message);
                        await fetchEnrollments(courseId);
                        fetchCourses();
                    }
                } catch (err) {
                    console.error('Clear error:', err);
                    if (err.response?.data?.message) {
                        showCustomModal('error', 'Error', err.response.data.message);
                    } else {
                        showCustomModal('error', 'Error', 'Failed to clear enrollments. Please try again.');
                    }
                }
            }
        );
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

    // Get enrollment status badge
    const getEnrollmentStatusClass = (status) => {
        switch (status) {
            case 'enrolled':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'dropped':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Filter enrollments by role AND search query
    const filteredEnrollments = enrollments.filter(user => {
        if (enrollmentFilter !== 'all' && user.role !== enrollmentFilter) return false;

        if (enrollmentSearch) {
            const query = enrollmentSearch.toLowerCase();
            return (
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.role?.toLowerCase().includes(query) ||
                user.department?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    // Check if course is ending soon
    const isCourseEndingSoon = (endDate) => {
        if (!endDate) return false;
        const end = new Date(endDate);
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return end <= sevenDaysFromNow && end >= today;
    };

    // Open Create Modal - ✅ UPDATED: Fetch production team
    const handleCreateCourse = () => {
        setFormState({
            title: '',
            instructor: '',
            start_date: '',
            end_date: '',
            seatLimit: '',
            description: '',
            image: null,
        });
        setShowCreateModal(true);
        fetchProductionTeam(); // ✅ Fetch production team when opening create modal
    };

    // Open View Modal
    const handleViewCourse = async (course) => {
        setSelectedCourse(course);
        setRegistrationClosed(course.registration_status === 'closed');
        setShowViewModal(true);
        await fetchEnrollments(course.id);
    };

    // Open Edit Modal - ✅ UPDATED: Fetch production team
    const handleEditCourse = (course) => {
        setSelectedCourse(course);
        setFormState({
            title: course.title,
            instructor: course.instructor,
            start_date: course.start_date ? course.start_date.split('T')[0] : '',
            end_date: course.end_date ? course.end_date.split('T')[0] : '',
            seatLimit: course.seat_limit,
            description: course.description || '',
            image: null,
        });
        setShowViewModal(false);
        setShowEditModal(true);
        fetchProductionTeam(); // ✅ Fetch production team when opening edit modal
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
            fetchCourses();
            showCustomModal('success', 'Success', `Registration for "${selectedCourse.title}" has been ${!registrationClosed ? 'closed' : 'opened'}.`);
        } catch (err) {
            console.error('Toggle registration error:', err);
            showCustomModal('error', 'Error', 'Failed to update registration status');
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
            fetchCourses();
            showCustomModal('success', 'Success', `Course "${selectedCourse.title}" deleted successfully!`);
        } catch (err) {
            console.error('Delete error:', err);
            showCustomModal('error', 'Error', 'Failed to delete course');
        }
    };

    // Save Create - ✅ UPDATED: Hardcode status and registration_status
    const handleSaveCreate = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('instructor', formState.instructor);
            formData.append('start_date', formState.start_date);
            formData.append('end_date', formState.end_date);
            formData.append('seat_limit', formState.seatLimit);
            // ✅ Hardcode these values
            formData.append('status', 'active');
            formData.append('registration_status', 'open');
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
            fetchCourses();
            showCustomModal('success', 'Success', `Course "${formState.title}" created successfully!`);
        } catch (err) {
            console.error('Create error:', err);
            if (err.response?.data?.errors) {
                const errors = Object.values(err.response.data.errors).flat().join('\n');
                showCustomModal('error', 'Validation Error', errors);
            } else if (err.response?.data?.message) {
                showCustomModal('error', 'Error', err.response.data.message);
            } else {
                showCustomModal('error', 'Error', 'Failed to create course');
            }
        }
    };

    // Save Edit - ✅ UPDATED: Hardcode status and registration_status
    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('instructor', formState.instructor);
            formData.append('start_date', formState.start_date);
            formData.append('end_date', formState.end_date);
            formData.append('seat_limit', formState.seatLimit);
            // ✅ Hardcode these values
            formData.append('status', 'active');
            formData.append('registration_status', 'open');
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
            fetchCourses();
            showCustomModal('success', 'Success', `Course "${formState.title}" updated successfully!`);
        } catch (err) {
            console.error('Update error:', err);
            if (err.response?.data?.errors) {
                const errors = Object.values(err.response.data.errors).flat().join('\n');
                showCustomModal('error', 'Validation Error', errors);
            } else if (err.response?.data?.message) {
                showCustomModal('error', 'Error', err.response.data.message);
            } else {
                showCustomModal('error', 'Error', 'Failed to update course');
            }
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowCreateModal(false);
        setShowViewModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowAbsentConfirm(false);
        setShowCustomAlert(false);
        setSelectedCourse(null);
        setEnrollments([]);
        setEnrollmentFilter('all');
        setEnrollmentSearch('');
        setCompletionStatus({});
        setPendingAbsentId(null);
        setCustomAlertData({ type: 'success', title: '', message: '', onConfirm: null });
    };

    // Get alert icon based on type
    const getAlertIcon = (type) => {
        const icons = {
            success: (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            error: (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            warning: (
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            info: (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            confirm: (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        };
        return icons[type] || icons.info;
    };

    return (
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
                                        className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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

            {/* ===== VIEW COURSE DETAILS MODAL ===== */}
            {showViewModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
                                <p className="text-sm text-gray-500 mt-1">View and manage this course</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Course Image */}
                            {selectedCourse.image && (
                                <img
                                    src={`http://127.0.0.1:8000/storage/${selectedCourse.image}`}
                                    alt={selectedCourse.title}
                                    className="w-full h-48 object-cover rounded-lg mb-6"
                                />
                            )}

                            {/* Title & Status */}
                            <div className="mb-6">
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h4>
                                <div className="flex gap-2 flex-wrap">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedCourse.status)}`}>
                                        {capitalize(selectedCourse.status)}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${registrationClosed ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                        {registrationClosed ? 'Closed' : 'Open'}
                                    </span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center gap-3 text-gray-700 mb-6">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">{selectedCourse.instructor}</span>
                            </div>

                            {/* Description */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                                <p className="text-gray-600 leading-relaxed">{selectedCourse.description || 'No description available'}</p>
                            </div>

                            {/* Course Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedCourse.start_date
                                            ? new Date(selectedCourse.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedCourse.end_date
                                            ? new Date(selectedCourse.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Enrollment</p>
                                    <p className="font-semibold text-gray-900">{selectedCourse.enrollment}/{selectedCourse.seat_limit}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <p className="font-semibold text-gray-900">{capitalize(selectedCourse.status)}</p>
                                </div>
                            </div>

                            {/* ENROLLED USERS SECTION */}
                            <div className="mb-6">
                                {/* No-Show Warning */}
                                {isCourseEndingSoon(selectedCourse.end_date) && filteredEnrollments.length > 0 && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-xs text-yellow-800">
                                            ⚠️ <strong>Course ends soon!</strong> Mark attendance for all users before {new Date(selectedCourse.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-semibold text-gray-900">
                                        Enrolled Users ({filteredEnrollments.length})
                                    </h5>

                                    <div className="flex items-center gap-2">
                                        {/* Role Filter Dropdown */}
                                        <select
                                            value={enrollmentFilter}
                                            onChange={(e) => setEnrollmentFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="all">All Roles</option>
                                            <option value="student">Students</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="outsider">Outsiders</option>
                                        </select>

                                        {/* Download Button */}
                                        <button
                                            onClick={() => handleDownloadEnrollments(selectedCourse.id, selectedCourse.title)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            title="Download as CSV"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>

                                        {/* Clear Button */}
                                        {filteredEnrollments.length > 0 && (
                                            <button
                                                onClick={() => handleClearEnrollments(selectedCourse.id, selectedCourse.title)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                title="Clear active enrollments (preserves completions)"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-4">
                                    <div className="relative max-w-md">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, role, or department..."
                                            value={enrollmentSearch}
                                            onChange={(e) => setEnrollmentSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                        {enrollmentSearch && (
                                            <button
                                                onClick={() => setEnrollmentSearch('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Mark All Button */}
                                {filteredEnrollments.length > 0 && (
                                    <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="text-sm text-blue-800">
                                            <strong>Quick Action:</strong> Mark attendance for all filtered users
                                        </div>
                                        <button
                                            onClick={handleMarkAllCompleted}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Mark All as Completed
                                        </button>
                                    </div>
                                )}

                                {/* Loading/Error States */}
                                {enrollmentsLoading && (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                        <p className="text-gray-500 mt-2">Loading enrolled users...</p>
                                    </div>
                                )}

                                {enrollmentError && !enrollmentsLoading && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                        {enrollmentError}
                                    </div>
                                )}

                                {/* Users Table */}
                                {!enrollmentsLoading && !enrollmentError && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Department</th>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Phone</th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-600">Attendance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredEnrollments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                            {enrollmentFilter === 'all' && !enrollmentSearch
                                                                ? 'No active users enrolled in this course yet.'
                                                                : enrollmentSearch
                                                                    ? 'No users match your search.'
                                                                    : `No ${enrollmentFilter}s found.`}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredEnrollments.map((user) => {
                                                        const status = completionStatus[user.enrollment_id];
                                                        return (
                                                            <tr key={user.enrollment_id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3">
                                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-xs text-gray-400 md:hidden">{user.email}</div>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{user.email}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${user.role === 'student' ? 'bg-blue-100 text-blue-700' :
                                                                        user.role === 'faculty' ? 'bg-purple-100 text-purple-700' :
                                                                            'bg-orange-100 text-orange-700'
                                                                        }`}>
                                                                        {capitalize(user.role)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{user.department || '-'}</td>
                                                                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{user.phone}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {/* Completed Button */}
                                                                        <button
                                                                            onClick={() => handleToggleStatus(user.enrollment_id, 'completed')}
                                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status === 'completed'
                                                                                ? 'bg-green-500 text-white shadow-md'
                                                                                : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                                                                                }`}
                                                                            title="Mark as Completed"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </button>
                                                                        {/* Absent Button */}
                                                                        <button
                                                                            onClick={() => handleToggleStatus(user.enrollment_id, 'absent')}
                                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status === 'absent'
                                                                                ? 'bg-red-500 text-white shadow-md'
                                                                                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                                                                                }`}
                                                                            title="Mark as Absent"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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

                        {/* Modal Footer - Sticky with Save Changes Button */}
                        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
                            <div className="flex items-center gap-3">
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
                            <button
                                onClick={handleSaveCompletion}
                                disabled={savingCompletion}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingCompletion ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ABSENT CONFIRMATION MODAL ===== */}
            {showAbsentConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Mark as Absent?</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to mark this user as absent? They will be removed from the course.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAbsentConfirm(false);
                                    setPendingAbsentId(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmMarkAbsent}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CUSTOM ALERT/CONFIRM MODAL ===== */}
            {showCustomAlert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${customAlertData.type === 'success' ? 'bg-green-100' :
                                customAlertData.type === 'error' ? 'bg-red-100' :
                                    customAlertData.type === 'warning' ? 'bg-yellow-100' :
                                        'bg-blue-100'
                                }`}>
                                {getAlertIcon(customAlertData.type)}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{customAlertData.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-6 whitespace-pre-line">{customAlertData.message}</p>
                        <div className="flex gap-3">
                            {customAlertData.type === 'confirm' ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowCustomAlert(false);
                                            setCustomAlertData({ type: 'success', title: '', message: '', onConfirm: null });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCustomAlert(false);
                                            if (customAlertData.onConfirm) {
                                                customAlertData.onConfirm();
                                            }
                                            setCustomAlertData({ type: 'success', title: '', message: '', onConfirm: null });
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowCustomAlert(false);
                                        setCustomAlertData({ type: 'success', title: '', message: '', onConfirm: null });
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CREATE COURSE MODAL ===== */}
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
                                    required
                                />
                            </div>

                            {/* ✅ UPDATED: Dynamic Instructor Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
                                <select
                                    value={formState.instructor}
                                    onChange={(e) => setFormState({ ...formState, instructor: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                    disabled={loadingProductionTeam}
                                >
                                    <option value="">
                                        {loadingProductionTeam ? 'Loading instructors...' : 'Select Instructor...'}
                                    </option>
                                    {productionTeam.map(member => (
                                        <option key={member.id} value={member.name}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {loadingProductionTeam
                                        ? 'Loading production team members...'
                                        : productionTeam.length === 0
                                            ? 'No production team members found. Please add team members first.'
                                            : 'Select from active production team members.'}
                                </p>
                            </div>

                            {/* Course Dates - Required */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formState.start_date || ''}
                                        onChange={(e) => setFormState({ ...formState, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formState.end_date || ''}
                                        onChange={(e) => setFormState({ ...formState, end_date: e.target.value })}
                                        min={formState.start_date}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Can be the same as start date for single-day courses</p>
                                </div>
                            </div>

                            {/* Seat Limit */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Seat Limit *</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="30"
                                    value={formState.seatLimit}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow numbers
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setFormState({ ...formState, seatLimit: value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Enter the maximum number of seats available</p>
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

            {/* ===== EDIT COURSE MODAL ===== */}
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
                                    required
                                />
                            </div>

                            {/* ✅ UPDATED: Dynamic Instructor Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
                                <select
                                    value={formState.instructor}
                                    onChange={(e) => setFormState({ ...formState, instructor: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                    disabled={loadingProductionTeam}
                                >
                                    <option value="">
                                        {loadingProductionTeam ? 'Loading instructors...' : 'Select Instructor...'}
                                    </option>
                                    {productionTeam.map(member => (
                                        <option key={member.id} value={member.name}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {loadingProductionTeam
                                        ? 'Loading production team members...'
                                        : productionTeam.length === 0
                                            ? 'No production team members found.'
                                            : 'Select from active production team members.'}
                                </p>
                            </div>

                            {/* Course Dates - Required */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formState.start_date || ''}
                                        onChange={(e) => setFormState({ ...formState, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formState.end_date || ''}
                                        onChange={(e) => setFormState({ ...formState, end_date: e.target.value })}
                                        min={formState.start_date}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Can be the same as start date for single-day courses</p>
                                </div>
                            </div>

                            {/* Seat Limit */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Seat Limit *</label>
                                <input
                                    type="number"
                                    value={formState.seatLimit}
                                    onChange={(e) => setFormState({ ...formState, seatLimit: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="1"
                                />
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

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
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

                        {/* Modal Footer */}
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