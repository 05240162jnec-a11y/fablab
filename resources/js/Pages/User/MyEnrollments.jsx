import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyEnrollments() {
    // Enrollment States
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Filter & Search States
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch enrollments on mount
    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/my-courses', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                }
            });

            // API returns { courses: [...] }
            const apiEnrollments = response.data.courses || [];

            // Transform to match frontend expected structure
            const transformed = apiEnrollments.map(enrollment => {
                const course = enrollment.course || {};
                return {
                    id: 'ENR-' + new Date().getFullYear() + '-' + String(enrollment.id).padStart(3, '0'),
                    course: {
                        id: course.id,
                        name: course.title,  // Map 'title' to 'name' for frontend
                        instructor: course.instructor,
                        category: 'General',  // Simple fallback
                        duration: course.duration,
                        image: course.image,
                        schedule: course.schedule,
                        location: 'Fab Lab',  // Simple fallback
                    },
                    status: enrollment.status,  // 'enrolled', 'completed', 'not_started'
                    progress: enrollment.status === 'completed' ? 100 : (enrollment.status === 'enrolled' ? 50 : 0),
                    enrolled_date: enrollment.enrolled_at,
                    start_date: course.start_date,
                    end_date: course.end_date,
                    attendance: 0,
                    total_sessions: 1,
                    certificate_available: enrollment.status === 'completed',
                };
            });

            setEnrollments(transformed);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    // Open enrollment details modal
    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDetailsModal(true);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const badges = {
            active: 'bg-blue-100 text-blue-700 border border-blue-200',
            completed: 'bg-green-100 text-green-700 border border-green-200',
            not_started: 'bg-gray-100 text-gray-700 border border-gray-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    // Get progress color
    const getProgressColor = (progress) => {
        if (progress >= 75) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-300';
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter enrollments
    const filteredEnrollments = enrollments.filter(enrollment => {
        // Filter by status
        if (filterStatus !== 'all' && enrollment.status !== filterStatus) {
            return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return enrollment.id.toLowerCase().includes(query) ||
                enrollment.course.name.toLowerCase().includes(query) ||
                enrollment.course.instructor.toLowerCase().includes(query) ||
                enrollment.course.category.toLowerCase().includes(query);
        }

        return true;
    });

    // Get status counts
    const statusCounts = {
        all: enrollments.length,
        active: enrollments.filter(e => e.status === 'active').length,
        completed: enrollments.filter(e => e.status === 'completed').length,
        not_started: enrollments.filter(e => e.status === 'not_started').length,
    };

    return (
        <>
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading enrollments...</p>
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
                                placeholder="Search by course, instructor, or category..."
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
                                onClick={() => setFilterStatus('active')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'active'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                Active ({statusCounts.active})
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
                                onClick={() => setFilterStatus('not_started')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'not_started'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                Not Started ({statusCounts.not_started})
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
                                    <p className="text-sm text-gray-600">Active Courses</p>
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
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{enrollments.filter(e => e.certificate_available).length}</p>
                                    <p className="text-sm text-gray-600">Certificates Available</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrollments Grid */}
                    {filteredEnrollments.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No enrollments found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchQuery ? 'Try a different search term' : 'Enroll in a course to see your enrollments here'}
                            </p>
                            {!searchQuery && (
                                <Link
                                    to="/user/courses"
                                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Browse Courses
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEnrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    onClick={() => handleViewDetails(enrollment)}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                                >
                                    {/* Course Image */}
                                    <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative">
                                        {enrollment.course.image ? (
                                            <img src={enrollment.course.image} alt={enrollment.course.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        )}

                                        {/* Status Badge */}
                                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(enrollment.status)}`}>
                                            {enrollment.status === 'not_started' ? 'Not Started' : enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Course Info */}
                                    <div className="p-5">
                                        <p className="text-xs text-blue-600 font-medium mb-2">{enrollment.course.category}</p>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{enrollment.course.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3">Instructor: {enrollment.course.instructor}</p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium text-gray-900">{enrollment.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getProgressColor(enrollment.progress)}`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Schedule */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="line-clamp-1">{enrollment.course.schedule}</span>
                                        </div>

                                        {/* Attendance */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">{enrollment.attendance}</span>/{enrollment.total_sessions} sessions
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Enrollment Details Modal */}
            {showDetailsModal && selectedEnrollment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Course Details</h2>
                                <p className="text-sm text-gray-500">{selectedEnrollment.id}</p>
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
                            {/* Course Info Card */}
                            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                    {selectedEnrollment.course.image ? (
                                        <img src={selectedEnrollment.course.image} alt={selectedEnrollment.course.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{selectedEnrollment.course.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{selectedEnrollment.course.category} • {selectedEnrollment.course.duration}</p>
                                    <p className="text-sm text-gray-700">Instructor: <span className="font-medium">{selectedEnrollment.course.instructor}</span></p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedEnrollment.status)}`}>
                                    {selectedEnrollment.status === 'not_started' ? 'Not Started' : selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                                </span>
                            </div>

                            {/* Progress Section */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-4">Your Progress</h4>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Overall Progress</span>
                                        <span className="font-bold text-gray-900">{selectedEnrollment.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${getProgressColor(selectedEnrollment.progress)}`}
                                            style={{ width: `${selectedEnrollment.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedEnrollment.attendance}</p>
                                        <p className="text-xs text-gray-600">Attended</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedEnrollment.total_sessions - selectedEnrollment.attendance}</p>
                                        <p className="text-xs text-gray-600">Remaining</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedEnrollment.total_sessions}</p>
                                        <p className="text-xs text-gray-600">Total Sessions</p>
                                    </div>
                                </div>
                            </div>

                            {/* Course Schedule */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Schedule</p>
                                    <p className="font-semibold text-gray-900">{selectedEnrollment.course.schedule}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Location</p>
                                    <p className="font-semibold text-gray-900">{selectedEnrollment.course.location}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedEnrollment.start_date)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedEnrollment.end_date)}</p>
                                </div>
                            </div>

                            {/* Certificate Available */}
                            {selectedEnrollment.certificate_available && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-green-800">Certificate Available!</p>
                                            <p className="text-xs text-green-700">You have completed this course. Download your certificate now.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {selectedEnrollment.status === 'active' && (
                                    <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                        Access Materials
                                    </button>
                                )}
                                {selectedEnrollment.status === 'not_started' && (
                                    <button className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                                        View Syllabus
                                    </button>
                                )}
                                {selectedEnrollment.certificate_available && (
                                    <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                        Download Certificate
                                    </button>
                                )}
                                {selectedEnrollment.status === 'completed' && !selectedEnrollment.certificate_available && (
                                    <button className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                                        View Completed Course
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}