import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ── Navigation Bar ── */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20">

                        {/* Logo */}
                        <a href="/" className="flex items-center flex-shrink-0">
                            <img
                                src="/images/logo.png"
                                alt="JNEC FABLAB Logo"
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                            />
                            <div className="ml-3">
                                <span className="block text-base sm:text-lg font-bold text-gray-800 leading-tight">JNEC Fab Lab</span>
                                <span className="block text-xs text-gray-500">Fabrication Laboratory</span>
                            </div>
                        </a>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center space-x-5 xl:space-x-6">
                            <a href="/" className="text-gray-600 hover:text-blue-600 transition text-sm">Home</a>
                            <a href="/machines" className="text-gray-600 hover:text-blue-600 transition text-sm">Machines</a>
                            <a href="/shop" className="text-gray-600 hover:text-blue-600 transition text-sm">Shop</a>
                            <a href="/training" className="text-gray-600 hover:text-blue-600 transition text-sm">Training</a>
                            <a href="/projects" className="text-gray-600 hover:text-blue-600 transition text-sm">Projects</a>
                            <a href="/about" className="text-gray-600 hover:text-blue-600 transition text-sm">About Us</a>
                            <a href="/gallery" className="text-gray-600 hover:text-blue-600 transition text-sm">Gallery</a>
                            <a href="/faq" className="text-gray-600 hover:text-blue-600 transition text-sm">FAQ</a>
                        </div>

                        {/* Right: Login + Hamburger */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-1.5 px-4 sm:py-2 sm:px-6 rounded-lg transition duration-200 text-sm whitespace-nowrap"
                            >
                                Login
                            </Link>
                            {/* Hamburger — visible below lg */}
                            <button
                                className="lg:hidden flex flex-col justify-center gap-1.5 w-9 h-9 p-1.5 rounded-md hover:bg-gray-100 transition"
                                onClick={() => setMenuOpen(o => !o)}
                                aria-label="Toggle menu"
                                aria-expanded={menuOpen}
                            >
                                <span className={`block w-full h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                                <span className={`block w-full h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                                <span className={`block w-full h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {menuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1 shadow-lg">
                        {[
                            ['Home', '/'],
                            ['Machines', '/machines'],
                            ['Shop', '/shop'],
                            ['Training', '/training'],
                            ['Projects', '/projects'],
                            ['About Us', '/about'],
                            ['Gallery', '/gallery'],
                            ['FAQ', '/faq'],
                        ].map(([label, href]) => (
                            <a
                                key={label}
                                href={href}
                                className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
                                onClick={() => setMenuOpen(false)}
                            >
                                {label}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            className="mt-2 block text-center bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition"
                            onClick={() => setMenuOpen(false)}
                        >
                            Login / Register
                        </Link>
                    </div>
                )}
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative py-12 sm:py-16 bg-gray-300">
                <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{
                    backgroundImage: "url('/images/fablab-bg.jpg')"
                }}>
                    <div className="absolute inset-0 bg-white bg-opacity-50"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Contact Us</h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* ── Contact Info Cards + Form ── */}
            <section className="py-12 sm:py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Info Cards — 1 col on mobile, 3 on md+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 sm:mb-16">

                        {/* Location */}
                        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center hover:shadow-lg transition duration-300">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Our Location</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Fab Lab, JNEC Campus<br />
                                Dewathang, Samdrupjongkhar<br />
                                Bhutan
                            </p>
                        </div>

                        {/* Email */}
                        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center hover:shadow-lg transition duration-300">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Email Us</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                fablab@jnec.ac.in<br />
                                info@jnecfablab.edu.bt
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center hover:shadow-lg transition duration-300">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Call Us</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                +975 77653429<br />
                                +975 02-123456
                            </p>
                        </div>
                    </div>

                    {/* Form + Map — stacks on mobile, side by side on md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                        {/* Contact Form */}
                        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base" htmlFor="name">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base" htmlFor="email">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base" htmlFor="subject">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                        placeholder="How can we help?"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base" htmlFor="message">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                        placeholder="Tell us more about your inquiry..."
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 text-sm sm:text-base"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Map & Office Hours */}
                        <div className="space-y-6 sm:space-y-8">

                            {/* Map Placeholder */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-300 h-52 sm:h-64 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                                        </svg>
                                        <p className="text-gray-500 text-sm">Map Location</p>
                                        <p className="text-gray-400 text-xs">(Google Maps integration coming soon)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Office Hours */}
                            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Office Hours</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm sm:text-base">Monday - Friday</span>
                                        <span className="font-medium text-gray-800 text-sm sm:text-base">9:00 AM - 5:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm sm:text-base">Saturday</span>
                                        <span className="font-medium text-gray-800 text-sm sm:text-base">10:00 AM - 2:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm sm:text-base">Sunday</span>
                                        <span className="font-medium text-gray-500 text-sm sm:text-base">Closed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-blue-50 rounded-lg shadow-md p-6 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    {[
                                        ['Visit our FAQ page', '/faq'],
                                        ['Explore our machines', '/machines'],
                                        ['View training courses', '/training'],
                                    ].map(([label, href]) => (
                                        <li key={label}>
                                            <a href={href} className="text-blue-600 hover:text-blue-700 transition flex items-center text-sm sm:text-base">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                </svg>
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}