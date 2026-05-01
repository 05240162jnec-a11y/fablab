import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function FAQ() {
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: false,
        operations: false,
        resources: false,
        contentMedia: true,
    });

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);

    // API Data States
    const [faqs, setFAQs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'General',
    });
    const [submitting, setSubmitting] = useState(false);

    // Accordion State
    const [expandedFAQs, setExpandedFAQs] = useState({});
    const [activeCategory, setActiveCategory] = useState('All');

    // Fetch FAQs on component mount
    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/faq', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            setFAQs(response.data.faqs);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            alert('Failed to load FAQs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Toggle FAQ Answer
    const toggleFAQ = (id) => {
        setExpandedFAQs(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Handle Form Input Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Open Add Modal
    const handleAddFAQ = () => {
        setFormData({
            question: '',
            answer: '',
            category: 'General',
        });
        setShowAddModal(true);
    };

    // Open Edit Modal
    const handleEditFAQ = (faq) => {
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
        });
        setSelectedFAQ(faq);
        setShowEditModal(true);
    };

    // Open Delete Modal
    const handleDeleteFAQ = (faq) => {
        setSelectedFAQ(faq);
        setShowDeleteModal(true);
    };

    // Submit Add FAQ Form
    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.post(
                'http://127.0.0.1:8000/api/admin/faq',
                {
                    question: formData.question,
                    answer: formData.answer,
                    category: formData.category,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setFAQs([response.data.faq, ...faqs]);
            setShowAddModal(false);
            alert('FAQ created successfully!');
        } catch (error) {
            console.error('Error creating FAQ:', error);
            alert('Failed to create FAQ. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Submit Edit FAQ Form
    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.put(
                `http://127.0.0.1:8000/api/admin/faq/${selectedFAQ.id}`,
                {
                    question: formData.question,
                    answer: formData.answer,
                    category: formData.category,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setFAQs(faqs.map(faq =>
                faq.id === selectedFAQ.id ? response.data.faq : faq
            ));
            setShowEditModal(false);
            setSelectedFAQ(null);
            alert('FAQ updated successfully!');
        } catch (error) {
            console.error('Error updating FAQ:', error);
            alert('Failed to update FAQ. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Confirm Delete
    const handleConfirmDelete = async () => {
        try {
            const adminToken = localStorage.getItem('admin_token');

            await axios.delete(
                `http://127.0.0.1:8000/api/admin/faq/${selectedFAQ.id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            setFAQs(faqs.filter(faq => faq.id !== selectedFAQ.id));
            setShowDeleteModal(false);
            setSelectedFAQ(null);
            alert('FAQ deleted successfully!');
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            alert('Failed to delete FAQ. Please try again.');
        }
    };

    // Close All Modals
    const closeAllModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedFAQ(null);
    };

    // Get unique categories with counts
    const categories = faqs.reduce((acc, faq) => {
        acc[faq.category] = (acc[faq.category] || 0) + 1;
        return acc;
    }, {});

    // Filter FAQs by category
    const filteredFAQs = activeCategory === 'All'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    // Group FAQs by category
    const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
        if (!acc[faq.category]) {
            acc[faq.category] = [];
        }
        acc[faq.category].push(faq);
        return acc;
    }, {});

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                    <img src="../images/logo.png" className="w-15 h-15 rounded-full object-cover" alt="Logo" />
                    <div>
                        <h1 className="text-lg font-bold text-white">JNEC Fab Lab</h1>
                        <p className="text-xs text-slate-400">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {/* Dashboard */}
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    {/* User Management */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('userManagement')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                User Management
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.userManagement ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.userManagement && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/users" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Users</Link>
                                <Link to="/admin/production-team" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Production Team</Link>
                            </div>
                        )}
                    </div>

                    {/* Operations */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('operations')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Operations
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.operations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.operations && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/machines" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Machines</Link>
                                <Link to="/admin/bookings" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Bookings</Link>
                                <Link to="/admin/courses" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Courses</Link>
                                <Link to="/admin/custom-orders" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Custom Orders</Link>
                            </div>
                        )}
                    </div>

                    {/* Resources */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('resources')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Resources
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.resources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.resources && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/inventory" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Inventory</Link>
                                <Link to="/admin/projects" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Projects</Link>
                            </div>
                        )}
                    </div>

                    {/* Content & Media — active */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('contentMedia')}
                            className="flex items-center justify-between w-full px-4 py-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-medium"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Content & Media
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedMenus.contentMedia ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus.contentMedia && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link to="/admin/gallery" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Gallery</Link>
                                <Link to="/admin/faq" className="block px-4 py-2 text-white bg-blue-600/30 rounded-lg text-sm font-medium">FAQ</Link>
                                <Link to="/admin/feedback" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Feedback</Link>
                            </div>
                        )}
                    </div>

                    {/* Transactions */}
                    <Link
                        to="/admin/transactions"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Transactions
                    </Link>

                    {/* Logout */}
                    <Link
                        to="/admin/login"
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-4 border-t border-slate-700/50 pt-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">FAQ Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage frequently asked questions</p>
                        </div>

                        {/* Add FAQ Button */}
                        <button
                            onClick={handleAddFAQ}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add FAQ
                        </button>
                    </div>
                </header>

                {/* FAQ Content */}
                <main className="p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading FAQs...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && faqs.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No FAQs found.</p>
                            <p className="text-gray-400 text-sm mt-2">Click "Add FAQ" to create your first FAQ.</p>
                        </div>
                    )}

                    {/* Category Filter Buttons */}
                    {!loading && faqs.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                                <button
                                    onClick={() => setActiveCategory('All')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'All'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    All ({faqs.length})
                                </button>
                                {Object.entries(categories).map(([category, count]) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === category
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {category} ({count})
                                    </button>
                                ))}
                            </div>

                            {/* FAQ List Grouped by Category */}
                            <div className="space-y-6">
                                {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
                                    <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        {/* Category Header */}
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                                            <span className="text-xs text-gray-500">{categoryFAQs.length} question{categoryFAQs.length !== 1 ? 's' : ''}</span>
                                        </div>

                                        {/* FAQ Items */}
                                        <div className="divide-y divide-gray-200">
                                            {categoryFAQs.map((faq) => (
                                                <div key={faq.id} className="p-6">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <button
                                                                onClick={() => toggleFAQ(faq.id)}
                                                                className="flex items-center justify-between w-full text-left"
                                                            >
                                                                <span className="text-base font-medium text-gray-900">{faq.question}</span>
                                                                <svg
                                                                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedFAQs[faq.id] ? 'rotate-180' : ''
                                                                        }`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>

                                                            {/* Answer - Expandable */}
                                                            {expandedFAQs[faq.id] && (
                                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                                    <p className="text-gray-600 leading-relaxed mb-4">{faq.answer}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleEditFAQ(faq)}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteFAQ(faq)}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* ===== ADD FAQ MODAL ===== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add New FAQ</h3>
                                <p className="text-sm text-gray-500 mt-1">Create a new frequently asked question.</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitAdd}>
                            <div className="p-6 space-y-4">
                                {/* Question */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                    <input
                                        type="text"
                                        name="question"
                                        value={formData.question}
                                        onChange={handleInputChange}
                                        placeholder="Enter the question"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option>General</option>
                                        <option>Booking</option>
                                        <option>Training</option>
                                        <option>Orders</option>
                                        <option>Safety</option>
                                        <option>Materials</option>
                                        <option>Equipment</option>
                                    </select>
                                </div>

                                {/* Answer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                    <textarea
                                        name="answer"
                                        value={formData.answer}
                                        onChange={handleInputChange}
                                        placeholder="Enter the answer"
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                    {submitting ? 'Creating...' : 'Add FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== EDIT FAQ MODAL ===== */}
            {showEditModal && selectedFAQ && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit FAQ</h3>
                                <p className="text-sm text-gray-500 mt-1">Update the frequently asked question.</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit}>
                            <div className="p-6 space-y-4">
                                {/* Question */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                    <input
                                        type="text"
                                        name="question"
                                        value={formData.question}
                                        onChange={handleInputChange}
                                        placeholder="Enter the question"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option>General</option>
                                        <option>Booking</option>
                                        <option>Training</option>
                                        <option>Orders</option>
                                        <option>Safety</option>
                                        <option>Materials</option>
                                        <option>Equipment</option>
                                    </select>
                                </div>

                                {/* Answer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                    <textarea
                                        name="answer"
                                        value={formData.answer}
                                        onChange={handleInputChange}
                                        placeholder="Enter the answer"
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {showDeleteModal && selectedFAQ && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Delete FAQ</h3>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Delete this FAQ?</p>
                                    <p className="text-xs text-gray-600">This action cannot be undone.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-semibold text-gray-900 mb-1">{selectedFAQ.question}</p>
                                <p className="text-xs text-gray-500">Category: {selectedFAQ.category}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}