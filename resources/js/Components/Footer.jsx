import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-50 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <img
                                src="/images/logo.png"
                                alt="JNEC FABLAB Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-bold text-gray-800">JNEC Fab Lab</span>
                                <span className="block text-xs text-gray-500">Fabrication Laboratory</span>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            The JNEC Fabrication Lab provides access to digital fabrication tools and training for students, faculty, and the community.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/machines" className="text-gray-600 hover:text-gray-800 transition">Machines</a></li>
                            <li><a href="/training" className="text-gray-600 hover:text-gray-800 transition">Training</a></li>
                            <li><a href="/projects" className="text-gray-600 hover:text-gray-800 transition">Projects</a></li>
                            <li><a href="/gallery" className="text-gray-600 hover:text-gray-800 transition">Gallery</a></li>
                            <li><a href="/about" className="text-gray-600 hover:text-gray-800 transition">About</a></li>
                            <li><a href="/faq" className="text-gray-600 hover:text-gray-800 transition">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/faq" className="text-gray-600 hover:text-gray-800 transition">FAQ</a></li>
                            <li><a href="/contact" className="text-gray-600 hover:text-gray-800 transition">Contact Us</a></li>
                            <li><a href="/login" className="text-gray-600 hover:text-gray-800 transition">Login/Register</a></li>
                        </ul>
                    </div>

                    {/* Contact + Admin Link */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Fab Lab, JNEC Campus, Dewathang,</li>
                            <li>Samdrupjongkhar.</li>
                            <li className="mt-4">fablab.jnec@rub.edu.bt</li>
                            <li>+975 17789864</li>
                        </ul>

                        {/* ← ADMIN LOGIN LINK (Subtle) */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <Link
                                to="/admin/login"
                                className="text-xs text-gray-400 hover:text-gray-600 transition"
                            >
                                Staff Login →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-xs text-center md:text-left">
                            2026 JNEC Fab Lab, Jigme Namgyel Engineering College. All rights reserved.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}