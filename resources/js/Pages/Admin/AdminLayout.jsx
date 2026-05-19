import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../Components/AdminSidebar';

export default function AdminLayout() {
    // ✅ Sidebar state - persists across ALL admin pages
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: false,
        operations: false,
        resources: false,
        contentMedia: false,
    });

    const navigate = useNavigate();

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // ✅ Handle logout - redirect to unified login page
    const handleLogout = () => {
        // ✅ Clear ALL tokens and data (both user and admin)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_dashboard_data');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');
        sessionStorage.clear();

        // ✅ Redirect to unified login page (not old admin login)
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar with persistent state */}
            <AdminSidebar
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
                onLogout={handleLogout}
            />

            {/* Main Content - Child routes render here via Outlet */}
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}