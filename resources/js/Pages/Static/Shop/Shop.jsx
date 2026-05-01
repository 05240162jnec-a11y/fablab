import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Footer';

export default function Shop() {
    // Product data array
    const products = [
        { id: 1, name: 'Jangchub Chorten 8 -Inch', price: 2000, image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=300', sale: false },
        { id: 2, name: 'Birch Plywood Mobile stand', price: 150, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 3, name: 'Accessories tray', price: 200, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=300', sale: false },
        { id: 4, name: 'Janghuk Chorten 9-Inch', price: 299, originalPrice: 299, image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=300', sale: false },
        { id: 5, name: 'HAIR CLIPS 2', price: 165, originalPrice: 259, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: true, discount: 36 },
        { id: 6, name: 'Birch Plywood Mobile stand', price: 150, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 7, name: 'Mini-wood container', price: 100, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=300', sale: false },
        { id: 8, name: 'Mini-chorten', price: 200, image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=300', sale: false },
        { id: 9, name: 'Janghuk Chorten 9-Inch', price: 50, originalPrice: 80, image: 'https://images.unsplash.com/photo-1610701596007-115028416c7a?auto=format&fit=crop&w=300', sale: true, discount: 38 },
        { id: 10, name: 'Accessories tray', price: 56, originalPrice: 60, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=300', sale: true, discount: 7 },
        { id: 11, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 12, name: 'Banchharam\'s Kesar Bhog 1 kg', price: 230, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=300', sale: false },
        { id: 13, name: 'Banchharam\'s Kesar Bhog 1 kg', price: 230, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=300', sale: false },
        { id: 14, name: 'Banchharam\'s Kesar Bhog 1 kg', price: 230, image: 'https://images.unsplash.com/photo-1513549557204-16188c958d25?auto=format&fit=crop&w=300', sale: false },
        { id: 15, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 16, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 17, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 18, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 19, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 20, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 21, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
        { id: 22, name: 'Cadbury Dairy Milk Crispello...', price: 40, image: 'https://images.unsplash.com/photo-1512499617640-c2f999098e95?auto=format&fit=crop&w=300', sale: false },
    ];

    // Cart state
    const [cartItems, setCartItems] = useState([]);

    // Add to cart function
    const addToCart = (product) => {
        setCartItems([...cartItems, product]);
        alert(`${product.name} added to cart!`);
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
                            <a href="/shop" className="text-gray-800 font-medium hover:text-blue-600 transition">Shop now</a>
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

            {/* Our Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-8">OUR PRODUCTS</h1>
                        
                        {/* Banner Image */}
                        <div className="relative">
                            <img 
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200" 
                                alt="JNEC Fab Lab Products" 
                                className="w-full h-96 object-cover rounded-lg shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Best Selling Products */}
                    <div className="mt-16">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Best Selling Products</h2>
                            <a href="#" className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition">
                                View All
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                </svg>
                            </a>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {products.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="relative">
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-full h-48 object-cover"
                                        />
                                        
                                        {/* Sale Badge */}
                                        {product.sale && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                -{product.discount}%
                                            </div>
                                        )}
                                        
                                        {/* Wishlist Heart */}
                                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Price */}
                                        <div className="mb-3">
                                            {product.sale ? (
                                                <div>
                                                    <span className="text-lg font-bold text-gray-800">Nu. {product.price}</span>
                                                    <span className="text-sm text-gray-500 line-through ml-2">Nu. {product.originalPrice}</span>
                                                </div>
                                            ) : (
                                                <span className="text-lg font-bold text-gray-800">Nu. {product.price}</span>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}