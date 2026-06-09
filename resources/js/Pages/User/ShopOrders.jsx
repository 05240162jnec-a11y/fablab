import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TabNavigation from './TabNavigation';
import ShopProducts from './ShopProducts';
import MyOrders from './MyOrders';
import CustomOrders from './CustomOrders';

export default function ShopOrders() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab') || 'products';
    const [activeTab, setActiveTab] = useState(urlTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['products', 'orders', 'custom'].includes(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab('products');
        }
    }, [location.search]);

    // ✅ 1. Helper to get User ID safely
    // Uses sessionStorage first (more reliable on refresh/login in this app),
    // then falls back to localStorage legacy key.
    const getUserId = () => {
        try {
            const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
            if (!raw) return null;
            const user = JSON.parse(raw);
            return user?.id || null;
        } catch {
            return null;
        }
    };


    // ✅ 2. Helper to get Cart safely based on User ID
    const getInitialCart = (userId) => {
        if (!userId) return [];
        try {
            const saved = localStorage.getItem(`cart_${userId}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    };

    // ✅ 3. LAZY INITIALIZATION: Load data immediately on first render
    const [currentUserId, setCurrentUserId] = useState(getUserId);
    const [cart, setCart] = useState(() => getInitialCart(getUserId()));
    const [cartProductIds, setCartProductIds] = useState(() => getInitialCart(getUserId()).map(item => item.id));
    const [showCartDrawer, setShowCartDrawer] = useState(false);

    // ✅ 4. Auto-save to localStorage ONLY when cart changes
    useEffect(() => {
        if (currentUserId) {
            localStorage.setItem(`cart_${currentUserId}`, JSON.stringify(cart));
        }
        setCartProductIds(cart.map(item => item.id));
    }, [cart, currentUserId]);

    // ✅ 5. Handle User Logout/Login (Clears cart if user changes)
    useEffect(() => {
        const checkUser = () => {
            const newUserId = getUserId();
            if (newUserId !== currentUserId) {
                setCurrentUserId(newUserId);
                setCart(getInitialCart(newUserId)); // Load new user's cart or empty array
            }
        };

        // Check when window regains focus (e.g., after logging out/in)
        window.addEventListener('focus', checkUser);
        return () => window.removeEventListener('focus', checkUser);
    }, [currentUserId]);

    const tabs = [
        { value: 'products', label: 'Product List' },
        { value: 'orders', label: 'My Orders' },
        { value: 'custom', label: 'Custom Orders' },
    ];

    const cartItemCount = cartProductIds.length;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <ShopProducts
                        cart={cart}
                        setCart={setCart}
                        cartProductIds={cartProductIds}
                        setCartProductIds={setCartProductIds}
                        showCartDrawer={showCartDrawer}
                        setShowCartDrawer={setShowCartDrawer}
                    />
                );
            case 'orders': return <MyOrders />;
            case 'custom': return <CustomOrders />;
            default:
                return (
                    <ShopProducts
                        cart={cart}
                        setCart={setCart}
                        cartProductIds={cartProductIds}
                        setCartProductIds={setCartProductIds}
                        showCartDrawer={showCartDrawer}
                        setShowCartDrawer={setShowCartDrawer}
                    />
                );
        }
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Shop & Orders</h1>
                        <p className="text-sm text-gray-500">Browse products and manage your orders</p>
                    </div>

                    {activeTab === 'products' && (
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
                    )}
                </div>
            </header>

            <main className="p-6">
                <TabNavigation tabs={tabs} basePath="/user/shop-orders" />
                <div className="w-full">
                    {renderTabContent()}
                </div>
            </main>
        </>
    );
}