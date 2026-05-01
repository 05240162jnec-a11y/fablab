import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Gallery() {
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: false,
        operations: false,
        resources: false,
        contentMedia: true,
    });

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // API Data States
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        image: null,
        imagePreview: null,
        title: '',
        category: '3D Printing',
        description: '',
    });
    const [uploading, setUploading] = useState(false);

    // Fetch gallery images on component mount
    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            setLoading(true);
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/gallery', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            setGalleryImages(response.data.galleries);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            alert('Failed to load gallery images. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
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
            category: '3D Printing',
            description: '',
        });
        setShowAddModal(true);
    };

    // Submit Add Image Form
    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            alert('Please select an image to upload.');
            return;
        }

        try {
            setUploading(true);
            const adminToken = localStorage.getItem('admin_token');

            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('image', formData.image);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);

            const response = await axios.post(
                'http://127.0.0.1:8000/api/admin/gallery',
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
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Delete Image
    const handleDeleteImage = async () => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const adminToken = localStorage.getItem('admin_token');

            await axios.delete(
                `http://127.0.0.1:8000/api/admin/gallery/${selectedImage.id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            setGalleryImages(galleryImages.filter(img => img.id !== selectedImage.id));
            setShowViewModal(false);
            setSelectedImage(null);
            alert('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    // Close All Modals
    const closeAllModals = () => {
        setShowAddModal(false);
        setShowViewModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                    <img src="../images/logo.png" className="w-15 h-15 rounded-full object-cover" alt="Logo" />
                    <div>
                        <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                        <p className="text-xs text-slate-400">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {/* Dashboard */}
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    {/* User Management */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('userManagement')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                User Management
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.userManagement ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.userManagement && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/users" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Users</Link>
                                <Link to="/admin/production-team" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Production Team</Link>
                            </div>
                        )}
                    </div>

                    {/* Operations */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('operations')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Operations
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.operations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.operations && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/machines" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Machines</Link>
                                <Link to="/admin/bookings" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Bookings</Link>
                                <Link to="/admin/courses" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Courses</Link>
                                <Link to="/admin/custom-orders" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Custom Orders</Link>
                            </div>
                        )}
                    </div>

                    {/* Resources */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('resources')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Resources
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.resources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.resources && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/inventory" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Inventory</Link>
                                <Link to="/admin/projects" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Projects</Link>
                            </div>
                        )}
                    </div>

                    {/* Content & Media — active */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('contentMedia')}
                            className="flex items-center justify-between w-full px-4 py-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-medium"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Content & Media
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.contentMedia ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.contentMedia && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/gallery" className="block px-4 py-2 text-white bg-blue-600/30 rounded-lg text-sm font-medium">Gallery</Link>
                                <Link to="/admin/faq" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">FAQ</Link>
                                <Link to="/admin/feedback" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Feedback</Link>
                            </div>
                        )}
                    </div>

                    {/* Transactions */}
                    <Link
                        to="/admin/transactions"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Transactions
                    </Link>

                    {/* Logout */}
                    <Link
                        to="/admin/login"
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-4 border-t border-slate-700/50 pt-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
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
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {image.category}
                                            </span>
                                            <span className="text-xs text-gray-500">{image.uploadedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

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

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option>3D Printing</option>
                                        <option>Laser Cutting</option>
                                        <option>CNC Machining</option>
                                        <option>PCB Fabrication</option>
                                        <option>Vinyl Cutting</option>
                                        <option>Electronics</option>
                                    </select>
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
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {selectedImage.category}
                                </span>
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
        </div>
    );
}