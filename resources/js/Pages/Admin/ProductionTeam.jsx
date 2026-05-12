import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../Components/AdminSidebar';

export default function ProductionTeam() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: true,
        operations: false,
        resources: false,
        contentMedia: false,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Dropdown States
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Add/Edit Form State
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        password: '',
        confirmPassword: '',
        status: 'available',
        assignedTask: '',
    });

    // Backend State
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch members from API
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/production-team', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    search: searchTerm || null,
                    status: statusFilter !== 'all' ? statusFilter : null,
                }
            });

            if (response.data.success) {
                setMembers(response.data.data);
                setStats(response.data.stats);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch members error:', err);
            setError('Failed to load team members. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchMembers();
    }, [searchTerm, statusFilter]);

    // Filter members (client-side for better UX)
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'assigned':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'available':
                return 'bg-green-100 text-green-700 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Get initials from name
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Open View Modal
    const handleViewMember = (member) => {
        setSelectedMember(member);
        setShowViewModal(true);
    };

    // Open Add Modal
    const handleAddMember = () => {
        setFormState({
            name: '',
            email: '',
            phone: '',
            gender: 'male',
            password: '',
            confirmPassword: '',
            status: 'available',
            assignedTask: '',
        });
        setShowAddModal(true);
    };

    // Open Edit Modal
    const handleEditMember = (member) => {
        setSelectedMember(member);
        setFormState({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            gender: member.gender || 'male',
            password: '',
            confirmPassword: '',
            status: member.status,
            assignedTask: member.assigned_task || '',
        });
        setShowEditModal(true);
    };

    // Open Delete Modal
    const handleDeleteMember = (member) => {
        setSelectedMember(member);
        setShowDeleteModal(true);
    };

    // Confirm Delete
    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://127.0.0.1:8000/api/admin/production-team/${selectedMember.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowDeleteModal(false);
            setSelectedMember(null);
            fetchMembers(); // Refresh list
            alert('✅ Team member deleted successfully!');
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Failed to delete team member');
        }
    };

    // Save Add
    const handleSaveAdd = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://127.0.0.1:8000/api/admin/production-team', {
                name: formState.name,
                email: formState.email,
                phone: formState.phone,
                gender: formState.gender,
                status: formState.status,
                assigned_task: formState.assignedTask,
                // Password will be auto-generated by backend
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowAddModal(false);
            fetchMembers(); // Refresh list
            alert('✅ Team member added successfully! Credentials sent to their email.');
        } catch (err) {
            console.error('Add error:', err);
            alert('❌ Failed to add team member');
        }
    };

    // Save Edit
    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://127.0.0.1:8000/api/admin/production-team/${selectedMember.id}`, {
                ...formState,
                assigned_task: formState.assignedTask,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowEditModal(false);
            setSelectedMember(null);
            fetchMembers(); // Refresh list
            alert('✅ Team member updated successfully!');
        } catch (err) {
            console.error('Update error:', err);
            alert('❌ Failed to update team member');
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowViewModal(false);
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedMember(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Production Team</h2>
                            <p className="text-sm text-gray-600">Manage production team members and assignments</p>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Admin Profile */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Production Team Content */}
                <main className="p-6">
                    {/* Header with Add Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleAddMember}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Production Team
                        </button>
                    </div>

                    {/* Team Members Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Team Members ({stats.total})</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search team members..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                    />
                                </div>

                                {/* Status Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className="w-full sm:w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700">
                                            {statusFilter === 'all' ? 'All Status' : capitalize(statusFilter)}
                                        </span>
                                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showStatusDropdown && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <button
                                                onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); }}
                                                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                All Status
                                                {statusFilter === 'all' && (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => { setStatusFilter('available'); setShowStatusDropdown(false); }}
                                                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${statusFilter === 'available' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Available
                                                {statusFilter === 'available' && (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => { setStatusFilter('assigned'); setShowStatusDropdown(false); }}
                                                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${statusFilter === 'assigned' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Assigned
                                                {statusFilter === 'assigned' && (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {/* Team Members Table */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team Member</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned Task</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewMember(member)}>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                                                            {getInitials(member.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                                                            <p className="text-xs text-gray-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(member.status)}`}>
                                                        {capitalize(member.status)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {member.assigned_task || '—'}
                                                </td>
                                                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleViewMember(member)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMember(member)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(member)}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filteredMembers.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-gray-500 text-lg font-medium">No team members found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ===== ADD TEAM MEMBER MODAL - YOUR DESIGN PRESERVED ===== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Add New Team Member</h3>
                                <p className="text-sm text-gray-500 mt-1">Enter the details for the new production team member.</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="member@jnec.ac.in"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Phone & Gender */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 00000"
                                        value={formState.phone}
                                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <select
                                        value={formState.gender}
                                        onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Info Message */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    🔐 A random password will be generated and sent to <strong>{formState.email || 'member email'}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAdd}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== VIEW TEAM MEMBER MODAL - YOUR DESIGN PRESERVED ===== */}
            {showViewModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Team Member Details</h3>
                                <p className="text-sm text-gray-500 mt-1">View detailed information about this team member</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Member Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {getInitials(selectedMember.name)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedMember.name}</h4>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedMember.status)}`}>
                                        {capitalize(selectedMember.status)}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-100 mb-6" />

                            {/* Details */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="text-gray-900 font-medium">{capitalize(selectedMember.gender || 'N/A')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900 font-medium">{selectedMember.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="text-gray-900 font-medium">{selectedMember.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Assigned Task */}
                                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                                    <p className="text-xs text-gray-500 mb-1">Currently Assigned</p>
                                    <p className="text-gray-900 font-medium">{selectedMember.assigned_task || 'No task assigned'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => { closeAllModals(); handleDeleteMember(selectedMember); }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT TEAM MEMBER MODAL - YOUR DESIGN PRESERVED ===== */}
            {showEditModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Edit Team Member</h3>
                                <p className="text-sm text-gray-500 mt-1">Update team member information</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Phone & Gender */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formState.phone}
                                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <select
                                        value={formState.gender}
                                        onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status & Assigned Task */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="available">Available</option>
                                        <option value="assigned">Assigned</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Task</label>
                                    <input
                                        type="text"
                                        placeholder="Task name"
                                        value={formState.assignedTask}
                                        onChange={(e) => setFormState({ ...formState, assignedTask: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL - YOUR DESIGN PRESERVED ===== */}
            {showDeleteModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
                        {/* Modal Header */}
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Team Member?</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete <span className="font-semibold">{selectedMember.name}</span>? This action cannot be undone.
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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