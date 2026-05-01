import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Machines() {
    // Machine data array (you can move this to a separate file later)
    const machines = [
        {
            id: 1,
            name: 'Prusa FDM 3D Printer',
            description: 'An FDM (Fused Deposition Modeling) 3D printer builds objects layer by layer by extruding melted thermoplastic filament through a heated nozzle.',
            image: '../images/Persua FDM 3D Printer.webp'
        },
        {
            id: 2,
            name: 'Zund g3 cutting machine',
            description: 'The G3 Cutter is a precision machine, meticulously engineered with perfectly coordinated components from the innovative drive system.',
            image: '../images/3D-Printer.avif'
        },
        {
            id: 3,
            name: 'Trotec Speedy 100',
            description: 'The Trotec Speedy 100 is a versatile and powerful laser engraving and cutting machine designed for a wide range of applications.',
            image: '../images/Trotec Speedy 100.png'
        },
        {
            id: 4,
            name: 'Trotec Speedy 400',
            description: 'The Trotec Speedy 400 is a cutting-edge laser engraving and cutting machine that offers unparalleled precision and versatility.',
            image: '../images/Trotec Speedy 400.png'
        },
        {
            id: 5,
            name: 'Omax Water Jet Cutter',
            description: 'The OMAX Water Jet Cutter is a state-of-the-art cutting solution renowned for its precision, versatility, and efficiency.',
            image: '../images/Prusa FDM 3D Printer.webp'
        },
        {
            id: 6,
            name: 'Mechatronika Pick and Place',
            description: 'The Mechatronika Pick and Place Machine is a cutting-edge solution designed for high-speed, high-precision electronic assembly.',
            image: '../images/Zund g3 cutting machine.jpg'
        },
        {
            id: 7,
            name: 'V-Scope 3D Scanner',
            description: 'High-precision 3D scanning system for reverse engineering and quality inspection applications.',
            image: '../images/Prusa FDM 3D Printer.webp'
        },
        {
            id: 8,
            name: 'Tai Lathe Machine',
            description: 'A high-precision CNC lathe, perfect for model construction, training, and small-batch productions.',
            image: '../images/Trotec Speedy 400.png'
        },
        {
            id: 9,
            name: 'Form Labs Resin 3D printer',
            description: 'Formlabs Resin 3D Printers are industry-leading devices renowned for their precision, reliability, and ease of use.',
            image: '../images/Zund g3 cutting machine.jpg'
        },
        {
            id: 10,
            name: 'ShopBot CNC Machine',
            description: 'The ShopBot CNC Machine is a versatile and powerful tool designed to meet the diverse needs of makers and professionals.',
            image: '../images/Prusa FDM 3D Printer.webp'
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
                            <a href="/machines" className="text-gray-800 font-medium hover:text-blue-600 transition">Machines</a>
                            <a href="/shop" className="text-gray-600 hover:text-blue-600 transition">Shop now</a>
                            <a href="/training" className="text-gray-600 hover:text-blue-600 transition">Training</a>
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

            {/* Our Machines Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">OUR MACHINES</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            State-of-the-art equipment for digital fabrication
                        </p>
                    </div>

                    {/* Machines Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {machines.map((machine) => (
                            <div 
                                key={machine.id} 
                                className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
                            >
                                {/* Machine Image */}
                                <div className="bg-white p-6">
                                    <img 
                                        src={machine.image} 
                                        alt={machine.name} 
                                        className="w-full h-48 object-contain"
                                    />
                                </div>

                                {/* Machine Info */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                        {machine.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {machine.description}
                                    </p>
                                    
                                    {/* Read More Link */}
                                    <a 
                                        href="#" 
                                        className="text-orange-600 font-medium text-sm hover:text-orange-700 transition block mb-4"
                                    >
                                        Read More
                                    </a>

                                    {/* Book Button */}
                                    <button className="w-full bg-white border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200">
                                        Book
                                    </button>
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