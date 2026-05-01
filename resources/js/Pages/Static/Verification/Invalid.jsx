import React from 'react';
import { Link } from 'react-router-dom';

export default function VerificationInvalid() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid or Expired Link</h2>
                <p className="text-gray-600 mb-6">
                    This verification link is invalid or has expired. Please register again or request a new verification email.
                </p>
                <div className="space-x-4">
                    <Link 
                        to="/register" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                    >
                        Register Again
                    </Link>
                    <Link 
                        to="/login" 
                        className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-200"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}