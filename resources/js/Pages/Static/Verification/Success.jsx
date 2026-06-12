import React from 'react';
import { Link } from 'react-router-dom';

export default function VerificationSuccess() {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 32px 80px rgba(0,0,0,.12)', padding: '3rem 2.5rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(22,163,74,.3)' }}>
                    <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, color: '#0d1117', marginBottom: '.5rem', letterSpacing: '-.02em' }}>Email Verified!</h1>
                <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.7, marginBottom: '2rem' }}>
                    Your email has been successfully verified. You can now log in and access all features of JNEC Fab Lab.
                </p>
                <Link to="/login" style={{ display: 'inline-block', background: '#1a56db', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '.9rem 2.5rem', borderRadius: '9999px', textDecoration: 'none', boxShadow: '0 8px 32px rgba(26,86,219,.35)', transition: 'all .3s' }}>
                    Login Now →
                </Link>
                <p style={{ marginTop: '1.5rem', fontSize: '.85rem', color: '#94a3b8' }}>
                    <a href="/" style={{ color: '#1a56db', textDecoration: 'none' }}>← Back to Home</a>
                </p>
            </div>
        </div>
    );
}