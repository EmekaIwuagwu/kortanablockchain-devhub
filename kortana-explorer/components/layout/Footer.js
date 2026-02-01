import React from 'react';
import Link from 'next/link';
import { Twitter, Github, MessageSquare, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="glass">
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="Kortana" style={{ height: '32px' }} />
                            <span className="font-heading" style={{ fontSize: '1.25rem' }}>KORTANA</span>
                        </div>
                        <p className="text-dim text-small" style={{ marginBottom: '1.5rem' }}>
                            The next generation high-performance blockchain for decentralized applications. Fast, secure, and scalable.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="footer-link"><Twitter size={20} /></a>
                            <a href="#" className="footer-link"><Github size={20} /></a>
                            <a href="#" className="footer-link"><MessageSquare size={20} /></a>
                            <a href="#" className="footer-link"><Globe size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Products</h4>
                        <Link href="#" className="footer-link">Blockchain Explorer</Link>
                        <Link href="#" className="footer-link">Dinar Wallet</Link>
                        <Link href="#" className="footer-link">DEX Aggregator</Link>
                        <Link href="#" className="footer-link">Governance</Link>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Resources</h4>
                        <Link href="#" className="footer-link">Documentation</Link>
                        <Link href="#" className="footer-link">Whitepaper</Link>
                        <Link href="#" className="footer-link">API Docs</Link>
                        <Link href="#" className="footer-link">Status</Link>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Company</h4>
                        <Link href="#" className="footer-link">About Us</Link>
                        <Link href="#" className="footer-link">Contact</Link>
                        <Link href="#" className="footer-link">Privacy Policy</Link>
                        <Link href="#" className="footer-link">Terms of Service</Link>
                    </div>
                </div>

                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <p className="text-dim text-small">
                        © {new Date().getFullYear()} Kortana Foundation. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
