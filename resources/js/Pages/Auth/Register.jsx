import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CountrySelect from '../../Components/CountrySelect';

export default function Register() {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        gender: '',
        phone: '',
        role: 'student',
        department: '',
        year_of_study: '',
    });

    const [countryCode, setCountryCode] = useState('BT'); // Default to Bhutan

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    // List of common weak passwords to reject
    const weakPasswords = [
        'password', 'password123', '12345678', '123456789', 'qwerty',
        'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
        'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
        'ashley', 'bailey', 'shadow', 'superman', 'qazwsx',
        '123123', 'admin', 'welcome', 'jennifer', 'login'
    ];

    // Validate phone number
    const validatePhone = (phone, country) => {
        // Bhutanese numbers: 17xxxxxx or 77xxxxxx (8 digits)
        if (country === 'BT') {
            const bhutanPattern = /^(17|77)\d{6}$/;
            return bhutanPattern.test(phone);
        }

        // International numbers: digits only, 7-15 digits
        const internationalPattern = /^\d{7,15}$/;
        return internationalPattern.test(phone);
    };

    // Validate password strength
    const validatePassword = (password) => {
        const errors = [];

        // Check minimum length
        if (password.length < 8) {
            errors.push('at least 8 characters');
        }

        // Check uppercase
        if (!/[A-Z]/.test(password)) {
            errors.push('one uppercase letter');
        }

        // Check lowercase
        if (!/[a-z]/.test(password)) {
            errors.push('one lowercase letter');
        }

        // Check numbers
        if (!/[0-9]/.test(password)) {
            errors.push('one number');
        }

        // Check special characters
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('one special character (!@#$%^&*)');
        }

        // Check weak passwords
        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('password is too common');
        }

        return errors;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        // Clear department/year when Outsider is selected
        if (name === 'role' && value === 'outsider') {
            setFormData(prev => ({
                ...prev,
                department: '',
                year_of_study: ''
            }));
        }

        // Validate phone number in real-time
        if (name === 'phone') {
            if (value && !validatePhone(value, countryCode)) {
                if (countryCode === 'BT') {
                    setErrors(prev => ({
                        ...prev,
                        phone: 'Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)'
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        phone: 'Phone number must be 7-15 digits'
                    }));
                }
            } else {
                setErrors(prev => ({
                    ...prev,
                    phone: ''
                }));
            }
        }

        // Validate password in real-time
        if (name === 'password') {
            if (value) {
                const pwdErrors = validatePassword(value);
                if (pwdErrors.length > 0) {
                    setErrors(prev => ({
                        ...prev,
                        password: 'Password must contain: ' + pwdErrors.join(', ')
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        password: ''
                    }));
                }
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        // Validate phone before submission
        if (!validatePhone(formData.phone, countryCode)) {
            if (countryCode === 'BT') {
                setErrors({
                    phone: ['Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)']
                });
            } else {
                setErrors({
                    phone: ['Phone number must be 7-15 digits']
                });
            }
            setLoading(false);
            return;
        }

        // Validate password before submission
        const pwdErrors = validatePassword(formData.password);
        if (pwdErrors.length > 0) {
            setErrors({
                password: ['Password must contain: ' + pwdErrors.join(', ')]
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register', formData);

            // Show success message
            setMessage('✅ ' + response.data.message);

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                gender: '',
                phone: '',
                role: 'student',
                department: '',
                year_of_study: '',
            });

            // Optional: Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);

            if (error.response?.status === 422) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setMessage('❌ ' + error.response.data.message);
                }
            } else if (error.response?.status === 403) {
                setMessage('❌ ' + error.response.data.message);
            } else {
                setMessage('❌ Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

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

                    {/* Navigation Tabs */}
                    <div className="flex justify-center mb-8">
                        <a href="/login" className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition">
                            Login
                        </a>
                        <a href="/register" className="px-6 py-2 text-gray-800 font-medium border-b-2 border-gray-800">
                            Register
                        </a>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('✅')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="mb-4">
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-sm text-red-600">{errors.gender[0]}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    {/* Country Dropdown */}
                                    <CountrySelect
                                        value={countryCode}
                                        onChange={setCountryCode}
                                        error={errors.phone}
                                    />

                                    {/* Phone Input */}
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder={countryCode === 'BT' ? '17XXXXXX' : 'Phone number'}
                                        className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-500 italic ${errors.phone
                                            ? 'border-red-500 focus:ring-red-400'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                        required
                                    />
                                </div>

                                {/* Error Message */}
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}

                                {/* Helper Text */}
                                {!errors.phone && (
                                    <p className="mt-1 text-xs text-gray-400 italic">
                                        {countryCode === 'BT'
                                            ? 'Bhutan numbers must be exactly 8 digits (17XXXXXX or 77XXXXXX)'
                                            : 'Enter your phone number without country code'}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div className="mb-4">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    required
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="outsider">Outsider</option>
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">{errors.role[0]}</p>
                                )}
                            </div>

                            {/* Department - Only show for Student and Faculty */}
                            {(formData.role === 'student' || formData.role === 'faculty') && (
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="Department"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                                    />
                                    {errors.department && (
                                        <p className="mt-1 text-sm text-red-600">{errors.department[0]}</p>
                                    )}
                                </div>
                            )}

                            {/* Year of Study - Only show for Student and Faculty */}
                            {(formData.role === 'student' || formData.role === 'faculty') && (
                                <div className="mb-4">
                                    <select
                                        name="year_of_study"
                                        value={formData.year_of_study}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                    {errors.year_of_study && (
                                        <p className="mt-1 text-sm text-red-600">{errors.year_of_study[0]}</p>
                                    )}
                                </div>
                            )}

                            {/* Password */}
                            <div className="mb-4">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-500 italic ${errors.password
                                        ? 'border-red-500 focus:ring-red-400'
                                        : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                    required
                                />
                                {/* ← ONLY show error message, NO helper text */}
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-6">
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 italic"
                                    required
                                />
                                {formData.password && formData.password_confirmation && (
                                    <p className={`mt-1 text-xs ${formData.password === formData.password_confirmation
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                        }`}>
                                        {formData.password === formData.password_confirmation
                                            ? '✓ Passwords match'
                                            : '✗ Passwords do not match'}
                                    </p>
                                )}
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
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}