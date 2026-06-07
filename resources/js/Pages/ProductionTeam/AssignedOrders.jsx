import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssignedOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✅ Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderToComplete, setOrderToComplete] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');
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

    // ✅ Show confirmation modal before completing
    const handleCompleteClick = (order, e) => {
        if (e) e.stopPropagation();
        setOrderToComplete(order);
        setShowConfirmModal(true);
    };

    // ✅ Confirm completion
    const confirmComplete = async () => {
        if (!orderToComplete) return;

        try {
            await axios.post(
                `/production-team/assigned-orders/${orderToComplete.id}/update-status`,
                { status: 'completed' }
            );

            setOrders(prev => prev.map(order =>
                order.id === orderToComplete.id ? { ...order, status: 'completed' } : order
            ));

            setShowConfirmModal(false);
            setOrderToComplete(null);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus, e) => {
        if (e) e.stopPropagation();

        try {
            await axios.post(
                `/production-team/assigned-orders/${orderId}/update-status`,
                { status: newStatus }
            );

            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    // ✅ Open image modal
    const handleViewImages = (order, e) => {
        if (e) e.stopPropagation();
        setSelectedOrder(order);
        setShowImageModal(true);
    };

    // ✅ Close modals
    const closeModals = () => {
        setShowConfirmModal(false);
        setShowImageModal(false);
        setSelectedOrder(null);
        setOrderToComplete(null);
    };

    // ✅ Download single image
    const downloadImage = async (imageUrl, filename) => {
        try {
            const response = await axios.get(imageUrl, { responseType: 'blob' });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download image');
        }
    };

    // ✅ Download all images
    const downloadAllImages = async (order) => {
        try {
            const images = order.design_images || (order.design_image ? [order.design_image] : []);

            if (images.length === 0) {
                alert('No images available to download');
                return;
            }

            for (let i = 0; i < images.length; i++) {
                const imageUrl = `http://127.0.0.1:8000/storage/${images[i]}`;
                const filename = `order-${order.id}-image-${i + 1}.jpg`;
                await downloadImage(imageUrl, filename);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error('Download all error:', error);
            alert('Failed to download images');
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
            assigned: 'ASSIGNED',
            in_progress: 'IN PROGRESS',
            completed: 'COMPLETED',
            rejected: 'NOT FEASIBLE'
        };
        return (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition cursor-pointer"
                                    onClick={() => handleViewImages(order)}
                                >
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">#{String(order.id).padStart(3, '0')}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700">{order.user_name}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700 max-w-xs truncate" title={order.description}>
                                        {order.description}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(order.status)}
                                            {order.status === 'assigned' && (
                                                <button
                                                    onClick={(e) => handleStatusUpdate(order.id, 'in_progress', e)}
                                                    className="ml-2 px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition shadow-sm"
                                                >
                                                    ▶ Start
                                                </button>
                                            )}
                                            {order.status === 'in_progress' && (
                                                <button
                                                    onClick={(e) => handleCompleteClick(order, e)}
                                                    className="ml-2 px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-sm"
                                                >
                                                    ✅ Complete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        📭 No assigned orders yet. <br />
                        <span className="text-xs">Admin will assign custom orders to you here.</span>
                    </div>
                )}
            </div>

            {/* ✅ Confirmation Modal for Complete */}
            {showConfirmModal && orderToComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModals}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Completion</h3>
                                <p className="text-sm text-gray-600 mt-1">Order #{String(orderToComplete.id).padStart(3, '0')}</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Are you sure you want to mark this order as <span className="font-semibold text-green-600">completed</span>?
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-gray-800">
                                    <p className="font-semibold mb-1 text-gray-900">This action will:</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Mark the order as completed</li>
                                        <li>Notify the customer</li>
                                        <li>Cannot be undone</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModals}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmComplete}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                            >
                                Yes, Mark Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Image Viewer Modal */}
            {showImageModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Order #{String(selectedOrder.id).padStart(3, '0')} - {selectedOrder.user_name}</p>
                            </div>
                            <button onClick={closeModals} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Customer</p>
                                        <p className="font-medium text-gray-900">{selectedOrder.user_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Description</p>
                                        <p className="text-gray-700 mt-1">{selectedOrder.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Design Images */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900">Design Images</h4>
                                    {(selectedOrder.design_images || (selectedOrder.design_image ? [selectedOrder.design_image] : [])).length > 0 && (
                                        <button
                                            onClick={() => downloadAllImages(selectedOrder)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download All
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(selectedOrder.design_images || (selectedOrder.design_image ? [selectedOrder.design_image] : [])).map((img, index) => (
                                        <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${img}`}
                                                alt={`Design ${index + 1}`}
                                                className="w-full h-64 object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => downloadImage(`http://127.0.0.1:8000/storage/${img}`, `order-${selectedOrder.id}-image-${index + 1}.jpg`)}
                                                    className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 hover:bg-gray-100 transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedOrder.design_images && !selectedOrder.design_image) && (
                                        <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p>No design images uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                {selectedOrder.status === 'assigned' && (
                                    <button
                                        onClick={(e) => {
                                            closeModals(); // ✅ Close modal first
                                            setTimeout(() => handleStatusUpdate(selectedOrder.id, 'in_progress', e), 100); // ✅ Then update
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <span>▶</span> Start Production
                                    </button>
                                )}
                                {selectedOrder.status === 'in_progress' && (
                                    <button
                                        onClick={(e) => {
                                            closeModals(); // ✅ Close the image modal first
                                            setTimeout(() => handleCompleteClick(selectedOrder, e), 100); // ✅ Then show confirmation
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        <span>✅</span> Mark Complete
                                    </button>
                                )}
                                <button
                                    onClick={closeModals}
                                    className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}