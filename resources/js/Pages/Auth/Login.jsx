import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [token, setToken] = useState(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle form submission - ✅ UNIFIED LOGIN (User + Admin + Production Team)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            // ✅ STEP 1: Try USER login first
            let response;
            let loginType = 'user';

            try {
                response = await axios.post('http://127.0.0.1:8000/api/login', formData);
            } catch (userError) {
                // ✅ STEP 2: If user login fails with "Invalid credentials", try ADMIN login
                if (userError.response?.status === 401 ||
                    userError.response?.data?.message?.includes('Invalid credentials')) {

                    console.log('User login failed, trying admin login...');

                    response = await axios.post('http://127.0.0.1:8000/api/admin/login', formData);
                    loginType = 'admin';
                } else {
                    // Re-throw other errors (403 email verify, 422 validation, etc.)
                    throw userError;
                }
            }

            // ✅ STEP 3: Clear ALL old data BEFORE setting new token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('user');
            localStorage.removeItem('admin');
            localStorage.removeItem('user_data');
            localStorage.removeItem('enrollments');
            localStorage.removeItem('courses');
            localStorage.removeItem('bookings');
            localStorage.removeItem('machines');
            sessionStorage.clear();

            // ✅ STEP 4: Save token (both endpoints return 'token' key)
            localStorage.setItem('auth_token', response.data.token);

            // ✅ STEP 5: Save user/admin data based on login type
            if (loginType === 'admin') {
                // Admin response: { admin: { id, name, email }, token, ... }
                if (response.data.admin) {
                    localStorage.setItem('user', JSON.stringify({
                        ...response.data.admin,
                        role: 'admin'  // ✅ Add role manually for admin
                    }));
                }
            } else {
                // User response: { user: { id, name, email, role }, token, ... }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }

            // ✅ STEP 6: Redirect based on role (handles admin, production_team, and regular users)
            const userData = response.data.user || response.data.admin;
            const userRole = userData?.role || (loginType === 'admin' ? 'admin' : 'student');

            const redirectPath =
                userRole === 'admin' ? '/admin/dashboard' :
                    userRole === 'production_team' ? '/production-team/dashboard' :
                        '/user/dashboard';

            // ✅ Use window.location for full page reload (clears React cache)
            window.location.href = redirectPath;

        } catch (error) {
            console.error('Login error:', error);

            if (error.response?.status === 403) {
                if (error.response.data.message?.includes('verify')) {
                    setMessage('⚠️ ' + error.response.data.message + ' Check your inbox.');
                } else {
                    setMessage('❌ ' + error.response.data.message);
                }
            } else if (error.response?.status === 422) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setMessage('❌ ' + error.response.data.message);
                }
            } else if (error.response?.status === 401) {
                setMessage('❌ Invalid email or password.');
            } else {
                setMessage('❌ Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle logout - ✅ Works for both user and admin
    const handleLogout = () => {
        // ✅ Clear ALL user/admin data on logout
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('user_data');
        localStorage.removeItem('enrollments');
        localStorage.removeItem('courses');
        localStorage.removeItem('bookings');
        localStorage.removeItem('machines');
        sessionStorage.clear();

        setToken(null);
        setMessage('👋 You have been logged out.');
        setFormData({ email: '', password: '' });

        // ✅ Force full page reload to clear React state
        window.location.href = '/login';
    };

    // Login form view
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Side - Image with Blur */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm"
                    style={{
                        backgroundImage: "url('/images/fablab-bg.jpg')"
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
                    <h1 className="text-4xl font-bold mb-4">FAB-Lab System</h1>
                    <p className="text-lg text-center max-w-md">
                        Access machines, enroll in training, and manage your bookings easily.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <img
                            src="/images/logo.png"
                            alt="JNEC FABLAB Logo"
                            className="mx-auto mb-4 w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                    </div>

                    {/* Navigation Tabs - Using React Router Link */}
                    <div className="flex justify-center mb-8">
                        <Link
                            to="/login"
                            className="px-6 py-2 text-gray-800 font-medium border-b-2 border-gray-800"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition"
                        >
                            Register
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('✅')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                                    required
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                                )}

                                {/* Forgot Password Link */}
                                <div className="text-right mt-2">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition duration-200 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-400 hover:bg-blue-500'
                                    }`}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}