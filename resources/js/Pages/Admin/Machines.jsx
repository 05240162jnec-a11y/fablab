import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Machines() {
    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState(null);

    // Custom Toast Notification State
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success',
        duration: 3000
    });

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    // Machines Data
    const [machines, setMachines] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, in_use: 0, maintenance: 0 });

    // Profile Dropdown State
    const [admin, setAdmin] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Show Toast Function
    const showToast = (message, type = 'success', duration = 3000) => {
        setToast({ show: true, message, type, duration });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, duration);
    };

    // Close Toast Function
    const closeToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Fetch admin data from localStorage
    useEffect(() => {
        const storedAdmin = JSON.parse(localStorage.getItem('admin'));
        if (storedAdmin) {
            setAdmin(storedAdmin);
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Profile click handler
    const handleProfileClick = () => {
        setShowDropdown(false);
        navigate('/admin/profile');
    };

    // Logout handler
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

    // Fetch machines from API
    const fetchMachines = async () => {
        try {
            setFetchLoading(true);
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/machines`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setMachines(response.data.data);
                setStats(response.data.stats);
            }
        } catch (err) {
            console.error('Fetch machines error:', err);
            setError('Failed to load machines');
            showToast('Failed to load machines', 'error');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: null
        });
        setPreviewImage(null);
    };

    // Add Machine
    const handleAddMachine = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('admin_token');
            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', 'General');
            data.append('status', 'available');
            data.append('description', formData.description);
            data.append('specifications', '');
            if (formData.image) {
                data.append('image', formData.image);
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/machines`, data, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setShowAddModal(false);
                resetForm();
                fetchMachines();
                showToast('Machine added successfully!', 'success');
            }
        } catch (err) {
            console.error('Add machine error:', err);
            console.error('Response:', err.response?.data);
            showToast('Failed to add machine: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Edit Machine - Open modal with data
    const handleEditClick = (machine) => {
        setSelectedMachine(machine);
        setFormData({
            name: machine.name,
            description: machine.description || '',
            image: null
        });
        setPreviewImage(machine.image ? `${(import.meta.env.VITE_API_URL || 'http://192.168.255.97/api').replace('/api','')}/storage/${machine.image}` : null);
        setShowViewModal(false);
        setShowEditModal(true);
    };

    // Update Machine
    const handleUpdateMachine = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('admin_token');
            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', 'General');
            data.append('description', formData.description);
            data.append('specifications', '');
            if (formData.image) {
                data.append('image', formData.image);
            }
            data.append('_method', 'PUT');

            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/machines/${selectedMachine.id}`, data, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setShowEditModal(false);
                resetForm();
                setSelectedMachine(null);
                fetchMachines();
                showToast('Machine updated successfully!', 'success');
            }
        } catch (err) {
            console.error('Update machine error:', err);
            console.error('Response:', err.response?.data);
            showToast('Failed to update machine: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // View Machine Details
    const handleViewClick = (machine) => {
        setSelectedMachine(machine);
        setShowViewModal(true);
    };

    // Delete Machine
    const handleDeleteClick = (machine) => {
        setSelectedMachine(machine);
        setShowViewModal(false);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/machines/${selectedMachine.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowDeleteConfirm(false);
            setSelectedMachine(null);
            fetchMachines();
            showToast('Machine deleted successfully!', 'success');
        } catch (err) {
            console.error('Delete machine error:', err);
            showToast('Failed to delete machine', 'error');
        }
    };

    // Open Maintenance Confirmation Modal
    const toggleMaintenance = (machine) => {
        if (machine.status === 'maintenance') {
            performMaintenanceToggle(machine, 'available');
        } else {
            setSelectedMachine(machine);
            setShowMaintenanceConfirm(true);
        }
    };

    // Actually perform the toggle after confirmation
    const performMaintenanceToggle = async (machine, newStatus) => {
        setShowMaintenanceConfirm(false);
        setLoading(true);

        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/machines/${machine.id}/toggle-maintenance`,
                {
                    status: newStatus,
                    notify_users: true
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                setMachines(prevMachines =>
                    prevMachines.map(m =>
                        m.id === machine.id ? { ...m, status: newStatus } : m
                    )
                );

                if (selectedMachine && selectedMachine.id === machine.id) {
                    setSelectedMachine({ ...selectedMachine, status: newStatus });
                }

                fetchMachines();

                if (newStatus === 'maintenance') {
                    showToast(`Machine set to maintenance mode. ${response.data.emails_sent} user(s) notified.`, 'warning');
                } else {
                    showToast(`Machine is now available. ${response.data.emails_sent} user(s) notified.`, 'success');
                }
            }
        } catch (err) {
            console.error('Toggle maintenance error:', err);
            showToast('Failed to update machine status: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Get status badge color for modal
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'in_use':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'maintenance':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Format status for display
    const formatStatus = (status) => {
        return status === 'in_use' ? 'In Use' : capitalize(status);
    };

    // Get Toast Styles
    const getToastStyles = () => {
        const styles = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800'
        };
        return styles[toast.type] || styles.info;
    };

    // Get Toast Icon
    const getToastIcon = () => {
        const icons = {
            success: (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            error: (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            warning: (
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            info: (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };
        return icons[toast.type] || icons.info;
    };

    return (
        <div className="flex-1">
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[100] animate-slide-in-right">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border-2 ${getToastStyles()} min-w-[320px] max-w-[500px]`}>
                        <div className="flex-shrink-0">
                            {getToastIcon()}
                        </div>
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={closeToast}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Machines</h2>
                        <p className="text-sm text-gray-600">Manage laboratory equipment and machinery</p>
                    </div>
                </div>
            </header>

            <main className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-sm text-gray-600">Total Machines</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                                <p className="text-sm text-gray-600">Available</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.in_use}</p>
                                <p className="text-sm text-gray-600">In Use</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
                                <p className="text-sm text-gray-600">Maintenance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Machine Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Machine
                    </button>
                </div>

                {/* Loading State */}
                {fetchLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !fetchLoading && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Machines Grid */}
                {!fetchLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {machines.map((machine) => (
                            <div key={machine.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                                <div className="relative w-full h-56 bg-gray-100 overflow-hidden flex-shrink-0">
                                    {machine.status === 'available' && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100/70 backdrop-blur-md border border-green-200/60 text-gray-900 shadow-lg">
                                                <svg className="w-3 h-3 mr-1 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Available
                                            </span>
                                        </div>
                                    )}

                                    {machine.status === 'maintenance' && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100/70 backdrop-blur-md border border-red-200/60 text-gray-900 shadow-lg">
                                                <svg className="w-3 h-3 mr-1 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Maintenance
                                            </span>
                                        </div>
                                    )}

                                    {machine.image ? (
                                        <img
                                            src={`${(import.meta.env.VITE_API_URL || 'http://192.168.255.97/api').replace('/api','')}/storage/${machine.image}`}
                                            alt={machine.name}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                            <svg className="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{machine.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{machine.description || 'No description available'}</p>
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => handleViewClick(machine)}
                                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {machines.length === 0 && !fetchLoading && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No machines found</p>
                        <p className="text-gray-400 text-sm mt-1">Click "Add New Machine" to get started</p>
                    </div>
                )}
            </main>

            {/* ===== ADD MACHINE MODAL ===== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Add New Machine</h3>
                            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddMachine} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="add-machine-image"
                                    />
                                    <label htmlFor="add-machine-image" className="cursor-pointer block">
                                        {previewImage ? (
                                            <div className="relative">
                                                <div className="w-full h-64">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-2">
                                                    <p className="text-sm font-medium">Click to change image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? 'Adding...' : 'Add Machine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== VIEW MACHINE DETAILS MODAL ===== */}
            {showViewModal && selectedMachine && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Machine Details</h3>
                            <button onClick={() => { setShowViewModal(false); setSelectedMachine(null); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {selectedMachine.image && (
                                <img src={`${(import.meta.env.VITE_API_URL || 'http://192.168.255.97/api').replace('/api','')}/storage/${selectedMachine.image}`} alt={selectedMachine.name} className="w-full h-64 object-cover rounded-lg" />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Machine Name</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Added On</p>
                                    <p className="font-semibold text-gray-900">{new Date(selectedMachine.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedMachine.description && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Description</p>
                                    <p className="text-gray-700">{selectedMachine.description}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Set to Maintenance</p>
                                        <p className="text-xs text-gray-500">Toggle to mark this machine as under maintenance</p>
                                    </div>
                                    <button
                                        onClick={() => toggleMaintenance(selectedMachine)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedMachine.status === 'maintenance' ? 'bg-red-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedMachine.status === 'maintenance' ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => handleEditClick(selectedMachine)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteClick(selectedMachine)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT MACHINE MODAL ===== */}
            {showEditModal && selectedMachine && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Edit Machine</h3>
                            <button onClick={() => { setShowEditModal(false); resetForm(); setSelectedMachine(null); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateMachine} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="edit-machine-image"
                                    />
                                    <label htmlFor="edit-machine-image" className="cursor-pointer block">
                                        {previewImage ? (
                                            <div className="relative">
                                                <div className="w-full h-64">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-2">
                                                    <p className="text-sm font-medium">Click to change image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); setSelectedMachine(null); }} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? 'Updating...' : 'Update Machine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {showDeleteConfirm && selectedMachine && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Machine</h3>
                            <p className="text-gray-500 text-center mb-6">Are you sure you want to delete "{selectedMachine.name}"? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDeleteConfirm(false); setSelectedMachine(null); }} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MAINTENANCE CONFIRMATION MODAL ===== */}
            {showMaintenanceConfirm && selectedMachine && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
                        {/* Header with Warning Icon */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Set to Maintenance?</h3>
                                    <p className="text-sm text-amber-700 mt-1">Warning: This will affect active bookings.</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to set <span className="font-bold text-gray-900">"{selectedMachine.name}"</span> to maintenance mode?
                            </p>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-gray-800">
                                        <p className="font-semibold mb-1 text-gray-900">What will happen:</p>
                                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                                            <li>All confirmed bookings for this machine will be <strong className="text-gray-900">automatically cancelled</strong>.</li>
                                            <li>Affected users will receive an <strong className="text-gray-900">email notification</strong> about the cancellation.</li>
                                            <li>Users will be notified again when the machine is back online.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 font-medium">Do you want to continue?</p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setShowMaintenanceConfirm(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => performMaintenanceToggle(selectedMachine, 'maintenance')}
                                disabled={loading}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Yes, Set to Maintenance'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}