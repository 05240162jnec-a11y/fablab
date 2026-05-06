import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import UserSidebar from './UserSidebar';
export default function Dashboard() {
    const location = useLocation();

    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: false,
        machines: false,
        learning: false,
        explore: false,
        support: false,
    });

    // API Data States
    const [student, setStudent] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        ongoingCourses: 0,
    });
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8000/api/student/dashboard', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            setStudent(response.data.student);
            setStats(response.data.stats);
            setAnnouncements(response.data.announcements);
            setCourses(response.data.courses);
            setRecentActivity(response.data.recentActivity);
        } catch (error) {
            console.error('Error fetching dashboard ', error);
            // Set sample data for frontend testing
            setStudent({
                name: 'Priya Sharma',
                email: 'priya.sharma@jnec.edu.bt',
                department: 'Computer Science',
                year_of_study: 3,
            });
            setStats({
                totalBookings: 12,
                pendingBookings: 3,
                approvedBookings: 8,
                ongoingCourses: 2,
            });
            setAnnouncements([
                {
                    id: 1,
                    title: 'New 3D Printer Available',
                    message: 'Prusa MK4 is now available for booking in Lab B.',
                    type: 'update',
                    date: 'Mar 1, 2026',
                },
                {
                    id: 2,
                    title: 'Laser Cutting Workshop Registration Open',
                    message: '2-week intensive workshop starting March 15. Limited seats.',
                    type: 'course',
                    date: 'Feb 28, 2026',
                },
                {
                    id: 3,
                    title: 'Lab Closed on Holi',
                    message: 'Fab Lab will remain closed on March 14 for Holi celebrations.',
                    type: 'important',
                    date: 'Feb 27, 2026',
                },
            ]);
            setCourses([
                { id: 1, title: 'CNC Machining Fundamentals', duration: '6 weeks', status: 'Open', enrolled: true },
                { id: 2, title: 'PCB Design & Fabrication', duration: '5 weeks', status: 'Open', enrolled: false },
                { id: 3, title: 'Laser Cutting Workshop', duration: '2 weeks', status: 'Open', enrolled: false },
                { id: 4, title: 'Introduction to 3D Printing', duration: '4 weeks', status: 'Closed', enrolled: true },
            ]);
            setRecentActivity([
                { id: 1, action: 'Booked 3D Printer - Ultimaker S5', date: 'Mar 2, 2026', status: 'Pending' },
                { id: 2, action: 'Registered for CNC Machining Fundamentals', date: 'Feb 28, 2026', status: 'Approved' },
                { id: 3, action: 'Booked Laser Cutter - Epilog Zing 24', date: 'Feb 25, 2026', status: 'Approved' },
                { id: 4, action: 'Booked PCB Mill - Bantam Tools', date: 'Feb 20, 2026', status: 'Rejected' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Get badge color based on type
    const getBadgeClass = (type) => {
        const badges = {
            update: 'bg-blue-100 text-blue-800',
            course: 'bg-green-100 text-green-800',
            important: 'bg-red-100 text-red-800',
        };
        return badges[type] || 'bg-gray-100 text-gray-800';
    };

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        const badges = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800',
            Open: 'bg-green-100 text-green-800',
            Closed: 'bg-gray-100 text-gray-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ Shared Sidebar Component */}
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800"></h2>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Student Profile */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {student?.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PS'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading dashboard...</p>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Welcome Section */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {student?.name?.split(' ')[0] || 'Student'}!</h1>
                                <p className="text-gray-600">The JNEC Fab Lab is your space to design, prototype, and build. Book machines, register for training courses, and bring your ideas to life.</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Total Bookings */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-600">Total Bookings</span>
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.totalBookings}</div>
                                </div>

                                {/* Pending Bookings */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-600">Pending Bookings</span>
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</div>
                                </div>

                                {/* Approved Bookings */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-600">Approved Bookings</span>
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.approvedBookings}</div>
                                </div>

                                {/* Ongoing Courses */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-600">Ongoing Courses</span>
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.ongoingCourses}</div>
                                </div>
                            </div>

                            {/* Announcements & Course Highlights */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Announcements */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                            </svg>
                                            <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
                                        </div>
                                        <Link to="/user/announcements" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                            View All
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {announcements.map((announcement) => (
                                            <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass(announcement.type)}`}>
                                                        {announcement.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                                                <p className="text-xs text-gray-500">{announcement.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Course Highlights */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                            <h2 className="text-lg font-bold text-gray-900">Course Highlights</h2>
                                        </div>
                                        <Link to="/user/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                            View All
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {courses.map((course) => (
                                            <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                                                    <p className="text-sm text-gray-500">{course.duration}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(course.status)}`}>
                                                        {course.status}
                                                    </span>
                                                    {course.enrolled ? (
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Enrolled</span>
                                                    ) : (
                                                        <button className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-50 transition-colors">
                                                            View Details
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* My Activity Summary */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <h2 className="text-lg font-bold text-gray-900">My Activity Summary</h2>
                                    </div>
                                    <Link to="/user/my-bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                        View All
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.action}</p>
                                                <p className="text-sm text-gray-500 mt-1">{activity.date}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}