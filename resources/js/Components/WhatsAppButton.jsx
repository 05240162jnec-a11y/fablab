import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Simple in-module cache so we don't refetch the FabLab number on every render across pages
let cachedNumber = null;

// Maps a country_code (e.g. 'BT') to its dialing code (e.g. '975') - mirrors backend Setting::getDialingCode
const DIALING_CODES = { BT: '975', IN: '91', US: '1', GB: '44' };

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 32 32" fill="white" className="w-[60%] h-[60%]">
            <path d="M16.001 3C9.038 3 3.4 8.638 3.4 15.601c0 2.49.652 4.84 1.886 6.908L3 29l6.687-2.243a12.55 12.55 0 0 0 6.314 1.708h.005c6.963 0 12.601-5.638 12.601-12.601C28.607 8.901 22.97 3.263 16.007 3.263l-.006-.263Zm0 23.07h-.004a10.46 10.46 0 0 1-5.336-1.462l-.383-.227-3.967 1.331 1.353-3.866-.25-.397a10.448 10.448 0 0 1-1.602-5.55c0-5.776 4.703-10.479 10.493-10.479 2.803 0 5.435 1.092 7.415 3.075a10.42 10.42 0 0 1 3.07 7.417c-.002 5.776-4.706 10.158-10.789 10.158Zm5.747-7.834c-.315-.158-1.863-.919-2.151-1.024-.289-.105-.499-.158-.709.158-.21.315-.812 1.024-.995 1.234-.183.21-.367.236-.682.079-.315-.158-1.33-.49-2.534-1.563-.937-.836-1.569-1.869-1.752-2.184-.183-.315-.02-.485.138-.642.142-.142.315-.367.473-.551.157-.184.21-.315.315-.525.105-.21.052-.394-.026-.552-.079-.158-.709-1.708-.971-2.339-.256-.615-.516-.532-.709-.542-.184-.009-.394-.011-.604-.011-.21 0-.552.079-.841.394-.289.315-1.103 1.078-1.103 2.629 0 1.551 1.129 3.05 1.286 3.26.158.21 2.222 3.392 5.385 4.757.752.325 1.339.52 1.796.665.755.24 1.443.206 1.987.125.606-.09 1.863-.762 2.126-1.498.262-.736.262-1.367.184-1.498-.079-.131-.289-.21-.604-.367Z" />
        </svg>
    );
}

export default function WhatsAppButton({ message, size = 'md', className = '', phone = null, countryCode = null }) {
    const [fablabNumber, setFablabNumber] = useState(cachedNumber);

    useEffect(() => {
        if (phone) return;
        if (cachedNumber) return;
        axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/settings/whatsapp-number`)
            .then(res => {
                if (res.data?.success && res.data?.number) {
                    cachedNumber = res.data.number;
                    setFablabNumber(res.data.number);
                }
            })
            .catch(err => console.error('Failed to load WhatsApp number:', err));
    }, [phone]);

    const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };

    if (phone !== null || countryCode !== null) {
        const cleanPhone = (phone || '').replace(/^0+/, '');
        const dialCode = DIALING_CODES[countryCode] || '975';
        const isValid = cleanPhone && /^\d{6,15}$/.test(cleanPhone);

        if (!isValid) {
            return (
                <div title="No phone number on file" className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-gray-300 rounded-full shadow-sm flex-shrink-0 cursor-not-allowed ${className}`}>
                    <WhatsAppIcon />
                </div>
            );
        }

        const fullNumber = `${dialCode}${cleanPhone}`;
        const customerHref = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message || '')}`;

        return (
            <a href={customerHref} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Contact customer on WhatsApp" className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-green-500 hover:bg-green-600 rounded-full shadow-sm hover:shadow-md transition-all flex-shrink-0 ${className}`}>
                <WhatsAppIcon />
            </a>
        );
    }

    if (!fablabNumber) return null;

    const fablabHref = `https://wa.me/${fablabNumber}?text=${encodeURIComponent(message || '')}`;

    return (
        <a href={fablabHref} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Contact FabLab on WhatsApp" className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-green-500 hover:bg-green-600 rounded-full shadow-sm hover:shadow-md transition-all flex-shrink-0 ${className}`}>
            <WhatsAppIcon />
        </a>
    );
}