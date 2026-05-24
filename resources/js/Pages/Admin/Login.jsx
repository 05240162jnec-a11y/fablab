import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            // POST to ADMIN endpoint
            const response = await axios.post('http://127.0.0.1:8000/api/admin/login', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            // Clear per-tab old data only
            sessionStorage.clear();

            // Save token per-tab (prevents other tabs overwriting it)
            sessionStorage.setItem('auth_token', response.data.token);

            // Save user data with role: 'admin' per-tab
            if (response.data.admin) {
                sessionStorage.setItem('user', JSON.stringify({
                    ...response.data.admin,
                    role: 'admin'  // Add role for unified redirect logic
                }));
            }

            setMessage('✅ Admin login successful!');

            // ✅ Redirect to admin dashboard
            setTimeout(() => {
                navigate('/admin/dashboard', { replace: true });
            }, 1000);

        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else if (error.response?.status === 401) {
                setMessage('❌ Invalid admin credentials.');
            } else {
                setMessage('❌ Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/images/logo.png"
                        alt="JNEC FABLAB Admin"
                        className="w-16 h-16 mx-auto mb-4 object-contain"
                    />
                    <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
                    <p className="text-gray-500 text-sm mt-1">FAB Lab Management System</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('✅')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="fablab.jnec@rub.edu.bt"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition duration-200 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                {/* Back to Unified Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        ← Back to Unified Login
                    </Link>
                </div>

                {/* Security Notice */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center">
                        🔐 Authorized access only. All activities are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}