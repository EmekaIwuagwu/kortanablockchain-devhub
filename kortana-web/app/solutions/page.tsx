'use client';

import PageHeader from "@/components/PageHeader";
import { ArrowRight, Box, Globe, ShieldCheck, Truck, Zap } from "lucide-react";

import { motion } from "framer-motion";

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-deep-space relative overflow-hidden">
            {/* Background Radiant Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Industrial Solutions"
                subtitle="High-fidelity tokenization engine for the global credit markets."
            />

            <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">

                {/* RWA Section */}
                <div className="flex flex-col lg:flex-row items-center gap-24 mb-48">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
                        >
                            Real World Asset Engine
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter leading-tight">
                            Programmable <br /><span className="text-gradient">Asset Containers</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-12 font-medium">
                            Kortana's legally-aware NFT standard allows for the fractionalization of illiquid assets with embedded compliance, automated profit distribution, and cross-border settlement.
                        </p>
                        <div className="space-y-6">
                            <FeatureCheck text="Hyper-local regulatory enforcement" />
                            <FeatureCheck text="Millisecond fractional settlement" />
                            <FeatureCheck text="Yield-auto-compounding architecture" />
                        </div>
                    </div>
                    <div className="flex-1 w-full p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-2xl relative group">
                        <div className="absolute -inset-4 bg-cyan-400/10 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative glass-panel bg-black/40 rounded-[2rem] overflow-hidden p-12">
                            {/* Mock Premium UI */}
                            <div className="flex justify-between items-center mb-10">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Pool</div>
                                    <div className="text-xl font-bold text-white">Manhattan RE Bond</div>
                                </div>
                                <div className="p-3 bg-cyan-500/10 rounded-xl">
                                    <Globe className="w-5 h-5 text-cyan-400" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Current Value</div>
                                    <div className="text-4xl font-black text-white tracking-widest">$42.5M <span className="text-sm text-cyan-400 font-bold ml-2">+12.4%</span></div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="flex-1 h-12 bg-white text-deep-space font-bold rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">Stake Assets</button>
                                    <button className="flex-1 h-12 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white/10">Yield Map</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Supply Chain Section */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
                        >
                            Logistics • Transparency
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter leading-tight">
                            Global <br /><span className="text-gradient">Supply Integrity</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-12 font-medium">
                            Kortana powers planetary-scale logistics by providing a high-throughput ledger for SKU-level tracking, immutable provenance, and automated customs settlement.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <SolutionsCard icon={<ShieldCheck className="w-4 h-4" />} title="Anti-Counterfeit" />
                            <SolutionsCard icon={<Zap className="w-4 h-4" />} title="Instant Settle" />
                            <SolutionsCard icon={<Box className="w-4 h-4" />} title="Inventory Sync" />
                            <SolutionsCard icon={<Truck className="w-4 h-4" />} title="Live Routing" />
                        </div>
                    </div>
                    <div className="flex-1 w-full p-1 rounded-[2.5rem] bg-gradient-to-bl from-white/10 to-transparent border border-white/5 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -inset-4 bg-purple-400/10 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="aspect-square glass-panel bg-black/40 rounded-[2rem] p-12 relative flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                            <div className="relative w-full h-full flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                    className="w-full h-full border border-white/5 rounded-full p-12"
                                >
                                    <div className="w-full h-full border border-cyan-500/10 rounded-full flex items-center justify-center">
                                        <div className="w-1/2 h-1/2 border border-purple-500/20 rounded-full shadow-[0_0_50px_rgba(168,85,247,0.1)]"></div>
                                    </div>
                                </motion.div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Globe className="w-20 h-20 text-white/5 animate-pulse" />
                                </div>
                                <PingPoint top="30%" left="20%" color="purple" />
                                <PingPoint top="60%" left="80%" color="cyan" />
                                <PingPoint top="10%" left="70%" color="green" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function FeatureCheck({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:bg-white transition-colors"></div>
            </div>
            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest group-hover:text-white transition-colors">{text}</span>
        </div>
    )
}

function SolutionsCard({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:border-white/20 hover:scale-105 transition-all group active:scale-95">
            <div className="text-gray-500 group-hover:text-white transition-colors">{icon}</div>
            <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{title}</span>
        </div>
    )
}

function PingPoint({ top, left, color }: { top: string, left: string, color: string }) {
    return (
        <div className="absolute" style={{ top, left }}>
            <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color === 'purple' ? 'bg-purple-400' : color === 'cyan' ? 'bg-cyan-400' : 'bg-green-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${color === 'purple' ? 'bg-purple-500' : color === 'cyan' ? 'bg-cyan-500' : 'bg-green-500'}`}></span>
            </span>
        </div>
    )
}
