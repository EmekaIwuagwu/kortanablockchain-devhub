"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Globe, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

    return (
        <section ref={containerRef} className="relative min-h-[120vh] flex flex-col items-center justify-start pt-40 overflow-hidden bg-neutral-obsidian">

            {/* Background World - Ultra Premium Parallax Layering */}
            <motion.div style={{ y: y1, scale }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=3000&q=100')] bg-cover bg-center brightness-[0.7] saturate-[1.2]" />

                {/* Luxury Architectural Texture Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 3 }}
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3000&q=100')] bg-cover bg-fixed mix-blend-overlay opacity-30"
                />

                {/* Atmospheric Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-obsidian/40 via-transparent to-neutral-obsidian" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neutral-obsidian to-transparent" />
            </motion.div>

            {/* Main Content - Minimalist Luxury Power */}
            <motion.div
                style={{ opacity }}
                className="container mx-auto px-12 relative z-10 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 inline-flex items-center gap-6 px-10 py-4 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-3xl"
                >
                    <div className="flex -space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary-bright shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                        <div className="w-6 h-6 rounded-full bg-secondary-warm shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.6em] font-black text-white/80">The Sovereign City Protocol</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[12vw] md:text-[160px] font-display font-black leading-[0.75] tracking-[-0.06em] text-white mb-16"
                >
                    URBAN <br />
                    <span className="text-gradient-cyber px-4">SYNTHESIS.</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.8 }}
                    className="max-w-4xl mx-auto mb-20 space-y-8"
                >
                    <p className="text-body-l text-neutral-body/60 font-display font-medium tracking-[0.3em] uppercase leading-relaxed text-sm md:text-xl">
                        The world's first autonomous financial operating system <br />
                        for hyper-modern civilizations.
                    </p>
                    <div className="flex items-center justify-center gap-12 pt-6">
                        <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                            <Shield className="w-5 h-5 text-primary-bright" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Verified Governance</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                            <Zap className="w-5 h-5 text-secondary-warm" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Atomic Transfers</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                            <Globe className="w-5 h-5 text-success" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Global Settlement</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col md:flex-row items-center justify-center gap-10"
                >
                    <Link href="/dashboard" className="btn-luxury-gold min-w-[320px] text-lg shadow-[0_20px_50px_rgba(245,158,11,0.2)]">
                        Explore Metropolis Alpha
                    </Link>

                    <button className="btn-luxury min-w-[320px] group flex items-center justify-center gap-4">
                        Watch Architecture Film <Play className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
                    </button>
                </motion.div>
            </motion.div>

            {/* Floating UI Elements - Luxury Aesthetic Components */}
            <div className="absolute bottom-20 inset-x-20 flex justify-between items-end z-20 opacity-30 select-none pointer-events-none">
                <div className="flex flex-col gap-6 border-l border-white/10 pl-12 h-32 justify-center">
                    <span className="text-[9px] uppercase tracking-[0.5em] font-black text-white/40">Core Version</span>
                    <span className="text-4xl font-display font-black text-white/20">BN-OS 1.0</span>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                    <span className="text-[9px] uppercase tracking-[1em] font-black text-white/40 rotate-180 [writing-mode:vertical-lr]">Scroll For Intelligence</span>
                </div>

                <div className="flex flex-col gap-6 border-r border-white/10 pr-12 h-32 justify-center text-right">
                    <span className="text-[9px] uppercase tracking-[0.5em] font-black text-white/40">Network Status</span>
                    <span className="text-4xl font-display font-black text-white/20">K-MINTED</span>
                </div>
            </div>

            <div className="absolute inset-0 noise-overlay pointer-events-none" />
        </section>
    );
}
