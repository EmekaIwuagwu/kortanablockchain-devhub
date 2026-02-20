'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rocket, ChevronDown, Menu, X } from 'lucide-react';

const Header = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Home', href: '/' },
        {
            label: 'Blockchain',
            items: [
                { label: 'View Blocks', href: '/blocks' },
                { label: 'View Transactions', href: '/txs' },
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

    const handleLaunchApp = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // First, request account access to authorize the site
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                // Try to switch to the Kortana Testnet
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x11B3F' }], // 72511 in hex
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x11B3F',
                                    chainName: 'Kortana Testnet',
                                    nativeCurrency: {
                                        name: 'Dinari',
                                        symbol: 'DNR',
                                        decimals: 18,
                                    },
                                    rpcUrls: ['https://poseidon-rpc.kortana.worchsester.xyz'],
                                    blockExplorerUrls: ['https://explorer.kortana.worchsester.xyz'],
                                },
                            ],
                        });
                    } catch (addError) {
                        console.error('User rejected adding the network');
                    }
                }
                console.error('Failed to switch network:', switchError);
            }
        } else {
            alert('Please install MetaMask to launch the Kortana App!');
            window.open('https://metamask.io/download/', '_blank');
        }
    };

    return (
        <header className={`glass ${scrolled ? 'scrolled' : ''}`} style={{
            transition: 'all 0.3s ease',
            background: scrolled ? 'rgba(11, 1, 24, 0.8)' : 'var(--surface)',
            borderBottom: scrolled ? '1px solid var(--primary)' : '1px solid var(--border)'
        }}>
            <div className="container flex items-center justify-between" style={{ height: '100%' }}>
                <Link href="/" className="flex items-center gap-2 md:gap-3">
                    <img src="/logo.png" alt="Kortana" style={{ height: '32px' }} />
                    <span className="font-heading" style={{
                        fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(to right, #ffffff, #9d4edd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        KORTANA
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden-mobile items-center" style={{ gap: '0.5rem' }}>
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
                        {/* <button
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                            onClick={handleLaunchApp}
                        >
                            <Rocket size={16} />
                            Launch App
                        </button> */}
                    </div>
                </nav>
                
                <button
                    className="show-mobile btn"
                    style={{ padding: '0.5rem', background: 'transparent' }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '70px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(11, 1, 24, 0.98)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 999,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }} className="animate-fade-in">
                    {navLinks.map((link, idx) => (
                        <div key={idx}>
                            {link.href ? (
                                <Link
                                    href={link.href}
                                    className="nav-link"
                                    style={{ fontSize: '1.25rem', padding: '1rem 0' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <div>
                                    <div style={{ color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem' }}>
                                        {link.label}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                                        {link.items.map((item, i) => (
                                            <Link
                                                key={i}
                                                href={item.href}
                                                className="nav-link"
                                                style={{ fontSize: '1.1rem', padding: '0.5rem 0' }}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={{ marginTop: '2rem' }}>
                        {/* <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                            onClick={handleLaunchApp}
                        >
                            <Rocket size={20} />
                            Launch App
                        </button> */}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
