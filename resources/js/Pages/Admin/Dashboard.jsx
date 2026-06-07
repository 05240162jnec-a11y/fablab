import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Doughnut, Bar, Line } from 'react-chartjs-2';

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
    // ✅ Chart Data States
    const [userDistribution, setUserDistribution] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [mostBookedMachines, setMostBookedMachines] = useState([]);
    const [chartsLoading, setChartsLoading] = useState(true);

    useEffect(() => {
        fetchChartData();
    }, []);

    // ✅ Fetch all chart data
    const fetchChartData = async () => {
        try {
            setChartsLoading(true);
            const adminToken = localStorage.getItem('admin_token');
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            };

            // Fetch all 4 chart endpoints in parallel
            const [userRes, productsRes, revenueRes, machinesRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/admin/dashboard/user-distribution', { headers }),
                axios.get('http://127.0.0.1:8000/api/admin/dashboard/top-products', { headers }),
                axios.get('http://127.0.0.1:8000/api/admin/dashboard/monthly-revenue', { headers }),
                axios.get('http://127.0.0.1:8000/api/admin/dashboard/most-booked-machines', { headers }),
            ]);

            if (userRes.data.success) setUserDistribution(userRes.data.data);
            if (productsRes.data.success) setTopProducts(productsRes.data.data);
            if (revenueRes.data.success) setMonthlyRevenue(revenueRes.data.data);
            if (machinesRes.data.success) setMostBookedMachines(machinesRes.data.data);

        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setChartsLoading(false);
        }
    };

    // ✅ NEW: User Distribution Chart Data (Doughnut)
    const userDistributionData = {
        labels: userDistribution.map((item) => item.role),
        datasets: [
            {
                data: userDistribution.map((item) => item.count),
                backgroundColor: [
                    '#3b82f6', // Blue - Students
                    '#10b981', // Green - Faculty
                    '#f59e0b', // Amber - Outsiders
                    '#8b5cf6', // Purple - Production Team
                    '#ef4444', // Red - Others
                ],
                borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 3,
                hoverOffset: 8,
            },
        ],
    };

    const userDistributionOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
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
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    },
                },
            },
        },
        cutout: '65%',
    };

    // ✅ NEW: Top Selling Products Chart Data (Horizontal Bar)
    const topProductsData = {
        labels: topProducts.map((item) => item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name),
        datasets: [
            {
                label: 'Units Sold',
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

    // ✅ NEW: Monthly Revenue Chart Data (Line)
    const monthlyRevenueData = {
        labels: monthlyRevenue.map((item) => item.month),
        datasets: [
            {
                label: 'Product Sales',
                data: monthlyRevenue.map((item) => item.product_revenue),
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
                data: monthlyRevenue.map((item) => item.custom_revenue),
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

    const monthlyRevenueOptions = {
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

    // ✅ NEW: Most Booked Machines Chart Data (Bar)
    const mostBookedMachinesData = {
        labels: mostBookedMachines.map((item) =>
            item.machine_name.length > 15 ? item.machine_name.substring(0, 15) + '...' : item.machine_name
        ),
        datasets: [
            {
                label: 'Total Bookings',
                data: mostBookedMachines.map((item) => item.booking_count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                ],
                borderColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
                    '#ec4899', '#0ea5e9', '#a855f7', '#22c55e', '#fb923c',
                ],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const mostBookedMachinesOptions = {
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
                        return mostBookedMachines[idx]?.machine_name || '';
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

    return (
        <div className="flex-1">
            {/* ✅ Dashboard Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <p className="text-sm text-gray-600">Welcome back, Admin. Here is an overview of your Fab Lab.</p>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="p-6">
                {/* Charts Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Analytics & Insights</h3>
                        <p className="text-sm text-gray-500">Real-time data visualization</p>
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

                {/* Charts Grid - Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* User Distribution (Doughnut Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-base font-bold text-gray-900">User Distribution</h4>
                                <p className="text-xs text-gray-500 mt-1">Breakdown by user role</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        {chartsLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : userDistribution.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                No user data available
                            </div>
                        ) : (
                            <div className="h-64">
                                <Doughnut data={userDistributionData} options={userDistributionOptions} />
                            </div>
                        )}
                    </div>

                    {/* Top Selling Products (Horizontal Bar Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-base font-bold text-gray-900">Top Selling Products</h4>
                                <p className="text-xs text-gray-500 mt-1">This month's best performers</p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                        {chartsLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
                            </div>
                        ) : topProducts.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                No sales data for this month
                            </div>
                        ) : (
                            <div className="h-64">
                                <Bar data={topProductsData} options={topProductsOptions} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Grid - Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Revenue Trends (Line Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-base font-bold text-gray-900">Monthly Revenue Trends</h4>
                                <p className="text-xs text-gray-500 mt-1">Last 6 months performance</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        {chartsLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
                            </div>
                        ) : monthlyRevenue.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                No revenue data available
                            </div>
                        ) : (
                            <div className="h-64">
                                <Line data={monthlyRevenueData} options={monthlyRevenueOptions} />
                            </div>
                        )}
                    </div>

                    {/* Most Booked Machines (Bar Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-base font-bold text-gray-900">Most Booked Machines</h4>
                                <p className="text-xs text-gray-500 mt-1">All-time booking statistics</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        {chartsLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
                            </div>
                        ) : mostBookedMachines.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                No booking data available
                            </div>
                        ) : (
                            <div className="h-64">
                                <Bar data={mostBookedMachinesData} options={mostBookedMachinesOptions} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}