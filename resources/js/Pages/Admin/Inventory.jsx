import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Inventory() {
    const [expandedMenus, setExpandedMenus] = useState({
        userManagement: false,
        operations: false,
        resources: true,
        contentMedia: false,
    });

    const [activeTab, setActiveTab] = useState('received');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);

    const [addForm, setAddForm] = useState({
        itemName: '',
        itemDesc: '',
        itemQty: '',
        itemRate: '',
        itemDate: new Date().toISOString().split('T')[0],
    });

    const [issueForm, setIssueForm] = useState({
        itemName: '',
        issueQty: '',
        issueDate: new Date().toISOString().split('T')[0],
        issueReason: '',
    });

    const [showDropdown, setShowDropdown] = useState({ add: false, issue: false });
    const [dropdownSearch, setDropdownSearch] = useState({ add: '', issue: '' });

    const [materials, setMaterials] = useState([]);
    const [receivedRecords, setReceivedRecords] = useState([]);
    const [issuedRecords, setIssuedRecords] = useState([]);
    const [stockData, setStockData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dropdownRef = useRef(null);

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Fetch inventory data from API
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');

            const response = await axios.get('http://127.0.0.1:8000/api/admin/inventory', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                const data = response.data.data;

                // Set materials list
                setMaterials(data.materials.map(m => m.name));

                // Set received records
                setReceivedRecords(data.received.map((record, index) => ({
                    id: record.id,
                    slNo: index + 1,
                    name: record.material.name,
                    desc: record.material.description || '',
                    qty: record.quantity,
                    rate: parseFloat(record.rate),
                    date: record.transaction_date,
                    total: record.quantity * parseFloat(record.rate),
                })));

                // Set issued records
                setIssuedRecords(data.issued.map((record, index) => ({
                    id: record.id,
                    slNo: index + 1,
                    name: record.material.name,
                    qty: record.quantity,
                    date: record.transaction_date,
                    reason: record.reason || '',
                })));

                // Set stock data
                setStockData(data.materials.map((material, index) => ({
                    slNo: index + 1,
                    name: material.name,
                    prevStock: material.quantity - material.received + material.issued,
                    received: material.received,
                    newStock: material.quantity,
                })));

                setError(null);
            }
        } catch (err) {
            console.error('Fetch inventory error:', err);
            setError('Failed to load inventory data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setAddForm(prev => ({ ...prev, itemDate: today }));
        setIssueForm(prev => ({ ...prev, issueDate: today }));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown({ add: false, issue: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMaterials = (searchTerm) => {
        const search = searchTerm.toLowerCase();
        return materials.filter(m => m.toLowerCase().includes(search));
    };

    const selectMaterial = (material, type) => {
        if (type === 'add') {
            setAddForm(prev => ({ ...prev, itemName: material }));
            setShowDropdown(prev => ({ ...prev, add: false }));
        } else {
            setIssueForm(prev => ({ ...prev, itemName: material }));
            setShowDropdown(prev => ({ ...prev, issue: false }));
        }
    };

    const calculateTotal = () => {
        const qty = parseFloat(addForm.itemQty) || 0;
        const rate = parseFloat(addForm.itemRate) || 0;
        return (qty * rate).toFixed(2);
    };

    const addToTable = async (e) => {
        e.preventDefault();
        const { itemName, itemDesc, itemQty, itemRate, itemDate } = addForm;
        if (!itemName || !itemQty || !itemRate) {
            alert('Please fill in Item Name, Quantity, and Rate.');
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://127.0.0.1:8000/api/admin/inventory/received', {
                name: itemName,
                description: itemDesc,
                quantity: parseInt(itemQty),
                rate: parseFloat(itemRate),
                transaction_date: itemDate,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchInventory();
            setAddForm({
                itemName: '',
                itemDesc: '',
                itemQty: '',
                itemRate: '',
                itemDate: new Date().toISOString().split('T')[0],
            });
            setShowAddModal(false);
            alert('✅ Material received successfully!');
        } catch (err) {
            console.error('Add received error:', err);
            if (err.response?.data?.message) {
                alert(`❌ ${err.response.data.message}`);
            } else {
                alert('❌ Failed to add received record');
            }
        }
    };

    const issueMaterial = async (e) => {
        e.preventDefault();
        const { itemName, issueQty, issueDate, issueReason } = issueForm;
        if (!itemName || !issueQty) {
            alert('Please fill in Item Name and Quantity.');
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://127.0.0.1:8000/api/admin/inventory/issued', {
                name: itemName,
                quantity: parseInt(issueQty),
                transaction_date: issueDate,
                reason: issueReason,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchInventory();
            setIssueForm({
                itemName: '',
                issueQty: '',
                issueDate: new Date().toISOString().split('T')[0],
                issueReason: '',
            });
            setShowIssueModal(false);
            alert('✅ Material issued successfully!');
        } catch (err) {
            console.error('Issue material error:', err);
            if (err.response?.data?.message) {
                alert(`❌ ${err.response.data.message}`);
            } else {
                alert('❌ Failed to issue material');
            }
        }
    };

    const deleteRecord = async (id, qty, name) => {
        if (!confirm('Delete this record? This will also reduce stock.')) return;

        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://127.0.0.1:8000/api/admin/inventory/received/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchInventory();
            alert('✅ Received record deleted successfully!');
        } catch (err) {
            console.error('Delete received error:', err);
            alert('❌ Failed to delete received record');
        }
    };

    const deleteIssuedRecord = async (id) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://127.0.0.1:8000/api/admin/inventory/issued/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            fetchInventory();
            alert('✅ Issued record deleted successfully!');
        } catch (err) {
            console.error('Delete issued error:', err);
            alert('❌ Failed to delete issued record');
        }
    };

    const toggleAddModal = () => {
        setShowAddModal(!showAddModal);
        if (!showAddModal) {
            setAddForm(prev => ({ ...prev, itemDate: new Date().toISOString().split('T')[0] }));
        }
    };

    const toggleIssueModal = () => {
        setShowIssueModal(!showIssueModal);
        if (!showIssueModal) {
            setIssueForm(prev => ({ ...prev, issueDate: new Date().toISOString().split('T')[0] }));
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar — matches Dashboard exactly */}
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

                    {/* Resources — active */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('resources')}
                            className="flex items-center justify-between w-full px-4 py-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-medium"
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
                                <Link to="/admin/inventory" className="block px-4 py-2 text-white bg-blue-600/30 rounded-lg text-sm font-medium">Inventory</Link>
                                <Link to="/admin/projects" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">Projects</Link>
                            </div>
                        )}
                    </div>

                    {/* Content & Media */}
                    <div>
                        <button
                            onClick={() => toggleSubmenu('contentMedia')}
                            className="flex items-center justify-between w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
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
                                <Link to="/admin/faq" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm transition-all">FAQ</Link>
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

            {/* Main Content - WITH STATIC HEADER LIKE DASHBOARD */}
            <div className="flex-1">
                {/* Top Header - EXACTLY LIKE DASHBOARD */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
                            <p className="text-sm text-gray-600">Manage your materials and stock levels</p>
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

                {/* Inventory Content */}
                <main className="p-6 space-y-6">

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    {!loading && !error && (
                        <div className="border-b border-slate-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('received')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'received'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    Received Materials
                                </button>
                                <button
                                    onClick={() => setActiveTab('issued')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'issued'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    Issued Materials
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Received Materials Tab */}
                    {!loading && !error && activeTab === 'received' && (
                        <>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Received Records</h2>
                                        <p className="text-sm text-slate-500 mt-1">Material receiving history</p>
                                    </div>
                                    <button
                                        onClick={toggleAddModal}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Received
                                    </button>
                                </div>

                                {receivedRecords.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-5">
                                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-600 font-semibold text-lg">No received records yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sl.No</th>
                                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>
                                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                                                    <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                                                    <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Rate (Nu.)</th>
                                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                                    <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Total (Nu.)</th>
                                                    <th className="px-8 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {receivedRecords.map((record) => (
                                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-8 py-5 text-sm text-slate-600">{record.slNo}</td>
                                                        <td className="px-8 py-5 text-sm font-semibold text-slate-900">{record.name}</td>
                                                        <td className="px-8 py-5 text-sm text-slate-600">{record.desc || '-'}</td>
                                                        <td className="px-8 py-5 text-sm font-semibold text-slate-900 text-right">{record.qty}</td>
                                                        <td className="px-8 py-5 text-sm text-slate-600 text-right">Nu. {record.rate.toFixed(2)}</td>
                                                        <td className="px-8 py-5 text-sm text-slate-600">{record.date}</td>
                                                        <td className="px-8 py-5 text-sm font-bold text-slate-900 text-right">Nu. {record.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-8 py-5 text-center">
                                                            <button
                                                                onClick={() => deleteRecord(record.id, record.qty, record.name)}
                                                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Stock Update Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                                <div className="px-8 py-6 border-b border-slate-100">
                                    <h2 className="text-xl font-bold text-slate-900">Stock Update</h2>
                                    <p className="text-sm text-slate-500 mt-1">Current inventory status (highlighted if &lt; 10)</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sl.No</th>
                                                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Material Name</th>
                                                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Previous Stock</th>
                                                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Received</th>
                                                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">New Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stockData.map((stock, index) => (
                                                <tr
                                                    key={index}
                                                    className={`transition-colors ${stock.newStock < 10
                                                        ? 'bg-red-200 border-l-4 border-red-500'
                                                        : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <td className="px-8 py-5 text-sm text-slate-600">{stock.slNo}</td>
                                                    <td className="px-8 py-5 text-sm font-semibold text-slate-900">{stock.name}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-600 text-right">{stock.prevStock} units</td>
                                                    <td className={`px-8 py-5 text-sm font-semibold text-right ${stock.received > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                                        {stock.received > 0 ? `+${stock.received}` : stock.received} units
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-900 text-right">{stock.newStock} units</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Issued Materials Tab */}
                    {!loading && !error && activeTab === 'issued' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Issued Records</h2>
                                    <p className="text-sm text-slate-500 mt-1">Material issuance history</p>
                                </div>
                                <button
                                    onClick={toggleIssueModal}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Issue Material
                                </button>
                            </div>

                            {issuedRecords.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-5">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600 font-semibold text-lg">No issued records yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sl.No</th>
                                                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>
                                                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty Issued</th>
                                                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Issued To / Reason</th>
                                                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                                <th className="px-8 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {issuedRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-5 text-sm text-slate-600">{record.slNo}</td>
                                                    <td className="px-8 py-5 text-sm font-semibold text-slate-900">{record.name}</td>
                                                    <td className="px-8 py-5 text-sm font-semibold text-red-600 text-right">-{record.qty}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-600">{record.reason || '-'}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-600">{record.date}</td>
                                                    <td className="px-8 py-5 text-center">
                                                        <button
                                                            onClick={() => deleteIssuedRecord(record.id)}
                                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Add Received Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleAddModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl z-10 border border-slate-200">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-bold text-slate-900">Add Received Record</h3>
                            <button onClick={toggleAddModal} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={addToTable} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Name with Dropdown */}
                            <div className="md:col-span-2 relative" ref={dropdownRef}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={addForm.itemName}
                                        onChange={(e) => {
                                            setAddForm(prev => ({ ...prev, itemName: e.target.value }));
                                            setDropdownSearch(prev => ({ ...prev, add: e.target.value }));
                                            setShowDropdown(prev => ({ ...prev, add: true }));
                                        }}
                                        onFocus={() => setShowDropdown(prev => ({ ...prev, add: true }))}
                                        placeholder="Type to search existing or add new material..."
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white pr-12 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(prev => ({ ...prev, add: !prev.add }))}
                                        className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                {showDropdown.add && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-hidden flex flex-col">
                                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                                            <input
                                                type="text"
                                                value={dropdownSearch.add}
                                                onChange={(e) => setDropdownSearch(prev => ({ ...prev, add: e.target.value }))}
                                                placeholder="Search materials..."
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="overflow-y-auto flex-1">
                                            {filteredMaterials(dropdownSearch.add).map((material, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => selectMaterial(material, 'add')}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    {material}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
                                            Select from list or keep typing to add a new item
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={addForm.itemDesc}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, itemDesc: e.target.value }))}
                                    placeholder="e.g., 4x8ft sheet, White color"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Qty & Rate */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Qty <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={addForm.itemQty}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, itemQty: e.target.value }))}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Rate (Nu.) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={addForm.itemRate}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, itemRate: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Date */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={addForm.itemDate}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, itemDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Total */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-lg">
                                    Nu. {calculateTotal()}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={toggleAddModal}
                                    className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Issue Material Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleIssueModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl z-10 border border-slate-200">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-bold text-slate-900">Issue Material</h3>
                            <button onClick={toggleIssueModal} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={issueMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Name with Dropdown */}
                            <div className="md:col-span-2 relative" ref={dropdownRef}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={issueForm.itemName}
                                        onChange={(e) => {
                                            setIssueForm(prev => ({ ...prev, itemName: e.target.value }));
                                            setDropdownSearch(prev => ({ ...prev, issue: e.target.value }));
                                            setShowDropdown(prev => ({ ...prev, issue: true }));
                                        }}
                                        onFocus={() => setShowDropdown(prev => ({ ...prev, issue: true }))}
                                        placeholder="Select material to issue..."
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white pr-12 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(prev => ({ ...prev, issue: !prev.issue }))}
                                        className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                {showDropdown.issue && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-hidden flex flex-col">
                                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                                            <input
                                                type="text"
                                                value={dropdownSearch.issue}
                                                onChange={(e) => setDropdownSearch(prev => ({ ...prev, issue: e.target.value }))}
                                                placeholder="Search materials..."
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="overflow-y-auto flex-1">
                                            {filteredMaterials(dropdownSearch.issue).map((material, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => selectMaterial(material, 'issue')}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    {material}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Qty & Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Qty to Issue <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={issueForm.issueQty}
                                    onChange={(e) => setIssueForm(prev => ({ ...prev, issueQty: e.target.value }))}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={issueForm.issueDate}
                                    onChange={(e) => setIssueForm(prev => ({ ...prev, issueDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Reason */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Issued To / Reason</label>
                                <input
                                    type="text"
                                    value={issueForm.issueReason}
                                    onChange={(e) => setIssueForm(prev => ({ ...prev, issueReason: e.target.value }))}
                                    placeholder="e.g., Project X, Student Name"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={toggleIssueModal}
                                    className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Issue Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}