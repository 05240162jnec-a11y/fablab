import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function FAQ() {
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

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

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
            showToast('Failed to load FAQs. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
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
            showToast('FAQ created successfully!', 'success');
        } catch (error) {
            console.error('Error creating FAQ:', error);
            showToast('Failed to create FAQ. Please try again.', 'error');
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
            showToast('FAQ updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating FAQ:', error);
            showToast('Failed to update FAQ. Please try again.', 'error');
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
            showToast('FAQ deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            showToast('Failed to delete FAQ. Please try again.', 'error');
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
        // ✅ JUST the main content - sidebar is in AdminLayout now
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
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}