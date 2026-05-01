import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Home() {
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
                            <a href="/" className="text-gray-800 font-medium hover:text-blue-600 transition">Home</a>
                            <a href="/machines" className="text-gray-600 hover:text-blue-600 transition">Machines</a>
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

            {/* Hero Section */}
            <section className="relative py-20 bg-gray-100">
                <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{
                    backgroundImage: "url('/images/fablab-bg.jpg')"
                }}>
                    <div className="absolute inset-0 bg-white bg-opacity-70"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Welcome To JNEC Fab Lab
                    </h1>
                    <Link 
                        to="/register" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200"
                    >
                        Register Now!
                    </Link>
                </div>
            </section>

            {/* Our Machines Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">OUR MACHINES</h2>
                            <p className="text-gray-600">State-of-the-art equipment for digital fabrication</p>
                        </div>
                        <a href="/machines" className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition">
                            View All
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Machine Card 1 */}
                        <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="../images/3D-Printer.avif" 
                                alt="3D Printers" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="text-sm text-gray-500 mb-2">Aug 2, 2024</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">3D Printers</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Ultimaker S5 & Prusa i3 MK3S+ for rapid prototyping with PLA, ABS, and PETG filament...
                                </p>
                                <a href="#" className="text-blue-600 font-medium text-sm hover:text-blue-700 transition">Read More</a>
                            </div>
                        </div>

                        {/* Machine Card 2 */}
                        <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="../images/3D-Printer.avif" 
                                alt="Biomaterials" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="text-sm text-gray-500 mb-2">Aug 2, 2024</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Biomaterials in Manufacturing</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    The goal of this project is to create a recipe using the most ubiquitous biowastes in the lab...
                                </p>
                                <a href="#" className="text-blue-600 font-medium text-sm hover:text-blue-700 transition">Read More</a>
                            </div>
                        </div>

                        {/* Machine Card 3 */}
                        <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            <img 
                                src="../images/3D-Printer.avif" 
                                alt="Plastic Waste" 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="text-sm text-gray-500 mb-2">Aug 2, 2024</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Plastic Waste to Filaments</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    The goal of this project is to design a machine that will process plastic waste material...
                                </p>
                                <a href="#" className="text-blue-600 font-medium text-sm hover:text-blue-700 transition">Read More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Training Courses Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">UPCOMING TRAINING COURSES</h2>
                            <p className="text-gray-600">Hands-on training from experienced instructors</p>
                        </div>
                        <a href="/training" className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition">
                            View All
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                        </a>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Course Card 1 */}
                        <div className="bg-gray-200 rounded-2xl p-8 hover:shadow-lg transition duration-300">
                            <div className="inline-block bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">Open</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">CNC Machining Fundamentals</h3>
                            <p className="text-gray-600 mb-4">Mr. Dorji Gyeltshen</p>
                            <p className="text-gray-600 text-sm mb-6">
                                Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                                <span>6 weeks</span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    Tue & Thu, 14:00-16:00
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    2 seats left
                                </span>
                            </div>
                            <button className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow transition duration-200">
                                Enroll now
                            </button>
                        </div>

                        {/* Course Card 2 */}
                        <div className="bg-gray-200 rounded-2xl p-8 hover:shadow-lg transition duration-300">
                            <div className="inline-block bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">Open</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">CNC Machining Fundamentals</h3>
                            <p className="text-gray-600 mb-4">Mr. Dorji Gyeltshen</p>
                            <p className="text-gray-600 text-sm mb-6">
                                Comprehensive course on CNC routing, tool paths, G-code basics, and hands-on machining projects with various materials.
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                                <span>6 weeks</span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    Tue & Thu, 14:00-16:00
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    2 seats left
                                </span>
                            </div>
                            <button className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow transition duration-200">
                                Enroll now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Announcements Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Latest Announcements</h2>
                        <p className="text-gray-600">Stay updated with Fab Lab news</p>
                    </div>

                    <div className="space-y-6">
                        {/* Announcement 1 */}
                        <div className="bg-gray-100 rounded-xl p-6 hover:shadow-md transition duration-300">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Fab Lab Extended Hours During Project Season</h3>
                                    <p className="text-gray-600 text-sm">
                                        The Fab Lab will operate from 8:00 AM to 8:00 PM starting next week to support end-of-semester projects.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Announcement 2 */}
                        <div className="bg-gray-100 rounded-xl p-6 hover:shadow-md transition duration-300">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">New Laser Cutter Installed</h3>
                                    <p className="text-gray-600 text-sm">
                                        A new Trotec Speedy 100 has been installed in Lab B. Training sessions will be scheduled soon.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Announcement 3 */}
                        <div className="bg-gray-100 rounded-xl p-6 hover:shadow-md transition duration-300">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Safety Orientation - Every Monday</h3>
                                    <p className="text-gray-600 text-sm">
                                        Mandatory safety orientation sessions are held every Monday at 9:00 AM in Lab A for first-time users.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Services Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Our <span className="text-orange-500">Services</span>
                        </h2>
                        <p className="text-gray-600">Our team of experts is dedicated to help you achieve your real estate goals</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="text-center">
                            <img 
                                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300" 
                                alt="Custom Prototyping" 
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Prototyping</h3>
                            <p className="text-gray-600 text-sm">
                                Bring your ideas to life with our cutting-edge prototyping services. Whether it's a simple model or a complex design, we provide the tools and expertise to turn your concepts into reality.
                            </p>
                        </div>

                        {/* Service 2 */}
                        <div className="text-center">
                            <img 
                                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=300" 
                                alt="Workshops" 
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Workshops</h3>
                            <p className="text-gray-600 text-sm">
                                Unlock your potential with our hands-on workshops and expert-led training sessions. Learn the latest in fabrication technology, and gain the skills to build anything you can imagine.
                            </p>
                        </div>

                        {/* Service 3 */}
                        <div className="text-center">
                            <img 
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300" 
                                alt="Collaborative Projects" 
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Collaborative Projects</h3>
                            <p className="text-gray-600 text-sm">
                                Join a community of innovators and creators. Work alongside like-minded individuals and teams on exciting collaborative projects that push the boundaries of what's possible.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to start making?</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Sign up for an account to book machines, enroll in courses, submit projects, and place custom fabrication orders.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/register" 
                            className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-8 rounded-full transition duration-200"
                        >
                            Get Started
                        </Link>
                        <Link 
                            to="/contact" 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition duration-200"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}