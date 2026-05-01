import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function About() {
    // Team members data
    const teamMembers = [
        { id: 1, name: 'Pema Wangchug', role: 'Associate Director (DRIVE/SFL)', image: 'silhouette' },
        { id: 2, name: 'Tshering Wangzom', role: 'Senior Analyst (SFL)', image: 'silhouette' },
        { id: 3, name: 'Chirag Sharma', role: 'Senior Analyst (DRIVE)', image: 'silhouette' },
        { id: 4, name: 'Nirpa Raj Dangal', role: 'Associate Analyst (DRIVE)', image: 'silhouette' },
        { id: 5, name: 'Uzal Chhetri', role: 'Associate Analyst (DRIVE)', image: 'silhouette' },
        { id: 6, name: 'Thinley Jamtsho', role: 'Associate Analyst (DRIVE)', image: 'silhouette' },
        { id: 7, name: 'Subham Chhetri', role: 'Associate Analyst (DRIVE)', image: 'silhouette' },
        { id: 8, name: 'Lhendup Dorji', role: 'Associate Analyst (DRIVE)', image: 'silhouette' },
    ];

    // Filter state
    const [activeFilter, setActiveFilter] = useState('ALL');

    return (
        <div className="min-h-screen bg-gray-100">
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
                            <a href="/training" className="text-gray-600 hover:text-blue-600 transition">Training</a>
                            <a href="/projects" className="text-gray-600 hover:text-blue-600 transition">Projects</a>
                            <a href="/about" className="text-gray-800 font-medium hover:text-blue-600 transition">About Us</a>
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

            {/* Hero Section */}
            <section className="relative py-20 bg-gray-300">
                <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{
                    backgroundImage: "url('/images/fablab-bg.jpg')"
                }}>
                    <div className="absolute inset-0 bg-white bg-opacity-30"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">About JNEC Fab Lab</h1>
                    <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
                        Empowering students to innovate, design, and build real-world projects using digital fabrication technologies.
                    </p>
                    <button className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-8 rounded-lg transition duration-200">
                        Explore more
                    </button>
                </div>
            </section>

            {/* JNEC Fab Lab Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-blue-400 mb-6">JNEC Fab Lab?</h2>
                    <p className="text-gray-700 leading-relaxed max-w-5xl">
                        The JNEC Fab Lab is a digital fabrication laboratory equipped with advanced tools such as 3D printers, laser cutters, CNC machines, and electronics workstations. It provides students, faculty, and innovators with a space to transform creative ideas into real prototypes.
                    </p>
                </div>
            </section>

            {/* What Our System Provides */}
            <section className="py-16 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-blue-400 text-center mb-12">What Our System Provides</h2>
                    
                    <div className="grid md:grid-cols-5 gap-4">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                            <div className="text-center mb-4">
                                <svg className="w-10 h-10 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">Inventory Management</h3>
                            <p className="text-xs text-gray-600 text-center">Track consumables and tools used in the Fab Lab.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                            <div className="text-center mb-4">
                                <svg className="w-10 h-10 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">Machine Booking</h3>
                            <p className="text-xs text-gray-600 text-center">Reserve machines and equipment easily.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                            <div className="text-center mb-4">
                                <svg className="w-10 h-10 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">Course Registration</h3>
                            <p className="text-xs text-gray-600 text-center">Register for training programs offered by the Fab Lab.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                            <div className="text-center mb-4">
                                <svg className="w-10 h-10 text-pink-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">Project Showcase</h3>
                            <p className="text-xs text-gray-600 text-center">Explore innovative projects created by students.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                            <div className="text-center mb-4">
                                <svg className="w-10 h-10 text-purple-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">Lab Analytics</h3>
                            <p className="text-xs text-gray-600 text-center">Visualize lab usage and machine statistics.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fab Lab Facilities */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-blue-400 text-center mb-12">Fab Lab Facilities</h2>
                    
                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Facility 1 */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="https://images.unsplash.com/photo-1631541909061-71e349d1f203?auto=format&fit=crop&w=300" 
                                alt="3D Printing" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-semibold text-gray-800">3D Printing</h3>
                            </div>
                        </div>

                        {/* Facility 2 */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300" 
                                alt="Laser Cutting" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-semibold text-gray-800">Laser Cutting</h3>
                            </div>
                        </div>

                        {/* Facility 3 */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="https://images.unsplash.com/photo-1565439398533-3171847f0a6e?auto=format&fit=crop&w=300" 
                                alt="CNC Machining" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-semibold text-gray-800">CNC Machining</h3>
                            </div>
                        </div>

                        {/* Facility 4 */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300" 
                                alt="Electronics Lab" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-semibold text-gray-800">Electronics Lab</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Mission */}
                        <div className="bg-white rounded-lg p-8 shadow-md">
                            <h3 className="text-lg font-semibold text-blue-400 text-center mb-4">Our Mission</h3>
                            <p className="text-gray-600 text-sm text-center">
                                To empower students and innovators by providing access to digital fabrication tools and enabling them to transform ideas into real-world solutions.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-white rounded-lg p-8 shadow-md">
                            <h3 className="text-lg font-semibold text-blue-400 text-center mb-4">Our Vision</h3>
                            <p className="text-gray-600 text-sm text-center">
                                To create a collaborative innovation hub where creativity, technology, and entrepreneurship thrive.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Our Team */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Meet <span className="text-blue-400">Our Team</span>
                        </h2>
                        
                        {/* Filter Buttons */}
                        <div className="flex justify-center space-x-4 mt-6">
                            <button 
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
                                    activeFilter === 'ALL' 
                                        ? 'bg-blue-400 text-white' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                ALL
                            </button>
                            <button 
                                onClick={() => setActiveFilter('SFL')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
                                    activeFilter === 'SFL' 
                                        ? 'bg-blue-400 text-white' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                SFL
                            </button>
                            <button 
                                onClick={() => setActiveFilter('DRIVE')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
                                    activeFilter === 'DRIVE' 
                                        ? 'bg-blue-400 text-white' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                DRIVE
                            </button>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                                {/* Profile Silhouette */}
                                <div className="bg-gray-200 p-6 flex justify-center">
                                    <svg className="w-32 h-32 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                </div>

                                {/* Member Info */}
                                <div className="p-4">
                                    <h3 className="text-base font-semibold text-gray-800 mb-1">{member.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{member.role}</p>
                                    <a href="#" className="text-blue-600 hover:text-blue-700 transition">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center space-x-2">
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition">Previous</button>
                        <button className="px-4 py-2 bg-blue-400 text-white rounded">1</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition">2</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition">3</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition">Next</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}