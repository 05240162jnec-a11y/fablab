import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TabNavigation from './TabNavigation';
import UserSidebar from './UserSidebar';

// ✅ Import your EXISTING components
import ShopProducts from './ShopProducts';
import MyOrders from './MyOrders';
import CustomOrders from './CustomOrders';

export default function ShopOrders() {
    const location = useLocation();

    // Read tab from URL, fallback to 'products'
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab') || 'products';
    const [activeTab, setActiveTab] = useState(urlTab);

    // Keep state in sync with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['products', 'orders', 'custom'].includes(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab('products');
        }
    }, [location.search]);

    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: false, machines: false, learning: false, explore: false, support: false,
    });

    // ✅ Lifted Cart State (so Cart button works in header)
    const [cart, setCart] = useState([]);
    const [cartProductIds, setCartProductIds] = useState([]);
    const [showCartDrawer, setShowCartDrawer] = useState(false);

    const tabs = [
        { value: 'products', label: 'Product List' },
        { value: 'orders', label: 'My Orders' },
        { value: 'custom', label: 'Custom Orders' },
    ];

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    };

    // ✅ Cart Badge Count
    const cartItemCount = cartProductIds.length;

    // ✅ Render your EXISTING components based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <ShopProducts
                        // Pass cart state and functions to ShopProducts
                        cart={cart}
                        setCart={setCart}
                        cartProductIds={cartProductIds}
                        setCartProductIds={setCartProductIds}
                        showCartDrawer={showCartDrawer}
                        setShowCartDrawer={setShowCartDrawer}
                    />
                );
            case 'orders':
                return <MyOrders />;
            case 'custom':
                return <CustomOrders />;
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
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <UserSidebar
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
                onLogout={handleLogout}
            />

            <div className="flex-1">
                {/* ✅ Header with Cart Button - SINGLE HEADER ONLY */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Shop & Orders</h1>
                            <p className="text-sm text-gray-500">Browse products and manage your orders</p>
                        </div>

                        {/* ✅ Cart Button with Badge - ONLY show on Product List tab */}
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

                    {/* ✅ Your existing components render here */}
                    <div className="w-full">
                        {renderTabContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}