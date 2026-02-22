'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import KortanaScene from '../3d/KortanaScene';
import { ArrowRight, Play, FileText, Users } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-space">
            {/* 3D Background */}
            <KortanaScene />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-space/50 to-deep-space z-0 pointer-events-none" />

            {/* Animated Nebula Overlay */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.2, 0.4],
                        x: [0, -40, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]"
                />

                {/* Extra floating radiant orbs */}
                <motion.div
                    animate={{ y: [0, -100, 0], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-1/2 left-10 w-2 h-2 bg-cyan-400 rounded-full blur-sm"
                />
                <motion.div
                    animate={{ y: [0, -150, 0], opacity: [0, 0.2, 0] }}
                    transition={{ duration: 12, repeat: Infinity, delay: 2 }}
                    className="absolute bottom-1/4 right-20 w-3 h-3 bg-purple-400 rounded-full blur-sm"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                    <span className="text-sm font-medium text-cyan-300 tracking-wide uppercase">Mainnet Live · Chain ID 9002</span>
                </motion.div>

                {/* Main Headline */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-white drop-shadow-2xl"
                    >
                        KORTANA
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-300% animate-gradient"
                    >
                        BLOCKCHAIN
                    </motion.div>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-6 text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed"
                >
                    The <span className="text-white font-semibold">EVM-Compatible</span> Layer 1 built for high-frequency finance.
                    <br className="hidden md:block" />
                    <span className="text-cyan-400">2-second blocks</span> • <span className="text-purple-400">Sub-2s BFT finality</span> • <span className="text-neon-green">50,000+ TPS</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-12 flex flex-col sm:flex-row justify-center gap-6"
                >
                    <button
                        onClick={async () => {
                            const { connectWallet } = await import('@/lib/wallet');
                            await connectWallet();
                        }}
                        className="group relative px-8 py-4 bg-white text-deep-space rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">Launch App <Play size={18} fill="currentColor" /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>

                    <Link
                        href="/docs"
                        className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
                    >
                        <FileText size={18} /> Documentation
                    </Link>

                    <Link
                        href="/community"
                        className="px-8 py-4 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Users size={18} /> Community
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-1 h-3 bg-cyan-400 rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
}
