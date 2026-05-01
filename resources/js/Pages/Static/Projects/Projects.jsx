import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Projects() {
    // Project categories with their projects
    const categories = [
        {
            name: 'PCB-Fabrication',
            projects: [
                { id: 1, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 2, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 3, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 4, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
        {
            name: 'CNC Shopbot',
            projects: [
                { id: 5, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 6, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 7, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 8, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
        {
            name: 'Two Days Embedded Programming Training : Arduino',
            projects: [
                { id: 9, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 10, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 11, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 12, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        },
        {
            name: '3-D shopbot',
            projects: [
                { id: 13, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 14, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
                { id: 15, title: 'Prusa FDM 3D Printer', description: 'An FDM (Fused Deposition Modeling) builds objects layer by layer by extruding thermoplastic filament through a heated nozzle.' },
                { id: 16, title: 'Zund g3 cutting machine', description: 'The G3 Cutter is a precision machine engineered with perfectly coordinated components from the innovative drive system.' },
            ]
        }
    ];

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
                            <a href="/training" className="text-gray-600 hover:text-blue-600 transition">Training</a>
                            <a href="/projects" className="text-gray-800 font-medium hover:text-blue-600 transition">Projects</a>
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

            {/* Projects Center Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Projects Center</h1>
                    </div>

                    {/* Categories */}
                    {categories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-16">
                            {/* Category Title */}
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">{category.name}</h2>

                            {/* Projects Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {category.projects.map((project) => (
                                    <div 
                                        key={project.id} 
                                        className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
                                    >
                                        {/* Profile Silhouette */}
                                        <div className="bg-gray-200 p-6 flex justify-center">
                                            <svg className="w-32 h-32 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                            </svg>
                                        </div>

                                        {/* Project Info */}
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-gray-800 mb-2">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                {project.description}
                                            </p>

                                            {/* Buttons */}
                                            <div className="space-y-2">
                                                <button className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-medium py-2 px-4 rounded transition duration-200">
                                                    Documentation
                                                </button>
                                                <button className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-medium py-2 px-4 rounded transition duration-200">
                                                    Video
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}