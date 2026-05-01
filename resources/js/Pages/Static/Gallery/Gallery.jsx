import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Gallery() {
    // Filter state
    const [activeFilter, setActiveFilter] = useState('All');

    // Gallery images data (placeholder - replace with actual images later)
    const galleryImages = [
        { id: 1, year: '2026', title: 'Gallery Image 1' },
        { id: 2, year: '2026', title: 'Gallery Image 2' },
        { id: 3, year: '2025', title: 'Gallery Image 3' },
        { id: 4, year: '2025', title: 'Gallery Image 4' },
        { id: 5, year: '2025', title: 'Gallery Image 5' },
        { id: 6, year: '2024', title: 'Gallery Image 6' },
        { id: 7, year: '2024', title: 'Gallery Image 7' },
        { id: 8, year: '2024', title: 'Gallery Image 8' },
        { id: 9, year: '2026', title: 'Gallery Image 9' },
        { id: 10, year: '2026', title: 'Gallery Image 10' },
        { id: 11, year: '2025', title: 'Gallery Image 11' },
        { id: 12, year: '2024', title: 'Gallery Image 12' },
    ];

    // Filter images based on selected year
    const filteredImages = activeFilter === 'All' 
        ? galleryImages 
        : galleryImages.filter(img => img.year === activeFilter);

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
                            <a href="/about" className="text-gray-600 hover:text-blue-600 transition">About Us</a>
                            <a href="/gallery" className="text-gray-800 font-medium hover:text-blue-600 transition">Gallery</a>
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
            <section className="relative py-16 bg-gray-300">
                <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{
                    backgroundImage: "url('/images/fablab-bg.jpg')"
                }}>
                    <div className="absolute inset-0 bg-white bg-opacity-30"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Fab Lab Gallery</h1>
                    <p className="text-lg text-white max-w-3xl mx-auto">
                        Photos of activities, workshops and projects in the Fab Lab.
                    </p>
                </div>
            </section>

            {/* Filter Buttons */}
            <section className="py-8 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center space-x-4">
                        {['All', '2026', '2025', '2024'].map((year) => (
                            <button
                                key={year}
                                onClick={() => setActiveFilter(year)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                    activeFilter === year
                                        ? 'bg-blue-400 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-12 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {filteredImages.map((image) => (
                            <div 
                                key={image.id} 
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 aspect-square flex items-center justify-center"
                            >
                                {/* Placeholder for actual images */}
                                <div className="text-center p-8">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p className="text-gray-500 text-sm">{image.title}</p>
                                    <p className="text-gray-400 text-xs mt-2">{image.year}</p>
                                </div>
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