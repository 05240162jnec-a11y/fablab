import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductionTeam() {

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Dropdown States
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // ✅ Profile Dropdown State
    const [admin, setAdmin] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // ✅ Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Add/Edit Form State
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'male',
    });

    // Backend State
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, verified: 0, not_verified: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // ✅ Fetch admin data from localStorage
    useEffect(() => {
        const storedAdmin = JSON.parse(localStorage.getItem('admin'));
        if (storedAdmin) {
            setAdmin(storedAdmin);
        }
    }, []);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ Profile click handler
    const handleProfileClick = () => {
        setShowDropdown(false);
        navigate('/admin/profile');
    };

    // ✅ Logout handler
    const handleLogout = () => {
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
        navigate('/login', { replace: true });
    };

    // ✅ Fetch members from API
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            const response = await axios.get('/admin/production-team', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    search: searchTerm || null,
                }
            });

            if (response.data.success) {
                setMembers(response.data.data);
                setStats({
                    total: response.data.stats?.total || 0,
                    active: response.data.stats?.active || 0,
                    inactive: response.data.stats?.inactive || 0,
                    verified: response.data.stats?.verified || 0,
                    not_verified: response.data.stats?.not_verified || 0,
                });
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
    }, [searchTerm]);

    // ✅ Safe filter members
    const filteredMembers = members.filter(member => {
        const name = member?.name || '';
        const email = member?.email || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // ✅ SAFE capitalize function
    const capitalize = (str) => {
        if (!str || typeof str !== 'string') return '—';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // ✅ Safe get initials
    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return 'PT';
        return name.split(' ').map(n => n?.[0] || '').join('').substring(0, 2).toUpperCase();
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
        });
        setShowAddModal(true);
    };

    // Open Edit Modal
    const handleEditMember = (member) => {
        setSelectedMember(member);
        setFormState({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            gender: member.gender || 'male',
        });
        setShowEditModal(true);
    };

    // ✅ Open Toggle Status Modal
    const handleToggleStatus = (member) => {
        setSelectedMember(member);
        setShowToggleModal(true);
    };

    // ✅ Confirm Toggle Status
    const confirmToggleStatus = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(`/admin/production-team/${selectedMember.id}/toggle-status`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowToggleModal(false);
            setSelectedMember(null);
            fetchMembers();

            const status = selectedMember.is_active ? 'disabled' : 'enabled';
            showToast(`✅ Team member ${status} successfully!`, 'success');
        } catch (err) {
            console.error('Toggle status error:', err);
            showToast('❌ Failed to update team member status', 'error');
        }
    };

    // Save Add
    const handleSaveAdd = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('/admin/production-team', {
                name: formState.name,
                email: formState.email,
                phone: formState.phone,
                gender: formState.gender,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowAddModal(false);
            fetchMembers();
            showToast('✅ Team member added successfully! Credentials sent to their email.', 'success');
        } catch (err) {
            console.error('Add error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to add team member';
            showToast('❌ ' + errorMsg, 'error');
        }
    };

    // Save Edit
    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`/admin/production-team/${selectedMember.id}`, {
                name: formState.name,
                email: formState.email,
                phone: formState.phone,
                gender: formState.gender,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowEditModal(false);
            setSelectedMember(null);
            fetchMembers();
            showToast('✅ Team member updated successfully!', 'success');
        } catch (err) {
            console.error('Update error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update team member';
            showToast('❌ ' + errorMsg, 'error');
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowViewModal(false);
        setShowAddModal(false);
        setShowEditModal(false);
        setShowToggleModal(false);
        setSelectedMember(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex-1">
                {/* ✅ Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Production Team</h2>
                            <p className="text-sm text-gray-600">Manage production team members and assignments</p>
                        </div>

                        {/* ✅ Right Side - Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 focus:outline-none"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-md transition-shadow">
                                    {admin?.name?.charAt(0) || 'A'}
                                </div>
                            </button>

                            {/* ✅ Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900">{admin?.name || 'Admin'}</p>
                                        <p className="text-sm text-gray-500 truncate">{admin?.email || 'admin@fablab.jnec.rub.edu.bt'}</p>
                                        <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            Administrator
                                        </span>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            onClick={handleProfileClick}
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            My Profile
                                        </button>
                                    </div>

                                    <div className="py-1 border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
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

                        {/* ✅ Team Members Table - Shows Both Statuses */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team Member</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Verification</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewMember(member)}>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* ✅ Changed avatar color to black */}
                                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                                            {getInitials(member?.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{member?.name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-500">{member?.email || 'No email'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {/* ✅ Changed role badge color to black */}
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 border border-gray-300">
                                                        {capitalize(member?.role) || 'Production Team'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {member?.phone || '—'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {/* ✅ Verification Status - Professional Design */}
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${member.is_verified
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {member.is_verified ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>Verified</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>Not Verified</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {/* ✅ Account Status - Professional Design */}
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${member.is_active !== false
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${member.is_active !== false ? 'bg-blue-600' : 'bg-rose-600'
                                                            }`}></span>
                                                        <span>{member.is_active !== false ? 'Active' : 'Disabled'}</span>
                                                    </div>
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
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new member</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ===== ADD TEAM MEMBER MODAL ===== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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

                        <div className="p-6 space-y-4">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+975 17XXXXXX"
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

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    🔐 A random password will be generated and sent to <strong>{formState.email || 'member email'}</strong>
                                </p>
                            </div>
                        </div>

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

            {/* ===== VIEW TEAM MEMBER MODAL ===== */}
            {showViewModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                {/* ✅ Changed avatar color to black */}
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {getInitials(selectedMember?.name)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedMember?.name || 'Unknown'}</h4>
                                    {/* ✅ Changed role badge color to black */}
                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 border border-gray-300">
                                        {capitalize(selectedMember?.role) || 'Production Team'}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-100 mb-6" />

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="text-gray-900 font-medium">{capitalize(selectedMember?.gender) || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900 font-medium">{selectedMember?.email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="text-gray-900 font-medium">{selectedMember?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* ✅ Verification Status - Professional Design */}
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Verification Status</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedMember.is_verified
                                                ? 'Member has logged in at least once'
                                                : 'Invited but has not logged in yet'}
                                        </p>
                                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-xs font-medium ${selectedMember.is_verified
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {selectedMember.is_verified ? (
                                                <>
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Verified</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Not Verified</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ Account Status - Professional Design */}
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Account Status</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedMember.is_active !== false
                                                ? 'Account is active and can login'
                                                : 'Account is disabled and cannot login'}
                                        </p>
                                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-xs font-medium ${selectedMember.is_active !== false
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedMember.is_active !== false ? 'bg-blue-600' : 'bg-rose-600'
                                                }`}></span>
                                            <span>{selectedMember.is_active !== false ? 'Active' : 'Disabled'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ✅ Modal Footer - Edit and Disable/Enable */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => { closeAllModals(); handleEditMember(selectedMember); }}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit
                            </button>
                            <button
                                onClick={() => { closeAllModals(); handleToggleStatus(selectedMember); }}
                                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${selectedMember.is_active !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {selectedMember.is_active !== false ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                {selectedMember.is_active !== false ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT TEAM MEMBER MODAL ===== */}
            {showEditModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

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
                        </div>

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

            {/* ===== TOGGLE STATUS CONFIRMATION MODAL ===== */}
            {showToggleModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedMember.is_active !== false ? 'bg-red-100' : 'bg-green-100'
                                }`}>
                                <svg className={`w-8 h-8 ${selectedMember.is_active !== false ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {selectedMember.is_active !== false ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {selectedMember.is_active !== false ? 'Disable' : 'Enable'} Team Member?
                            </h3>
                            <p className="text-gray-600">
                                Are you sure you want to {selectedMember.is_active !== false ? 'disable' : 'enable'} <span className="font-semibold">{selectedMember?.name || 'this member'}</span>?
                                {selectedMember.is_active !== false && ' They will not be able to log in.'}
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeAllModals}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                className={`px-6 py-2 text-white rounded-lg transition-colors ${selectedMember.is_active !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {selectedMember.is_active !== false ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    <div className="flex items-center gap-2">
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}