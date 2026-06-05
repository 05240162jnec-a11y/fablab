import React from 'react';

export default function CustomAlert({ show, type, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) {
    if (!show) return null;

    const isSuccess = type === 'success';
    const isConfirm = type === 'confirm';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100">
                {/* Header */}
                <div className={`px-6 py-4 border-b ${isSuccess ? 'bg-green-50 border-green-100' : isConfirm ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100' : isConfirm ? 'bg-blue-100' : 'bg-red-100'
                            }`}>
                            {isSuccess ? (
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : isConfirm ? (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    {isConfirm && onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 rounded-lg transition-colors font-medium ${isSuccess
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : isConfirm
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}