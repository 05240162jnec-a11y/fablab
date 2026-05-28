import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const INITIAL_MATERIALS = [
    "Arduino Mega", "Raspberry Pi", "Buzzer", "Big Buzzer", "Switch", "Push Button",
    "WiFi Module", "DC Motor", "LCD", "Transistor", "LED", "Electrolytic Capacitor",
    "Terminal Assortment", "Diode", "IC Holder", "Breadboard Small", "PCB Resistor",
    "Relay", "PLA Filament (White)", "PLA Filament (Black)", "PLA Filament (Red)",
    "PLA Filament (Blue)", "PLA Filament (Yellow)", "Plywood 4mm", "Birch Ply 3mm",
    "Birch Ply 4mm", "Acrylic Sheet 2mm (Red)", "Acrylic Sheet 2mm (Blue)",
    "Acrylic Sheet 2mm (Green)", "Acrylic Sheet 2mm (Yellow)", "Acrylic Sheet 2mm (Black)",
    "Acrylic Sheet 2mm (White)", "Acrylic Sheet 2mm (Transparent)", "Acrylic Sheet 3mm",
    "Vinyl Sticker (Black)", "Vinyl Sticker (White)", "Vinyl Sticker (Red)",
    "Vinyl Sticker (Green)", "Vinyl Sticker (Blue)", "Copper Clad", "Laser Lens",
    "Laser Mirror", "Rubber Wood", "CNC End Mill Bit", "CNC Router V Bit",
    "Fabric Cloth", "Matty Cloth", "Micro Fiber Cloth", "PVC Sheet", "Glue Stick",
    "Led Light (Warm White)"
];

const EMPTY_ADD_FORM = {
    itemName: '',
    itemDesc: '',
    itemQty: '',
    itemRate: '',
    itemDate: new Date().toISOString().split('T')[0],
    receivedBy: '',
};

