import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TabNavigation from './TabNavigation';

// ✅ Import your EXISTING components
import Courses from './Courses'; // Available Courses
import MyEnrollments from './MyEnrollments'; // My Enrollments

export default function Learning() {
    const location = useLocation();

    // Read tab from URL, fallback to 'courses'
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab') || 'courses';
    const [activeTab, setActiveTab] = useState(urlTab);

    // Keep state in sync with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['courses', 'enrollments'].includes(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab('courses');
        }
    }, [location.search]);

    const tabs = [
        { value: 'courses', label: 'Available Courses' },
        { value: 'enrollments', label: 'My Enrollments' },
    ];

    // ✅ Render your EXISTING components based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'courses':
                return <Courses />;
            case 'enrollments':
                return <MyEnrollments />;
            default:
                return <Courses />;
        }
    };

    return (
        <>
            {/* ✅ Header - Page-specific header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Learning</h1>
                        <p className="text-sm text-gray-500">Browse courses and track your progress</p>
                    </div>
                </div>
            </header>

            <main className="p-6">
                <TabNavigation tabs={tabs} basePath="/user/learning" />

                {/* ✅ Your existing components render here */}
                <div className="w-full">
                    {renderTabContent()}
                </div>
            </main>
        </>
    );
}