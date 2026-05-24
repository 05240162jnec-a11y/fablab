import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import ProductionTeamSidebar from '../../Components/ProductionTeamSidebar';

export default function ProductionTeamLayout() {
    // Sidebar state - for future expandable menus if needed
    const [expandedMenus, setExpandedMenus] = useState({});
    const navigate = useNavigate(); // ✅ Added navigate

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // ✅ ADDED: Logout handler for production team
    const handleLogout = () => {
        // Clear production-team-specific keys first
        localStorage.removeItem('production_team_token');
        localStorage.removeItem('production_team_data');

        // Also clear legacy/shared keys for backward compatibility
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_data');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');
        sessionStorage.clear();

        navigate('/login', { replace: true });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar with persistent state */}
            <ProductionTeamSidebar
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
                onLogout={handleLogout} // ✅ ADDED: Pass logout handler to sidebar
            />

            {/* Main Content - Child routes render here via Outlet */}
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}