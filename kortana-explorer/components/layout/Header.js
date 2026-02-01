'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Rocket, ChevronDown, Menu, X } from 'lucide-react';

const Header = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const navLinks = [
        { label: 'Home', href: '/' },
        {
            label: 'Blockchain',
            items: [
                { label: 'View Pending Txns', href: '/pending' },
                { label: 'Validators List', href: '/validators' },
            ]
        },
        {
            label: 'Tokens',
            items: [
                { label: 'Top Tokens', href: '#' },
                { label: 'Verified Contracts', href: '/verify' },
            ]
        },
        { label: 'Verify', href: '/verify' },
    ];

    return (
        <header className="glass">
            <div className="container flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Kortana" style={{ height: '40px' }} />
                    <span className="font-heading" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #9d4edd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        KORTANA
                    </span>
                </Link>

                <nav className="flex items-center" style={{ gap: '0.5rem' }}>
                    {navLinks.map((link, idx) => (
                        <div
                            key={idx}
                            style={{ position: 'relative' }}
                            onMouseEnter={() => link.items && setActiveDropdown(idx)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            {link.href ? (
                                <Link href={link.href} className="nav-link">
                                    {link.label}
                                </Link>
                            ) : (
                                <div className="nav-link cursor-pointer flex items-center gap-1">
                                    {link.label} <ChevronDown size={14} />
                                </div>
                            )}

                            {link.items && activeDropdown === idx && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    width: '220px',
                                    paddingTop: '10px',
                                    zIndex: 1000
                                }}>
                                    <div className="glass" style={{
                                        padding: '0.5rem',
                                        background: '#0b0118',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                    }}>
                                        {link.items.map((item, i) => (
                                            <Link
                                                key={i}
                                                href={item.href}
                                                className="nav-link"
                                                style={{ fontSize: '0.85rem', width: '100%', display: 'block' }}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <div style={{ marginLeft: '1rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                            <Rocket size={16} />
                            Launch App
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
