import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';

export default function ShopProducts() {
    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: true,
        machines: false,
        learning: false,
        explore: false,
        support: false,
    });

    // Product States
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Cart States
    const [cart, setCart] = useState([]);
    const [showCartDrawer, setShowCartDrawer] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Delivery & Payment States
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [directCheckoutProduct, setDirectCheckoutProduct] = useState(null);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
        // Load cart from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // ✅ UPDATED: Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const userToken = localStorage.getItem('auth_token');

            const response = await axios.get('http://127.0.0.1:8000/api/user/products', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.data.success) {
                // Filter to only show active products with stock
                const activeProducts = response.data.products.filter(p =>
                    p.status === 'active' && p.stock > 0
                );
                setProducts(activeProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Keep sample data as fallback for development
            setProducts([
                {
                    id: 1,
                    name: 'Jangchub Chorten',
                    description: 'Beautifully crafted 3D printed Jangchub Chorten (Stupa of Enlightenment). A traditional Bhutanese Buddhist monument representing the enlightened mind of Buddha.',
                    price: 1000,
                    size: '8 inch',
                    stock: 8,
                    images: [],
                    category: '3D Printed'
                },
                {
                    id: 2,
                    name: 'Druk Thunder Dragon',
                    description: 'Intricate 3D printed Druk (Thunder Dragon) - the national symbol of Bhutan. Perfect for display on desk or shelf.',
                    price: 850,
                    size: '6 inch',
                    stock: 5,
                    images: [],
                    category: '3D Printed'
                },
                {
                    id: 3,
                    name: 'Takin Figurine',
                    description: '3D printed Takin, Bhutan\'s national animal. A unique conversation starter and collectible item.',
                    price: 600,
                    size: '4 inch',
                    stock: 12,
                    images: [],
                    category: '3D Printed'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Open product details modal (click on product card)
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowDetailsModal(true);
    };

    // Add to cart
    const addToCart = (product, qty = 1) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            const newCart = cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            );
            setCart(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
        } else {
            const newCart = [...cart, { ...product, quantity: qty }];
            setCart(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
        }

        setShowDetailsModal(false);
        setShowCartDrawer(true);
    };

    // Buy Now - Direct to checkout
    const buyNow = (product, qty = 1) => {
        setDirectCheckoutProduct({ ...product, quantity: qty });
        setShowDetailsModal(false);
        setDeliveryOption('pickup');
        setShippingAddress('');
        setShowDeliveryModal(true);
    };

    // Remove from cart
    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // Update cart quantity
    const updateCartQuantity = (productId, newQty) => {
        if (newQty < 1) return;

        const newCart = cart.map(item =>
            item.id === productId ? { ...item, quantity: newQty } : item
        );
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // Calculate total
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Proceed to checkout from cart
    const handleCheckout = () => {
        setShowCartDrawer(false);
        setDeliveryOption('pickup');
        setShippingAddress('');
        setShowDeliveryModal(true);
    };

    // ✅ FIXED: Submit order to real API - Send items as form fields, not JSON string
    const handleSubmitOrder = async () => {
        if (!paymentScreenshot) {
            alert('❌ Please upload payment screenshot');
            return;
        }

        if (deliveryOption === 'shipping' && !shippingAddress.trim()) {
            alert('❌ Please enter shipping address');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            const userToken = localStorage.getItem('auth_token');

            // Prepare items array
            const items = directCheckoutProduct
                ? [{
                    id: directCheckoutProduct.id,
                    name: directCheckoutProduct.name,
                    price: directCheckoutProduct.price,
                    quantity: directCheckoutProduct.quantity
                }]
                : cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }));

            // ✅ FIXED: Send items as individual form fields (Laravel expects array format)
            items.forEach((item, index) => {
                formData.append(`items[${index}][id]`, item.id);
                formData.append(`items[${index}][name]`, item.name);
                formData.append(`items[${index}][price]`, item.price);
                formData.append(`items[${index}][quantity]`, item.quantity);
            });

            formData.append('total_amount', directCheckoutProduct
                ? directCheckoutProduct.price * directCheckoutProduct.quantity
                : cartTotal
            );
            formData.append('delivery_option', deliveryOption);

            if (deliveryOption === 'shipping') {
                formData.append('shipping_address', shippingAddress);
            }

            if (paymentScreenshot) {
                formData.append('payment_screenshot', paymentScreenshot);
            }

            const response = await axios.post(
                'http://127.0.0.1:8000/api/user/product-orders',
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                alert('✅ Order submitted successfully! We will review your payment and confirm shortly.');

                // Clear cart and reset
                setCart([]);
                localStorage.removeItem('cart');
                setDirectCheckoutProduct(null);
                setPaymentScreenshot(null);
                setShowPaymentModal(false);
                setShowDeliveryModal(false);

                // Refresh products to update stock
                fetchProducts();
            }
        } catch (error) {
            console.error('Order submission error:', error);

            if (error.response?.data?.errors) {
                // Show validation errors
                const errors = Object.values(error.response.data.errors).flat().join('\n');
                alert('❌ Validation failed:\n' + errors);
            } else if (error.response?.data?.message) {
                alert('❌ ' + error.response.data.message);
            } else {
                alert('❌ Failed to submit order. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `Nu. ${amount.toLocaleString()}`;
    };

    // ✅ UPDATED: Get product image URL
    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return `http://127.0.0.1:8000/storage/${product.images[0]}`;
        }
        if (product.image) {
            return `http://127.0.0.1:8000/storage/${product.image}`;
        }
        return null;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <UserSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Shop Products</h1>
                            <p className="text-sm text-gray-600 mt-1">Browse and order products made at the JNEC Fab Lab</p>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setShowCartDrawer(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Cart
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Products Grid */}
                <main className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading products...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => handleViewDetails(product)}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                                >
                                    {/* Product Image */}
                                    <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                                        {getProductImage(product) ? (
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.parentElement.innerHTML = `
                                                        <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                        </svg>
                                                    `;
                                                }}
                                            />
                                        ) : (
                                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}

                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-50"
                                        >
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>

                                        {/* Out of Stock Badge */}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">{product.size}</p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>

                                            {product.stock > 0 ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product);
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-3 py-1.5 bg-gray-200 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                                                >
                                                    Out of Stock
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Product Details Modal */}
            {showDetailsModal && selectedProduct && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Gallery */}
                                <div>
                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                        {getProductImage(selectedProduct) ? (
                                            <img
                                                src={getProductImage(selectedProduct)}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.parentElement.innerHTML = `
                                                        <svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                        </svg>
                                                    `;
                                                }}
                                            />
                                        ) : (
                                            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div>
                                    <p className="text-gray-600 mb-4">{selectedProduct.description}</p>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-3xl font-bold text-blue-600">{formatCurrency(selectedProduct.price)}</span>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {selectedProduct.stock} available
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">
                                            Size: <span className="font-medium">{selectedProduct.size}</span>
                                        </p>
                                    </div>

                                    <hr className="my-6" />

                                    {/* Quantity Selector */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-medium">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => addToCart(selectedProduct, quantity)}
                                            disabled={selectedProduct.stock === 0}
                                            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => buyNow(selectedProduct, quantity)}
                                            disabled={selectedProduct.stock === 0}
                                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer - Slides from Right */}
            {showCartDrawer && (
                <>
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
                        onClick={() => setShowCartDrawer(false)}
                    ></div>
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Shopping Cart ({cartItemCount})
                                </h2>
                                <button
                                    onClick={() => setShowCartDrawer(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-gray-500">Your cart is empty</p>
                                        <button
                                            onClick={() => setShowCartDrawer(false)}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Continue Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                                {/* Product Image */}
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {getProductImage(item) ? (
                                                        <img
                                                            src={getProductImage(item)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.parentElement.innerHTML = `
                                                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                                    </svg>
                                                                `;
                                                            }}
                                                        />
                                                    ) : (
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                            <p className="text-xs text-gray-500">{item.size}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <p className="text-sm font-bold text-blue-600 mt-2">{formatCurrency(item.price)}</p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer - Total & Checkout */}
                            {cart.length > 0 && (
                                <div className="border-t border-gray-200 p-6 bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold text-gray-700">Total</span>
                                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(cartTotal)}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Delivery Options Modal */}
            {showDeliveryModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Delivery Option
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDeliveryModal(false);
                                        if (directCheckoutProduct) {
                                            setShowDetailsModal(true);
                                        } else {
                                            setShowCartDrawer(true);
                                        }
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <div className="w-24 h-1 bg-blue-600"></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <div className="w-24 h-1 bg-gray-300"></div>
                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="space-y-4 mb-6">
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${deliveryOption === 'pickup' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="delivery"
                                        value="pickup"
                                        checked={deliveryOption === 'pickup'}
                                        onChange={(e) => setDeliveryOption(e.target.value)}
                                        className="mt-1 w-4 h-4 text-blue-600"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-semibold text-gray-900">Self Pick Up</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">Pick up your order from JNEC Fab Lab during working hours (9 AM - 5 PM)</p>
                                    </div>
                                </label>

                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${deliveryOption === 'shipping' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="delivery"
                                        value="shipping"
                                        checked={deliveryOption === 'shipping'}
                                        onChange={(e) => setDeliveryOption(e.target.value)}
                                        className="mt-1 w-4 h-4 text-blue-600"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-semibold text-gray-900">Ship to Address</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">We will ship your order to your provided address (additional charges may apply)</p>
                                    </div>
                                </label>
                            </div>

                            {/* Shipping Address Field */}
                            {deliveryOption === 'shipping' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shipping Address *
                                    </label>
                                    <textarea
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter your full shipping address"
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeliveryModal(false);
                                        if (directCheckoutProduct) {
                                            setShowDetailsModal(true);
                                        } else {
                                            setShowCartDrawer(true);
                                        }
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => {
                                        if (deliveryOption === 'shipping' && !shippingAddress.trim()) {
                                            alert('❌ Please enter shipping address');
                                            return;
                                        }
                                        setShowDeliveryModal(false);
                                        setShowPaymentModal(true);
                                    }}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Payment
                                </h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <div className="w-24 h-1 bg-blue-600"></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <div className="w-24 h-1 bg-blue-600"></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Bank Transfer Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Bank Name:</span>
                                        <span className="font-semibold text-gray-900">BOB Bank</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Account Name:</span>
                                        <span className="font-semibold text-gray-900">JNEC Fab Lab</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Account Number:</span>
                                        <span className="font-semibold text-gray-900">200123456789</span>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount to Pay:</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {directCheckoutProduct
                                                ? formatCurrency(directCheckoutProduct.price * directCheckoutProduct.quantity)
                                                : formatCurrency(cartTotal)
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Screenshot Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Payment Screenshot *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                                        className="hidden"
                                        id="payment-screenshot"
                                    />
                                    <label htmlFor="payment-screenshot" className="cursor-pointer">
                                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm text-gray-600">Click to upload screenshot</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                    </label>
                                    {paymentScreenshot && (
                                        <p className="text-sm text-green-600 mt-2">✅ {paymentScreenshot.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setShowDeliveryModal(true);
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={submitting || !paymentScreenshot}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}