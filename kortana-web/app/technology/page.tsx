'use client';

import PageHeader from "@/components/PageHeader";
import { Cpu, Network, Shield, Zap, Database, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function TechnologyPage() {
    return (
        <div className="min-h-screen bg-deep-space relative overflow-hidden text-medium">
            {/* Ambient Background Decor */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Industrial Tech"
                subtitle="The hardware-optimized execution layer for global finance."
            />

            <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <TechCard
                        icon={<Cpu className="w-8 h-8 text-cyan-400" />}
                        label="Compute"
                        title="Hyper-Parallel VM"
                        desc="Advanced runtime capable of processing tens of thousands of contracts in parallel across millions of hardware threads."
                    />
                    <TechCard
                        icon={<Network className="w-8 h-8 text-purple-400" />}
                        label="Consensus"
                        title="Deterministic PoH"
                        desc="Implements a source of decentralized time that allows the network to stay synchronized without massive communication overhead."
                    />
                    <TechCard
                        icon={<Shield className="w-8 h-8 text-neon-green" />}
                        label="Security"
                        title="BFT Persistence"
                        desc="Provable Byzantine Fault Tolerance with optimistic sub-2s finality, ensuring assets are irreversibly secured."
                    />
                </div>

                {/* Technical Deep Dives */}
                <div className="space-y-40">

                    {/* Performance Section */}
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="flex-1">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6 block"
                            >
                                Architecture • Networking
                            </motion.span>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                                Adaptive <span className="text-gradient">Throughput</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                                Kortana utilizes a custom implementation of <strong>QUIC transport</strong> with a proprietary propagation protocol called <strong>Solaris</strong>.
                                This allows the network to propagate blocks to 100+ nodes globally in less than 320ms.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <TechMetric label="Propagation" value="< 320ms" />
                                <TechMetric label="Bandwidth" value="10 Gbps+" />
                            </div>
                        </div>
                        <div className="flex-1 w-full glass-panel p-1 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent shadow-2xl">
                            <div className="aspect-square rounded-[2rem] bg-black/40 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] animate-pulse"></div>
                                <div className="p-12 text-center relative z-10">
                                    <Network className="w-20 h-20 text-cyan-400/20 mb-6 mx-auto group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-700" />
                                    <div className="font-mono text-[10px] text-cyan-400/40 uppercase tracking-[0.5em]">Solaris Topology</div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border border-cyan-500/10 rounded-full animate-ping"></div>
                                    <div className="w-64 h-64 border border-cyan-500/5 rounded-full animate-ping delay-700"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scalability Section */}
                    <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
                        <div className="flex-1">
                            <motion.span
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-purple-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6 block"
                            >
                                Execution • Parallelism
                            </motion.span>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                                Massive <span className="text-gradient">Horizontal </span> Scaling
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                                By utilizing <strong>State-Level Runtime</strong>, Kortana identifies transactions that don't compete for the same state and executes them simultaneously across all available hardware threads.
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <TechCheck label="Hardware-level instruction pipelining" />
                                <TechCheck label="GPU-accelerated signature verification" />
                                <TechCheck label="Non-blocking state access" />
                            </div>
                        </div>
                        <div className="flex-1 w-full glass-panel p-1 rounded-[2.5rem] border-white/5 bg-gradient-to-bl from-white/5 to-transparent shadow-2xl">
                            <div className="aspect-square rounded-[2rem] bg-black/40 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] animate-pulse"></div>
                                <div className="p-12 text-center relative z-10">
                                    <Cpu className="w-20 h-20 text-purple-400/20 mb-6 mx-auto group-hover:scale-110 group-hover:text-purple-400 transition-all duration-700" />
                                    <div className="font-mono text-[10px] text-purple-400/40 uppercase tracking-[0.5em]">State Threadpool</div>
                                </div>
                                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 p-10 gap-2 opacity-20">
                                    {[...Array(36)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 2, delay: i * 0.05, repeat: Infinity }}
                                            className="bg-purple-500/30 rounded-sm"
                                        ></motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function TechCard({ icon, label, title, desc }: { icon: React.ReactNode, label: string, title: string, desc: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-10 rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500"
        >
            <div className="flex flex-col">
                <div className="mb-10 p-4 bg-white/5 w-fit rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">{label}</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase tracking-widest">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function TechMetric({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-2xl font-black text-white tracking-widest">{value}</div>
        </div>
    )
}

function TechCheck({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-colors">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                {label}
            </span>
        </div>
    )
}
