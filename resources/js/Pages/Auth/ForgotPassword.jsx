import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [formData, setFormData] = useState({ email: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', formData);
            setMessage('✅ ' + response.data.message);
            setFormData({ email: '' });
        } catch (error) {
            if (error.response?.status === 422) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setMessage('❌ ' + error.response.data.message);
                }
            } else if (error.response?.status === 404) {
                setMessage('❌ Email not found. Please check your email address.');
            } else {
                setMessage('❌ Failed to send reset link. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img 
                        src="/images/logo.png" 
                        alt="JNEC FABLAB Logo" 
                        className="mx-auto mb-4 w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                    <p className="text-gray-600 text-sm">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message.includes('✅') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition duration-200 ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-400 hover:bg-blue-500'
                        }`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link 
                        to="/login" 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}