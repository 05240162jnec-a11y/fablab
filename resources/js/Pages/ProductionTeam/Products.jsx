import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Products() {
    // Product States
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // ✅ NEW: Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // ✅ NEW: Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger' // 'danger' | 'warning' | 'info'
    });

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stockAlertThreshold, setStockAlertThreshold] = useState(5);

    // ✅ NEW: State for the input field (allows empty string while typing)
    const [thresholdInput, setThresholdInput] = useState('');

    // ✅ NEW: Payment Deadline States
    const [paymentDeadlineHours, setPaymentDeadlineHours] = useState(24);
    const [deadlineLoading, setDeadlineLoading] = useState(false);

    // ✅ NEW: Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        size: '',
        price: '',
        stock: '',
        images: [],
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [otherImages, setOtherImages] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const adminToken = sessionStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/products', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Fetch Payment Deadline Setting
    const fetchSettings = async () => {
        try {
            const adminToken = sessionStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/settings/payment-deadline/hours', {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.data.success) {
                setPaymentDeadlineHours(response.data.hours);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    // ✅ NEW: Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // ✅ NEW: Custom confirmation modal
    const showCustomConfirm = (config) => {
        setConfirmConfig({
            title: config.title || 'Confirm Action',
            message: config.message || 'Are you sure?',
            onConfirm: config.onConfirm,
            confirmText: config.confirmText || 'Confirm',
            cancelText: config.cancelText || 'Cancel',
            type: config.type || 'danger'
        });
        setShowConfirmModal(true);
    };

    // ✅ UPDATED: Update Payment Deadline Setting
    const updateDeadlineHours = async (hours) => {
        // Prevent duplicate calls
        if (deadlineLoading) return;

        try {
            setDeadlineLoading(true);
            const adminToken = sessionStorage.getItem('auth_token');
            await axios.put(`http://127.0.0.1:8000/api/admin/settings/payment_upload_deadline_hours`, {
                value: hours,
                description: 'Hours allowed for user to re-upload payment after rejection'
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
            });
            showToast('✅ Payment deadline updated successfully!');
        } catch (err) {
            console.error('Error updating settings:', err);
            showToast('❌ Failed to update deadline.', 'error');
        } finally {
            setDeadlineLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchProducts();
        fetchSettings();
        fetchStockThreshold();
    }, []);

    // ✅ NEW: Fetch Stock Alert Threshold from backend
    const fetchStockThreshold = async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/settings/stock-alert/threshold', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const val = response.data.threshold;
                setStockAlertThreshold(val);
                setThresholdInput(val.toString()); // ✅ Set the input field value
            }
        } catch (err) {
            console.error('Error fetching stock threshold:', err);
        }
    };

    // ✅ NEW: Keyboard navigation for carousel
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!showDetailsModal) return;

            if (e.key === 'ArrowLeft') {
                goToPreviousImage();
            } else if (e.key === 'ArrowRight') {
                goToNextImage();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showDetailsModal, currentImageIndex, selectedProduct]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setHasUnsavedChanges(true);
    };

    // Handle thumbnail image selection
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, images: [file] }));
            const preview = URL.createObjectURL(file);
            setPreviewImages([preview]);
            setHasUnsavedChanges(true);
        }
    };

    // Handle other images selection (up to 4 additional images, excluding thumbnail)
    const handleOtherImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 4 - otherImages.length;
        const filesToAdd = files.slice(0, remainingSlots);

        if (filesToAdd.length > 0) {
            const newOtherImages = [...otherImages, ...filesToAdd];
            setFormData(prev => ({ ...prev, images: [prev.images[0], ...newOtherImages] }));

            const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
            setOtherImages(prev => [...prev, ...newPreviews]);
            setHasUnsavedChanges(true);
        }
    };

    // Remove other image (keep thumbnail intact)
    const removeOtherImage = (index) => {
        const newOtherImages = otherImages.filter((_, i) => i !== index);
        const newFormDataImages = [formData.images[0], ...newOtherImages];

        setOtherImages(newOtherImages);
        setFormData(prev => ({ ...prev, images: newFormDataImages }));
        setHasUnsavedChanges(true);
    };

    // Handle image change for Edit modal
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 4 - previewImages.length;
        const filesToAdd = files.slice(0, remainingSlots);

        if (filesToAdd.length > 0) {
            const newPreviewImages = [...previewImages, ...filesToAdd.map(file => URL.createObjectURL(file))];
            const newFormDataImages = [...formData.images, ...filesToAdd];

            setPreviewImages(newPreviewImages);
            setFormData(prev => ({ ...prev, images: newFormDataImages }));
            setHasUnsavedChanges(true);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            size: '',
            price: '',
            stock: '',
            images: [],
        });
        setPreviewImages([]);
        setOtherImages([]);
        setHasUnsavedChanges(false);
        setCurrentImageIndex(0);
    };

    // Open product details modal
    const handleViewDetails = (product) => {
        const productWithFullUrls = {
            ...product,
            images: product.images?.map(img => {
                if (img.startsWith('http')) {
                    return img;
                }
                return `http://127.0.0.1:8000/storage/${img}`;
            }) || []
        };

        setSelectedProduct(productWithFullUrls);
        setCurrentImageIndex(0);
        setShowDetailsModal(true);
    };

    // Open edit modal with product data
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            size: product.size || '',
            price: product.price,
            stock: product.stock,
            images: [],
        });

        if (product.images && product.images.length > 0) {
            const fullUrls = product.images.map(img => {
                if (img.startsWith('http')) {
                    return img;
                }
                return `http://127.0.0.1:8000/storage/${img}`;
            });
            setPreviewImages(fullUrls);
        } else {
            setPreviewImages([]);
        }

        setShowDetailsModal(false);
        setShowEditModal(true);
        setHasUnsavedChanges(false);
    };

    // ✅ NEW: Carousel Navigation Functions
    const goToPreviousImage = () => {
        if (selectedProduct?.images?.length > 0) {
            setCurrentImageIndex((prev) => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1));
        }
    };

    const goToNextImage = () => {
        if (selectedProduct?.images?.length > 0) {
            setCurrentImageIndex((prev) => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1));
        }
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    // Check for unsaved changes before closing modal
    const checkUnsavedChanges = (callback) => {
        if (hasUnsavedChanges) {
            showCustomConfirm({
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. Are you sure you want to discard them and close?',
                onConfirm: () => {
                    resetForm();
                    callback();
                },
                confirmText: 'Discard Changes',
                cancelText: 'Keep Editing',
                type: 'warning'
            });
        } else {
            callback();
        }
    };

    // Toggle product status via API
    const toggleStatus = async (productId) => {
        try {
            const adminToken = sessionStorage.getItem('auth_token');
            const product = products.find(p => p.id === productId);
            const newStatus = product.status === 'active' ? 'inactive' : 'active';

            const response = await axios.put(
                `http://127.0.0.1:8000/api/admin/products/${productId}/toggle-status`,
                { status: newStatus },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            if (response.data.success) {
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, status: newStatus } : p
                ));
                if (selectedProduct?.id === productId) {
                    setSelectedProduct({ ...selectedProduct, status: newStatus });
                }
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            showToast('❌ Failed to update status', 'error');
        }
    };

    // Delete product via API
    const handleDelete = async (productId) => {
        showCustomConfirm({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const adminToken = sessionStorage.getItem('auth_token');

                    const response = await axios.delete(
                        `http://127.0.0.1:8000/api/admin/products/${productId}`,
                        {
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            }
                        }
                    );

                    if (response.data.success) {
                        setProducts(products.filter(p => p.id !== productId));
                        setShowDetailsModal(false);
                        showToast('✅ Product deleted successfully!');
                    }
                } catch (err) {
                    console.error('Error deleting product:', err);
                    showToast('❌ Failed to delete product', 'error');
                }
            },
            confirmText: 'Delete Product',
            cancelText: 'Cancel',
            type: 'danger'
        });
    };

    // Add new product via API
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const adminToken = sessionStorage.getItem('auth_token');
            const data = new FormData();

            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('size', formData.size);
            data.append('price', formData.price);
            data.append('stock', formData.stock);

            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((image, index) => {
                    if (image instanceof File) {
                        data.append(`images[${index}]`, image);
                    }
                });
            }

            const response = await axios.post(
                'http://127.0.0.1:8000/api/admin/products',
                data,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setShowAddModal(false);
                resetForm();
                fetchProducts();
                showToast('✅ Product added successfully!');
            }
        } catch (err) {
            console.error('Error adding product:', err);
            showToast('❌ Failed to add product', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    // Update existing product via API
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const adminToken = sessionStorage.getItem('auth_token');
            const data = new FormData();

            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('size', formData.size);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('_method', 'PUT');

            formData.images.forEach((image, index) => {
                data.append(`images[${index}]`, image);
            });

            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/products/${selectedProduct.id}`,
                data,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setShowEditModal(false);
                resetForm();
                setSelectedProduct(null);
                fetchProducts();
                showToast('✅ Product updated successfully!');
            }
        } catch (err) {
            console.error('Error updating product:', err);
            showToast('❌ Failed to update product', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            out_of_stock: 'bg-red-100 text-red-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `Nu. ${amount.toLocaleString()}`;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        if (filterStatus !== 'all') {
            if (filterStatus === 'active' && product.status !== 'active') return false;
            if (filterStatus === 'inactive' && product.status !== 'inactive') return false;
            if (filterStatus === 'out_of_stock' && product.stock > 0) return false;
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return product.name.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query);
        }

        return true;
    });

    // Get stats
    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        outOfStock: products.filter(p => p.stock === 0).length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= stockAlertThreshold).length,
    };

    // ✅ NEW: Handle numeric input (prevent non-numeric characters)
    const handleNumericInput = (e, fieldName) => {
        const value = e.target.value;
        // Allow empty string or positive numbers
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [fieldName]: value }));
            setHasUnsavedChanges(true);
        }
    };

    return (
        <div className="flex-1">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage product listings for the Fab Lab shop</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </header>

            <main className="p-6">
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button
                            onClick={fetchProducts}
                            className="ml-4 underline hover:text-red-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                        <p className="text-sm text-gray-600">Total Products</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                        <p className="text-sm text-gray-600">Active Listings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
                                        <p className="text-sm text-gray-600">Out of Stock</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 13h2v8H3v-8zm4-4h2v12H7V9zm4-4h2v16h-2V5zm4 8h2v8h-2v-8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
                                        <p className="text-sm text-gray-600">Low Stock</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ✅ UPDATED: Settings Grid (Stock Alert + Payment Deadline) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Stock Alert Threshold */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Stock Alert Threshold</p>
                                            <p className="text-xs text-gray-600">Highlight low stock items</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={thresholdInput}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Allow empty string or only numbers
                                                if (val === '' || /^\d+$/.test(val)) {
                                                    setThresholdInput(val);
                                                }
                                            }}
                                            onBlur={() => {
                                                // ✅ Save when user clicks away
                                                const newValue = parseInt(thresholdInput) || 0;
                                                setThresholdInput(newValue.toString());
                                                setStockAlertThreshold(newValue);

                                                const token = sessionStorage.getItem('auth_token');
                                                axios.put('http://127.0.0.1:8000/api/admin/settings/stock-alert/threshold', {
                                                    value: newValue
                                                }, {
                                                    headers: {
                                                        'Accept': 'application/json',
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}`
                                                    }
                                                }).catch(err => console.error('Error saving threshold:', err));
                                            }}
                                            onKeyDown={(e) => {
                                                // ✅ Save when user presses Enter
                                                if (e.key === 'Enter') {
                                                    e.target.blur();
                                                }
                                            }}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-gray-600">units</span>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ NEW: Payment Upload Deadline */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Payment Re-upload Deadline</p>
                                            <p className="text-xs text-gray-600">Hours allowed after rejection</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={paymentDeadlineHours === 0 ? '' : paymentDeadlineHours}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    setPaymentDeadlineHours(0);
                                                } else if (/^\d+$/.test(value)) {
                                                    const num = parseInt(value) || 0;
                                                    setPaymentDeadlineHours(num);
                                                }
                                            }}
                                            onBlur={() => updateDeadlineHours(paymentDeadlineHours)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    updateDeadlineHours(paymentDeadlineHours);
                                                    e.target.blur();
                                                }
                                            }}
                                            disabled={deadlineLoading}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-gray-600">hours</span>
                                        {deadlineLoading && (
                                            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Nu.)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    <p>No products found</p>
                                                    <button
                                                        onClick={() => setShowAddModal(true)}
                                                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Add your first product
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    onClick={() => handleViewDetails(product)}
                                                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${product.stock > 0 && product.stock <= stockAlertThreshold ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                                                        }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={`http://127.0.0.1:8000/storage/${product.images[0]}`}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">{product.size}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-700' :
                                                            product.stock <= stockAlertThreshold ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleStatus(product.id);
                                                            }}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${product.status === 'active' ? 'bg-blue-600' : 'bg-gray-300'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* ✅ UPDATED: Product Details Modal WITH CAROUSEL */}
            {showDetailsModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Image Carousel */}
                                <div>
                                    {/* Main Carousel Image */}
                                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={selectedProduct.images[currentImageIndex]}
                                                    alt={`${selectedProduct.name} - View ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Navigation Arrows */}
                                                {selectedProduct.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={goToPreviousImage}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                                                        >
                                                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={goToNextImage}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                                                        >
                                                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>

                                                        {/* Image Counter */}
                                                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                            {currentImageIndex + 1} / {selectedProduct.images.length}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnail Navigation */}
                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {selectedProduct.images.map((img, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => goToImage(index)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                                        ? 'border-blue-600 ring-2 ring-blue-600/20'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Details */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(selectedProduct.price)}</p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedProduct.status)}`}>
                                            {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Description</div>
                                        <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedProduct.description || 'No description available'}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-500 mb-1">Size</div>
                                            <div className="font-semibold text-gray-900">{selectedProduct.size || 'N/A'}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-500 mb-1">Stock</div>
                                            <div className={`font-semibold ${selectedProduct.stock === 0 ? 'text-red-600' : selectedProduct.stock <= stockAlertThreshold ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {selectedProduct.stock} units
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-500 mb-1">Status</div>
                                            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedProduct.status)}`}>
                                                {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500 mb-1">Created On</div>
                                        <div className="font-semibold text-gray-900">{formatDate(selectedProduct.created_at)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleEdit(selectedProduct);
                                }}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(selectedProduct.id)}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                                <p className="text-sm text-gray-600 mt-1">Update the product listing details</p>
                            </div>
                            <button
                                onClick={() => checkUnsavedChanges(() => {
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedProduct(null);
                                })}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-6">
                            <form onSubmit={handleUpdateProduct}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Thumbnail Preview */}
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700 mb-3">Thumbnail Image</div>
                                        <div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
                                            {previewImages.length > 0 ? (
                                                <img
                                                    src={previewImages[0]}
                                                    alt="Thumbnail Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-500">No Image</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column - Form Fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter product name"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter product description"
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Size *</label>
                                                <input
                                                    type="text"
                                                    name="size"
                                                    value={formData.size}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="e.g., 8 inch, 4 x 3 inch"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Nu.) *</label>
                                                <input
                                                    type="text"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={(e) => handleNumericInput(e, 'price')}
                                                    required
                                                    placeholder="Enter price"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                                            <input
                                                type="text"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={(e) => handleNumericInput(e, 'stock')}
                                                required
                                                placeholder="Enter stock quantity"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Images Section */}
                                <div className="mt-6">
                                    <div className="text-sm font-semibold text-gray-700 mb-3">Product Images</div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {previewImages.map((img, index) => (
                                            <div key={index} className="aspect-square bg-gray-100 rounded-lg relative group overflow-hidden">
                                                <img
                                                    src={img}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-medium">Image ({index + 1})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPreviews = [...previewImages];
                                                        newPreviews.splice(index, 1);
                                                        setPreviewImages(newPreviews);

                                                        const newFormDataImages = [...formData.images];
                                                        newFormDataImages.splice(index, 1);
                                                        setFormData(prev => ({ ...prev, images: newFormDataImages }));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {previewImages.length < 4 && (
                                            <label className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${previewImages.length >= 4
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                }`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    disabled={previewImages.length >= 4}
                                                />
                                                <div className="text-center p-4">
                                                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    <p className="text-xs text-gray-600 font-medium">Add</p>
                                                    <p className="text-xs text-gray-500 mt-1">({previewImages.length + 1}/4)</p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Upload up to 4 product images. First image will be the thumbnail.</p>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => checkUnsavedChanges(() => {
                                            setShowEditModal(false);
                                            resetForm();
                                            setSelectedProduct(null);
                                        })}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {formLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                                <p className="text-sm text-gray-600 mt-1">Create a new product listing for the Fab Lab shop</p>
                            </div>
                            <button
                                onClick={() => checkUnsavedChanges(() => {
                                    setShowAddModal(false);
                                    resetForm();
                                })}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleAddProduct} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Thumbnail Preview */}
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 mb-3">Thumbnail Image</div>
                                    <div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group hover:border-blue-500 transition-colors">
                                        {previewImages.length > 0 ? (
                                            <>
                                                <img
                                                    src={previewImages[0]}
                                                    alt="Thumbnail Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-sm font-medium">Large Thumbnail Image (1)</span>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-6">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="hidden"
                                                    id="add-thumbnail"
                                                />
                                                <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-600 font-medium">Click to upload thumbnail</p>
                                                <p className="text-xs text-gray-500 mt-1">First image will be thumbnail</p>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter product name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter product description"
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Size *</label>
                                            <input
                                                type="text"
                                                name="size"
                                                value={formData.size}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="e.g., 8 inch, 4 x 3 inch"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Nu.) *</label>
                                            <input
                                                type="text"
                                                name="price"
                                                value={formData.price}
                                                onChange={(e) => handleNumericInput(e, 'price')}
                                                required
                                                placeholder="Enter price"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                                        <input
                                            type="text"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={(e) => handleNumericInput(e, 'stock')}
                                            required
                                            placeholder="Enter stock quantity"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Other Images Section */}
                            <div className="mt-6">
                                <div className="text-sm font-semibold text-gray-700 mb-3">Other Images</div>
                                <div className="grid grid-cols-4 gap-4">
                                    {otherImages.map((img, index) => (
                                        <div key={index} className="aspect-square bg-gray-100 rounded-lg relative group overflow-hidden">
                                            <img
                                                src={img}
                                                alt={`Other Image ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium">Image ({index + 1})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeOtherImage(index)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    {otherImages.length < 4 && (
                                        <label className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${otherImages.length >= 4
                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleOtherImagesChange}
                                                className="hidden"
                                                disabled={otherImages.length >= 4}
                                            />
                                            <div className="text-center p-4">
                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <p className="text-xs text-gray-600 font-medium">Add Image</p>
                                                <p className="text-xs text-gray-500 mt-1">({otherImages.length + 1}/4)</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Upload up to 4 additional images (excluding thumbnail).</p>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => checkUnsavedChanges(() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    })}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {formLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Adding...
                                        </span>
                                    ) : (
                                        'Add Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ NEW: Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className={`px-6 py-4 ${confirmConfig.type === 'danger' ? 'bg-red-50' : confirmConfig.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${confirmConfig.type === 'danger' ? 'bg-red-100' : confirmConfig.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                    {confirmConfig.type === 'danger' ? (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : confirmConfig.type === 'warning' ? (
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{confirmConfig.title}</h3>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">{confirmConfig.message}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    {confirmConfig.cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        if (confirmConfig.onConfirm) {
                                            confirmConfig.onConfirm();
                                        }
                                    }}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-semibold shadow-lg ${confirmConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : confirmConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {confirmConfig.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Toast Notification */}
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