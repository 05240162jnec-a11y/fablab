import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Certificates() {
    // Page States
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        // ✅ JUST the main content - sidebar is in AdminLayout now
        <div className="flex-1">
            {/* Top Header - EXACT COPY FROM Courses.jsx */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">📜 Certificate Management</h2>
                        <p className="text-sm text-gray-600">Generate and manage course completion certificates</p>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Back to Courses Button */}
                        <Link
                            to="/admin/courses"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Courses
                        </Link>

                        {/* Admin Profile */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                AD
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Certificate Management Content */}
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

                {/* Courses List */}
                {!loading && !error && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Courses with Completed Students</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                <div className="text-sm text-gray-500">{course.instructor}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${course.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    course.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {course.enrollment} / {course.seat_limit}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                                                    Generate Certificates
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && !error && courses.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No courses found</p>
                        <p className="text-gray-400 text-sm mt-1">Create a course to start generating certificates</p>
                    </div>
                )}
            </main>
        </div>
    );
}