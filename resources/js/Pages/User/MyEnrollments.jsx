import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyEnrollments() {
    // Enrollment States
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

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
                        name: course.title,
                        instructor: course.instructor,
                        category: 'General',
                        duration: course.duration,
                        image: course.image,
                        schedule: course.schedule,
                        location: 'Fab Lab',
                    },
                    status: enrollment.status,
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

    // Toggle row expansion
    const handleRowClick = (enrollment) => {
        if (expandedRow === enrollment.id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(enrollment.id);
            setSelectedEnrollment(enrollment);
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const badges = {
            enrolled: 'bg-blue-100 text-blue-700 border border-blue-200',
            completed: 'bg-green-100 text-green-700 border border-green-200',
            not_started: 'bg-gray-100 text-gray-700 border border-gray-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
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
                enrollment.course.instructor.toLowerCase().includes(query);
        }

        return true;
    });

    // Get status counts
    const statusCounts = {
        all: enrollments.length,
        enrolled: enrollments.filter(e => e.status === 'enrolled').length,
        completed: enrollments.filter(e => e.status === 'completed').length,
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
                                placeholder="Search by course or instructor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter Tabs - Removed "Not Started" */}
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
                                onClick={() => setFilterStatus('enrolled')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'enrolled'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                Active ({statusCounts.enrolled})
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
                        </div>
                    </div>

                    {/* Enrollments List - Row-wise */}
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
                        <div className="space-y-3">
                            {filteredEnrollments.map((enrollment) => (
                                <div key={enrollment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    {/* Main Row - Clickable */}
                                    <div
                                        onClick={() => handleRowClick(enrollment)}
                                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Course Icon/Image */}
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {enrollment.course.image ? (
                                                    <img src={enrollment.course.image} alt={enrollment.course.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{enrollment.course.name}</h3>
                                                <p className="text-sm text-gray-600">Instructor: {enrollment.course.instructor}</p>
                                            </div>
                                        </div>

                                        {/* Status Badge & Expand Icon */}
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(enrollment.status)}`}>
                                                {enrollment.status === 'enrolled' ? 'Active' : enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedRow === enrollment.id ? 'transform rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedRow === enrollment.id && (
                                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                                                    <p className="font-semibold text-gray-900">{formatDate(enrollment.start_date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                                                    <p className="font-semibold text-gray-900">{formatDate(enrollment.end_date)}</p>
                                                </div>
                                            </div>

                                            {/* Certificate Available */}
                                            {enrollment.certificate_available && (
                                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-green-800">Certificate Available!</p>
                                                            <p className="text-xs text-green-700">You have completed this course.</p>
                                                        </div>
                                                        <button className="ml-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}