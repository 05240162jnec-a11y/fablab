import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Cart States
    const [cart, setCart] = useState([]);
    const [showCartDrawer, setShowCartDrawer] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // ✅ NEW: Cart Selection States
    const [selectedCartItems, setSelectedCartItems] = useState([]); // Array of product IDs
    const [isSelectAll, setIsSelectAll] = useState(false);

    // Notification State
    const [showNotification, setShowNotification] = useState(false);

    // Delivery & Payment States
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [directCheckoutProduct, setDirectCheckoutProduct] = useState(null);

    // Track products already in cart (for badge count)
    const [cartProductIds, setCartProductIds] = useState([]);

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
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            setCartProductIds(parsedCart.map(item => item.id));
        }
    }, []);

    // Update "Select All" checkbox when cart or selection changes
    useEffect(() => {
        if (cart.length > 0 && selectedCartItems.length === cart.length) {
            setIsSelectAll(true);
        } else {
            setIsSelectAll(false);
        }
    }, [selectedCartItems, cart]);

    // Keyboard navigation for carousel
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

    // Fetch products from API
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
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([
                {
                    id: 1,
                    name: 'Jangchub Chorten',
                    description: 'Beautifully crafted 3D printed Jangchub Chorten (Stupa of Enlightenment).',
                    price: 1000,
                    size: '8 inch',
                    stock: 8,
                    images: [],
                    category: '3D Printed'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Open product details modal
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setCurrentImageIndex(0);
        setShowDetailsModal(true);
    };

    // Carousel Navigation Functions
    const goToPreviousImage = () => {
        if (selectedProduct?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1));
        }
    };

    const goToNextImage = () => {
        if (selectedProduct?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1));
        }
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
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
            setCartProductIds(prev => [...prev, product.id]);
        }

        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    // Buy Now - Direct to checkout (selects this single product)
    const buyNow = (product, qty = 1) => {
        setDirectCheckoutProduct({ ...product, quantity: qty });
        setShowDetailsModal(false);
        setDeliveryOption('pickup');
        setShippingAddress('');
        setSelectedCartItems([]); // Clear selection for direct buy
        setShowDeliveryModal(true);
    };

    // ✅ Toggle item selection
    const toggleItemSelection = (productId) => {
        if (selectedCartItems.includes(productId)) {
            setSelectedCartItems(selectedCartItems.filter(id => id !== productId));
        } else {
            setSelectedCartItems([...selectedCartItems, productId]);
        }
    };

    // ✅ Toggle Select All
    const toggleSelectAll = () => {
        if (isSelectAll) {
            setSelectedCartItems([]);
        } else {
            setSelectedCartItems(cart.map(item => item.id));
        }
    };

    // ✅ Delete selected items
    const deleteSelectedItems = () => {
        if (selectedCartItems.length === 0) return;

        const newCart = cart.filter(item => !selectedCartItems.includes(item.id));
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        setSelectedCartItems([]);
        setCartProductIds(prev => prev.filter(id => !selectedCartItems.includes(id)));
    };

    // Remove from cart
    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        setCartProductIds(prev => prev.filter(id => id !== productId));
        setSelectedCartItems(prev => prev.filter(id => id !== productId));
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

    // ✅ Calculate totals for SELECTED items only
    const selectedItems = cart.filter(item => selectedCartItems.includes(item.id));
    const selectedItemsTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedItemsCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    // Badge count (unique products in cart)
    const cartItemCount = cartProductIds.length;

    // Shipping calculation
    const shippingCost = deliveryOption === 'shipping' ? 150 : 0;
    const totalWithShipping = selectedItemsTotal + shippingCost;

    // Proceed to checkout
    const handleCheckout = () => {
        if (selectedCartItems.length === 0) {
            alert('Please select at least one item to checkout');
            return;
        }
        setShowCartDrawer(false);
        setDeliveryOption('pickup');
        setShippingAddress('');
        setShowDeliveryModal(true);
    };

    // Handle payment screenshot upload
    const handleScreenshotUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit order
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

            // Determine which items to submit (selected items or direct checkout product)
            const itemsToSubmit = directCheckoutProduct
                ? [{
                    id: directCheckoutProduct.id,
                    name: directCheckoutProduct.name,
                    price: directCheckoutProduct.price,
                    quantity: directCheckoutProduct.quantity
                }]
                : selectedItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }));

            itemsToSubmit.forEach((item, index) => {
                formData.append(`items[${index}][id]`, item.id);
                formData.append(`items[${index}][name]`, item.name);
                formData.append(`items[${index}][price]`, item.price);
                formData.append(`items[${index}][quantity]`, item.quantity);
            });

            const finalTotal = directCheckoutProduct
                ? (directCheckoutProduct.price * directCheckoutProduct.quantity) + (deliveryOption === 'shipping' ? 150 : 0)
                : totalWithShipping;

            formData.append('total_amount', finalTotal);
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

                // Remove purchased items from cart
                const purchasedIds = directCheckoutProduct
                    ? [directCheckoutProduct.id]
                    : selectedCartItems;

                const remainingCart = cart.filter(item => !purchasedIds.includes(item.id));
                setCart(remainingCart);
                localStorage.setItem('cart', JSON.stringify(remainingCart));
                setCartProductIds(prev => prev.filter(id => !purchasedIds.includes(id)));

                setSelectedCartItems([]);
                setDirectCheckoutProduct(null);
                setPaymentScreenshot(null);
                setScreenshotPreview(null);
                setShowPaymentModal(false);
                setShowDeliveryModal(false);

                fetchProducts();
            }
        } catch (error) {
            console.error('Order submission error:', error);
            if (error.response?.data?.errors) {
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

    // Get product image URL
    const getProductImage = (product, index = 0) => {
        if (product.images && product.images.length > 0 && product.images[index]) {
            return `http://127.0.0.1:8000/storage/${product.images[index]}`;
        }
        if (product.image) {
            return `http://127.0.0.1:8000/storage/${product.image}`;
        }
        return null;
    };

    // View product details from cart
    const viewProductFromCart = (product) => {
        setShowCartDrawer(false);
        handleViewDetails(product);
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

                        {/* Cart Button with Badge */}
                        <button
                            onClick={() => setShowCartDrawer(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Cart
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Notification Toast */}
                {showNotification && (
                    <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
                        <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold">Added to cart</p>
                                <p className="text-sm text-green-100">Product has been added to cart</p>
                            </div>
                        </div>
                    </div>
                )}

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

                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">{product.size}</p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                                className="px-3 py-1.5 text-sm rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Add to Cart
                                            </button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
                                <div>
                                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={getProductImage(selectedProduct, currentImageIndex) || getProductImage(selectedProduct)}
                                                    alt={`${selectedProduct.name} - View ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                />

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

                                                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                            {currentImageIndex + 1} / {selectedProduct.images.length}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-600 mb-4">{selectedProduct.description}</p>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-3xl font-bold text-blue-600">{formatCurrency(selectedProduct.price)}</span>
                                            <span className={`text-sm px-3 py-1 rounded-full ${selectedProduct.stock > 0
                                                    ? 'text-green-700 bg-green-100'
                                                    : 'text-red-700 bg-red-100'
                                                }`}>
                                                {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of Stock'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">
                                            Size: <span className="font-medium">{selectedProduct.size}</span>
                                        </p>
                                    </div>

                                    <hr className="my-6" />

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
                                                onClick={() => setQuantity(Math.min(selectedProduct.stock || 999, quantity + 1))}
                                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => addToCart(selectedProduct, quantity)}
                                            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => buyNow(selectedProduct, quantity)}
                                            disabled={selectedProduct.stock === 0}
                                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

            {/* ✅ UPDATED: Cart Drawer with Checkboxes */}
            {showCartDrawer && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowCartDrawer(false)}
                    ></div>
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in-right">
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

                            {/* ✅ Selection Toolbar */}
                            {cart.length > 0 && (
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isSelectAll}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Select All ({cart.length})
                                        </span>
                                    </label>
                                    {selectedCartItems.length > 0 && (
                                        <button
                                            onClick={deleteSelectedItems}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete ({selectedCartItems.length})
                                        </button>
                                    )}
                                </div>
                            )}

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
                                            <div key={item.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${selectedCartItems.includes(item.id)
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                {/* ✅ Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCartItems.includes(item.id)}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                />

                                                {/* Clickable Product Image */}
                                                <div
                                                    onClick={() => viewProductFromCart(item)}
                                                    className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                                                >
                                                    {getProductImage(item) ? (
                                                        <img
                                                            src={getProductImage(item)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
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
                                                            <h3
                                                                onClick={() => viewProductFromCart(item)}
                                                                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                                            >
                                                                {item.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">{item.size}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                                                    {item.stock === 0 && (
                                                        <p className="text-xs text-red-600 mt-1 font-medium">
                                                            ⚠ Currently out of stock
                                                        </p>
                                                    )}
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
                                        <span className="text-lg font-semibold text-gray-700">
                                            Selected ({selectedCartItems.length})
                                        </span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(selectedItemsTotal)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={selectedCartItems.length === 0}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ✅ UPDATED: Delivery Options Modal with Order Summary */}
            {showDeliveryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                            <button
                                onClick={() => {
                                    setShowDeliveryModal(false);
                                    if (directCheckoutProduct) {
                                        setShowDetailsModal(true);
                                    } else {
                                        setShowCartDrawer(true);
                                    }
                                }}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Delivery Options */}
                                <div className="lg:col-span-2 space-y-6">
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

                                    <h3 className="text-lg font-semibold text-gray-900">Delivery Option</h3>

                                    <div className="space-y-4">
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
                                                <p className="text-sm text-gray-600 mt-1">
                                                    We will ship your order to your provided address
                                                </p>
                                                {deliveryOption === 'shipping' && (
                                                    <p className="text-sm font-semibold text-purple-600 mt-2">
                                                        Shipping Cost (Fixed): {formatCurrency(150)}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    </div>

                                    {deliveryOption === 'shipping' && (
                                        <div>
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
                                </div>

                                {/* ✅ Right: Order Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-xl p-6 sticky top-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                            {(directCheckoutProduct ? [directCheckoutProduct] : selectedItems).map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                        {getProductImage(item) ? (
                                                            <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Items Total:</span>
                                                <span className="font-medium text-gray-900">
                                                    {directCheckoutProduct
                                                        ? formatCurrency(directCheckoutProduct.price * directCheckoutProduct.quantity)
                                                        : formatCurrency(selectedItemsTotal)
                                                    }
                                                </span>
                                            </div>

                                            {deliveryOption === 'shipping' && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Shipping Cost:</span>
                                                    <span className="font-medium text-purple-600">{formatCurrency(150)}</span>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-200 pt-2 flex justify-between">
                                                <span className="text-base font-semibold text-gray-900">Total:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {directCheckoutProduct
                                                        ? formatCurrency((directCheckoutProduct.price * directCheckoutProduct.quantity) + (deliveryOption === 'shipping' ? 150 : 0))
                                                        : formatCurrency(totalWithShipping)
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setShowDeliveryModal(false);
                                    if (directCheckoutProduct) {
                                        setShowDetailsModal(true);
                                    } else {
                                        setShowCartDrawer(true);
                                    }
                                }}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
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
            )}

            {/* ✅ UPDATED: Payment Modal with Order Summary */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Payment Details */}
                                <div className="lg:col-span-2 space-y-6">
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
                                    <div className="bg-gray-50 rounded-lg p-6">
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
                                        </div>
                                    </div>

                                    {/* Screenshot Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Payment Screenshot *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors relative min-h-[250px]">
                                            {!screenshotPreview ? (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleScreenshotUpload}
                                                        className="hidden"
                                                        id="payment-screenshot"
                                                    />
                                                    <label htmlFor="payment-screenshot" className="cursor-pointer block">
                                                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <p className="text-sm text-gray-600">Click to upload screenshot</p>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                                    </label>
                                                </>
                                            ) : (
                                                <div className="relative">
                                                    <img
                                                        src={screenshotPreview}
                                                        alt="Payment Screenshot Preview"
                                                        className="w-full h-auto object-contain mx-auto rounded-lg"
                                                        style={{ maxHeight: '400px' }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setPaymentScreenshot(null);
                                                            setScreenshotPreview(null);
                                                        }}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                        </div>

                                        {paymentScreenshot && (
                                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {paymentScreenshot.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Right: Order Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-xl p-6 sticky top-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                            {(directCheckoutProduct ? [directCheckoutProduct] : selectedItems).map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                        {getProductImage(item) ? (
                                                            <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Items Total:</span>
                                                <span className="font-medium text-gray-900">
                                                    {directCheckoutProduct
                                                        ? formatCurrency(directCheckoutProduct.price * directCheckoutProduct.quantity)
                                                        : formatCurrency(selectedItemsTotal)
                                                    }
                                                </span>
                                            </div>

                                            {deliveryOption === 'shipping' && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Shipping Cost:</span>
                                                    <span className="font-medium text-purple-600">{formatCurrency(150)}</span>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-200 pt-2 flex justify-between">
                                                <span className="text-base font-semibold text-gray-900">Total:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {directCheckoutProduct
                                                        ? formatCurrency((directCheckoutProduct.price * directCheckoutProduct.quantity) + (deliveryOption === 'shipping' ? 150 : 0))
                                                        : formatCurrency(totalWithShipping)
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setShowDeliveryModal(true);
                                }}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
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
            )}
        </div>
    );
}