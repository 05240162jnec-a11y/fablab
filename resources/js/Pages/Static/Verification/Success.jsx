import React from 'react';
import { Link } from 'react-router-dom';

export default function VerificationSuccess() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">
                    Your email has been successfully verified. You can now login to your account.
                </p>
                <Link 
                    to="/login" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200"
                >
                    Login Now
                </Link>
            </div>
        </div>
    );
}