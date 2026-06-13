import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Projects() {
    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showDocumentPreviewModal, setShowDocumentPreviewModal] = useState(false);
    const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [documentUrl, setDocumentUrl] = useState(null);
    const [documentInfo, setDocumentInfo] = useState(null);

    // Data States
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Bulk Selection
    const [selectedProjects, setSelectedProjects] = useState([]);

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // ✅ Production team token
    const getToken = () => localStorage.getItem('production_team_token');

    // Fetch projects
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = getToken();

            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/projects`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                console.log('📸 Projects data:', response.data.data);
                console.log('📸 First project student_photo:', response.data.data[0]?.student_photo);
                setProjects(response.data.data);
                setStats(response.data.stats);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || project.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    // Bulk Selection Handlers
    const handleSelectProject = (projectId) => {
        setSelectedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProjects.length === filteredProjects.length) {
            setSelectedProjects([]);
        } else {
            setSelectedProjects(filteredProjects.map(p => p.id));
        }
    };

    // Bulk Delete
    const handleBulkDelete = () => {
        if (selectedProjects.length === 0) {
            showToast('❌ Please select at least one project', 'error');
            return;
        }
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = async () => {
        try {
            const token = getToken();
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/projects/bulk-delete`, {
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
        } catch (error) {
            console.error('Bulk delete error:', error);
            showToast('❌ Failed to delete projects', 'error');
        }
    };

    // Open View Modal
    const handleViewProject = (project) => {
        setSelectedProject(project);
        setShowViewModal(true);
    };

    // Open Reject Modal
    const handleRejectClick = (project, e) => {
        if (e) e.stopPropagation();
        setSelectedProject(project);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    // ✅ NEW: Open student photo preview
    const openStudentPhotoPreview = () => {
        if (selectedProject?.student_photo) {
            setShowImagePreviewModal(true);
        }
    };

    // ✅ UPDATED: Open Document Preview (Smart Preview)
    const handlePreviewDocument = async (project) => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/projects/${project.id}/preview`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setDocumentInfo(response.data);
                setShowDocumentPreviewModal(true);
            }
        } catch (error) {
            console.error('Preview error:', error);
            showToast('❌ Failed to load document preview', 'error');
        }
    };

    // Download Document
    const handleDownloadDocument = async (project) => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/projects/${project.id}/download`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
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
                    filename = `${project.title.replace(/\s+/g, '_')}.${extension}`;
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
            showToast('❌ Failed to download document', 'error');
        }
    };

    // Confirm Reject
    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            showToast('❌ Please provide a reason for rejection', 'error');
            return;
        }

        try {
            const token = getToken();
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/projects/${selectedProject.id}/reject`,
                { reason: rejectionReason },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            showToast('✅ Project rejected. Student has been notified.', 'success');
            setShowRejectModal(false);
            setShowViewModal(false);
            setSelectedProject(null);
            setRejectionReason('');
            fetchProjects();
        } catch (error) {
            console.error('Error rejecting project:', error);
            showToast('❌ Failed to reject project', 'error');
        }
    };

    // Approve Project
    const handleApproveProject = async () => {
        try {
            const token = getToken();
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/projects/${selectedProject.id}/approve`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            showToast('✅ Project approved and published!', 'success');
            setShowViewModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            console.error('Error approving project:', error);
            showToast('❌ Failed to approve project', 'error');
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

    // ✅ NEW: Get file extension
    const getFileExtension = (path) => {
        if (!path) return 'file';
        return path.split('.').pop().toLowerCase();
    };

    // ✅ NEW: Get file icon based on extension (Google Drive style)
    const getFileIcon = (path) => {
        const ext = getFileExtension(path);
        switch (ext) {
            case 'pdf':
                return { color: 'text-red-600', bg: 'bg-red-50', label: 'PDF' };
            case 'doc':
            case 'docx':
                return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'DOC' };
            case 'xls':
            case 'xlsx':
                return { color: 'text-green-600', bg: 'bg-green-50', label: 'XLS' };
            case 'ppt':
            case 'pptx':
                return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'PPT' };
            case 'txt':
                return { color: 'text-gray-600', bg: 'bg-gray-50', label: 'TXT' };
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return { color: 'text-purple-600', bg: 'bg-purple-50', label: 'IMG' };
            case 'zip':
            case 'rar':
                return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'ZIP' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-50', label: ext.toUpperCase().substring(0, 3) };
        }
    };

    // ✅ UPDATED: Close only preview modal (keep view modal open)
    const closePreviewModal = () => {
        setShowDocumentPreviewModal(false);
        setDocumentInfo(null);
    };

    // Close all modals
    const closeAllModals = () => {
        setShowViewModal(false);
        setShowRejectModal(false);
        setShowBulkDeleteModal(false);
        setShowDocumentPreviewModal(false);
        setShowImagePreviewModal(false);
        setSelectedProject(null);
        setRejectionReason('');
        if (documentUrl) {
            window.URL.revokeObjectURL(documentUrl);
            setDocumentUrl(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Project Management</h2>
                            <p className="text-sm text-gray-600">Review and approve student project submissions</p>
                        </div>
                    </div>
                </header>

                {/* Projects Content */}
                <main className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Total Projects */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Projects</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pending */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        {/* Approved */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Approved</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rejected */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Rejected</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects Table Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                All Submissions ({filteredProjects.length})
                            </h3>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by title, description, or student..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
                                    />
                                </div>

                                {/* Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="all">All Status ({stats.total})</option>
                                    <option value="pending">Pending ({stats.pending})</option>
                                    <option value="approved">Approved ({stats.approved})</option>
                                    <option value="rejected">Rejected ({stats.rejected})</option>
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
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted By</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reviewer</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reviewed Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredProjects.map((project) => (
                                            <tr
                                                key={project.id}
                                                onClick={() => handleViewProject(project)}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
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
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{project.title}</p>
                                                            <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {/* ✅ UPDATED: Show student photo or initials */}
                                                        {project.student_photo ? (
                                                            <img
                                                                src={project.student_photo}
                                                                alt={project.user?.name || 'Student'}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-xs">
                                                                {getInitials(project.user?.name)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{project.user?.name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-500">{project.user?.email || ''}</p>
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
                                                    {project.reviewer ? (
                                                        <div>
                                                            <p className="font-medium text-gray-900">{project.reviewer.name}</p>
                                                            <p className="text-xs text-gray-500">{project.reviewer.email}</p>
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {project.reviewed_at ? formatDate(project.reviewed_at) : '—'}
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
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {searchTerm || filterStatus !== 'all' ? 'No projects found' : 'No projects yet'}
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm || filterStatus !== 'all'
                                        ? 'Try adjusting your search or filter'
                                        : 'Projects will appear here when students submit them'}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ===== VIEW PROJECT DETAILS MODAL ===== */}
            {showViewModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="text-lg font-bold text-gray-900">Project Details</h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Header with student info */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                {/* ✅ UPDATED: Show student photo or initials - CLICKABLE */}
                                {selectedProject.student_photo ? (
                                    <img
                                        src={selectedProject.student_photo}
                                        alt={selectedProject.user?.name || 'Student'}
                                        onClick={openStudentPhotoPreview}
                                        className="w-16 h-16 rounded-full object-cover cursor-pointer hover:shadow-lg transition-shadow"
                                    />
                                ) : (
                                    <div
                                        onClick={openStudentPhotoPreview}
                                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                                    >
                                        {getInitials(selectedProject.user?.name)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-900">{selectedProject.title}</h4>
                                    <p className="text-sm text-gray-600">
                                        Submitted by <span className="font-semibold">{selectedProject.user?.name}</span> ({selectedProject.user?.email})
                                    </p>
                                    <div className="mt-2">
                                        {getStatusBadge(selectedProject.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                            </div>

                            {/* ✅ UPDATED: Google Drive-style Document Card */}
                            <div className="mb-6">
                                <h5 className="font-semibold text-gray-900 mb-3">Project Document</h5>
                                <button
                                    onClick={() => handlePreviewDocument(selectedProject)}
                                    className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group cursor-pointer"
                                >
                                    {/* File Icon based on type */}
                                    {(() => {
                                        const fileInfo = getFileIcon(selectedProject.document_path);
                                        return (
                                            <div className={`flex-shrink-0 w-12 h-12 ${fileInfo.bg} rounded flex items-center justify-center`}>
                                                <span className={`text-xs font-bold ${fileInfo.color}`}>{fileInfo.label}</span>
                                            </div>
                                        );
                                    })()}

                                    {/* Filename */}
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                                            {selectedProject.document_path?.split('/').pop() || 'Project Document'}
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* Rejection reason if rejected */}
                            {selectedProject.status === 'rejected' && selectedProject.admin_comments && (
                                <div className="mb-6 bg-rose-50 border border-rose-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-rose-800 mb-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Rejection Reason
                                    </p>
                                    <p className="text-sm text-rose-700">{selectedProject.admin_comments}</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Submitted</p>
                                    <p className="text-gray-900">{formatDate(selectedProject.submitted_at || selectedProject.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Reviewed</p>
                                    <p className="text-gray-900">
                                        {selectedProject.reviewed_at ? formatDate(selectedProject.reviewed_at) : 'Not yet reviewed'}
                                    </p>
                                    {selectedProject.reviewer?.name && (
                                        <p className="text-xs text-gray-500">by {selectedProject.reviewer.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>

                            {selectedProject.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleRejectClick(selectedProject)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Reject
                                    </button>
                                    <button
                                        onClick={handleApproveProject}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Approve
                                    </button>
                                </>
                            )}

                            {selectedProject.status === 'rejected' && (
                                <button
                                    onClick={handleApproveProject}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Approve Now
                                </button>
                            )}

                            {selectedProject.status === 'approved' && (
                                <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Approved & Published
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: Student Photo Preview Modal */}
            {showImagePreviewModal && selectedProject?.student_photo && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                    onClick={() => setShowImagePreviewModal(false)}
                >
                    <div className="relative max-w-2xl max-h-[90vh]">
                        <img
                            src={selectedProject.student_photo}
                            alt={selectedProject.user?.name || 'Student'}
                            className="max-w-full max-h-[90vh] rounded-lg object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setShowImagePreviewModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                            {selectedProject.user?.name || 'Student'}
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ UPDATED: SMART DOCUMENT PREVIEW MODAL */}
            {showDocumentPreviewModal && documentInfo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-0" onClick={closePreviewModal}>
                    <div className="bg-white w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
                                <p className="text-sm text-gray-500">{documentInfo.file_name} ({documentInfo.file_size} MB)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Download Button */}
                                <button
                                    onClick={() => handleDownloadDocument(selectedProject)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                                {/* Close Button */}
                                <button
                                    onClick={closePreviewModal}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 bg-gray-100 overflow-auto relative">
                            {/* PDF Preview */}
                            {documentInfo.file_type === 'pdf' && (
                                <iframe
                                    src={documentInfo.file_path}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                    style={{ border: 'none' }}
                                />
                            )}

                            {/* Image Preview */}
                            {['jpg', 'jpeg', 'png', 'gif'].includes(documentInfo.file_type) && (
                                <div className="flex items-center justify-center h-full p-8">
                                    <img
                                        src={documentInfo.file_path}
                                        alt={documentInfo.file_name}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    />
                                </div>
                            )}

                            {/* Text File Preview */}
                            {documentInfo.file_type === 'txt' && (
                                <div className="max-w-4xl mx-auto p-8">
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                                            {documentInfo.content || 'No content available'}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Non-previewable Files (Office documents) */}
                            {!documentInfo.previewable && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center max-w-md p-8">
                                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Not Available</h3>
                                        <p className="text-gray-600 mb-6">
                                            This file type (.{documentInfo.file_type.toUpperCase()}) cannot be previewed in the browser. Please download to view.
                                        </p>
                                        <button
                                            onClick={() => handleDownloadDocument(selectedProject)}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                        >
                                            Download File
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={closePreviewModal}
                            className="absolute top-4 left-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:shadow-xl group z-10"
                            title="Back to Project Details"
                        >
                            <svg className="w-5 h-5 text-gray-700 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ===== REJECT WITH REASON MODAL ===== */}
            {showRejectModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Reject Project</h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Rejecting project:</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedProject.title}</p>
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows="4"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                                placeholder="Please provide a detailed reason for rejecting this project..."
                            />
                            <p className="text-xs text-gray-500 mt-1">This reason will be emailed to the student.</p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button onClick={closeAllModals} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleConfirmReject} className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                                ✕ Confirm Reject
                            </button>
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
                                Are you sure you want to delete {selectedProjects.length} selected project(s)? This action can be undone by restoring from trash.
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

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}