import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function About() {
    // States
    const [activeTab, setActiveTab] = useState('sections'); // 'sections' or 'team'
    const [sections, setSections] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showEditSectionModal, setShowEditSectionModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showEditMemberModal, setShowEditMemberModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Form States
    const [sectionForm, setSectionForm] = useState({ title: '', body: '', image: null, imagePreview: null });
    const [memberForm, setMemberForm] = useState({
        name: '',
        role: '',
        image: null,
        imagePreview: null,
        linkedin_url: '',
        facebook_url: '',
        twitter_url: '',
    });
    const [uploading, setUploading] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    // Auto-hide toast
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };

            const [sectionsRes, membersRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/admin/about/sections', { headers }),
                axios.get('http://127.0.0.1:8000/api/admin/about/team-members', { headers }),
            ]);

            if (sectionsRes.data.success) setSections(sectionsRes.data.sections);
            if (membersRes.data.success) setTeamMembers(membersRes.data.members);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Failed to load data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════
    // SECTIONS MANAGEMENT
    // ═══════════════════════════════════════════════

    const handleEditSection = (section) => {
        setSelectedSection(section);
        setSectionForm({
            title: section.title,
            body: section.body,
            image: null,
            imagePreview: section.image,
        });
        setShowEditSectionModal(true);
    };

    const handleSectionImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSectionForm({
                ...sectionForm,
                image: file,
                imagePreview: URL.createObjectURL(file),
            });
        }
    };

    const handleUpdateSection = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('title', sectionForm.title);
            formData.append('body', sectionForm.body);
            if (sectionForm.image) formData.append('image', sectionForm.image);
            formData.append('_method', 'PUT');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/about/sections/${selectedSection.id}`,
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                setSections(sections.map(s => s.id === selectedSection.id ? response.data.section : s));
                setShowEditSectionModal(false);
                showToast('Section updated successfully!');
            }
        } catch (error) {
            console.error('Error updating section:', error);
            showToast('Failed to update section.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // ═══════════════════════════════════════════════
    // TEAM MEMBERS MANAGEMENT
    // ═══════════════════════════════════════════════

    const handleAddMember = () => {
        setMemberForm({
            name: '',
            role: '',
            section: 'fab_team',
            image: null,
            imagePreview: null,
            linkedin_url: '',
            facebook_url: '',
            twitter_url: '',
        });
        setShowAddMemberModal(true);
    };

    const handleEditMember = (member) => {
        setSelectedMember(member);
        setMemberForm({
            name: member.name,
            role: member.role,
            section: member.section || 'fab_team',
            image: null,
            imagePreview: member.image,
            linkedin_url: member.linkedin_url || '',
            facebook_url: member.facebook_url || '',
            twitter_url: member.twitter_url || '',
        });
        setShowEditMemberModal(true);
    };

    const handleMemberImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMemberForm({
                ...memberForm,
                image: file,
                imagePreview: URL.createObjectURL(file),
            });
        }
    };

    const handleStoreMember = async (e) => {
        e.preventDefault();
        if (!memberForm.image) {
            showToast('Please select an image.', 'error');
            return;
        }

        try {
            setUploading(true);
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('name', memberForm.name);
            formData.append('role', memberForm.role);
            formData.append('section', memberForm.section);
            formData.append('image', memberForm.image);
            formData.append('linkedin_url', memberForm.linkedin_url);
            formData.append('facebook_url', memberForm.facebook_url);
            formData.append('twitter_url', memberForm.twitter_url);

            const response = await axios.post(
                'http://127.0.0.1:8000/api/admin/about/team-members',
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                setTeamMembers([...teamMembers, response.data.member]);
                setShowAddMemberModal(false);
                showToast('Team member added successfully!');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            showToast('Failed to add team member.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateMember = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const token = localStorage.getItem('admin_token');
            const formData = new FormData();
            formData.append('name', memberForm.name);
            formData.append('role', memberForm.role);
            formData.append('section', memberForm.section);
            if (memberForm.image) formData.append('image', memberForm.image);
            formData.append('linkedin_url', memberForm.linkedin_url);
            formData.append('facebook_url', memberForm.facebook_url);
            formData.append('twitter_url', memberForm.twitter_url);
            formData.append('_method', 'PUT');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/about/team-members/${selectedMember.id}`,
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                setTeamMembers(teamMembers.map(m => m.id === selectedMember.id ? response.data.member : m));
                setShowEditMemberModal(false);
                showToast('Team member updated successfully!');
            }
        } catch (error) {
            console.error('Error updating member:', error);
            showToast('Failed to update team member.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleMemberStatus = async (memberId) => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/admin/about/team-members/${memberId}/toggle-status`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setTeamMembers(teamMembers.map(m =>
                    m.id === memberId ? { ...m, is_active: response.data.is_active } : m
                ));
                showToast('Status updated successfully!');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast('Failed to update status.', 'error');
        }
    };

    const handleDeleteMember = (member) => {
        setSelectedMember(member);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(
                `http://127.0.0.1:8000/api/admin/about/team-members/${selectedMember.id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setTeamMembers(teamMembers.filter(m => m.id !== selectedMember.id));
            setShowDeleteConfirm(false);
            setSelectedMember(null);
            showToast('Team member deleted successfully!');
        } catch (error) {
            console.error('Error deleting member:', error);
            showToast('Failed to delete team member.', 'error');
        }
    };

    const closeAllModals = () => {
        setShowEditSectionModal(false);
        setShowAddMemberModal(false);
        setShowEditMemberModal(false);
        setShowDeleteConfirm(false);
        setSelectedSection(null);
        setSelectedMember(null);
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    // Get section icon based on key
    const getSectionIcon = (key) => {
        const icons = {
            'who_we_are': '',
            'mission': '',
            'vision': '',
        };
        return icons[key] || '';
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">About Page</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage About page content and team members</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-t border-gray-100">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('sections')}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'sections'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            📄 About Sections
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'team'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            👥 Team Members
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {/* ═══════════════════════════════════════════════ */}
                {/* SECTIONS TAB */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'sections' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> Edit the content for each section. These sections appear on the public About page.
                            </p>
                        </div>

                        {sections.map((section) => (
                            <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="flex items-start gap-4 p-6">
                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                        {getSectionIcon(section.section_key)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {section.section_key.replace(/_/g, ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {section.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{section.body}</p>

                                        {section.image && (
                                            <div className="mt-3">
                                                <img
                                                    src={section.image}
                                                    alt={section.title}
                                                    className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => handleEditSection(section)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* TEAM MEMBERS TAB */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'team' && (
                    <div>
                        {/* Add Button */}
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={handleAddMember}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Team Member
                            </button>
                        </div>

                        {/* Members Grid */}
                        {teamMembers.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-gray-500 text-lg">No team members yet.</p>
                                <p className="text-gray-400 text-sm mt-2">Click "Add Team Member" to add your first member.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                                        {/* Avatar Area */}
                                        <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative">
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                                                    {getInitials(member.name)}
                                                </div>
                                            )}

                                            {/* Status Toggle */}
                                            <button
                                                onClick={() => handleToggleMemberStatus(member.id)}
                                                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${member.is_active
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                                title={member.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                                            >
                                                {member.is_active ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                                            <p className="text-sm text-gray-600 italic mb-1">{member.role}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${member.section === 'leader' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {member.section === 'leader' ? '⭐ Leader' : 'Fab Team'}
                                            </span>

                                            {/* Social Links */}
                                            <div className="flex gap-2 mb-3">
                                                {member.linkedin_url && (
                                                    <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                        </svg>
                                                    </a>
                                                )}
                                                {member.facebook_url && (
                                                    <a href={member.facebook_url} target="_blank" rel="noreferrer" className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                        </svg>
                                                    </a>
                                                )}
                                                {member.twitter_url && (
                                                    <a href={member.twitter_url} target="_blank" rel="noreferrer" className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditMember(member)}
                                                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(member)}
                                                    className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ═══════════════════════════════════════════════ */}
            {/* EDIT SECTION MODAL */}
            {/* ═══════════════════════════════════════════════ */}
            {showEditSectionModal && selectedSection && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit Section</h3>
                                <p className="text-sm text-gray-600">{selectedSection.section_key.replace(/_/g, ' ')}</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSection} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={sectionForm.title}
                                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                                <textarea
                                    value={sectionForm.body}
                                    onChange={(e) => setSectionForm({ ...sectionForm, body: e.target.value })}
                                    rows="8"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    required
                                />
                            </div>

                            {/* Image — hidden for Mission & Vision sections */}
                            {!['mission', 'vision'].includes(selectedSection.section_key) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSectionImageChange}
                                            className="hidden"
                                            id="section-image"
                                        />
                                        <label htmlFor="section-image" className="cursor-pointer">
                                            {sectionForm.imagePreview ? (
                                                <img src={sectionForm.imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                            ) : (
                                                <>
                                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600">Click to upload image</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
                                >
                                    {uploading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ADD TEAM MEMBER MODAL */}
            {/* ═══════════════════════════════════════════════ */}
            {(showAddMemberModal || showEditMemberModal) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-gray-900">
                                {showAddMemberModal ? 'Add Team Member' : 'Edit Team Member'}
                            </h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={showAddMemberModal ? handleStoreMember : handleUpdateMember} className="p-6 space-y-4">
                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Photo {showAddMemberModal && '*'}
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMemberImageChange}
                                        className="hidden"
                                        id="member-image"
                                    />
                                    <label htmlFor="member-image" className="cursor-pointer">
                                        {memberForm.imagePreview ? (
                                            <img src={memberForm.imagePreview} alt="Preview" className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg" />
                                        ) : (
                                            <>
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <p className="text-sm text-gray-600">Click to upload photo</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Name & Role */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={memberForm.name}
                                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                        placeholder="e.g., John Doe"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                                    <input
                                        type="text"
                                        value={memberForm.role}
                                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                        placeholder="e.g., Lab Technician"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                                <select
                                    value={memberForm.section}
                                    onChange={(e) => setMemberForm({ ...memberForm, section: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    required
                                >
                                    <option value="fab_team">Fab Team</option>
                                    <option value="leader">Leader</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    "Leader" appears in the Leader section on the About page. "Fab Team" appears in the team grid below.
                                </p>
                            </div>

                            {/* Social Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={memberForm.linkedin_url}
                                    onChange={(e) => setMemberForm({ ...memberForm, linkedin_url: e.target.value })}
                                    placeholder="https://linkedin.com/in/username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                                <input
                                    type="url"
                                    value={memberForm.facebook_url}
                                    onChange={(e) => setMemberForm({ ...memberForm, facebook_url: e.target.value })}
                                    placeholder="https://facebook.com/username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                                <input
                                    type="url"
                                    value={memberForm.twitter_url}
                                    onChange={(e) => setMemberForm({ ...memberForm, twitter_url: e.target.value })}
                                    placeholder="https://twitter.com/username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
                                >
                                    {uploading ? 'Saving...' : showAddMemberModal ? 'Add Member' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ═══════════════════════════════════════════════ */}
            {showDeleteConfirm && selectedMember && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete <span className="font-semibold">"{selectedMember.name}"</span>? This will permanently remove them from the team.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeAllModals}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-lg"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TOAST NOTIFICATION */}
            {/* ═══════════════════════════════════════════════ */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[9999] animate-fade-in">
                    <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[350px] ${toast.type === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-red-500 to-rose-600'
                        } text-white`}>
                        {toast.type === 'success' ? (
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast({ show: false, message: '', type: 'success' })}
                            className="flex-shrink-0 text-white/80 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}