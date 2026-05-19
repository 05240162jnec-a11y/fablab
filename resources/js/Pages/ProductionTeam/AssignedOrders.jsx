import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssignedOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✅ Fetch real orders from backend API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');

                // ✅ Use configured axios (interceptor adds Authorization header automatically)
                const response = await axios.get('/production-team/assigned-orders');

                setOrders(response.data.orders || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // ✅ Update order status via API
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await axios.post(
                `/production-team/assigned-orders/${orderId}/update-status`,
                { status: newStatus }
            );

            // ✅ Update local state to reflect change immediately
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            console.log('✅ Status updated:', response.data.message);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            assigned: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-amber-100 text-amber-800',
            completed: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        const labels = {
            assigned: 'Assigned',
            in_progress: 'In Progress',
            completed: 'Completed',
            rejected: 'Not Feasible'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Assigned Custom Orders</h2>
            <p className="text-sm text-gray-600 mb-6">Manage fabrication requests assigned to you by the admin.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deadline</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{String(order.id).padStart(3, '0')}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{order.user_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={order.description}>
                                    {order.description}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{order.deadline || '—'}</td>
                                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {order.status === 'assigned' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition shadow-sm"
                                            >
                                                ▶ Start
                                            </button>
                                        )}
                                        {order.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-sm"
                                            >
                                                ✅ Complete
                                            </button>
                                        )}
                                        {order.design_image && (
                                            <a
                                                href={`http://127.0.0.1:8000/storage/${order.design_image}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                                            >
                                                👁 View Design
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        📭 No assigned orders yet. <br />
                        <span className="text-xs">Admin will assign custom orders to you here.</span>
                    </div>
                )}
            </div>
        </div>
    );
}