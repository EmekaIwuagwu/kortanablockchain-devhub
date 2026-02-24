"use client";

import { motion } from 'framer-motion';
import { Ship, ArrowRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative pt-20 pb-12 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-indigo-600/20 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Presale Phase 1 is Live
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-8xl font-black text-white mb-6 font-space tracking-tight leading-[1.1]"
                >
                    Join the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Kortana</span> <br /> Revolution
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Secure your position in the next generation of industrial-grade Layer 1.
                    Limited allocation. Tiered discounts. Community-centric scaling.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group px-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:bg-indigo-700 transition flex items-center gap-2 shadow-2xl shadow-indigo-600/20"
                    >
                        Start Registration <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </button>
                    <a
                        href="/docs/tokenomics"
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:bg-white/10 transition"
                    >
                        View Tokenomics
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
