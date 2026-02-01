'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Layers, Network, Zap, Shield, Cpu, ChevronRight, Share2, Globe, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function ArchitecturePage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Protocol Architecture"
                subtitle="High-fidelity 5-layer execution stack for industrial throughput."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-32">

                        {/* Section 1: Stack Overview */}
                        <section id="stack">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-12 flex items-center gap-3">
                                <Layers className="text-purple-400" /> The 5-Layer Stack
                            </h2>
                            <div className="space-y-6">
                                <LayerItem
                                    number="01"
                                    title="Solaris"
                                    desc="Optimized QUIC transport layer for block propagation and transaction gossip."
                                    color="cyan"
                                />
                                <LayerItem
                                    number="02"
                                    title="DPoH Timing"
                                    desc="Decouples timing from transaction processing via SHA-256 looping."
                                    color="purple"
                                />
                                <LayerItem
                                    number="03"
                                    title="Tower BFT"
                                    desc="A sub-second finality engine utilizing DPoH for ultra-low latency voting."
                                    color="neon"
                                />
                                <LayerItem
                                    number="04"
                                    title="Sealevel"
                                    desc="The world's first parallel smart contract runtime."
                                    color="blue"
                                />
                                <LayerItem
                                    number="05"
                                    title="Cloudbreak"
                                    desc="Horizontally scaled account database."
                                    color="pink"
                                />
                            </div>
                        </section>

                        {/* Section 2: Solaris Networking */}
                        <section id="solaris">
                            <div className="flex flex-col md:flex-row gap-12 items-start text-medium">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                        <Globe className="text-cyan-400" /> Solaris Networking
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed mb-8">
                                        Kortana achieves its speed through **Solaris**, a proprietary networking protocol that replaces traditional Gossip with a directed, broadcast-optimized structure.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-sm text-gray-300 font-bold uppercase tracking-widest">
                                            <Zap size={14} className="text-cyan-400" /> QUIC UDP Transport
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-300 font-bold uppercase tracking-widest">
                                            <Zap size={14} className="text-cyan-400" /> Dynamic Sharding
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full glass-panel p-1 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/5">
                                    <div className="aspect-video bg-black/40 rounded-[2rem] flex items-center justify-center p-12 text-center group">
                                        <div className="relative">
                                            <Share2 size={60} className="text-cyan-400/20 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-700" />
                                            <div className="absolute inset-0 animate-ping border border-cyan-500/20 rounded-full scale-150"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Sealevel Runtime */}
                        <section id="sealevel">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Cpu className="text-purple-400" /> Sealevel Runtime
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed font-medium">
                                <p>
                                    Unlike single-threaded runtimes, Kortana's **Sealevel** runtime processes millions of transactions simultaneously.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                                    <div className="glass-panel p-8 rounded-3xl border-white/5 bg-white/[0.02]">
                                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-[10px]">Parallel Ops</h4>
                                        <p className="text-xs">Executing transactions in parallel across thousands of cores.</p>
                                    </div>
                                    <div className="glass-panel p-8 rounded-3xl border-white/5 bg-white/[0.02]">
                                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-[10px]">Cloud Scoping</h4>
                                        <p className="text-xs">Optimizing storage access for high-frequency RWA trades.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">In this guide</h3>
                            <nav className="space-y-4">
                                <TocLink label="The 5-Layer Stack" href="#stack" />
                                <TocLink label="Solaris Networking" href="#solaris" />
                                <TocLink label="Sealevel Runtime" href="#sealevel" />
                                <TocLink label="Cloudbreak" href="#cloudbreak" />
                            </nav>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function TocLink({ label, href }: { label: string, href: string }) {
    return (
        <a href={href} className="flex items-center justify-between group py-2 border-b border-white/[0.02] hover:border-purple-500/20 transition-all">
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
            <ChevronRight size={14} className="text-gray-800 group-hover:text-purple-400 transition-colors" />
        </a>
    )
}

function LayerItem({ number, title, desc, color }: { number: string, title: string, desc: string, color: string }) {
    const accents: Record<string, string> = {
        cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
        purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
        neon: "text-neon-green border-neon-green/20 bg-neon-green/5",
        blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
        pink: "text-pink-400 border-pink-500/20 bg-pink-500/5"
    }

    return (
        <div className="group flex gap-8 items-center p-8 glass-panel rounded-3xl border-white/5 hover:border-white/20 transition-all">
            <div className={`shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-xl transition-transform group-hover:scale-110 ${accents[color]}`}>
                {number}
            </div>
            <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">{title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl font-medium">{desc}</p>
            </div>
        </div>
    )
}
