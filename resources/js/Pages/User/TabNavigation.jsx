import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TabNavigation({ tabs, basePath }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Get current tab from URL query params
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('tab') || tabs[0].value;

    const handleTabClick = (tabValue) => {
        // Navigate to basePath with tab query param
        navigate(`${basePath}?tab=${tabValue}`, { replace: true });
    };

    return (
        <div className="border-b border-gray-200 mb-6">
            <div className="flex items-center gap-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleTabClick(tab.value)}
                            className={`pb-3 text-sm font-medium transition-all relative ${
                                isActive
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {/* Blue underline for active tab */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}