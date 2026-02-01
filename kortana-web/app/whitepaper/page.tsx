'use client';

import PageHeader from "@/components/PageHeader";
import { Copy, Download, FileText, CheckCircle, Shield, Zap, Globe, Cpu, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WhitepaperPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden text-medium">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Whitepaper"
                subtitle="The Technical Specification for the Industrial Finance Layer."
            />

            <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left: Summary Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3 italic">
                                Abstract.
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                Blockchain scaling has historically been a tradeoff between decentralization, security, and scalability.
                                Kortana proposes a novel consensus mechanism, **Delegated Proof-of-History (DPoH)**, combined with
                                the **Solaris** execution engine to achieve industrial-scale throughput (50,000+ TPS)
                                while maintaining strict Byzantine Fault Tolerance.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-10">Technical Pillars</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SpecCard
                                    icon={<Shield className="text-cyan-400" />}
                                    title="DPoH Architecture"
                                    desc="Utilization of sequential hashing for decentralized time verification."
                                />
                                <SpecCard
                                    icon={<Zap className="text-purple-400" />}
                                    title="Solaris Engine"
                                    desc="Optimized QUIC transport layer for block propagation under 400ms."
                                />
                                <SpecCard
                                    icon={<Cpu className="text-neon-green" />}
                                    title="Parallel Runtime"
                                    desc="Concurrent transaction execution via state-level scoper (Sealevel)."
                                />
                                <SpecCard
                                    icon={<Globe className="text-blue-400" />}
                                    title="RWA Containers"
                                    desc="KIP-721 native support for industrial asset metadata embedding."
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right: Download Widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col items-center text-center">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mb-8">
                                <FileText size={48} className="text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Technical Spec v2.0</h3>
                            <p className="text-gray-500 text-sm mb-10 font-medium">Finalizing industrial release documentation (Feb 2026).</p>

                            <button className="w-full py-5 bg-white text-deep-space font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl shadow-white/10 group">
                                <Download size={14} /> Full PDF Review
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity">
                                    <span className="text-deep-space text-[10px] font-black uppercase tracking-widest">Processing...</span>
                                </div>
                            </button>

                            <div className="mt-10 pt-10 border-t border-white/5 w-full flex flex-col gap-4">
                                <div className="flex justify-between items-center text-[10px] font-black">
                                    <span className="text-gray-600 uppercase tracking-widest">Hash</span>
                                    <code className="text-gray-400">0x8A2...F4D</code>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black">
                                    <span className="text-gray-600 uppercase tracking-widest">Status</span>
                                    <span className="text-neon-green uppercase tracking-widest">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function SpecCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
            <div className="mb-6 p-3 bg-white/5 w-fit rounded-xl border border-white/5 group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-3">{title}</h4>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
    )
}
