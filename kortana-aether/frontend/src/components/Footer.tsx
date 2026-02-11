'use client';

import React from 'react';
import Link from 'next/link';
import { LogoText } from './Logo';

export const Footer = () => {
    const sections = [
        {
            title: "Marketplace",
            items: [
                { name: "Browse Properties", href: "/marketplace" },
                { name: "Golden Visa Opportunities", href: "/golden-visa" },
                { name: "Sell Tokens", href: "/sell" }
            ]
        },
        {
            title: "Company",
            items: [
                { name: "About Us", href: "/about" },
                { name: "How it Works", href: "/how-it-works" },
                { name: "Careers", href: "/careers" }
            ]
        },
        {
            title: "Security & Legal",
            items: [
                { name: "Terms of Service", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "KYC Guidelines", href: "/kyc" }
            ]
        },
        {
            title: "Connect",
            items: [
                { name: "Twitter", href: "#" },
                { name: "LinkedIn", href: "#" },
                { name: "Discord", href: "#" }
            ]
        }
    ];

    return (
        <footer className="bg-[#0A1929] text-white py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <div className="mb-6">
                            <LogoText isLightMode={false} />
                        </div>
                        <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
                            Real estate investment reimagined on the Kortana blockchain.
                            Secure, transparent, and built for global investors seeking fractional
                            ownership in premium properties.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg text-white">Marketplace</h4>
                        <ul className="space-y-2">
                            <li><Link href="/marketplace" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">Browse Properties</Link></li>
                            <li><Link href="/golden-visa" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">Golden Visa</Link></li>
                            <li><Link href="/sell" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">Sell Tokens</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg text-white">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/how-it-works" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">How it Works</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">FAQ & Support</Link></li>
                            <li><a href="mailto:support@aether.finance" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg text-white">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/terms" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-[#DC143C] transition-colors text-sm">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© 2026 AETHER Platform. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <span>Powered by Kortana Blockchain</span>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse"></span>
                            <span>System Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