const EMPTY_ISSUE_FORM = {
    itemName: '',
    issueQty: '',
    issueDate: new Date().toISOString().split('T')[0],
    issuedTo: '',
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
                    value={value}
                    onChange={e => { onChange(e.target.value); setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => { setSearch(''); setOpen(true); }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white pr-12 transition-all"
                />
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
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
   Custom Dialog/Modal Component
───────────────────────────────────────────── */
function CustomDialog({ title, message, type = 'info', onConfirm, onCancel, visible }) {
    if (!visible) return null;

    const icons = {
        info: (
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        error: (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border border-slate-200">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6">
                        {icons[type]}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                    <p className="text-slate-600 mb-8">{message}</p>
                    <div className="flex gap-3 w-full">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all ${type === 'error' ? 'bg-red-600 hover:bg-red-700' : type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {onCancel ? 'Confirm' : 'OK'}
                        </button>
                    </div>
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
function DeleteBtn({ onClick }) {
    return (
        <button onClick={onClick} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
}

/* ─────────────────────────────────────────────
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

    const [materials, setMaterials] = useState(INITIAL_MATERIALS);
    const [receivedRecords, setReceivedRecords] = useState([]);
    const [issuedRecords, setIssuedRecords] = useState([]);
    const [stockData, setStockData] = useState([]);

    // ✅ NEW: Dynamic team members for dropdown (MOVED INSIDE COMPONENT)
    const [teamMembers, setTeamMembers] = useState([]);

    // Bulk selection
    const [selectedReceived, setSelectedReceived] = useState(new Set());
    const [selectedIssued, setSelectedIssued] = useState(new Set());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Custom Dialog State
    const [dialog, setDialog] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

    // Toast
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
        });
    };

    const closeDialog = () => {
        setDialog({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
    };

    /* ── API Fetch ── */
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            // ✅ Fetch inventory data AND team members in parallel
            const [inventoryRes, teamRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/admin/inventory', {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                }),
                axios.get('http://127.0.0.1:8000/api/admin/inventory/team-members', {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                })
            ]);

            if (inventoryRes.data.success && teamRes.data.success) {
                const data = inventoryRes.data.data;
                const members = teamRes.data.data;

                // ✅ Set dynamic team members for dropdowns
                setTeamMembers(members);

                // ... rest of your existing inventory data handling ...
                const fetchedMaterialNames = data.materials.map(m => m.name);
                setMaterials(prev => {
                    const merged = [...new Set([...prev, ...fetchedMaterialNames])];
                    return merged.sort((a, b) => a.localeCompare(b));
                });

                setReceivedRecords(data.received.map((record, index) => ({
                    id: record.id,
                    slNo: index + 1,
                    name: record.material.name,
                    desc: record.material.description || '',
                    qty: record.quantity,
                    rate: parseFloat(record.rate),
                    date: record.transaction_date,
                    receivedBy: record.received_by || '',
                    total: record.quantity * parseFloat(record.rate),
                })));

                setIssuedRecords(data.issued.map((record, index) => ({
                    id: record.id,
                    slNo: index + 1,
                    name: record.material.name,
                    qty: record.quantity,
                    date: record.transaction_date,
                    issuedTo: record.issued_to || '',
                    reason: record.reason || '',
                    issuedBy: record.issued_by || '',
                })));

                setStockData(data.materials.map((material, index) => ({
                    slNo: index + 1,
                    name: material.name,
                    currentStock: material.quantity,
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

    useEffect(() => { fetchInventory(); }, []);

    /* ── Stock helpers ── */
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

    /* ── Add Material to Master List ── */
    const addMaterial = (e) => {
        e.preventDefault();
        if (!materialForm.name.trim()) {
            showDialog('Validation Error', 'Please enter a material name.', 'error');
            return;
        }

        if (materials.some(m => m.toLowerCase() === materialForm.name.toLowerCase())) {
            showDialog('Duplicate Material', `"${materialForm.name}" already exists in the material list.`, 'warning');
            return;
        }

        const newMaterials = [...materials, materialForm.name].sort((a, b) => a.localeCompare(b));
        setMaterials(newMaterials);
        showToast('✅ Material added successfully!');
        setMaterialForm({ name: '' });
        setShowMaterialModal(false);
    };

    /* ── Delete Material from Master List ── */
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

    /* ── Export Material List to CSV ── */
    const exportMaterials = () => {
        const exportData = materials.map((name, index) => ({
            'Sl.No': index + 1,
            'Material Name': name
        }));
        exportToCSV(exportData, 'material-list');
        showToast('📥 Material list exported successfully!');
    };

    const addToTable = async (e) => {
        e.preventDefault();
        const { itemName, itemDesc, itemQty, itemRate, itemDate, receivedBy } = addForm;

        // ✅ Extract just the name from "Name (Role)" format
        const receivedByName = receivedBy.split(' (')[0];

        if (!itemName || !itemQty || !itemRate || !receivedByName) {
            showDialog('Validation Error', 'Please fill in Item Name, Quantity, Rate, and Received By.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('http://127.0.0.1:8000/api/admin/inventory/received', {
                name: itemName,
                description: itemDesc,
                quantity: parseInt(itemQty),
                rate: parseFloat(itemRate),
                transaction_date: itemDate,
                received_by: receivedByName, // ✅ Save just the name
            }, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            fetchInventory();
            showToast('✅ Material received successfully!');
        } catch {
            const qty = parseInt(itemQty);
            const rate = parseFloat(itemRate);
            const newRecord = {
                id: Date.now(),
                slNo: receivedRecords.length + 1,
                name: itemName,
                desc: itemDesc,
                qty,
                rate,
                date: itemDate,
                receivedBy,
                total: qty * rate,
            };
            setReceivedRecords(prev => [...prev, newRecord]);
            updateLocalStock(itemName, qty);

            if (!materials.some(m => m.toLowerCase() === itemName.toLowerCase())) {
                setMaterials(prev => [...prev, itemName].sort((a, b) => a.localeCompare(b)));
            }
            showToast('✅ Material received successfully!');
        }

        setAddForm({ ...EMPTY_ADD_FORM, itemDate: new Date().toISOString().split('T')[0] });
        setShowAddModal(false);
    };

    /* ── Issue Material ── */
    const issueMaterial = async (e) => {
        e.preventDefault();
        const { itemName, issueQty, issueDate, issuedTo, issueReason, issuedBy } = issueForm;

        // ✅ Extract just the name from "Name (Role)" format
        const issuedByName = issuedBy.split(' (')[0];

        if (!itemName || !issueQty || !issuedByName) {
            showDialog('Validation Error', 'Please fill in Item Name, Quantity, and Issued By.', 'error');
            return;
        }

        const qty = parseInt(issueQty);
        const stock = getLocalStock(itemName);
        if (stock < qty) {
            showDialog('Insufficient Stock', `Current stock for "${itemName}" is ${stock}. Cannot issue ${qty}.`, 'error');
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('http://127.0.0.1:8000/api/admin/inventory/issued', {
                name: itemName,
                quantity: qty,
                transaction_date: issueDate,
                issued_to: issuedTo,
                reason: issueReason,
                issued_by: issuedByName, // ✅ Save just the name
            }, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            fetchInventory();
            showToast('✅ Material issued successfully!');
        } catch {
            const newRecord = {
                id: Date.now(),
                slNo: issuedRecords.length + 1,
                name: itemName,
                qty,
                date: issueDate,
                issuedTo,
                reason: issueReason,
                issuedBy,
            };
            setIssuedRecords(prev => [...prev, newRecord]);
            updateLocalStock(itemName, -qty);
            showToast('✅ Material issued successfully!');
        }

        setIssueForm({ ...EMPTY_ISSUE_FORM, issueDate: new Date().toISOString().split('T')[0] });
        setShowIssueModal(false);
    };

    /* ── Delete Received ── */
    const deleteRecord = async (id, qty, name) => {
        showDialog(
            'Confirm Delete',
            'Delete this record? This will also reduce stock.',
            'warning',
            async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    await axios.delete(`http://127.0.0.1:8000/api/admin/inventory/received/${id}`, {
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

    /* ── Delete Issued ── */
    const deleteIssuedRecord = async (id, qty, name) => {
        showDialog(
            'Confirm Delete',
            'Delete this issued record? Stock will be refunded.',
            'warning',
            async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    await axios.delete(`http://127.0.0.1:8000/api/admin/inventory/issued/${id}`, {
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

    /* ── Bulk Delete ── */
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

    const bulkDeleteIssued = () => {
        if (selectedIssued.size === 0) return;
        showDialog(
            'Confirm Bulk Delete',
            `Delete ${selectedIssued.size} selected records?`,
            'warning',
            () => {
                issuedRecords.filter(r => selectedIssued.has(r.id)).forEach(r => updateLocalStock(r.name, r.qty));
                setIssuedRecords(prev => prev.filter(r => !selectedIssued.has(r.id)));
                setSelectedIssued(new Set());
                showToast(`✅ ${selectedIssued.size} record(s) deleted.`);
                closeDialog();
            }
        );
    };

    /* ── Checkbox helpers ── */
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

    /* ── Tabs config ── */
    const tabs = [
        { id: 'materials', label: 'Material List' },
        { id: 'received', label: 'Material Received' },
        { id: 'stock', label: 'Current Stock' },
        { id: 'issued', label: 'Issued Materials' },
    ];

    const tabBtn = (id) =>
        `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`;

    /* ═══════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-slate-50 pb-4 mb-6 border-b border-slate-200">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your materials and stock levels</p>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Sub-tabs */}
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

                {/* ── MATERIAL LIST TAB ── */}
                {!loading && !error && activeTab === 'materials' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Material List</h2>
                                <p className="text-sm text-slate-500 mt-1">Master list of all materials</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* ✅ Export Buttons */}
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
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Material
                                </button>
                            </div>
                        </div>

                        {materials.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-5">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 font-semibold text-lg">No materials yet</p>
                                <p className="text-slate-400 text-sm mt-2">Add your first material to get started</p>
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
                                        {materials.map((material, index) => (
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

                {/* ── RECEIVED TAB ── */}
                {!loading && !error && activeTab === 'received' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Received Records</h2>
                                <p className="text-sm text-slate-500 mt-1">Material receiving history</p>
                            </div>
                            <div className="flex items-center gap-3">
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
                                    onClick={() => { setShowAddModal(true); setAddForm({ ...EMPTY_ADD_FORM, itemDate: new Date().toISOString().split('T')[0] }); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Received
                                </button>
                            </div>
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
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                                    checked={selectedReceived.size === receivedRecords.length && receivedRecords.length > 0}
                                                    onChange={e => toggleSelectAllReceived(e.target.checked)}
                                                />
                                            </th>
                                            {['Sl.No', 'Item Name', 'Description', 'Qty', 'Rate (Nu.)', 'Date', 'Received By', 'Total (Nu.)', 'Action'].map((h, i) => (
                                                <th key={i} className={`px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider ${['Qty', 'Rate (Nu.)', 'Total (Nu.)'].includes(h) ? 'text-right' : ['Action'].includes(h) ? 'text-center' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {receivedRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                                        checked={selectedReceived.has(record.id)}
                                                        onChange={() => toggleSelectReceived(record.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.slNo}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900">{record.name}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.desc || '-'}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900 text-right">{record.qty}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600 text-right">Nu. {record.rate.toFixed(2)}</td>
                                                {/* ✅ Formatted Date */}
                                                <td className="px-6 py-5 text-sm text-slate-600">{formatDate(record.date)}</td>
                                                <td className="px-6 py-5 text-sm font-medium text-slate-900">{record.receivedBy || '-'}</td>
                                                <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right">Nu. {record.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <DeleteBtn onClick={() => deleteRecord(record.id, record.qty, record.name)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CURRENT STOCK TAB ── */}
                {!loading && !error && activeTab === 'stock' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Current Stock</h2>
                            <p className="text-sm text-slate-500 mt-1">Highlighted in red if stock &lt; 10 units</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sl.No</th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Material Name</th>
                                        <th className="px-8 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stockData.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-medium">No stock data available</td>
                                        </tr>
                                    ) : (
                                        stockData.map((stock, index) => (
                                            <tr
                                                key={index}
                                                className={`transition-colors ${stock.currentStock < 10
                                                    ? 'bg-red-100 border-l-4 border-red-500'
                                                    : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <td className="px-8 py-5 text-sm text-slate-600">{stock.slNo}</td>
                                                <td className="px-8 py-5 text-sm font-semibold text-slate-900">{stock.name}</td>
                                                <td className={`px-8 py-5 text-sm font-bold text-right ${stock.currentStock < 10 ? 'text-red-700' : 'text-slate-900'}`}>
                                                    {stock.currentStock} units
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ISSUED TAB ── */}
                {!loading && !error && activeTab === 'issued' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Issued Materials</h2>
                                <p className="text-sm text-slate-500 mt-1">Material issuance history</p>
                            </div>
                            <div className="flex items-center gap-3">
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
                                    onClick={() => { setShowIssueModal(true); setIssueForm({ ...EMPTY_ISSUE_FORM, issueDate: new Date().toISOString().split('T')[0] }); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Issue Material
                                </button>
                            </div>
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
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                                    checked={selectedIssued.size === issuedRecords.length && issuedRecords.length > 0}
                                                    onChange={e => toggleSelectAllIssued(e.target.checked)}
                                                />
                                            </th>
                                            {['Sl.No', 'Item Name', 'Qty Issued', 'Issued To', 'Reason', 'Date', 'Issued By', 'Action'].map((h, i) => (
                                                <th key={i} className={`px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider ${h === 'Qty Issued' ? 'text-right' : h === 'Action' ? 'text-center' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {issuedRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                                        checked={selectedIssued.has(record.id)}
                                                        onChange={() => toggleSelectIssued(record.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.slNo}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-900">{record.name}</td>
                                                {/* ✅ Positive quantity display (no negative sign) */}
                                                <td className="px-6 py-5 text-sm font-semibold text-red-600 text-right">{record.qty}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.issuedTo || '-'}</td>
                                                <td className="px-6 py-5 text-sm text-slate-600">{record.reason || '-'}</td>
                                                {/* ✅ Formatted Date */}
                                                <td className="px-6 py-5 text-sm text-slate-600">{formatDate(record.date)}</td>
                                                <td className="px-6 py-5 text-sm font-medium text-slate-900">{record.issuedBy || '-'}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <DeleteBtn onClick={() => deleteIssuedRecord(record.id, record.qty, record.name)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════
                ADD MATERIAL MODAL
            ═══════════════════════════ */}
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
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowMaterialModal(false)} className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">Add Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════
                ADD RECEIVED MODAL
            ═══════════════════════════ */}
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
                            {/* Item Name */}
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

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={addForm.itemDesc}
                                    onChange={e => setAddForm(p => ({ ...p, itemDesc: e.target.value }))}
                                    placeholder="e.g., 4x8ft sheet, White color"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Qty */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Qty <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={addForm.itemQty}
                                    onChange={e => setAddForm(p => ({ ...p, itemQty: e.target.value }))}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Rate */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Rate (Nu.) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={addForm.itemRate}
                                    onChange={e => setAddForm(p => ({ ...p, itemRate: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={addForm.itemDate}
                                    onChange={e => setAddForm(p => ({ ...p, itemDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Received By */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Received By <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    value={addForm.receivedBy}
                                    onChange={v => setAddForm(p => ({ ...p, receivedBy: v }))}
                                    options={teamMembers.map(m => m.name)} // ✅ Use dynamic names
                                    placeholder="Select staff member..."
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
                            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════
                ISSUE MATERIAL MODAL
            ═══════════════════════════ */}
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

                        <form onSubmit={issueMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    value={issueForm.itemName}
                                    onChange={v => setIssueForm(p => ({ ...p, itemName: v }))}
                                    options={materials}
                                    placeholder="Select material to issue..."
                                />
                            </div>

                            {/* Qty */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Qty to Issue <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={issueForm.issueQty}
                                    onChange={e => setIssueForm(p => ({ ...p, issueQty: e.target.value }))}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={issueForm.issueDate}
                                    onChange={e => setIssueForm(p => ({ ...p, issueDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Issued To */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Issued To <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={issueForm.issuedTo}
                                    onChange={e => setIssueForm(p => ({ ...p, issuedTo: e.target.value }))}
                                    placeholder="e.g., Sonam Tshering, Project Alpha"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Reason */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                                <input
                                    type="text"
                                    value={issueForm.issueReason}
                                    onChange={e => setIssueForm(p => ({ ...p, issueReason: e.target.value }))}
                                    placeholder="e.g., Project Alpha, Replacement, Maintenance"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                />
                            </div>

                            {/* Issued By */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Issued By <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    value={issueForm.issuedBy}
                                    onChange={v => setIssueForm(p => ({ ...p, issuedBy: v }))}
                                    options={teamMembers.map(m => m.name)} // ✅ Use dynamic names
                                    placeholder="Select staff member..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowIssueModal(false)} className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">Issue Material</button>
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
                onConfirm={dialog.onConfirm}
                onCancel={dialog.onCancel || closeDialog}
                visible={dialog.visible}
            />

            <Toast message={toast.message} visible={toast.visible} />
        </div>
    );
}