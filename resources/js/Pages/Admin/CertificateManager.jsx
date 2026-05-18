import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function CertificateManager({ course, onClose, onSuccess }) {
    const [templateFile, setTemplateFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(
        course.certificate_template_path
            ? `http://127.0.0.1:8000/storage/${course.certificate_template_path}`
            : null
    );
    const [config, setConfig] = useState(course.certificate_template_config || {});
    const [selectedField, setSelectedField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [generating, setGenerating] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const imgRef = useRef(null);

    // Field labels for display
    const fieldLabels = {
        name: 'Student Name',
        student_no: 'ID Number',
        course_title: 'Course Name',
        start_date: 'Start Date',
        end_date: 'End Date',
    };

    // Sample data for preview
    const sampleData = {
        name: 'Eino Heaney MD',
        student_no: 'test12345678',
        course_title: course.title || 'Test Certificate Course',
        start_date: '2026-05-16',
        end_date: '2026-05-17',
    };

    // Reset preview mode when component unmounts
    useEffect(() => {
        return () => setPreviewMode(false);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTemplateFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMessage('');
        }
    };

    const handleImageClick = (e) => {
        if (!imgRef.current || !selectedField) return;

        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setConfig((prev) => ({
            ...prev,
            [selectedField]: {
                ...prev[selectedField],
                x: Math.round(x),
                y: Math.round(y),
                size: prev[selectedField]?.size || 24,
                color: prev[selectedField]?.color || '#000000',
            },
        }));
    };

    const handleConfigChange = (field, key, value) => {
        setConfig((prev) => ({
            ...prev,
            [field]: { ...prev[field], [key]: value },
        }));
    };

    const handleResetField = (field) => {
        setConfig((prev) => {
            const newConfig = { ...prev };
            delete newConfig[field];
            return newConfig;
        });
        if (selectedField === field) setSelectedField(null);
    };

    const handleSave = async () => {
        if (!templateFile) {
            setMessage('❌ Please select a template image first.');
            return;
        }

        // Validate that required fields have coordinates
        const requiredFields = ['name', 'student_no', 'course_title'];
        const missingFields = requiredFields.filter(
            (f) => !config[f] || config[f].x === undefined || config[f].y === undefined
        );

        if (missingFields.length > 0) {
            setMessage(`❌ Please position: ${missingFields.map(f => fieldLabels[f]).join(', ')}`);
            return;
        }

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('template_image', templateFile);
        formData.append('template_config', JSON.stringify(config));

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(
                `http://127.0.0.1:8000/api/admin/courses/${course.id}/certificate-template`,
                formData,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setMessage('✅ Template saved successfully!');
            onSuccess?.();
            setTimeout(onClose, 1500);
        } catch (error) {
            console.error('Save error:', error);
            setMessage('❌ Failed to save template. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePositionsOnly = async () => {
        // Save positions without re-uploading image
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(
                `http://127.0.0.1:8000/api/admin/courses/${course.id}/certificate-template`,
                {
                    template_config: JSON.stringify(config),
                    // Don't send template_image - keep existing one
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setMessage('✅ Positions updated successfully!');
            onSuccess?.();
            setEditMode(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Save positions error:', error);
            setMessage('❌ Failed to save positions. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!window.confirm('Generate certificates for all completed students? This may take a moment.')) return;

        setGenerating(true);
        setMessage('');
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(
                `http://127.0.0.1:8000/api/admin/courses/${course.id}/generate-certificates`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('✅ ' + res.data.message);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Generate error:', error);
            alert('❌ Generation failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setGenerating(false);
        }
    };

    const fields = ['name', 'student_no', 'course_title', 'start_date', 'end_date'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold">Certificate Manager: {course.title}</h2>
                        <p className="text-sm text-gray-500">
                            {editMode ? 'Edit field positions - click on image to reposition' : 'View and manage certificate template'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Edit Positions Button */}
                        {previewUrl && (
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1 ${editMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    }`}
                            >
                                {editMode ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel Edit
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Positions
                                    </>
                                )}
                            </button>
                        )}
                        {/* Save Positions Button (Only in Edit Mode) */}
                        {editMode && (
                            <button
                                onClick={handleSavePositionsOnly}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                            >
                                {loading ? 'Saving...' : '💾 Save Positions'}
                            </button>
                        )}
                        {/* Preview Toggle */}
                        {previewUrl && Object.keys(config).length > 0 && !editMode && (
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${previewMode
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                title={previewMode ? 'Exit preview' : 'Preview with sample data'}
                            >
                                {previewMode ? '🔍 Exit Preview' : '👁️ Test Preview'}
                            </button>
                        )}
                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !course.certificate_template_path}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                            {generating ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                '🎓 Generate Certificates'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Image Preview */}
                    <div className="flex-1 bg-gray-100 overflow-auto p-4 flex items-center justify-center relative">
                        {previewUrl ? (
                            <div className="relative inline-block shadow-lg">
                                <img
                                    ref={imgRef}
                                    src={previewUrl}
                                    alt="Certificate Template"
                                    className={`max-w-full h-auto select-none rounded-lg ${editMode ? 'cursor-crosshair' : 'cursor-default'
                                        }`}
                                    onClick={editMode ? handleImageClick : undefined}
                                    crossOrigin="anonymous"
                                />
                                {/* Render Markers */}
                                {Object.entries(config).map(([field, pos]) => (
                                    <div
                                        key={field}
                                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 ${selectedField === field ? 'scale-110' : ''
                                            } ${editMode ? 'opacity-100' : 'opacity-80'}`}
                                        style={{ left: pos.x, top: pos.y }}
                                        onClick={(e) => {
                                            if (editMode) {
                                                e.stopPropagation();
                                                setSelectedField(field);
                                            }
                                        }}
                                        title={`${fieldLabels[field]} - X:${pos.x}, Y:${pos.y}`}
                                    >
                                        {/* Marker Dot */}
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${selectedField === field
                                                    ? 'bg-blue-500 ring-2 ring-blue-300'
                                                    : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                        />
                                        {/* Label Badge */}
                                        <div className="absolute left-6 top-0 px-2 py-1 bg-gray-900/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {fieldLabels[field]} ({pos.x}, {pos.y})
                                        </div>
                                        {/* Preview Text (when in preview mode) */}
                                        {previewMode && sampleData[field] && (
                                            <div
                                                className="absolute left-1/2 transform -translate-x-1/2 mt-6 px-2 py-1 bg-yellow-100 border border-yellow-300 text-yellow-900 text-xs rounded whitespace-nowrap max-w-[200px] truncate"
                                                style={{
                                                    fontSize: `${(pos.size || 24) * 0.4}px`,
                                                    color: pos.color || '#000000',
                                                }}
                                            >
                                                {sampleData[field]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {/* Instructions Overlay */}
                                {editMode && selectedField && !config[selectedField] && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 animate-pulse">
                                            👆 Click anywhere on the image to position "{fieldLabels[selectedField]}"
                                        </div>
                                    </div>
                                )}
                                {/* Edit Mode Overlay */}
                                {editMode && (
                                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                        ✏️ Edit Mode: Click a field button, then click on the image to reposition
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 p-8">
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-lg font-medium">No template uploaded yet</p>
                                <p className="text-sm mt-1">Upload a PNG/JPG certificate template to get started</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Settings Panel */}
                    <div className="w-80 bg-white border-l overflow-y-auto p-4 flex flex-col gap-4">
                        {/* Edit Mode Notice */}
                        {editMode && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800 font-medium">✏️ Edit Mode Active</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    1. Select a field below<br />
                                    2. Click on the image to reposition<br />
                                    3. Click "Save Positions" to apply
                                </p>
                            </div>
                        )}

                        {/* 1. Upload Section (Only if NOT in edit mode) */}
                        {!editMode && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    1. Upload New Template
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/png,image/jpeg"
                                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">PNG or JPG, max 5MB</p>
                            </div>
                        )}

                        {/* 2. Position Fields Section */}
                        <div className={`p-3 rounded-lg border ${editMode ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {editMode ? '2. Click Field to Reposition' : '2. Field Positions'}
                            </label>
                            {editMode ? (
                                <p className="text-xs text-blue-600 mb-3">
                                    Select a field, then click on the image to set new position.
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 mb-3">
                                    Click "Edit Positions" button above to adjust field locations.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                                {fields.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setSelectedField(f)}
                                        disabled={!editMode}
                                        className={`px-2.5 py-1 text-[10px] rounded-full border transition-all ${selectedField === f
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : config[f]
                                                    ? editMode
                                                        ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer'
                                                        : 'bg-green-50 text-green-700 border-green-200'
                                                    : editMode
                                                        ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer'
                                                        : 'bg-gray-100 text-gray-400 border-gray-200'
                                            } ${!editMode ? 'cursor-default opacity-75' : ''}`}
                                        title={config[f] ? `Positioned at (${config[f]?.x}, ${config[f]?.y})` : 'Not positioned'}
                                    >
                                        {fieldLabels[f]}
                                        {config[f] && <span className="ml-1">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Active Field Settings (Only in Edit Mode) */}
                        {editMode && selectedField && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-blue-900 text-sm">
                                        Edit: {fieldLabels[selectedField]}
                                    </h4>
                                    {config[selectedField] && (
                                        <button
                                            onClick={() => handleResetField(selectedField)}
                                            className="text-xs text-red-600 hover:text-red-800 hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                {/* Coordinates */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-600 block mb-1">X Position</label>
                                        <input
                                            type="number"
                                            value={config[selectedField]?.x || 0}
                                            onChange={(e) =>
                                                handleConfigChange(selectedField, 'x', parseInt(e.target.value) || 0)
                                            }
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-600 block mb-1">Y Position</label>
                                        <input
                                            type="number"
                                            value={config[selectedField]?.y || 0}
                                            onChange={(e) =>
                                                handleConfigChange(selectedField, 'y', parseInt(e.target.value) || 0)
                                            }
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Styling */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-600 block mb-1">Font Size</label>
                                        <input
                                            type="number"
                                            value={config[selectedField]?.size || 24}
                                            onChange={(e) =>
                                                handleConfigChange(selectedField, 'size', parseInt(e.target.value) || 24)
                                            }
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="8"
                                            max="72"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-600 block mb-1">Color</label>
                                        <input
                                            type="color"
                                            value={config[selectedField]?.color || '#000000'}
                                            onChange={(e) =>
                                                handleConfigChange(selectedField, 'color', e.target.value)
                                            }
                                            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Message */}
                        {message && (
                            <div
                                className={`p-3 rounded-lg text-sm font-medium ${message.includes('✅')
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}
                            >
                                {message}
                            </div>
                        )}

                        {/* Save Button (Only when uploading new template) */}
                        {!editMode && (
                            <div className="mt-auto pt-4 border-t">
                                <button
                                    onClick={handleSave}
                                    disabled={loading || !templateFile}
                                    className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        '💾 Save New Template'
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-2">
                                    Upload a new template and set positions
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}