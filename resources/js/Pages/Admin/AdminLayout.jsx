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

    // ✅ Handle logout
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_dashboard_data');
        navigate('/admin/login', { replace: true });
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