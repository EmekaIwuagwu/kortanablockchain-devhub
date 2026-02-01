'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { BookOpen, Globe, Zap, Shield, Cpu, ChevronRight, Activity, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { motion } from "framer-motion";

export default function IntroPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Introduction"
                subtitle="The industrial-scale L1 blockchain for global credit markets."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-24">

                        {/* Section 1: Vision */}
                        <section id="vision">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                            >
                                Industrial Evolution
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 leading-none">
                                Decentralized <span className="text-gradient">Performance</span>
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed text-lg space-y-6 font-medium">
                                <p>
                                    Kortana is a high-performance Layer 1 blockchain built from the ground up to support industrial-scale financial applications.
                                    By combining EVM compatibility with a proprietary parallel execution runtime, Kortana solves the blockchain trilemma
                                    for institutional use cases.
                                </p>
                            </div>
                        </section>

                        {/* Section 2: Why Kortana? */}
                        <section id="why">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-10">Comparative Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
                                <ComparisonCard
                                    category="Throughput"
                                    legacy="15 - 300 TPS"
                                    kortana="50,000+ TPS"
                                    highlight="Parallel Engine"
                                />
                                <ComparisonCard
                                    category="Finality"
                                    legacy="15m - 60m"
                                    kortana="< 2 Seconds"
                                    highlight="Deterministic BFT"
                                />
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">On this page</h3>
                            <nav className="space-y-4">
                                <TocLink label="Vision" href="#vision" />
                                <TocLink label="Why Kortana?" href="#why" />
                                <TocLink label="Next Steps" href="#next" />
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
        <a href={href} className="flex items-center justify-between group py-2 border-b border-white/[0.02] hover:border-cyan-500/20 transition-all">
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
            <ChevronRight size={14} className="text-gray-800 group-hover:text-cyan-400 transition-colors" />
        </a>
    )
}

function ComparisonCard({ category, legacy, kortana, highlight }: { category: string, legacy: string, kortana: string, highlight: string }) {
    return (
        <div className="p-8 rounded-3xl glass-panel border-white/5 bg-white/[0.02] hover:border-white/20 transition-all">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">{category}</div>
            <div className="flex justify-between items-end gap-4">
                <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Legacy</div>
                    <div className="text-sm font-bold text-gray-700">{legacy}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Kortana</div>
                    <div className="text-xl font-black text-white tracking-widest">{kortana}</div>
                </div>
            </div>
        </div>
    )
}
