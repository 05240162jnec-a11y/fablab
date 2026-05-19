import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ProductionTeamSidebar from '../../Components/ProductionTeamSidebar';

export default function ProductionTeamLayout() {
    // Sidebar state - for future expandable menus if needed
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar with persistent state */}
            <ProductionTeamSidebar
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
            />

            {/* Main Content - Child routes render here via Outlet */}
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}