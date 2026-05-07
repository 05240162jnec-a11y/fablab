import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../Components/AdminSidebar';

export default function Machines() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: true,
        operations: true,
        resources: false,
        contentMedia: false,
    });

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: 'available',
        description: '',
        specifications: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    // Machines Data
    const [machines, setMachines] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, in_use: 0, maintenance: 0 });

    // Toggle submenu
    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch machines from API
    const fetchMachines = async () => {
        try {
            setFetchLoading(true);
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/machines', {
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
            type: '',
            status: 'available',
            description: '',
            specifications: '',
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
            data.append('type', formData.type);
            data.append('status', formData.status);
            data.append('description', formData.description);
            data.append('specifications', formData.specifications);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const response = await axios.post('http://127.0.0.1:8000/api/admin/machines', data, {
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
                alert('Machine added successfully!');
            }
        } catch (err) {
            console.error('Add machine error:', err);
            alert('Failed to add machine');
        } finally {
            setLoading(false);
        }
    };

    // Edit Machine - Open modal with data
    const handleEditClick = (machine) => {
        setSelectedMachine(machine);
        setFormData({
            name: machine.name,
            type: machine.type,
            status: machine.status,
            description: machine.description || '',
            specifications: machine.specifications || '',
            image: null
        });
        setPreviewImage(machine.image ? `http://127.0.0.1:8000/storage/${machine.image}` : null);
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
            data.append('type', formData.type);
            data.append('status', formData.status);
            data.append('description', formData.description);
            data.append('specifications', formData.specifications);
            if (formData.image) {
                data.append('image', formData.image);
            }
            data.append('_method', 'PUT');

            const response = await axios.post(`http://127.0.0.1:8000/api/admin/machines/${selectedMachine.id}`, data, {
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
                alert('Machine updated successfully!');
            }
        } catch (err) {
            console.error('Update machine error:', err);
            alert('Failed to update machine');
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
            await axios.delete(`http://127.0.0.1:8000/api/admin/machines/${selectedMachine.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            setShowDeleteConfirm(false);
            setSelectedMachine(null);
            fetchMachines();
            alert('Machine deleted successfully!');
        } catch (err) {
            console.error('Delete machine error:', err);
            alert('Failed to delete machine');
        }
    };

    // Toggle Maintenance Status
    const toggleMaintenance = async (machine) => {
        try {
            const token = localStorage.getItem('admin_token');
            const newStatus = machine.status === 'maintenance' ? 'available' : 'maintenance';

            const response = await axios.put(`http://127.0.0.1:8000/api/admin/machines/${machine.id}/status`, {
                status: newStatus
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                // Update local state immediately
                setMachines(prevMachines =>
                    prevMachines.map(m =>
                        m.id === machine.id ? { ...m, status: newStatus } : m
                    )
                );
                // Update selected machine if view modal is open
                if (selectedMachine && selectedMachine.id === machine.id) {
                    setSelectedMachine({ ...selectedMachine, status: newStatus });
                }
                // Update stats
                fetchMachines();
            }
        } catch (err) {
            console.error('Toggle maintenance error:', err);
            alert('Failed to update machine status');
        }
    };

    // Get status badge color
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ Sidebar - Using Reusable AdminSidebar Component */}
            <AdminSidebar expandedMenus={expandedMenus} toggleSubmenu={toggleSubmenu} />

            {/* Main Content */}
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Machines</h2>
                            <p className="text-sm text-gray-600">Manage laboratory equipment and machinery</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                                <div key={machine.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Machine Image */}
                                    <div className="w-full h-56 bg-gray-100 overflow-hidden">
                                        {machine.image ? (
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${machine.image}`}
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

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <div className="mb-3">
                                            <h3 className="text-lg font-bold text-gray-900">{machine.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{machine.type}</p>
                                        </div>

                                        <div className="mb-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(machine.status)}`}>
                                                {formatStatus(machine.status)}
                                            </span>
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => handleViewClick(machine)}
                                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Details
                                        </button>
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
            </div>

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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Type *</label>
                                <input type="text" name="type" value={formData.type} onChange={handleInputChange} required placeholder="e.g., 3D Printer, Laser Cutter, CNC" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="available">Available</option>
                                    <option value="in_use">In Use</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                                <textarea name="specifications" value={formData.specifications} onChange={handleInputChange} rows="3" placeholder="Technical specifications, capabilities, etc." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Image</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {previewImage && <img src={previewImage} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />}
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
                                <img src={`http://127.0.0.1:8000/storage/${selectedMachine.image}`} alt={selectedMachine.name} className="w-full h-64 object-cover rounded-lg" />
                            )}

                            {/* Machine Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Machine Name</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Machine Type</p>
                                    <p className="font-semibold text-gray-900">{selectedMachine.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedMachine.status)}`}>
                                        {formatStatus(selectedMachine.status)}
                                    </span>
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

                            {selectedMachine.specifications && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Specifications</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMachine.specifications}</p>
                                </div>
                            )}

                            {/* Maintenance Toggle - Inside View Modal */}
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

                        {/* Edit and Delete Buttons */}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Type *</label>
                                <input type="text" name="type" value={formData.type} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="available">Available</option>
                                    <option value="in_use">In Use</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                                <textarea name="specifications" value={formData.specifications} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Image</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {previewImage && <img src={previewImage} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />}
                            </div>

                            {/* Machine Details Section - As shown in your uploaded image */}
                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Machine Details</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Machine Name</span>
                                        <span className="text-sm font-medium text-gray-900">{formData.name || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Machine Type</span>
                                        <span className="text-sm font-medium text-gray-900">{formData.type || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(formData.status)}`}>
                                            {formatStatus(formData.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Added On</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedMachine.created_at ? new Date(selectedMachine.created_at).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                    {formData.description && (
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-500">Description</span>
                                            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{formData.description}</span>
                                        </div>
                                    )}
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
        </div>
    );
}