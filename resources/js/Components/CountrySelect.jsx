import React, { useState, useRef, useEffect } from 'react';
import countries from '../data/countries';

export default function CountrySelect({ value, onChange, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Filter countries based on search
    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dial_code.includes(searchTerm)
    );

    // Get selected country
    const selectedCountry = countries.find(c => c.code === value) || countries[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Country Display */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full lg:w-48 px-4 py-3 border rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 ${error
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-gray-700 font-medium">
                        {selectedCountry.name} ({selectedCountry.dial_code})
                    </span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full lg:w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Country List */}
                    <div className="overflow-y-auto max-h-60">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                        onChange(country.code);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition ${value === country.code ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-800">{country.name}</div>
                                        <div className="text-sm text-gray-500">{country.dial_code}</div>
                                    </div>
                                    {value === country.code && (
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                No countries found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}