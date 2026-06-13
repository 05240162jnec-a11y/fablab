import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Materials loaded dynamically from API
const INITIAL_MATERIALS = [];

const EMPTY_ADD_FORM = {
    itemName: '',
    itemDesc: '',
    itemQty: '',
    itemRate: '',
    itemDate: new Date().toISOString().split('T')[0],
};

const EMPTY_ISSUE_FORM = {
    itemName: '',
    issueQty: '',
    issueDate: new Date().toISOString().split('T')[0],
    issuedTo: '',
    issuedToDepartment: '',
    issuedToEmail: '',
    issueReason: '',
    issuedBy: '',
};

/* ─────────────────────────────────────────────
   Searchable Dropdown (reusable)
───────────────────────────────────────────── */
function SearchableDropdown({ value, onChange, options, placeholder, allowNew = false }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapRef = useRef(null);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const select = (item) => {
        onChange(item);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={wrapRef}>
            <div className="relative">
                <input
                    type="text"
                    value={open ? search : value}
                    onChange={e => {
                        setSearch(e.target.value);
                        if (allowNew) {
                            onChange(e.target.value);
                        }
                        setOpen(true);
                    }}
                    onFocus={() => {
                        setSearch(value);
                        setOpen(true);
                    }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white pr-12 transition-all"
                />
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="absolute right-4 top-3 text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search..."
                            autoFocus
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filtered.length === 0 && !allowNew && (
                            <p className="px-4 py-3 text-sm text-slate-400">No results</p>
                        )}
                        {filtered.map((item, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseDown={() => select(item)}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    {allowNew && (
                        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500 flex-shrink-0">
                            Select from list or keep typing to add a new item
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   ✅ UPDATED: Custom Dialog/Modal Component (Matches Admin)
───────────────────────────────────────────── */
function CustomDialog({ title, message, type = 'info', onConfirm, onCancel, visible, isConfirmation = false }) {
    if (!visible) return null;

    const isConfirmAction = type === 'warning' && typeof onConfirm === 'function';

    const icons = {
        info: (
            <svg className="w-14 h-14 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-14 h-14 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        error: (
            <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isConfirmAction ? onCancel : (onConfirm || onCancel)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
                style={{ animation: 'dialogIn .2s cubic-bezier(.16,1,.3,1) both' }}>
                <style>{`@keyframes dialogIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
                <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
                    <div className="mb-5">{icons[type]}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                </div>
                <div className="px-8 pb-8 flex gap-3">
                    {isConfirmAction ? (
                        <>
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onConfirm || onCancel}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Toast
───────────────────────────────────────────── */
function Toast({ message, visible }) {
    return (
        <div
            className={`fixed bottom-6 right-6 z-[200] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                }`}
        >
            {message}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Delete icon button
───────────────────────────────────────────── */
function DeleteBtn({ onClick, disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-lg transition-all ${disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                }`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
}

/* ────────────────────────────────────────────
   Format Date Helper
───────────────────────────────────────────── */
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/* ─────────────────────────────────────────────
   Export to CSV Helper
───────────────────────────────────────────── */
const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(field => {
            const value = row[field];
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/* ─────────────────────────────────────────────
   Format Role Helper
───────────────────────────────────────────── */
const formatRole = (role) => {
    if (!role) return '-';
    if (role === 'admin') return 'Admin';
    if (role === 'production' || role === 'production_team') return 'Production Team member';
    if (role === 'staff') return 'Staff';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function ProductionTeamInventory() {
    const [activeTab, setActiveTab] = useState('materials');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);

    const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
    const [issueForm, setIssueForm] = useState(EMPTY_ISSUE_FORM);
    const [materialForm, setMaterialForm] = useState({ name: '' });

    const [materials, setMaterials] = useState([]);
    const [receivedRecords, setReceivedRecords] = useState([]);
    const [issuedRecords, setIssuedRecords] = useState([]);
    const [stockData, setStockData] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);
    const [searchMaterials, setSearchMaterials] = useState('');
    const [searchReceived, setSearchReceived] = useState('');
    const [searchStock, setSearchStock] = useState('');
    const [searchIssued, setSearchIssued] = useState('');
    const [stockThreshold, setStockThreshold] = useState(10);
    const [thresholdLoading, setThresholdLoading] = useState(false);
    const [thresholdError, setThresholdError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [usersByDepartment, setUsersByDepartment] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [issueType, setIssueType] = useState('user');
    const [productionTeamMembers, setProductionTeamMembers] = useState([]);

    const [selectedReceived, setSelectedReceived] = useState(new Set());
    const [selectedIssued, setSelectedIssued] = useState(new Set());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialog, setDialog] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

    const [toast, setToast] = useState({ visible: false, message: '' });
    const toastTimer = useRef(null);

    const showToast = (msg) => {
        setToast({ visible: true, message: msg });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    };

    const showDialog = (title, message, type = 'info', onConfirm = null) => {
        setDialog({
            visible: true,
            title,
            message,
            type,
            onConfirm,
            isConfirmation: onConfirm !== null,
        });
    };

    const closeDialog = () => {
        setDialog({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
    };

    // ✅ UPDATED: Use production_team_token
    const getToken = () => localStorage.getItem('production_team_token');

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = getToken();
            // ✅ Using admin inventory endpoints (shared inventory)
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                const data = response.data.data;

                const fetchedMaterialNames = data.materials.map(m => m.name);
                setMaterials(fetchedMaterialNames.sort((a, b) => a.localeCompare(b)));

                setReceivedRecords(data.received.map((record, index) => ({
                    id: record.id,
                    slNo: index + 1,
                    name: record.material.name,
                    desc: record.material.description || '',
                    qty: record.quantity,
                    rate: parseFloat(record.rate),
                    date: record.transaction_date,
                    receivedBy: record.received_by || '',
                    receivedByRole: record.received_by_role || '',
                    total: record.quantity * parseFloat(record.rate),
                })));

                setIssuedRecords(data.issued.map((record, index) => ({
                    id: record.id,
                    slNo: index + 1,
                    name: record.material.name,
                    qty: record.quantity,
                    date: record.transaction_date,
                    issuedTo: record.issued_to || '',
                    issuedToEmail: record.issued_to_email || '',
                    issuedToDepartment: record.issued_to_department || '',
                    reason: record.reason || '',
                    issuedBy: record.issued_by || '',
                })));

                const sortedStock = [...data.materials].sort((a, b) => {
                    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                    return dateB - dateA;
                }).map((material, index) => ({
                    slNo: index + 1,
                    name: material.name,
                    currentStock: material.quantity,
                    updated_at: material.updated_at,
                }));

                setStockData(sortedStock);

                if (data.threshold !== undefined) {
                    setStockThreshold(data.threshold);
                }

                setError(null);
            }
        } catch (err) {
            console.error('Fetch inventory error:', err);
            setError('Failed to load inventory data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/production-team/profile`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });

            let userData = null;

            if (response.data?.data) {
                userData = response.data.data;
            } else if (response.data?.user) {
                userData = response.data.user;
            } else if (response.data) {
                userData = response.data;
            }

            if (userData) {
                setCurrentUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                throw new Error('No user data in response');
            }
        } catch (err) {
            console.error('Failed to fetch current user:', err);

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setCurrentUser(parsed);
            } else {
                showDialog('Error', 'Unable to load user profile. Please refresh the page.', 'error');
            }
        }
    };

    const fetchStockThreshold = async () => {
        try {
            setThresholdLoading(true);
            const token = getToken();
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/threshold`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setStockThreshold(response.data.data.threshold);
            }
        } catch (err) {
            console.error('Failed to fetch threshold:', err);
            setThresholdError('Failed to load threshold. Using default.');
        } finally {
            setThresholdLoading(false);
        }
    };

    const fetchDepartmentsAndUsers = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/departments-users`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setDepartments(response.data.data.departments);
                setAllUsers(response.data.data.users);
            }
        } catch (err) {
            console.error('Failed to fetch departments and users:', err);
        }
    };

    const fetchProductionTeamMembers = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/departments-users`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                const productionMembers = response.data.data.users
                    .filter(user => user.role === 'production' || user.role === 'production_team')
                    .map(user => ({
                        id: user.id,
                        name: user.name + ' (Production Team member)',
                        email: user.email,
                        display: `${user.name} - ${user.email}`,
                    }));

                setProductionTeamMembers(productionMembers);
            }
        } catch (err) {
            console.error('Failed to fetch production team:', err);
        }
    };

    const handleDepartmentChange = (department) => {
        setIssueForm(p => ({ ...p, issuedToDepartment: department, issuedTo: '', issuedToEmail: '' }));

        if (department) {
            const filteredUsers = allUsers.filter(u => u.department === department);
            setUsersByDepartment(filteredUsers);
        } else {
            setUsersByDepartment([]);
        }
    };

    const handleUserSelect = (userDisplay) => {
        let user = usersByDepartment.find(u => u.display === userDisplay);

        if (!user) {
            user = allUsers.find(u => u.display === userDisplay);
        }

        if (user) {
            setIssueForm(p => ({
                ...p,
                issuedTo: user.name,
                issuedToEmail: user.email,
                issuedToDepartment: user.department,
            }));
        }
    };

    const handleProductionTeamSelect = (memberDisplay) => {
        const parts = memberDisplay.split(' - ');
        const name = parts[0];
        const email = parts[1] || '';

        setIssueForm(p => ({
            ...p,
            issuedTo: name,
            issuedToEmail: email,
            issuedToDepartment: 'Production Team',
        }));
    };

    const handleIssueTypeChange = (type) => {
        setIssueType(type);
        setIssueForm(p => ({
            ...p,
            issuedTo: '',
            issuedToEmail: '',
            issuedToDepartment: '',
        }));
    };

    const updateStockThreshold = async (newThreshold) => {
        try {
            setThresholdLoading(true);
            const token = getToken();
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/threshold`, {
                threshold: newThreshold,
            }, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            setStockThreshold(newThreshold);
            showToast('✅ Stock alert threshold updated!');
        } catch (err) {
            console.error('Failed to update threshold:', err);
            setThresholdError('Failed to update threshold.');
            showDialog('Error', 'Failed to save threshold. Please try again.', 'error');
        } finally {
            setThresholdLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchCurrentUser();
        fetchStockThreshold();
        fetchDepartmentsAndUsers();
        fetchProductionTeamMembers();
    }, []);

    const getLocalStock = (name) => {
        const entry = stockData.find(s => s.name.toLowerCase() === name.toLowerCase());
        return entry ? entry.currentStock : 0;
    };

    const updateLocalStock = (name, delta) => {
        setStockData(prev => {
            const exists = prev.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                return prev.map(s =>
                    s.name.toLowerCase() === name.toLowerCase()
                        ? { ...s, currentStock: s.currentStock + delta }
                        : s
                );
            } else if (delta > 0) {
                return [...prev, { slNo: prev.length + 1, name, currentStock: delta }];
            }
            return prev;
        });
    };

    const addMaterial = async (e) => {
        e.preventDefault();
        if (!materialForm.name.trim()) {
            showDialog('Validation Error', 'Please enter a material name.', 'error');
            return;
        }

        if (materials.some(m => m.toLowerCase() === materialForm.name.toLowerCase())) {
            showDialog('Duplicate Material', `"${materialForm.name}" already exists in the material list.`, 'warning');
            return;
        }

        try {
            const token = getToken();

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/materials`, {
                name: materialForm.name
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            const newMaterials = [...materials, materialForm.name].sort((a, b) => a.localeCompare(b));
            setMaterials(newMaterials);
            showToast('✅ Material added successfully!');
            setMaterialForm({ name: '' });
            setShowMaterialModal(false);
        } catch (err) {
            console.error('Add material error:', err);
            console.error('Error response:', err.response?.data);
            showDialog('Error', err.response?.data?.message || 'Failed to add material. Please try again.', 'error');
        }
    };

    const deleteMaterial = (name) => {
        const usedInReceived = receivedRecords.some(r => r.name === name);
        const usedInIssued = issuedRecords.some(r => r.name === name);

        if (usedInReceived || usedInIssued) {
            showDialog(
                'Cannot Delete Material',
                `"${name}" is being used in received or issued records. You cannot delete materials that are in use.`,
                'error'
            );
            return;
        }

        showDialog(
            'Confirm Delete',
            `Are you sure you want to delete "${name}" from the material list?`,
            'warning',
            () => {
                setMaterials(prev => prev.filter(m => m !== name));
                showToast('✅ Material deleted successfully!');
                closeDialog();
            }
        );
    };

    const exportMaterials = () => {
        const exportData = materials.map((name, index) => ({
            'Sl.No': index + 1,
            'Material Name': name
        }));
        exportToCSV(exportData, 'material-list');
        showToast('📥 Material list exported successfully!');
    };

    const exportReceived = () => {
        const exportData = receivedRecords.map(r => ({
            'Sl.No': r.slNo,
            'Item Name': r.name,
            'Description': r.desc,
            'Qty': r.qty,
            'Rate (Nu.)': r.rate.toFixed(2),
            'Date': r.date,
            'Received By': r.receivedBy,
            'Role': formatRole(r.receivedByRole),
            'Total (Nu.)': r.total.toFixed(2),
        }));
        exportToCSV(exportData, 'received-records');
        showToast('📥 Received records exported successfully!');
    };

    const exportStock = () => {
        const exportData = stockData.map(s => ({
            'Sl.No': s.slNo,
            'Material Name': s.name,
            'Current Stock': s.currentStock,
        }));
        exportToCSV(exportData, 'current-stock');
        showToast('📥 Stock data exported successfully!');
    };

    const exportIssued = () => {
        const exportData = issuedRecords.map(r => ({
            'Sl.No': r.slNo,
            'Item Name': r.name,
            'Qty Issued': r.qty,
            'Issued To': r.issuedTo,
            'Department': r.issuedToDepartment,
            'Reason': r.reason,
            'Date': r.date,
            'Issued By': r.issuedBy,
        }));
        exportToCSV(exportData, 'issued-records');
        showToast('📥 Issued records exported successfully!');
    };

    const addToTable = async (e) => {
        e.preventDefault();
        const { itemName, itemDesc, itemQty, itemRate, itemDate } = addForm;

        if (!itemName || !itemQty || !itemRate) {
            showDialog('Validation Error', 'Please fill in Item Name, Quantity, and Rate.', 'error');
            return;
        }

        if (!currentUser) {
            showDialog('Validation Error', 'User not loaded. Please wait a moment and try again.', 'error');
            return;
        }

        const userRole = currentUser.role || 'production_team';

        try {
            const token = getToken();

            const payload = {
                name: itemName,
                description: itemDesc,
                quantity: parseInt(itemQty),
                rate: parseFloat(itemRate),
                transaction_date: itemDate,
                received_by: currentUser.name,
                received_by_role: userRole,
            };

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/received`, payload, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            fetchInventory();
            showToast('✅ Material received successfully!');
        } catch (err) {
            console.error('Save error:', err);
            console.error('Error response:', err.response?.data);
            showDialog('Error', err.response?.data?.message || 'Failed to save record. Please try again.', 'error');
        }

        setAddForm({ ...EMPTY_ADD_FORM, itemDate: new Date().toISOString().split('T')[0] });
        setShowAddModal(false);
    };

    const issueMaterial = async (e) => {
        e.preventDefault();

        let finalIssuedBy = issueForm.issuedBy;
        if (!finalIssuedBy && currentUser?.name) {
            finalIssuedBy = currentUser.name;
        }

        const { itemName, issueQty, issueDate, issuedTo, issuedToEmail, issuedToDepartment, issueReason } = issueForm;

        if (!itemName || !issueQty || !issuedTo || !finalIssuedBy) {
            const missingFields = [];
            if (!itemName) missingFields.push('Item Name');
            if (!issueQty) missingFields.push('Quantity');
            if (!issuedTo) missingFields.push('Issued To');
            if (!finalIssuedBy) missingFields.push('Issued By');

            showDialog('Validation Error', `Missing fields: ${missingFields.join(', ')}. Please fill them in.`, 'error');
            return;
        }

        const qty = parseInt(issueQty);
        const stock = getLocalStock(itemName);
        if (stock < qty) {
            showDialog('Insufficient Stock', `Current stock for "${itemName}" is ${stock}. Cannot issue ${qty}.`, 'error');
            return;
        }

        try {
            const token = getToken();

            const payload = {
                name: itemName,
                quantity: qty,
                transaction_date: issueDate,
                issued_to: issuedTo,
                issued_to_email: issuedToEmail,
                issued_to_department: issuedToDepartment,
                reason: issueReason,
                issued_by: finalIssuedBy,
            };

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/issued`, payload, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            fetchInventory();
            showToast('✅ Material issued successfully!');
        } catch (err) {
            console.error('Save error:', err);
            console.error('Error response:', err.response?.data);
            showDialog('Error', err.response?.data?.message || 'Failed to save record. Please try again.', 'error');
        }

        setIssueForm({ ...EMPTY_ISSUE_FORM, issueDate: new Date().toISOString().split('T')[0] });
        setIssueType('user');
        setShowIssueModal(false);
    };

    const deleteRecord = async (id, qty, name) => {
        showDialog(
            'Confirm Delete',
            'Delete this record? This will also reduce stock.',
            'warning',
            async () => {
                try {
                    const token = getToken();
                    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/received/${id}`, {
                        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                    });
                    fetchInventory();
                } catch {
                    setReceivedRecords(prev => prev.filter(r => r.id !== id));
                    updateLocalStock(name, -qty);
                }
                setSelectedReceived(prev => { const s = new Set(prev); s.delete(id); return s; });
                showToast('✅ Record deleted successfully!');
                closeDialog();
            }
        );
    };

    const deleteIssuedRecord = async (id, qty, name) => {
        showDialog(
            'Confirm Delete',
            'Delete this issued record? Stock will be refunded.',
            'warning',
            async () => {
                try {
                    const token = getToken();
                    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/issued/${id}`, {
                        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                    });
                    fetchInventory();
                } catch {
                    setIssuedRecords(prev => prev.filter(r => r.id !== id));
                    updateLocalStock(name, qty);
                }
                setSelectedIssued(prev => { const s = new Set(prev); s.delete(id); return s; });
                showToast('✅ Issued record deleted successfully!');
                closeDialog();
            }
        );
    };

    const bulkDeleteReceived = () => {
        if (selectedReceived.size === 0) return;
        showDialog(
            'Confirm Bulk Delete',
            `Delete ${selectedReceived.size} selected records?`,
            'warning',
            () => {
                receivedRecords.filter(r => selectedReceived.has(r.id)).forEach(r => updateLocalStock(r.name, -r.qty));
                setReceivedRecords(prev => prev.filter(r => !selectedReceived.has(r.id)));
                setSelectedReceived(new Set());
                showToast(`✅ ${selectedReceived.size} record(s) deleted.`);
                closeDialog();
            }
        );
    };

    const bulkDeleteIssued = async () => {
        if (selectedIssued.size === 0) return;

        showDialog(
            'Confirm Bulk Delete',
            `Delete ${selectedIssued.size} selected records?`,
            'warning',
            async () => {
                try {
                    const token = getToken();

                    const deletePromises = Array.from(selectedIssued).map(id =>
                        axios.delete(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/admin/inventory/issued/${id}`, {
                            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                        })
                    );

                    await Promise.all(deletePromises);

                    issuedRecords.filter(r => selectedIssued.has(r.id)).forEach(r => updateLocalStock(r.name, r.qty));
                    setIssuedRecords(prev => prev.filter(r => !selectedIssued.has(r.id)));
                    setSelectedIssued(new Set());
                    showToast(`✅ ${selectedIssued.size} record(s) deleted.`);
                } catch (err) {
                    console.error('Bulk delete error:', err);
                    showDialog('Error', 'Failed to delete records. Please try again.', 'error');
                }
                closeDialog();
            }
        );
    };

    const toggleSelectReceived = (id) => {
        setSelectedReceived(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const toggleSelectAllReceived = (checked) => {
        setSelectedReceived(checked ? new Set(receivedRecords.map(r => r.id)) : new Set());
    };

    const toggleSelectIssued = (id) => {
        setSelectedIssued(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const toggleSelectAllIssued = (checked) => {
        setSelectedIssued(checked ? new Set(issuedRecords.map(r => r.id)) : new Set());
    };

    const calculateTotal = () => {
        const qty = parseFloat(addForm.itemQty) || 0;
        const rate = parseFloat(addForm.itemRate) || 0;
        return (qty * rate).toFixed(2);
    };

    const filterMaterials = (list, search) => {
        if (!search) return list;
        return list.filter(item => item.toLowerCase().includes(search.toLowerCase()));
    };

    const filterReceived = (list, search) => {
        if (!search) return list;
        return list.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.desc?.toLowerCase().includes(search.toLowerCase()) ||
            item.receivedBy?.toLowerCase().includes(search.toLowerCase())
        );
    };

    const filterStock = (list, search) => {
        if (!search) return list;
        return list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    };

    const filterIssued = (list, search) => {
        if (!search) return list;
        return list.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.issuedTo?.toLowerCase().includes(search.toLowerCase()) ||
            item.reason?.toLowerCase().includes(search.toLowerCase())
        );
    };

    const tabs = [
        { id: 'materials', label: 'Material List' },
        { id: 'received', label: 'Material Received' },
        { id: 'stock', label: 'Current Stock' },
        { id: 'issued', label: 'Issued Materials' },
    ];

    const tabBtn = (id) =>
        `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`;

    /* ═══════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="sticky top-0 z-20 bg-slate-50 pb-4 mb-6 border-b border-slate-200">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your materials and stock levels</p>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)} className={tabBtn(t.id)}>
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}

                {/* MATERIAL LIST TAB */}
                {!loading && !error && activeTab === 'materials' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Material List</h2>
                                <p className="text-sm text-slate-500 mt-1">Master list of all materials</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Search materials..."
                                    value={searchMaterials}
                                    onChange={(e) => setSearchMaterials(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                                />
                                <button
                                    onClick={exportMaterials}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => setShowMaterialModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Material
                                </button>
                            </div>
                        </div>

                        {filterMaterials(materials, searchMaterials).length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-5">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 font-semibold text-lg">No materials found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sl.No</th>
                                            <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Material Name</th>
                                            <th className="px-8 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filterMaterials(materials, searchMaterials).map((material, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5 text-sm text-slate-600">{index + 1}</td>
                                                <td className="px-8 py-5 text-sm font-semibold text-slate-900">{material}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <DeleteBtn onClick={() => deleteMaterial(material)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* RECEIVED TAB */}
                {!loading && !error && activeTab === 'received' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Received Records</h2>
                                <p className="text-sm text-slate-500 mt-1">Material receiving history</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Search records..."
                                    value={searchReceived}
                                    onChange={(e) => setSearchReceived(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                                />
                                {selectedReceived.size > 0 && (
                                    <button
                                        onClick={bulkDeleteReceived}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Selected ({selectedReceived.size})
                                    </button>
                                )}
                                <button
                                    onClick={exportReceived}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => { setShowAddModal(true); setAddForm({ ...EMPTY_ADD_FORM, itemDate: new Date().toISOString().split('T')[0] }); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Received
                                </button>
                            </div>
                        </div>

                        {filterReceived(receivedRecords, searchReceived).length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-5">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 font-semibold text-lg">No received records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                    checked={selectedReceived.size === receivedRecords.length && receivedRecords.length > 0}
                                                    onChange={e => toggleSelectAllReceived(e.target.checked)}
                                                />
                                            </th>
                                            {['Sl.No', 'Item Name', 'Description', 'Qty', 'Rate (Nu.)', 'Date', 'Received By', 'Role', 'Total (Nu.)'].map((h, i) => (
                                                <th key={i} className={`px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider ${['Qty', 'Rate (Nu.)', 'Total (Nu.)'].includes(h) ? 'text-right' : ['Action'].includes(h) ? 'text-center' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filterReceived(receivedRecords, searchReceived).map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                        checked={selectedReceived.has(record.id)}
                                                        onChange={() => toggleSelectReceived(record.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.slNo}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900">{record.name}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.desc || '-'}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900 text-right">{record.qty}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600 text-right">{record.rate.toFixed(2)}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{formatDate(record.date)}</td>
                                                <td className="px-6 py-5 text-sm font-medium text-slate-900">{record.receivedBy || '-'}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{formatRole(record.receivedByRole)}</td>
                                                <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right">{record.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* CURRENT STOCK TAB */}
                {!loading && !error && activeTab === 'stock' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Current Stock</h2>
                                <p className="text-sm text-slate-500 mt-1">Stocks with stock below this value will be highlighted</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Search stock..."
                                    value={searchStock}
                                    onChange={(e) => setSearchStock(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                                />
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Stock Alert Threshold:</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={stockThreshold || ''}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                                                setStockThreshold(value);
                                            }}
                                            onBlur={() => updateStockThreshold(stockThreshold)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    updateStockThreshold(stockThreshold);
                                                    e.target.blur();
                                                }
                                            }}
                                            disabled={thresholdLoading}
                                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    {thresholdLoading && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                    )}
                                </div>
                                <button
                                    onClick={exportStock}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sl.No</th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Material Name</th>
                                        <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Stock</th>
                                        <th className="px-8 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filterStock(stockData, searchStock).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium">No stock data found</td>
                                        </tr>
                                    ) : (
                                        filterStock(stockData, searchStock).map((stock, index) => {
                                            const isLowStock = stock.currentStock < stockThreshold;
                                            const canDelete = stock.currentStock <= 0;

                                            return (
                                                <tr
                                                    key={index}
                                                    className={`transition-colors ${isLowStock
                                                        ? 'bg-red-100 border-l-4 border-red-500'
                                                        : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <td className="px-8 py-5 text-sm text-slate-600">{stock.slNo}</td>
                                                    <td className="px-8 py-5 text-sm font-semibold text-slate-900">{stock.name}</td>
                                                    <td className={`px-8 py-5 text-sm font-bold text-right ${isLowStock ? 'text-red-700' : 'text-slate-900'}`}>
                                                        {stock.currentStock} units
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <DeleteBtn
                                                            onClick={() => deleteMaterial(stock.name)}
                                                            disabled={!canDelete}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ISSUED TAB */}
                {!loading && !error && activeTab === 'issued' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Issued Materials</h2>
                                <p className="text-sm text-slate-500 mt-1">Material issuance history</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Search issued..."
                                    value={searchIssued}
                                    onChange={(e) => setSearchIssued(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                                />
                                {selectedIssued.size > 0 && (
                                    <button
                                        onClick={bulkDeleteIssued}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Selected ({selectedIssued.size})
                                    </button>
                                )}
                                <button
                                    onClick={exportIssued}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => { setShowIssueModal(true); setIssueForm({ ...EMPTY_ISSUE_FORM, issueDate: new Date().toISOString().split('T')[0] }); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Issue Material
                                </button>
                            </div>
                        </div>

                        {filterIssued(issuedRecords, searchIssued).length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-5">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 font-semibold text-lg">No issued records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                    checked={selectedIssued.size === issuedRecords.length && issuedRecords.length > 0}
                                                    onChange={e => toggleSelectAllIssued(e.target.checked)}
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">Sl.No</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-48">Item Name</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Qty Issued</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-64">Issued To</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">Department</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Reason</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">Issued By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filterIssued(issuedRecords, searchIssued).map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                        checked={selectedIssued.has(record.id)}
                                                        onChange={() => toggleSelectIssued(record.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.slNo}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900">{record.name}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900 text-right">{record.qty}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">
                                                    {record.issuedToEmail
                                                        ? `${record.issuedTo} - ${record.issuedToEmail}`
                                                        : record.issuedTo || '-'
                                                    }
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.issuedToDepartment || '-'}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600 w-48 max-w-[200px]">
                                                    {record.reason ? (
                                                        <div className="group relative">
                                                            <div
                                                                className="truncate cursor-help border-b border-dotted border-slate-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                {record.reason}
                                                            </div>

                                                            {/* Modern Custom Tooltip */}
                                                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-80 max-w-md z-50">
                                                                <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                                                                    <p className="leading-relaxed break-words">{record.reason}</p>
                                                                    {/* Arrow */}
                                                                    <div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{formatDate(record.date)}</td>
                                                <td className="px-6 py-5 text-sm font-medium text-slate-900">{record.issuedBy || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ADD MATERIAL MODAL */}
            {showMaterialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMaterialModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg z-10 border border-slate-200">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-bold text-slate-900">Add New Material</h3>
                            <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={addMaterial}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Material Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={materialForm.name}
                                    onChange={e => setMaterialForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g., Arduino Mega, Acrylic Sheet 3mm"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowMaterialModal(false)} className="px-6 py-3 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">Add Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD RECEIVED MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl z-10 border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-bold text-slate-900">Add Received Record</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={addToTable} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    value={addForm.itemName}
                                    onChange={v => setAddForm(p => ({ ...p, itemName: v }))}
                                    options={materials}
                                    placeholder="Type to search existing or add new material..."
                                    allowNew
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={addForm.itemDesc}
                                    onChange={e => setAddForm(p => ({ ...p, itemDesc: e.target.value }))}
                                    placeholder="e.g., 4x8ft sheet, White color"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Qty <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={addForm.itemQty || ''}
                                    onChange={e => {
                                        const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                                        setAddForm(p => ({ ...p, itemQty: value }));
                                    }}
                                    min="0"
                                    onWheel={e => e.target.blur()}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Rate (Nu.) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={addForm.itemRate || ''}
                                    onChange={e => {
                                        const value = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0);
                                        setAddForm(p => ({ ...p, itemRate: value }));
                                    }}
                                    min="0"
                                    step="0.01"
                                    onWheel={e => e.target.blur()}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={addForm.itemDate}
                                    onChange={e => setAddForm(p => ({ ...p, itemDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Received By</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                    {currentUser ? (
                                        <span className="text-slate-900 font-medium">
                                            {currentUser.name} ({formatRole(currentUser.role || 'production_team')})
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Loading...</span>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-lg">
                                    Nu. {calculateTotal()}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ISSUE MATERIAL MODAL */}
            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowIssueModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl z-10 border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-bold text-slate-900">Issue Material</h3>
                            <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={issueMaterial} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    value={issueForm.itemName}
                                    onChange={v => setIssueForm(p => ({ ...p, itemName: v }))}
                                    options={materials}
                                    placeholder="Select material to issue..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Qty to Issue <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={issueForm.issueQty || ''}
                                        onChange={e => {
                                            const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                                            setIssueForm(p => ({ ...p, issueQty: value }));
                                        }}
                                        min="0"
                                        onWheel={e => e.target.blur()}
                                        placeholder="0"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={issueForm.issueDate}
                                        onChange={e => setIssueForm(p => ({ ...p, issueDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Issue To <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            value="user"
                                            checked={issueType === 'user'}
                                            onChange={e => handleIssueTypeChange(e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-slate-700">User</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            value="production_team"
                                            checked={issueType === 'production_team'}
                                            onChange={e => handleIssueTypeChange(e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-slate-700">Production Team</span>
                                    </label>
                                </div>
                            </div>

                            {issueType === 'user' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                                        <select
                                            value={issueForm.issuedToDepartment}
                                            onChange={e => handleDepartmentChange(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept, index) => (
                                                <option key={index} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Issued To (User) <span className="text-red-500">*</span></label>
                                        <select
                                            value={issueForm.issuedTo && issueForm.issuedToEmail ? `${issueForm.issuedTo} - ${issueForm.issuedToEmail}` : ''}
                                            onChange={e => handleUserSelect(e.target.value)}
                                            disabled={!issueForm.issuedToDepartment}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">{issueForm.issuedToDepartment ? 'Select User' : 'Select Department First'}</option>
                                            {usersByDepartment.map((user, index) => (
                                                <option key={index} value={user.display}>{user.display}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Production Team Member <span className="text-red-500">*</span></label>
                                    <select
                                        value={issueForm.issuedTo || ''}
                                        onChange={e => handleProductionTeamSelect(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                    >
                                        <option value="">Select Production Team Member</option>
                                        {productionTeamMembers.map((member, index) => (
                                            <option key={index} value={member.display}>
                                                {member.display}
                                            </option>
                                        ))}
                                    </select>
                                    {issueForm.issuedTo && (
                                        <p className="mt-2 text-sm text-emerald-600">
                                            ✅ Selected: {issueForm.issuedTo}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                                <input
                                    type="text"
                                    value={issueForm.issueReason}
                                    onChange={e => setIssueForm(p => ({ ...p, issueReason: e.target.value }))}
                                    placeholder="e.g., Project Alpha, Replacement, Maintenance"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Issued By</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                    {currentUser ? (
                                        <span className="text-slate-900 font-medium">
                                            {currentUser.name} ({formatRole(currentUser.role || 'production_team')})
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Loading...</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowIssueModal(false)} className="px-6 py-3 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">Issue Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Dialog */}
            <CustomDialog
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                onConfirm={dialog.onConfirm || closeDialog}
                onCancel={closeDialog}
                isConfirmation={dialog.isConfirmation}
                visible={dialog.visible}
            />

            <Toast message={toast.message} visible={toast.visible} />
        </div>
    );
}