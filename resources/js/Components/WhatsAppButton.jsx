import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Simple in-module cache so we don't refetch the number on every render across pages
let cachedNumber = null;

export default function WhatsAppButton({ message, size = 'md', className = '' }) {
    const [number, setNumber] = useState(cachedNumber);

    useEffect(() => {
        if (cachedNumber) return;
        axios.get(`${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}/settings/whatsapp-number`)
            .then(res => {
                if (res.data?.success && res.data?.number) {
                    cachedNumber = res.data.number;
                    setNumber(res.data.number);
                }
            })
            .catch(err => console.error('Failed to load WhatsApp number:', err));
    }, []);

    if (!number) return null;

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const href = `https://wa.me/${number}?text=${encodeURIComponent(message || '')}`;

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Contact FabLab on WhatsApp" className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-green-500 hover:bg-green-600 rounded-full shadow-sm hover:shadow-md transition-all flex-shrink-0 ${className}`}>
            <svg viewBox="0 0 24 24" fill="white" className="w-[55%] h-[55%]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.66 1.45 5.24L2 22l4.97-1.55a9.87 9.87 0 0 0 5.07 1.38h.01c5.46 0 9.9-4.45 9.91-9.92.01-2.65-1.02-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.78 15.7c-.24.69-1.41 1.32-1.94 1.4-.51.08-1.16.11-1.87-.12-.43-.14-.99-.33-1.7-.64-2.99-1.29-4.94-4.28-5.09-4.48-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.08.15.13.32.03.52-.1.2-.15.32-.3.49-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.81 2.03.96.3.15.5.22.57.35.08.13.08.74-.16 1.43z" />
            </svg>
        </a>
    );
}