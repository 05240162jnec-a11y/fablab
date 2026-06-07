import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssignedOrders from './AssignedOrders';

export default function ProductionTeamCustomOrders() {
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ NEW: Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchAllOrders = async () => {
            if (activeTab !== 'all') return;

            try {
                setLoading(true);
                setError(null);
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

    // ✅ NEW: Open modal with order details
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    // ✅ NEW: Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    // ✅ NEW: Download single image
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

    // ✅ NEW: Download all images as ZIP
    const downloadAllImages = async (order) => {
        try {
            // For now, download individual images
            // In production, you'd use a library like JSZip to create a ZIP file
            const images = order.design_images || (order.design_image ? [order.design_image] : []);

            if (images.length === 0) {
                alert('No images available to download');
                return;
            }

            for (let i = 0; i < images.length; i++) {
                const imageUrl = `http://127.0.0.1:8000/storage/${images[i]}`;
                const filename = `order-${order.id}-image-${i + 1}.jpg`;
                await downloadImage(imageUrl, filename);
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error('Download all error:', error);
            alert('Failed to download images');
        }
    };

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
        <div className="min-h-screen bg-gray-50">
            {/* ✅ Sticky Page Header */}
            <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 border-b border-gray-200">
                <div className="p-6 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Custom Orders</h2>
                    <p className="text-sm text-gray-600">View fabrication requests and manage your assigned tasks</p>
                </div>

                {/* ✅ Tab Navigation */}
                <div className="px-6 border-b border-gray-200">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assigned'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My Assigned Orders
                        </button>
                    </nav>
                </div>
            </div>

            <div className="px-6 pb-6">
                {/* Tab Content */}
                {activeTab === 'all' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading && (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="p-6 text-center text-red-600 bg-red-50 border-b border-red-200">
                                ⚠️ {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    {/* Remove the Actions column header */}
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => handleViewOrder(order)}
                                            >
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

                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-900 text-sm">{order.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{order.user?.email || '—'}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-green-700 text-sm">
                                                        Nu. {order.estimated_price ? parseFloat(order.estimated_price).toFixed(2) : '0.00'}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {order.payment_screenshot ? (
                                                        <a
                                                            href={`http://127.0.0.1:8000/storage/${order.payment_screenshot}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            View Screenshot
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Not uploaded</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {order.assigned_user ? (
                                                        <span className="text-sm text-gray-800 font-medium">{order.assigned_user.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Unassigned</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

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
                    <AssignedOrders />
                )}
            </div>

            {/* ✅ NEW: Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Order #{String(selectedOrder.id).padStart(4, '0')}</p>
                            </div>
                            <button onClick={closeModal} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Title</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.title || 'Untitled'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{selectedOrder.user?.email || '—'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Price</p>
                                    <p className="font-semibold text-green-700">Nu. {selectedOrder.estimated_price ? parseFloat(selectedOrder.estimated_price).toFixed(2) : '0.00'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedOrder.description || 'No description provided'}</p>
                            </div>

                            {/* Design Images */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
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
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {(selectedOrder.design_images || (selectedOrder.design_image ? [selectedOrder.design_image] : [])).map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${img}`}
                                                alt={`Design ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                onClick={() => downloadImage(`http://127.0.0.1:8000/storage/${img}`, `order-${selectedOrder.id}-image-${index + 1}.jpg`)}
                                                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                    {(!selectedOrder.design_images && !selectedOrder.design_image) && (
                                        <div className="col-span-3 text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
                                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p>No design images uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Screenshot */}
                            {selectedOrder.payment_screenshot && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Payment Screenshot</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${selectedOrder.payment_screenshot}`}
                                            alt="Payment"
                                            className="max-w-md h-auto rounded-lg border border-gray-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}