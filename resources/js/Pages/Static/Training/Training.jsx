import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Training() {
    // Course data array
    const courses = [
        {
            id: 1,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00-16:00',
            seats: 2,
            status: 'Open'
        },
        {
            id: 2,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00-16:00',
            seats: 2,
            status: 'Open'
        },
        {
            id: 3,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00-16:00',
            seats: 2,
            status: 'Open'
        },
        {
            id: 4,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00-16:00',
            seats: 2,
            status: 'Open'
        },
        {
            id: 5,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00-16:00',
            seats: 2,
            status: 'Open'
        },
        {
            id: 6,
            title: 'CNC Machining Fundamentals',
            instructor: 'Mr. Dorji Gyeltshen',
            description: 'Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.',
            duration: '6 weeks',
            schedule: 'Tue & Thu, 14:00-16:00',
            seats: 2,
            status: 'Open'
        }
    ];

    // Enrollment handler
    const handleEnroll = (courseId) => {
        alert(`Enrollment initiated for course ID: ${courseId}\nPlease login to complete enrollment.`);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center">
                            <img 
                                src="/images/logo.png" 
                                alt="JNEC FABLAB Logo" 
                                className="w-12 h-12 object-contain"
                            />
                            <div className="ml-3">
                                <span className="block text-lg font-bold text-gray-800">JNEC Fab Lab</span>
                                <span className="block text-xs text-gray-500">Fabrication Laboratory</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-6">
                            <a href="/" className="text-gray-600 hover:text-blue-600 transition">Home</a>
                            <a href="/machines" className="text-gray-600 hover:text-blue-600 transition">Machines</a>
                            <a href="/shop" className="text-gray-600 hover:text-blue-600 transition">Shop now</a>
                            <a href="/training" className="text-gray-800 font-medium hover:text-blue-600 transition">Training</a>
                            <a href="/projects" className="text-gray-600 hover:text-blue-600 transition">Projects</a>
                            <a href="/about" className="text-gray-600 hover:text-blue-600 transition">About Us</a>
                            <a href="/gallery" className="text-gray-600 hover:text-blue-600 transition">Gallery</a>
                            <a href="/faq" className="text-gray-600 hover:text-blue-600 transition">FAQ</a>
                        </div>

                        {/* Login Button */}
                        <div>
                            <Link 
                                to="/login" 
                                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Training Courses Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">Training Courses</h1>
                        <p className="text-lg text-gray-600 max-w-4xl">
                            Build essential skills with hands-on training from experienced instructors. 
                            Courses cover everything from 3D printing to electronics. Log in to enroll.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-gray-200 rounded-lg p-6 mb-12">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-12 h-12 text-blue-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">New to the Fab Lab?</h3>
                                    <p className="text-gray-600 text-sm">
                                        All first-time users must complete a safety orientation before enrolling in courses.
                                    </p>
                                </div>
                            </div>
                            <button className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200">
                                Learn more
                            </button>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {courses.map((course) => (
                            <div 
                                key={course.id} 
                                className="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition duration-300"
                            >
                                {/* Status Badge */}
                                <div className="inline-block bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                                    {course.status}
                                </div>

                                {/* Course Title */}
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {course.title}
                                </h3>

                                {/* Instructor */}
                                <p className="text-gray-600 mb-4">{course.instructor}</p>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-6">
                                    {course.description}
                                </p>

                                {/* Course Details */}
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                                    <span>{course.duration}</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {course.schedule}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                        {course.seats} seats left
                                    </span>
                                </div>

                                {/* Enroll Button */}
                                <button 
                                    onClick={() => handleEnroll(course.id)}
                                    className={`w-full py-3 px-6 rounded-lg font-medium transition duration-200 ${
                                        course.id === 6 
                                            ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                                            : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'
                                    }`}
                                >
                                    Enroll now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}