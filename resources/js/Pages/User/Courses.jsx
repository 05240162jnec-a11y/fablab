import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useDialog } from '../../Components/UniformDialogManager';

export default function Courses() {
    const { showAlert, showConfirm } = useDialog();
    // API Data States
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEnrollments, setUserEnrollments] = useState([]);

    // User Data State
    const [userData, setUserData] = useState(null);

    // Enrollment Form State
    const [enrollData, setEnrollData] = useState({
        name: '',
        gender: '',
        phone: '',
        email: '',
        department: '',
        year: '',
    });
    const [enrollSubmitting, setEnrollSubmitting] = useState(false);
    const [enrollMessage, setEnrollMessage] = useState('');

    // Fetch courses and user data on mount
    useEffect(() => {
        fetchCourses();
        fetchUserData();
        fetchUserEnrollments();

        // Auto-refresh courses every 30 seconds to stay in sync with admin changes
        const interval = setInterval(() => {
            fetchCourses();
            fetchUserEnrollments();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/courses', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please check your connection or try logging in again.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            setUserData(response.data.user);
        } catch (error) {
            console.error('Error fetching user ', error);
            // Fallback sample data for testing only
            setUserData({
                name: 'Test User',
                email: '12345678.jnec@rub.edu.bt',
                role: 'student',
                gender: 'male',
                phone: '17123456',
                department: 'Computer Science',
                year_of_study: 2,
            });
        }
    };

    const fetchUserEnrollments = async () => {
        try {
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/my-courses', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                }
            });

            // Get list of enrolled course IDs (filter by status)
            const enrolledIds = response.data.courses
                .filter(enrollment => enrollment.status === 'enrolled')
                .map(enrollment => enrollment.course_id);

            setUserEnrollments(enrolledIds);
        } catch (error) {
            console.error('Error fetching user enrollments:', error);
            setUserEnrollments([]);
        }
    };

    // Check if user is enrolled in a course
    const isEnrolled = (courseId) => {
        return userEnrollments.includes(courseId);
    };

    // Open enrollment modal
    const handleEnrollClick = (course) => {
        setSelectedCourse(course);

        // Pre-fill form with user data
        if (userData) {
            setEnrollData({
                name: userData.name || '',
                gender: userData.gender || '',
                phone: userData.phone || '',
                email: userData.email || '',
                department: userData.department || '',
                year: userData.year_of_study || '',
            });
        }

        setShowEnrollModal(true);
        setEnrollMessage('');
    };

    // Handle unenroll click
    const handleUnenrollClick = async (course) => {
        const confirmed = await showConfirm({
            title: 'Confirm unenroll',
            message: `Are you sure you want to unenroll from "${course.title}"?`,
            confirmText: 'Unenroll',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;


        try {
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/user/courses/${course.id}/unenroll`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            showAlert({ title: 'Success', message: '✅ ' + response.data.message });

            // Refresh courses and enrollments
            setCourses([]);
            await fetchCourses();
            await fetchUserEnrollments();
        } catch (error) {
            console.error('Unenroll error:', error);
            if (error.response?.data?.message) {
                showAlert({ title: 'Error', message: '❌ ' + error.response.data.message });
            } else {
                showAlert({ title: 'Error', message: '❌ Unenroll failed. Please try again.' });
            }
        }
    };

    // Handle enrollment form input changes
    const handleEnrollChange = (e) => {
        const { name, value } = e.target;
        setEnrollData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit enrollment
    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        setEnrollSubmitting(true);
        setEnrollMessage('');

        try {
            const authToken = localStorage.getItem('auth_token');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/user/courses/${selectedCourse.id}/enroll`,
                enrollData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setEnrollMessage('✅ ' + response.data.message);

            // Refresh courses list to update seat count
            setCourses([]);
            await fetchCourses();
            await fetchUserEnrollments();

            setTimeout(() => {
                setShowEnrollModal(false);
                setEnrollMessage('');
            }, 1000);
        } catch (error) {
            console.error('Enrollment error:', error);
            if (error.response?.data?.message) {
                setEnrollMessage('❌ ' + error.response.data.message);
            } else {
                setEnrollMessage('❌ Enrollment failed. Please try again.');
            }
        } finally {
            setEnrollSubmitting(false);
        }
    };

    // Close enrollment modal
    const closeEnrollModal = () => {
        setShowEnrollModal(false);
        setSelectedCourse(null);
        setEnrollMessage('');
    };

    // Check if user is student (shows dept/year fields)
    const isStudent = userData?.role === 'student';

    return (
        <>
            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading courses...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-12">
                    <div className="inline-block p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                        <p className="font-medium">⚠️ {error}</p>
                        <button
                            onClick={() => fetchCourses()}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
                                {/* Course Image Placeholder - Fixed Height */}
                                <div className="h-48 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>

                                {/* Course Info - Flex to fill height */}
                                <div className="p-5 flex flex-col flex-grow">
                                    {/* Title - Fixed height with truncation */}
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 min-h-[3.5rem]" title={course.title}>
                                        {course.title}
                                    </h3>

                                    {/* Seats - Fixed position */}
                                    <div className="mb-4 flex-shrink-0">
                                        {(() => {
                                            const enrolled = course.seat_limit - course.available_seats;
                                            const percentage = (enrolled / course.seat_limit) * 100;

                                            return (
                                                <>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-600">Enrolled</span>
                                                        <span className={`font-bold ${enrolled >= course.seat_limit ? 'text-red-600' : 'text-green-600'}`}>
                                                            {enrolled} / {course.seat_limit}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${enrolled >= course.seat_limit ? 'bg-red-500' :
                                                                percentage >= 70 ? 'bg-yellow-500' :
                                                                    'bg-green-500'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {enrolled >= course.seat_limit ? 'Course full' :
                                                            percentage >= 70 ? 'Filling up fast!' :
                                                                'Seats available'}
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Push button to bottom */}
                                    <div className="mt-auto pt-2">
                                        {/* Enroll/Unenroll Button - Fixed position at bottom */}
                                        <button
                                            onClick={() => {
                                                if (!course.registration_open || course.available_seats === 0) return;

                                                if (isEnrolled(course.id)) {
                                                    handleUnenrollClick(course);
                                                } else {
                                                    handleEnrollClick(course);
                                                }
                                            }}
                                            disabled={!course.registration_open || course.available_seats === 0}
                                            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${!course.registration_open || course.available_seats === 0
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : isEnrolled(course.id)
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {!course.registration_open && !isEnrolled(course.id)
                                                ? 'Registration Closed'
                                                : course.available_seats === 0
                                                    ? 'Course Full'
                                                    : !course.registration_open && isEnrolled(course.id)
                                                        ? 'Unenroll (Closed)'
                                                        : isEnrolled(course.id)
                                                            ? 'Unenroll'
                                                            : 'Enroll Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {courses.length === 0 && !error && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No courses available</p>
                            <p className="text-gray-400 text-sm mt-2">Check back later for new training sessions</p>
                        </div>
                    )}
                </>
            )}

            {/* Enrollment Modal */}
            {showEnrollModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeEnrollModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Enroll in {selectedCourse.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">Fill in your details to confirm enrollment</p>
                            </div>
                            <button onClick={closeEnrollModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleEnrollSubmit}>
                            <div className="p-6 space-y-6">
                                {/* Course Details */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">{selectedCourse.title}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="text-blue-600 font-medium">Instructor</p>
                                            <p className="text-blue-900">{selectedCourse.instructor}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-600 font-medium">Dates</p>
                                            <p className="text-blue-900">
                                                {new Date(selectedCourse.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} → {new Date(selectedCourse.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-blue-200">
                                        <p className="text-xs text-blue-700">
                                            <strong>Description:</strong> {selectedCourse.description}
                                        </p>
                                    </div>
                                </div>

                                {enrollMessage && (
                                    <div className={`p-3 rounded-lg text-sm ${enrollMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {enrollMessage}
                                    </div>
                                )}

                                {/* Enrollment Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={enrollData.name}
                                            onChange={handleEnrollChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                        <select
                                            name="gender"
                                            value={enrollData.gender}
                                            onChange={handleEnrollChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select...</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={enrollData.phone}
                                            onChange={handleEnrollChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={enrollData.email}
                                            onChange={handleEnrollChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Department - Only for Students */}
                                    {isStudent && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={enrollData.department}
                                                onChange={handleEnrollChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    {/* Year - Only for Students */}
                                    {isStudent && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                                            <select
                                                name="year"
                                                value={enrollData.year}
                                                onChange={handleEnrollChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">Year 1</option>
                                                <option value="2">Year 2</option>
                                                <option value="3">Year 3</option>
                                                <option value="4">Year 4</option>
                                                <option value="5">Year 5</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Important Note */}
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Note:</strong> You can unenroll anytime before registration closes.
                                        Course completion is automatic after the end date.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={closeEnrollModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={enrollSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                    {enrollSubmitting ? 'Enrolling...' : 'Confirm Enrollment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}