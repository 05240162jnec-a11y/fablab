import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function FAQ() {
    // Active category state
    const [activeCategory, setActiveCategory] = useState('All');
    
    // Search query state
    const [searchQuery, setSearchQuery] = useState('');
    
    // Expanded question state (accordion)
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    // FAQ data
    const faqData = [
        {
            id: 1,
            category: 'General',
            question: 'What is Fab Lab?',
            answer: 'Fab Lab is a digital fabrication laboratory with machines like 3D printers, laser cutters and CNC machines.'
        },
        {
            id: 2,
            category: 'Machines',
            question: 'How do I book a machines?',
            answer: 'Fab Lab is a digital fabrication laboratory with machines like 3D printers, laser cutters and CNC machines.'
        },
        {
            id: 3,
            category: 'Machines',
            question: 'What machines are available in the fab lab?',
            answer: 'The Fab Lab provides 3D printers, laser cutters, CNC machines and electronics tools.'
        },
        {
            id: 4,
            category: 'Projects',
            question: 'How can I upload my project?',
            answer: 'Go to the project showcase page and click upload project.'
        },
        {
            id: 5,
            category: 'System',
            question: 'How do I reset my password?',
            answer: 'Click the forgot password option on the login page.'
        },
    ];

    // Filter FAQs based on category and search
    const filteredFAQs = faqData.filter(faq => {
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Toggle accordion
    const toggleQuestion = (id) => {
        setExpandedQuestion(expandedQuestion === id ? null : id);
    };

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
                            <a href="/gallery" className="text-gray-600 hover:text-blue-600 transition">Gallery</a>
                            <a href="/faq" className="text-gray-800 font-medium hover:text-blue-600 transition">FAQ</a>
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
                    <div className="absolute inset-0 bg-white bg-opacity-50"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                        Find answers about Fab Lab machines, projects and system usage.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Categories Sidebar */}
                        <div className="md:w-1/4">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-blue-400 mb-6">Categories</h3>
                                <ul className="space-y-4">
                                    {['All', 'General', 'Machines', 'Projects', 'System'].map((category) => (
                                        <li key={category}>
                                            <button
                                                onClick={() => setActiveCategory(category)}
                                                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                                                    activeCategory === category
                                                        ? 'bg-blue-400 text-white font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {category}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* FAQ Items */}
                        <div className="md:w-3/4">
                            <div className="space-y-4">
                                {filteredFAQs.map((faq) => (
                                    <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        {/* Question (Clickable) */}
                                        <button
                                            onClick={() => toggleQuestion(faq.id)}
                                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition duration-200"
                                        >
                                            <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                                            <svg 
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                                    expandedQuestion === faq.id ? 'transform rotate-180' : ''
                                                }`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>

                                        {/* Answer (Expandable) */}
                                        {expandedQuestion === faq.id && (
                                            <div className="px-6 pb-4">
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-gray-600">{faq.answer}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* No Results Message */}
                            {filteredFAQs.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-gray-500 text-lg">No questions found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}