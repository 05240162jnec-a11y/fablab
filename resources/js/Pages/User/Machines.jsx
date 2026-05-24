import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TabNavigation from './TabNavigation';
import UserSidebar from './UserSidebar';

// ✅ Import your EXISTING components
import BookMachine from './BookMachine';
import MyBookings from './MyBookings';

export default function Machines() {
    const location = useLocation();

    // Read tab from URL, fallback to 'book'
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab') || 'book';
    const [activeTab, setActiveTab] = useState(urlTab);
    

    // Keep state in sync with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['book', 'bookings'].includes(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab('book');
        }
    }, [location.search]);

    const [expandedMenus, setExpandedMenus] = useState({
        shopOrders: false, machines: false, learning: false, explore: false, support: false,
    });

    const tabs = [
        { value: 'book', label: 'Book a Machine' },
        { value: 'bookings', label: 'My Bookings' },
    ];

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleLogout = () => {
        sessionStorage.removeItem('auth_token');
        window.location.href = '/login';
    };

    // ✅ Render your EXISTING components based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'book':
                return <BookMachine />;
            case 'bookings':
                return <MyBookings />;
            default:
                return <BookMachine />;
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
                {/* ✅ Header - SINGLE HEADER ONLY */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                    <div className="px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Machines</h1>
                            <p className="text-sm text-gray-500">Book equipment and manage your reservations</p>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    <TabNavigation tabs={tabs} basePath="/user/machines" />

                    {/* ✅ Your existing components render here */}
                    <div className="w-full">
                        {renderTabContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}