'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LogoText } from './Logo';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { usePathname } from 'next/navigation';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { isConnected, address } = useAccount();
    const pathname = usePathname();

    useEffect(() => {
        if (isConnected && address) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 10000);
            return () => clearInterval(interval);
        }
    }, [isConnected, address]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages/unread-count?address=${address}`);
            const data = await response.json();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Determine default text color based on pathname (simplified logic)
    // Pages with dark heroes: /, /how-it-works, /property/[id]
    // Pages with light heroes: /marketplace, /portfolio, /golden-visa
    const isDarkHero = ['/', '/how-it-works'].includes(pathname) || pathname.startsWith('/property/');

    // Header state: 
    // If scrolled: Always white bg, black text
    // If not scrolled & dark hero: Transparent bg, white text
    // If not scrolled & light hero: Transparent bg, black text
    // But simplified: Light hero pages usually have white background, so transparent header needs black text.

    // Text Color Logic
    const isLightMode = scrolled || !isDarkHero;
    const textColorClass = isLightMode ? 'text-[#0A1929]' : 'text-white';
    const hoverColorClass = 'hover:text-[#DC143C]';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm'
                : 'bg-transparent border-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2 group">
                    <LogoText isLightMode={isLightMode} />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    {[
                        { name: 'Marketplace', href: '/marketplace' },
                        { name: 'How It Works', href: '/how-it-works' },
                        ...(isConnected ? [
                            { name: 'Portfolio', href: '/portfolio' },
                            { name: 'Golden Visa', href: '/golden-visa' },
                            { name: 'Messages', href: '/messages' }
                        ] : [])
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`font-medium text-sm tracking-wide transition-colors relative group flex items-center ${textColorClass} ${hoverColorClass}`}
                        >
                            {item.name}
                            {item.name === 'Messages' && unreadCount > 0 && (
                                <span className="ml-2 bg-[#DC143C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-[#DC143C]/20">
                                    {unreadCount}
                                </span>
                            )}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#DC143C] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    ))}

                    {/* RainbowKit Connect Button */}
                    <div className={`ml-6 pl-6 border-l ${isLightMode ? 'border-gray-200' : 'border-white/20'}`}>
                        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
                    </div>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className={`md:hidden p-2 rounded-lg transition-colors ${textColorClass} hover:bg-black/5`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed inset-0 top-[70px] bg-white z-40 px-6 py-8 space-y-8 overflow-y-auto"
                    >
                        <nav className="flex flex-col space-y-6">
                            <Link href="/marketplace" className="text-2xl font-bold text-[#0A1929]" onClick={() => setIsOpen(false)}>Marketplace</Link>
                            <Link href="/how-it-works" className="text-2xl font-bold text-[#0A1929]" onClick={() => setIsOpen(false)}>How It Works</Link>

                            {isConnected && (
                                <>
                                    <Link href="/portfolio" className="text-2xl font-bold text-[#0A1929]" onClick={() => setIsOpen(false)}>Portfolio</Link>
                                    <Link href="/golden-visa" className="text-2xl font-bold text-[#0A1929]" onClick={() => setIsOpen(false)}>Golden Visa</Link>
                                    <Link href="/messages" className="text-2xl font-bold text-[#0A1929] flex items-center justify-between" onClick={() => setIsOpen(false)}>
                                        Messages
                                        {unreadCount > 0 && (
                                            <span className="bg-[#DC143C] text-white text-xs font-black min-w-6 h-6 px-2 rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                        </nav>

                        <div className="pt-8 border-t border-gray-100">
                            <ConnectButton showBalance={false} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
