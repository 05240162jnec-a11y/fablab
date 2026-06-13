import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// ✅ Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const navigate = useNavigate();

    // API Data States
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ NEW: Chart Data States
    const [bookingActivity, setBookingActivity] = useState([]);
    const [monthlySpending, setMonthlySpending] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [chartsLoading, setChartsLoading] = useState(true);

    // ✅ Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
        fetchChartData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const authToken = sessionStorage.getItem('auth_token');

            // ✅ Check if user is logged in
            if (!authToken) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/dashboard`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            setStudent(response.data.student || response.data.user || null);

        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError('Failed to load dashboard. Please try again.');
            setStudent(null);

            if (error.response?.status === 401 || error.response?.status === 403) {
                sessionStorage.removeItem('auth_token');
                navigate('/login');
            }

        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Fetch chart data
    const fetchChartData = async () => {
        try {
            setChartsLoading(true);
            const authToken = sessionStorage.getItem('auth_token');

            if (!authToken) return;

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            // Fetch all 3 chart endpoints in parallel
            const [bookingRes, spendingRes, productsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/dashboard/booking-activity`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/dashboard/monthly-spending`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/dashboard/top-products`, { headers }),
            ]);

            if (bookingRes.data.success) setBookingActivity(bookingRes.data.data);
            if (spendingRes.data.success) setMonthlySpending(spendingRes.data.data);
            if (productsRes.data.success) setTopProducts(productsRes.data.data);

        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setChartsLoading(false);
        }
    };

    // ✅ NEW: Booking Activity Chart Data
    const bookingActivityData = {
        labels: bookingActivity.map((item) => 
            item.machine_name.length > 15 ? item.machine_name.substring(0, 15) + '...' : item.machine_name
        ),
        datasets: [
            {
                label: 'Bookings',
                data: bookingActivity.map((item) => item.booking_count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
                ],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const bookingActivityOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    title: function (context) {
                        const idx = context[0].dataIndex;
                        return bookingActivity[idx]?.machine_name || '';
                    },
                    label: function (context) {
                        return `Bookings: ${context.parsed.y}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                    font: { size: 11 },
                    stepSize: 1,
                },
            },
        },
    };

    // ✅ NEW: Monthly Spending Chart Data
    const monthlySpendingData = {
        labels: monthlySpending.map((item) => item.month),
        datasets: [
            {
                label: 'Product Orders',
                data: monthlySpending.map((item) => item.product_revenue),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Custom Orders',
                data: monthlySpending.map((item) => item.custom_revenue),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const monthlySpendingOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12, weight: '500' },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: Nu. ${context.parsed.y.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                    font: { size: 11 },
                    callback: function (value) {
                        return 'Nu. ' + value.toLocaleString();
                    },
                },
            },
        },
    };

    // ✅ NEW: Top Products Chart Data
    const topProductsData = {
        labels: topProducts.map((item) => 
            item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
        ),
        datasets: [
            {
                label: 'Quantity Ordered',
                data: topProducts.map((item) => item.total_quantity),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
            },
        ],
    };

    const topProductsOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    title: function (context) {
                        const idx = context[0].dataIndex;
                        return topProducts[idx]?.name || '';
                    },
                    label: function (context) {
                        const idx = context.dataIndex;
                        const product = topProducts[idx];
                        return [
                            `Quantity: ${product?.total_quantity || 0}`,
                            `Revenue: Nu. ${product?.total_revenue?.toLocaleString() || 0}`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 11 } },
            },
            y: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
            },
        },
    };

    return (
        <>
            {/* Dashboard Content */}
            <main className="p-6">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700 text-sm">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Welcome Section */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {student?.name?.split(' ')[0] || 'Student'}!</h1>
                            <p className="text-gray-600">The JNEC Fab Lab is your space to design, prototype, and build. Book machines, register for training courses, and bring your ideas to life.</p>
                        </div>

                        {/* ✅ NEW: Charts Section - ONLY 3 CHARTS */}
                        <div className="mb-6">
                            {/* Charts Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">My Activity Analytics</h3>
                                    <p className="text-sm text-gray-500">Track your bookings, spending, and favorite products</p>
                                </div>
                                {chartsLoading && (
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Loading charts...
                                    </div>
                                )}
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Booking Activity (Bar Chart) */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">My Booking Activity</h4>
                                            <p className="text-xs text-gray-500 mt-1">Top 5 most used machines</p>
                                        </div>
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {chartsLoading ? (
                                        <div className="h-64 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    ) : bookingActivity.length === 0 ? (
                                        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                            No booking data available
                                        </div>
                                    ) : (
                                        <div className="h-64">
                                            <Bar data={bookingActivityData} options={bookingActivityOptions} />
                                        </div>
                                    )}
                                </div>

                                {/* Monthly Spending (Line Chart) */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">Monthly Spending</h4>
                                            <p className="text-xs text-gray-500 mt-1">Last 6 months spending trend</p>
                                        </div>
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                    </div>
                                    {chartsLoading ? (
                                        <div className="h-64 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
                                        </div>
                                    ) : monthlySpending.length === 0 ? (
                                        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                            No spending data available
                                        </div>
                                    ) : (
                                        <div className="h-64">
                                            <Line data={monthlySpendingData} options={monthlySpendingOptions} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Products Chart (Full Width) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900">Top Products I Order</h4>
                                        <p className="text-xs text-gray-500 mt-1">Most frequently purchased products</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                </div>
                                {chartsLoading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
                                    </div>
                                ) : topProducts.length === 0 ? (
                                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                        No product order data available
                                    </div>
                                ) : (
                                    <div className="h-64">
                                        <Bar data={topProductsData} options={topProductsOptions} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}