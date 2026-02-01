'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, ChevronDown, ExternalLink, Github, Twitter, Book } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const navLinks = [
    { name: 'Technology', href: '/technology' },
    { name: 'Ecosystem', href: '/ecosystem' },
    { name: 'Developers', href: '/developers', hasDropdown: true },
    { name: 'Community', href: '/community' },
    { name: 'Blog', href: '/blog' },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                    scrolled ? 'py-4' : 'py-6'
                )}
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div
                        className={cn(
                            'rounded-full border transition-all duration-500 flex items-center justify-between px-6',
                            scrolled
                                ? 'bg-black/40 backdrop-blur-xl border-white/10 h-16 shadow-2xl shadow-purple-500/5'
                                : 'bg-transparent border-transparent h-20'
                        )}
                    >
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 transition-transform duration-500 group-hover:rotate-[360deg]">
                                <img src="/logo.svg" alt="Kortana Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter text-white uppercase hidden sm:block">
                                KORTANA
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors uppercase tracking-widest hover:bg-white/5 rounded-full"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block">
                                <ConnectButton
                                    accountStatus="avatar"
                                    chainStatus="none"
                                    showBalance={false}
                                />
                            </div>

                            <button
                                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white border border-white/10"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-4 top-24 z-40 lg:hidden"
                    >
                        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6">
                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-bold text-white/50 hover:text-white px-4 py-3 hover:bg-white/5 rounded-xl transition-all uppercase tracking-wider flex items-center justify-between"
                                    >
                                        {link.name}
                                        <ChevronDown size={16} className="-rotate-90 opacity-0" />
                                    </Link>
                                ))}
                            </nav>

                            <div className="h-px bg-white/10" />

                            <div className="flex flex-col gap-4">
                                <ConnectButton className="w-full" />
                                <div className="grid grid-cols-3 gap-2">
                                    <SocialButton icon={Github} href="https://github.com/EmekaIwuagwu/kortanablockchain-devhub" />
                                    <SocialButton icon={Twitter} href="#" />
                                    <SocialButton icon={Book} href="/docs" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

function SocialButton({ icon: Icon, href }: { icon: any; href: string }) {
    return (
        <Link
            href={href}
            target="_blank"
            className="h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
        >
            <Icon size={20} />
        </Link>
    )
}
