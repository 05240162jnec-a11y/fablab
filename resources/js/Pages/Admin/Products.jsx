import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../Components/AdminSidebar';

export default function Products() {
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: true,
        operations: true,
        resources: false,
        contentMedia: false,
    });

    // Product States
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stockAlertThreshold, setStockAlertThreshold] = useState(5);

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
    const [formLoading, setFormLoading] = useState(false);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const adminToken = localStorage.getItem('admin_token');

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

    // Fetch on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle image selection for add/edit forms
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 4); // Max 4 images
        setFormData(prev => ({ ...prev, images: files }));

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
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
    };

    // Open product details modal
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
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
        setPreviewImages(product.images?.length > 0
            ? product.images.map(img => `http://127.0.0.1:8000/storage/${img}`)
            : []
        );
        setShowDetailsModal(false);
        setShowEditModal(true);
    };

    // Toggle product status via API
    const toggleStatus = async (productId) => {
        try {
            const adminToken = localStorage.getItem('admin_token');
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
                // Update local state immediately for better UX
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, status: newStatus } : p
                ));
                // Also update selected product if details modal is open
                if (selectedProduct?.id === productId) {
                    setSelectedProduct({ ...selectedProduct, status: newStatus });
                }
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            alert('❌ Failed to update status');
        }
    };

    // Delete product via API
    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const adminToken = localStorage.getItem('admin_token');

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
                alert('✅ Product deleted successfully!');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('❌ Failed to delete product');
        }
    };

    // Add new product via API
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const adminToken = localStorage.getItem('admin_token');
            const data = new FormData();

            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('size', formData.size);
            data.append('price', formData.price);
            data.append('stock', formData.stock);

            // Append images if any
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
                fetchProducts(); // Refresh list
                alert('✅ Product added successfully!');
            }
        } catch (err) {
            console.error('Error adding product:', err);
            alert('❌ Failed to add product');
        } finally {
            setFormLoading(false);
        }
    };

    // Update existing product via API
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const adminToken = localStorage.getItem('admin_token');
            const data = new FormData();

            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('size', formData.size);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('_method', 'PUT'); // Laravel method spoofing for PUT

            // Append new images if any
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
                fetchProducts(); // Refresh list
                alert('✅ Product updated successfully!');
            }
        } catch (err) {
            console.error('Error updating product:', err);
            alert('❌ Failed to update product');
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
        // Filter by status
        if (filterStatus !== 'all') {
            if (filterStatus === 'active' && product.status !== 'active') return false;
            if (filterStatus === 'inactive' && product.status !== 'inactive') return false;
            if (filterStatus === 'out_of_stock' && product.stock > 0) return false;
        }

        // Filter by search query
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ Sidebar - Using Reusable AdminSidebar Component */}
            <AdminSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
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

                {/* Products Content */}
                <main className="p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading products...</p>
                        </div>
                    )}

                    {/* Error State */}
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
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Products</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                        </div>
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Active Listings</p>
                                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                        </div>
                                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Out of Stock</p>
                                            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                                        </div>
                                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Low Stock</p>
                                            <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                                        </div>
                                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Alert Threshold Setting */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-gray-900">Stock Alert Threshold</p>
                                            <p className="text-sm text-gray-600">Products with stock below this value will be highlighted</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={stockAlertThreshold}
                                            onChange={(e) => setStockAlertThreshold(parseInt(e.target.value) || 0)}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                        />
                                        <span className="text-sm text-gray-600">units</span>
                                    </div>
                                </div>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                {/* Search */}
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

                                {/* Status Filter */}
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

                            {/* Products Table */}
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
            </div>

            {/* Product Details Modal */}
            {showDetailsModal && selectedProduct && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${selectedProduct.images[0]}`}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                                    <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(selectedProduct.price)}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedProduct.status)}`}>
                                        {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-600">{selectedProduct.description}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Size</p>
                                    <p className="font-semibold text-gray-900">{selectedProduct.size}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Stock</p>
                                    <p className="font-semibold text-gray-900">{selectedProduct.stock} units</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedProduct.status)}`}>
                                        {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">All Images ({selectedProduct.images.length})</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedProduct.images.map((img, index) => (
                                            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${img}`}
                                                    alt={`${selectedProduct.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-semibold text-gray-900">{formatDate(selectedProduct.created_at)}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleEdit(selectedProduct);
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedProduct.id)}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">Update the product listing details</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (Nu.) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {previewImages.map((img, index) => (
                                        <div key={index} className="aspect-square bg-gray-100 rounded-lg relative group">
                                            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newPreviews = [...previewImages];
                                                    newPreviews.splice(index, 1);
                                                    setPreviewImages(newPreviews);
                                                }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <div className="text-center">
                                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <p className="text-xs text-gray-500">Add</p>
                                        </div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Upload up to 4 product images. First image will be the thumbnail.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                        setSelectedProduct(null);
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {formLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add New Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">Create a new product listing for the Fab Lab shop</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter product name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter product description"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., 8 inch, 4 x 3 inch"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (Nu.) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter price"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter stock quantity"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="add-product-images"
                                    />
                                    <label htmlFor="add-product-images" className="cursor-pointer block">
                                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <p className="text-sm text-gray-600">Add Images</p>
                                        <p className="text-xs text-gray-500 mt-1">Upload up to 4 images. First will be thumbnail.</p>
                                    </label>
                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                            {previewImages.map((img, index) => (
                                                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {formLoading ? 'Adding...' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}