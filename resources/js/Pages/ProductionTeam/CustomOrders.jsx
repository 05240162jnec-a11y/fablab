import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssignedOrders from './AssignedOrders';

export default function ProductionTeamCustomOrders() {
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch all custom orders when Tab 1 is active
    useEffect(() => {
        const fetchAllOrders = async () => {
            if (activeTab !== 'all') return;

            try {
                setLoading(true);
                setError(null);
                // ✅ Axios interceptor automatically adds Authorization header
                const response = await axios.get('/production-team/custom-orders');
                setOrders(response.data.data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load custom orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, [activeTab]);

    // ✅ Status badge helper
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            paid: 'bg-blue-100 text-blue-800 border border-blue-200',
            in_progress: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
            completed: 'bg-green-100 text-green-800 border border-green-200',
            cancelled: 'bg-gray-100 text-gray-800 border border-gray-200',
        };
        const labels = {
            pending: 'PENDING',
            paid: 'PAID',
            in_progress: 'IN PROGRESS',
            completed: 'COMPLETED',
            cancelled: 'CANCELLED',
        };
        return (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status?.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Custom Orders</h2>
                <p className="text-sm text-gray-600">View fabrication requests and manage your assigned tasks</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assigned'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        My Assigned Orders
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'all' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="p-6 text-center text-red-600 bg-red-50 border-b border-red-200">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Orders Table */}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Order ID + Title */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {order.design_image ? (
                                                        <img
                                                            src={`http://127.0.0.1:8000/storage/${order.design_image}`}
                                                            alt="Design"
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                            📄
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">#{String(order.id).padStart(4, '0')}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.title || 'Untitled'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900 text-sm">{order.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{order.user?.email || '—'}</p>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-green-700 text-sm">
                                                    Nu. {order.estimated_price ? parseFloat(order.estimated_price).toFixed(2) : '0.00'}
                                                </p>
                                            </td>

                                            {/* Payment Screenshot */}
                                            <td className="px-6 py-4">
                                                {order.payment_screenshot ? (
                                                    <a
                                                        href={`http://127.0.0.1:8000/storage/${order.payment_screenshot}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                                    >
                                                        View Screenshot
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Not uploaded</span>
                                                )}
                                            </td>

                                            {/* Assigned To */}
                                            <td className="px-6 py-4">
                                                {order.assigned_user ? (
                                                    <span className="text-sm text-gray-800 font-medium">{order.assigned_user.name}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Unassigned</span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>

                                            {/* Actions (Read-Only) */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="text-gray-500 hover:text-purple-600 transition-colors"
                                                    title="View Details (Read-Only)"
                                                    onClick={() => alert(`Viewing Order #${order.id}\nTitle: ${order.title}\nDescription: ${order.description}`)}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Empty State */}
                            {orders.length === 0 && (
                                <div className="text-center py-16 text-gray-500">
                                    <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">No custom orders found</p>
                                    <p className="text-sm mt-1">Orders will appear here once users submit requests.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // ✅ Tab 2: Your existing Assigned Orders component (100% preserved)
                <AssignedOrders />
            )}
        </div>
    );
}