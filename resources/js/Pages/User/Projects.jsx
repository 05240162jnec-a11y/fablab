import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { usePageHeader } from './PageHeaderContext';

export default function UserProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Bulk Selection State
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Cancel Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Modal States
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // Form State
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        document: null,
        photo: null,
        photoPreview: null,
    });

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Highlight state (from notification click)
    const location = useLocation();
    const hlParams = new URLSearchParams(location.search);
    const [highlightId, setHighlightId] = useState(hlParams.get('highlight') ? Number(hlParams.get('highlight')) : null);
    const [dismissedDot, setDismissedDot] = useState(null);

    useEffect(() => {
        if (!highlightId) return;
        const el = document.getElementById(`card-${highlightId}`);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
    }, []);

    useEffect(() => {
        const s = document.createElement('style');
        s.id = 'hl-style-proj';
        s.textContent = `
            @keyframes hlPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0)} }
            .hl-card { border:2px solid #2563eb !important; animation:hlPulse 1.2s ease-in-out infinite; }
        `;
        if (!document.getElementById('hl-style-proj')) document.head.appendChild(s);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Fetch user's projects
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('auth_token');
            const response = await axios.get('/user/projects', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                setProjects(response.data.data);
                setError(null);
            }
        } catch (err) {
            console.error('Fetch projects error:', err);
            setError('Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Calculate stats
    const stats = {
        total: projects.length,
        pending: projects.filter(p => p.status === 'pending').length,
        approved: projects.filter(p => p.status === 'approved').length,
        rejected: projects.filter(p => p.status === 'rejected').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
    };

    // Filter projects based on search term AND status
    const filteredProjects = projects.filter(project => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            project.title.toLowerCase().includes(searchLower) ||
            project.description.toLowerCase().includes(searchLower);

        const matchesFilter = filterStatus === 'all' || project.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    // Handle checkbox selection
    const handleSelectProject = (projectId) => {
        setSelectedProjects(prev => {
            if (prev.includes(projectId)) {
                return prev.filter(id => id !== projectId);
            } else {
                return [...prev, projectId];
            }
        });
    };

    // Select/Deselect all
    const handleSelectAll = () => {
        if (selectedProjects.length === filteredProjects.length) {
            setSelectedProjects([]);
        } else {
            setSelectedProjects(filteredProjects.map(p => p.id));
        }
    };

    // Open bulk delete modal
    const handleBulkDelete = () => {
        if (selectedProjects.length === 0) {
            showToast('❌ Please select at least one project', 'error');
            return;
        }
        setShowBulkDeleteModal(true);
    };

    // Confirm bulk delete
    const confirmBulkDelete = async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            await axios.post('/user/projects/bulk-delete', {
                ids: selectedProjects
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            showToast(`✅ ${selectedProjects.length} project(s) deleted successfully!`, 'success');
            setSelectedProjects([]);
            setShowBulkDeleteModal(false);
            fetchProjects();
        } catch (err) {
            console.error('Bulk delete error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to delete projects';
            showToast('❌ ' + errorMsg, 'error');
        }
    };

    // Open Cancel Modal (close View modal first)
    const handleCancelClick = (project) => {
        console.log('🔵 Cancel button clicked for project:', project);
        setSelectedProject(project);
        setShowViewModal(false); // ✅ Close View modal
        setShowCancelModal(true); // ✅ Open Cancel modal
    };

    // Confirm Cancel
    const confirmCancel = async () => {
        console.log('🟡 Confirm Cancel clicked');
        console.log('🟡 Selected project:', selectedProject);

        if (!selectedProject) {
            console.error('❌ No project selected!');
            showToast('❌ No project selected', 'error');
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token');
            console.log('🟡 Token:', token ? 'exists' : 'missing');
            console.log('🟡 Making API call to:', `/user/projects/${selectedProject.id}/cancel`);

            const response = await axios.post(`/user/projects/${selectedProject.id}/cancel`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            console.log('🟢 API response:', response.data);

            showToast('✅ Project cancelled successfully', 'success');
            setShowCancelModal(false);
            setShowViewModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (err) {
            console.error('❌ Cancel error:', err);
            console.error('❌ Error response:', err.response?.data);
            const errorMsg = err.response?.data?.message || 'Failed to cancel project';
            showToast('❌ ' + errorMsg, 'error');
        }
    };

    // Open Submit Modal
    const handleOpenSubmit = () => {
        setFormState({
            title: '',
            description: '',
            document: null,
            photo: null,
            photoPreview: null,
        });
        setShowSubmitModal(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (project) => {
        setSelectedProject(project);
        setFormState({
            title: project.title,
            description: project.description,
            document: null,
            photo: null,
            photoPreview: project.student_photo || null,
        });
        setShowEditModal(true);
    };

    // Open View Modal
    const handleOpenView = (project) => {
        setSelectedProject(project);
        setShowViewModal(true);
    };

    // ✅ Handle photo upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                showToast('❌ Only PNG and JPG images are allowed', 'error');
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                showToast('❌ Image size must be less than 2MB', 'error');
                return;
            }

            setFormState({ ...formState, photo: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, photoPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ✅ Remove photo
    const removePhoto = () => {
        setFormState({
            ...formState,
            photo: null,
            photoPreview: null,
        });
    };

    const handleSubmitProject = async (e) => {
        e.preventDefault();

        if (!formState.title || !formState.description || !formState.document) {
            showToast('❌ Please fill all fields and upload a document', 'error');
            return;
        }

        if (formState.document && formState.document.type !== 'application/pdf') {
            showToast('❌ Only PDF files are allowed for project documents', 'error');
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('description', formState.description);
            formData.append('document', formState.document);

            // ✅ ADD THIS - Append photo if exists
            if (formState.photo) {
                formData.append('photo', formState.photo);
            }

            await axios.post('/user/projects', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            setShowSubmitModal(false);
            fetchProjects();
            showToast('✅ Project submitted successfully! Awaiting admin approval.', 'success');
        } catch (err) {
            console.error('Submit error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to submit project';
            showToast('❌ ' + errorMsg, 'error');
        }
    };

    // Resubmit rejected project
    const handleResubmitProject = async (e) => {
        e.preventDefault();

        if (!formState.title || !formState.description) {
            showToast('❌ Please fill all fields', 'error');
            return;
        }

        if (formState.document && formState.document.type !== 'application/pdf') {
            showToast('❌ Only PDF files are allowed for project documents', 'error');
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('title', formState.title);
            formData.append('description', formState.description);
            formData.append('_method', 'PUT');

            if (formState.document) {
                formData.append('document', formState.document);
            }

            if (formState.photo) {
                formData.append('photo', formState.photo);
            }

            await axios.post(`/user/projects/${selectedProject.id}`, formData, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            setShowEditModal(false);
            setSelectedProject(null);
            fetchProjects();
            showToast('✅ Project resubmitted successfully!', 'success');
        } catch (err) {
            console.error('Resubmit error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to resubmit project';
            showToast('❌ ' + errorMsg, 'error');
        }
    };

    // Handle document download
    const handleDownloadDocument = async (project) => {
        try {
            const token = sessionStorage.getItem('auth_token');

            if (!token) {
                showToast('❌ No authentication token found. Please login again.', 'error');
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/user/projects/${project.id}/download`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = `project_${project.id}_document`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            } else {
                const originalPath = project.document_path;
                if (originalPath) {
                    const extension = originalPath.split('.').pop();
                    filename = `project_${project.id}_document.${extension}`;
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('✅ Document downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);

            if (error.response) {
                if (error.response.status === 401) {
                    showToast('❌ Authentication failed. Please login again.', 'error');
                } else if (error.response.status === 404) {
                    showToast('❌ File not found.', 'error');
                } else {
                    showToast('❌ Failed to download document', 'error');
                }
            } else {
                showToast('❌ Failed to download document', 'error');
            }
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Approved</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-rose-50 text-rose-700 border-rose-200">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Rejected</span>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Cancelled</span>
                    </div>
                );
            default:
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                        <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Pending</span>
                    </div>
                );
        }
    };

    // Close all modals
    const closeAllModals = () => {
        setShowSubmitModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setShowBulkDeleteModal(false);
        setShowCancelModal(false);
        setSelectedProject(null);
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">My Projects</h2>
                        <p className="text-sm text-gray-600">Submit and track your Fab Lab projects</p>
                    </div>
                    <button
                        onClick={handleOpenSubmit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Submit New Project
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            My Submissions ({filteredProjects.length})
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-80">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* NEW: Status Filter Dropdown */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="all">All Status ({stats.total})</option>
                                <option value="pending">Pending ({stats.pending})</option>
                                <option value="approved">Approved ({stats.approved})</option>
                                <option value="rejected">Rejected ({stats.rejected})</option>
                                <option value="cancelled">Cancelled ({stats.cancelled})</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedProjects.length > 0 && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedProjects.length} project(s) selected
                                </span>
                                <button
                                    onClick={() => setSelectedProjects([])}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    Clear selection
                                </button>
                            </div>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Selected
                            </button>
                        </div>
                    )}

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

                    {/* Projects Table */}
                    {!loading && !error && filteredProjects.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reviewed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProjects.map((project) => (
                                        <tr
                                            key={project.id}
                                            id={`card-${project.id}`}
                                            onClick={() => { handleOpenView(project); setHighlightId(null); }}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer relative ${highlightId === project.id ? 'hl-card' : ''}`}
                                        >
                                            {highlightId === project.id && dismissedDot !== project.id && (
                                                <div onClick={e => { e.stopPropagation(); setDismissedDot(project.id); }}
                                                    style={{ position: 'absolute', top: 12, right: 12, width: 10, height: 10, background: '#2563eb', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 2px #2563eb', cursor: 'pointer', zIndex: 10 }} />
                                            )}
                                            <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProjects.includes(project.id)}
                                                    onChange={() => handleSelectProject(project.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    {/* ✅ UPDATED: Show student photo or initials */}
                                                    {project.student_photo ? (
                                                        <img
                                                            src={project.student_photo}  // ✅ Just use the URL directly!
                                                            alt={project.title}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlVOPC90ZXh0Pjwvc3ZnPg==';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{project.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(project.status)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {formatDate(project.submitted_at || project.created_at)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {project.reviewed_at ? (
                                                    <div>
                                                        <p>{formatDate(project.reviewed_at)}</p>
                                                        {project.reviewer_name && (
                                                            <p className="text-xs text-gray-500">by {project.reviewer_name}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredProjects.length === 0 && (
                        <div className="text-center py-16">
                            {searchTerm || filterStatus !== 'all' ? (
                                <>
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                                    <p className="text-gray-500 mb-4">Try adjusting your search or filter</p>
                                    <button
                                        onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Clear Filters
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                                    <p className="text-gray-500 mb-4">Submit your first Fab Lab project to get started!</p>
                                    <button
                                        onClick={handleOpenSubmit}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Submit Your First Project
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ===== CANCEL CONFIRMATION MODAL ===== */}
            {showCancelModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Project Submission?</h3>
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to cancel <span className="font-semibold">"{selectedProject.title}"</span>?
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                This will mark your project as cancelled. You can submit a new project anytime.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Keep Project
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== BULK DELETE CONFIRMATION MODAL ===== */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete {selectedProjects.length} Project(s)?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete {selectedProjects.length} selected project(s)? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setShowBulkDeleteModal(false)}
                                    className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBulkDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SUBMIT PROJECT MODAL ===== */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Submit New Project</h3>
                                <p className="text-sm text-gray-500 mt-1">Share your Fab Lab project with the community</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitProject} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.title}
                                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                    placeholder="e.g., Solar-Powered Water Pump"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    placeholder="Describe your project, what you built, tools used, etc."
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* ✅ NEW: Photo Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Photo <span className="text-xs text-gray-500">(Optional - for public display)</span>
                                </label>

                                {!formState.photoPreview ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            id="photo-upload"
                                            accept="image/png,image/jpeg,image/jpg"
                                        />
                                        <label htmlFor="photo-upload" className="cursor-pointer block">
                                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-blue-600">Click to upload</span> your photo
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">PNG or JPG, max 2MB</p>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="relative">
                                            <img
                                                src={formState.photoPreview}
                                                alt="Preview"
                                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removePhoto}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Click X to remove photo</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Document <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file && file.type !== 'application/pdf') {
                                                showToast('❌ Only PDF files are allowed', 'error');
                                                e.target.value = '';
                                                return;
                                            }
                                            setFormState({ ...formState, document: file });
                                        }}
                                        className="hidden"
                                        id="document-upload"
                                        accept=".pdf,application/pdf"
                                    />
                                    <label htmlFor="document-upload" className="cursor-pointer">
                                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm text-gray-600">
                                            {formState.document ? (
                                                <span className="font-medium text-blue-600">{formState.document.name}</span>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-blue-600">Click to upload</span> your PDF document
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PDF only, max 10MB</p>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    ℹ️ Your project will be reviewed by the admin team. Once approved, it will be visible in the public gallery.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Submit Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== VIEW PROJECT MODAL ===== */}
            {showViewModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Project Details</h3>
                                <p className="text-sm text-gray-500 mt-1">View your project submission</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                {/* ✅ Show student photo or initials */}
                                {selectedProject.student_photo ? (
                                    <img
                                        src={selectedProject.student_photo}  // ✅ Just use the URL directly!
                                        alt={selectedProject.title}
                                        className="w-14 h-14 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlVOPC90ZXh0Pjwvc3ZnPg==';
                                        }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedProject.title}</h4>
                                    {getStatusBadge(selectedProject.status)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                                <p className="text-gray-900 whitespace-pre-wrap">{selectedProject.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Submitted</p>
                                    <p className="text-gray-900">{formatDate(selectedProject.submitted_at || selectedProject.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Reviewed</p>
                                    <p className="text-gray-900">{selectedProject.reviewed_at ? formatDate(selectedProject.reviewed_at) : 'Not yet reviewed'}</p>
                                </div>
                            </div>

                            {/* Show rejection reason if rejected */}
                            {selectedProject.status === 'rejected' && selectedProject.admin_comments && (
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-rose-800 mb-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Admin's Feedback
                                    </p>
                                    <p className="text-sm text-rose-700">{selectedProject.admin_comments}</p>
                                </div>
                            )}

                            {/* Show cancellation message if cancelled */}
                            {selectedProject.status === 'cancelled' && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        This project was cancelled
                                    </p>
                                </div>
                            )}

                            {/* Show approval message if approved */}
                            {selectedProject.status === 'approved' && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Your project is now visible in the public gallery!
                                    </p>
                                </div>
                            )}

                            {/* Download document button */}
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleDownloadDocument(selectedProject)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Document
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            {/* Cancel button for PENDING projects */}
                            {selectedProject.status === 'pending' && (
                                <button
                                    onClick={() => handleCancelClick(selectedProject)}
                                    className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel Submission
                                </button>
                            )}

                            {/* Show Edit button for PENDING and REJECTED */}
                            {(selectedProject.status === 'pending' || selectedProject.status === 'rejected') && (
                                <button
                                    onClick={() => { closeAllModals(); handleOpenEdit(selectedProject); }}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {selectedProject.status === 'pending' ? 'Edit (Pending Review)' : 'Edit & Resubmit'}
                                </button>
                            )}

                            {/* Show disabled button for APPROVED */}
                            {selectedProject.status === 'approved' && (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Approved - Cannot Edit
                                </button>
                            )}

                            {/* Show message for CANCELLED */}
                            {selectedProject.status === 'cancelled' && (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                                >
                                    Project Cancelled
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT PROJECT MODAL ===== */}
            {showEditModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Edit & Resubmit Project</h3>
                                <p className="text-sm text-gray-500 mt-1">Update your project and resubmit for review</p>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Show previous rejection reason */}
                        {selectedProject.admin_comments && (
                            <div className="mx-6 mt-6 bg-rose-50 border border-rose-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-rose-800 mb-1">Previous Rejection Reason:</p>
                                <p className="text-sm text-rose-700">{selectedProject.admin_comments}</p>
                            </div>
                        )}

                        <form onSubmit={handleResubmitProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formState.title}
                                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* ✅ NEW: Photo Upload Section (Edit) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Photo <span className="text-xs text-gray-500">(Optional - for public display)</span>
                                </label>

                                {!formState.photoPreview ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            id="photo-edit"
                                            accept="image/png,image/jpeg,image/jpg"
                                        />
                                        <label htmlFor="photo-edit" className="cursor-pointer block">
                                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-blue-600">Click to upload</span> your photo
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">PNG or JPG, max 2MB</p>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative inline-block">
                                        <img
                                            src={formState.photoPreview}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={removePhoto}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Document (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file && file.type !== 'application/pdf') {
                                                showToast('❌ Only PDF files are allowed', 'error');
                                                e.target.value = '';
                                                return;
                                            }
                                            setFormState({ ...formState, document: file });
                                        }}
                                        className="hidden"
                                        id="document-edit"
                                        accept=".pdf,application/pdf"
                                    />
                                    <label htmlFor="document-edit" className="cursor-pointer">
                                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm text-gray-600">
                                            {formState.document ? (
                                                <span className="font-medium text-blue-600">{formState.document.name}</span>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-blue-600">Click to upload new PDF</span>
                                                    <br />
                                                    <span className="text-xs text-gray-500">Leave empty to keep current document</span>
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PDF only, max 10MB</p>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeAllModals}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    Resubmit Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {toast.message}
                </div>
            )}
        </>
    );
}