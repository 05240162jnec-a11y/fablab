import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Gallery() {
    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // ✅ NEW: Delete confirmation modal
    const [selectedImage, setSelectedImage] = useState(null);

    // API Data States
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ NEW: Toast Notification State
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success', // 'success' | 'error'
    });

    // Form State
    const [formData, setFormData] = useState({
        image: null,
        imagePreview: null,
        title: '',
        description: '',
    });
    const [uploading, setUploading] = useState(false);

    // Fetch gallery images on component mount
    useEffect(() => {
        fetchGalleryImages();
    }, []);

    // ✅ NEW: Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // ✅ NEW: Show Toast Notification
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const fetchGalleryImages = async () => {
        try {
            setLoading(true);
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/gallery`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            setGalleryImages(response.data.galleries);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            showToast('Failed to load gallery images. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Image Upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file),
            });
        }
    };

    // Handle Form Input Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Open View Modal
    const handleViewImage = (image) => {
        setSelectedImage(image);
        setShowViewModal(true);
    };

    // Open Add Modal
    const handleAddImage = () => {
        setFormData({
            image: null,
            imagePreview: null,
            title: '',
            description: '',
        });
        setShowAddModal(true);
    };

    // Submit Add Image Form
    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            showToast('Please select an image to upload.', 'error');
            return;
        }

        try {
            setUploading(true);
            const adminToken = localStorage.getItem('admin_token');

            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('image', formData.image);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/gallery`,
                formDataToSend,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Add new image to list
            setGalleryImages([response.data.gallery, ...galleryImages]);
            setShowAddModal(false);
            showToast('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Failed to upload image. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // ✅ NEW: Show Delete Confirmation Modal
    const handleDeleteImage = () => {
        setShowDeleteConfirm(true);
    };

    // ✅ NEW: Confirm Delete
    const confirmDelete = async () => {
        try {
            const adminToken = localStorage.getItem('admin_token');

            await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/gallery/${selectedImage.id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            setGalleryImages(galleryImages.filter(img => img.id !== selectedImage.id));
            setShowViewModal(false);
            setShowDeleteConfirm(false);
            setSelectedImage(null);
            showToast('Image deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast('Failed to delete image. Please try again.', 'error');
            setShowDeleteConfirm(false);
        }
    };

    // ✅ NEW: Cancel Delete
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Close All Modals
    const closeAllModals = () => {
        setShowAddModal(false);
        setShowViewModal(false);
        setShowDeleteConfirm(false);
        setSelectedImage(null);
    };

    return (
        <div className="flex-1">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
                        <p className="text-sm text-gray-600 mt-1">Showcase Fab Lab projects and creations</p>
                    </div>

                    {/* Add Image Button */}
                    <button
                        onClick={handleAddImage}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Image
                    </button>
                </div>
            </header>

            {/* Gallery Content */}
            <main className="p-6">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading gallery...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && galleryImages.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No images in gallery yet.</p>
                        <p className="text-gray-400 text-sm mt-2">Click "Add Image" to upload your first image.</p>
                    </div>
                )}

                {/* Gallery Grid */}
                {!loading && galleryImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {galleryImages.map((image) => (
                            <div
                                key={image.id}
                                onClick={() => handleViewImage(image)}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={image.image}
                                        alt={image.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800';
                                        }}
                                    />
                                    {/* View Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{image.title}</h3>
                                    <div className="flex items-center justify-end">
                                        <span className="text-xs text-gray-500">{image.uploadedAt}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ===== ADD IMAGE MODAL ===== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Add Gallery Image</h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitAdd}>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-600">Upload a new image to the gallery.</p>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            {formData.imagePreview ? (
                                                <img src={formData.imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                            ) : (
                                                <>
                                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600">Click to upload image</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Image title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description..."
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                    {uploading ? 'Uploading...' : 'Add Image'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== VIEW IMAGE MODAL ===== */}
            {showViewModal && selectedImage && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header - Fixed at top */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedImage.title}</h3>
                                <p className="text-sm text-gray-600">{selectedImage.description}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Image - Scrollable content area */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
                            <div className="rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={selectedImage.image}
                                    alt={selectedImage.title}
                                    className="w-full h-auto max-h-[60vh] object-contain bg-black"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800';
                                    }}
                                />
                            </div>

                            {/* Meta Info - Below image */}
                            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
                                <span className="text-sm text-gray-600">
                                    Uploaded by <span className="font-medium">{selectedImage.uploadedBy}</span> on {selectedImage.uploadedAt}
                                </span>
                            </div>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                            <button
                                onClick={handleDeleteImage}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: DELETE CONFIRMATION MODAL */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete <span className="font-semibold">"{selectedImage?.title}"</span>? This will permanently remove the image from the gallery.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: TOAST NOTIFICATION */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[9999] animate-fade-in">
                    <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[350px] ${toast.type === 'success'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-red-500 to-rose-600'
                        } text-white`}>
                        {toast.type === 'success' ? (
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast({ show: false, message: '', type: 'success' })}
                            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}