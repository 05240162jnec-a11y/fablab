import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Projects() {
    

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');

    // API Data States
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/projects', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            setProjects(response.data.projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
            alert('Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

   

    // Get statistics
    const totalProjects = projects.length;
    const pendingProjects = projects.filter(p => p.status === 'Pending').length;
    const completedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Approved').length;

    // Filter projects based on status
    const filteredProjects = projects.filter(project => {
        if (filterStatus === 'pending') return project.status === 'Pending';
        if (filterStatus === 'completed') return project.status === 'Completed' || project.status === 'Approved';
        return true;
    });

    // Get title based on filter
    const getSectionTitle = () => {
        if (filterStatus === 'pending') return `Pending Approval (${pendingProjects})`;
        if (filterStatus === 'completed') return `Completed Projects (${completedProjects})`;
        return `All Projects (${totalProjects})`;
    };

    // Get initials from name
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('');
    };

    // Open View Modal - CARD CLICK HANDLER
    const handleViewProject = (project, e) => {
        // Prevent opening if clicking on buttons (to avoid double triggers)
        if (e && e.target.closest('button')) {
            return;
        }
        setSelectedProject(project);
        setShowViewModal(true);
    };

    // Open Reject Modal
    const handleRejectClick = (project, e) => {
        e.stopPropagation(); // Prevent card click from triggering
        setSelectedProject(project);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    // Confirm Reject
    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        if (!selectedProject) return;

        try {
            const adminToken = localStorage.getItem('admin_token');

            await axios.post(
                `http://127.0.0.1:8000/api/admin/projects/${selectedProject.id}/reject`,
                { rejection_reason: rejectionReason },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            alert(`Project for ${selectedProject.name} has been rejected.\n\nReason: ${rejectionReason}\n\nStudent will be notified.`);
            setShowRejectModal(false);
            setSelectedProject(null);
            setRejectionReason('');
            fetchProjects(); // Refresh the list
        } catch (error) {
            console.error('Error rejecting project:', error);
            alert('Failed to reject project. Please try again.');
        }
    };

    // Approve Project
    const handleApproveProject = async (e) => {
        if (e) e.stopPropagation();

        if (!selectedProject) return;

        try {
            const adminToken = localStorage.getItem('admin_token');

            await axios.post(
                `http://127.0.0.1:8000/api/admin/projects/${selectedProject.id}/approve`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            alert('Project approved and published successfully!');
            setShowViewModal(false);
            setSelectedProject(null);
            fetchProjects(); // Refresh the list
        } catch (error) {
            console.error('Error approving project:', error);
            alert('Failed to approve project. Please try again.');
        }
    };

    // Open PDF Modal
    const handleOpenPDF = (pdfFile, e) => {
        if (e) e.stopPropagation();
        setShowPDFModal(true);
    };

    // Open Video Modal
    const handleOpenVideo = (videoFile, e) => {
        if (e) e.stopPropagation();
        setShowVideoModal(true);
    };

    // Close all modals
    const closeAllModals = () => {
        setShowViewModal(false);
        setShowRejectModal(false);
        setShowPDFModal(false);
        setShowVideoModal(false);
        setSelectedProject(null);
        setRejectionReason('');
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
                            <p className="text-sm text-gray-600">Review and manage all student projects</p>
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

                {/* Projects Content */}
                <main className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Projects */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Projects</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Projects */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Pending Projects</p>
                                    <p className="text-3xl font-bold text-gray-900">{pendingProjects}</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Projects */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Completed Projects</p>
                                    <p className="text-3xl font-bold text-gray-900">{completedProjects}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects Container */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">{getSectionTitle()}</h2>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
                                >
                                    <option value="all">All Projects ({totalProjects})</option>
                                    <option value="pending">Pending ({pendingProjects})</option>
                                    <option value="completed">Completed ({completedProjects})</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="p-6 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                <p className="mt-2 text-gray-600">Loading projects...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredProjects.length === 0 && (
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No projects found.</p>
                            </div>
                        )}

                        {/* Projects Grid - CARDS ARE NOW CLICKABLE */}
                        {!loading && filteredProjects.length > 0 && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => {
                                    const initials = getInitials(project.name);
                                    const isPending = project.status === 'Pending';

                                    return (
                                        <div
                                            key={project.id}
                                            onClick={(e) => handleViewProject(project, e)}
                                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl mb-4">
                                                    {initials}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>
                                                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-6">{project.dept}</p>

                                                {isPending ? (
                                                    <div className="flex gap-3 w-full">
                                                        <button
                                                            onClick={(e) => handleRejectClick(project, e)}
                                                            className="flex-1 py-2 border-2 border-red-200 text-red-600 bg-white rounded-lg text-sm font-semibold hover:bg-red-50 hover:border-red-400 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleApproveProject(e)}
                                                            className="flex-1 py-2 border-2 border-green-200 text-green-600 bg-white rounded-lg text-sm font-semibold hover:bg-green-50 hover:border-green-400 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-full text-center">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Published
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl flex-shrink-0">
                                    {getInitials(selectedProject.name)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedProject.name}</h4>
                                    <p className="text-sm text-blue-600 uppercase tracking-wide">{selectedProject.dept}</p>
                                    <p className="text-sm text-gray-500 mt-1">{selectedProject.proj}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h5 className="font-semibold text-gray-900 mb-2">Project Description</h5>
                                <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
                            </div>

                            <div className="mb-6">
                                <h5 className="font-semibold text-gray-900 mb-3">Documentation</h5>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={(e) => handleOpenPDF(selectedProject.pdfFile, e)}
                                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">{selectedProject.pdfFile}</p>
                                            <p className="text-xs text-gray-500">Technical Report • 2.4 MB</p>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-semibold text-gray-900 mb-3">Video Demonstration</h5>
                                <button
                                    onClick={(e) => handleOpenVideo(selectedProject.videoFile, e)}
                                    className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-lg"
                                >
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm z-10">
                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <p className="absolute bottom-3 right-4 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">03:45</p>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="px-3 py-1.5 bg-white/90 text-gray-900 text-xs font-semibold rounded-full">▶ Watch Video</span>
                                    </div>
                                </button>
                            </div>
                        </div>
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
                                    <p className="text-sm font-medium text-gray-900">Rejecting project for:</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedProject.name}</p>
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection <span className="text-red-500">*</span></label>
                            <textarea
                                rows="4"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                                placeholder="Please provide a detailed reason for rejecting this project..."
                            />
                            <p className="text-xs text-gray-500 mt-1">This reason will be sent to the student.</p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button onClick={closeAllModals} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleConfirmReject} className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                                ✕ Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PDF PREVIEW MODAL ===== */}
            {showPDFModal && selectedProject && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Project_Report.pdf</h4>
                                    <p className="text-xs text-gray-500">2.4 MB • Submitted by {selectedProject.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                                <button onClick={closeAllModals} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-6 overflow-auto">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-3xl">
                                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Previous">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">Page 1 of 8</span>
                                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Next">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Zoom Out">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                            </svg>
                                        </button>
                                        <span className="text-xs text-gray-500">100%</span>
                                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Zoom In">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v4m0-4h4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 min-h-[500px] flex flex-col items-center justify-center text-center">
                                    <div className="mb-6">
                                        <div className="w-24 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                                            <span className="text-gray-400 text-xs">PDF Page Preview</span>
                                        </div>
                                        <p className="text-sm text-gray-500">PDF renders here for admin verification</p>
                                    </div>

                                    <div className="text-left max-w-xl space-y-3">
                                        <h5 className="font-bold text-gray-900 text-lg">{selectedProject.proj} - Technical Report</h5>
                                        <p className="text-sm text-gray-600"><strong>Submitted by:</strong> {selectedProject.name}</p>
                                        <p className="text-sm text-gray-600"><strong>Department:</strong> {selectedProject.dept}</p>
                                        <p className="text-sm text-gray-600"><strong>Date:</strong> {selectedProject.date}</p>

                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {selectedProject.description.substring(0, 200)}...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== VIDEO PREVIEW MODAL ===== */}
            {showVideoModal && selectedProject && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Demo_Video.mp4</h4>
                                    <p className="text-xs text-gray-500">45.2 MB • 03:45 • Submitted by {selectedProject.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                                <button onClick={closeAllModals} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-black flex items-center justify-center p-4">
                            <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                        <p className="text-white/80 text-sm">Video player ready</p>
                                        <p className="text-white/50 text-xs mt-1">Click play to watch demonstration</p>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-3">
                                    <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                    <span className="text-white text-xs font-medium">01:15</span>
                                    <div className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative">
                                        <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                    <span className="text-white text-xs font-medium">03:45</span>
                                    <button className="p-2 text-white/80 hover:text-white transition-colors" title="Volume">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 8.464A5 5 0 005.586 15.536M2 12h2m14 0h2" />
                                        </svg>
                                    </button>
                                    <button className="p-2 text-white/80 hover:text-white transition-colors" title="Fullscreen">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}