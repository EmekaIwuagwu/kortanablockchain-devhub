'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Shield, Clock, Zap, Cpu, Database, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function ConsensusPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="DPoH Consensus"
                subtitle="The industry's first cryptographically verifiable decentralized clock."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-24">

                        {/* Section 1 */}
                        <section id="problem">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Clock className="text-cyan-400" /> The Problem of Time
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed space-y-6 font-medium">
                                <p className="text-lg">
                                    In traditional decentralized systems like Bitcoin or Ethereum, nodes do not share a common clock.
                                    They must rely on timestamps in blocks, which are easily manipulated or delayed by network latency.
                                </p>
                                <div className="glass-panel p-8 rounded-3xl border-white/5 bg-white/[0.02]">
                                    <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                                        <Info size={14} className="text-cyan-400" /> The Trilemma Bottleneck
                                    </h4>
                                    <p className="text-sm">
                                        Without a synchronized source of time, validators must wait for block propagation before they can decide on the next leading node.
                                        This communication overhead is the primary reason legacy chains struggle with throughput.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section id="architecture">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Cpu className="text-purple-400" /> DPoH Architecture
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <ConceptCard
                                    title="The Validator Clock"
                                    desc="Every Kortana validator runs a recursive SHA-256 loop that produces a sequence of hashes representing the passage of time."
                                />
                                <ConceptCard
                                    title="Data Anchoring"
                                    desc="Transactions are 'woven' into this sequence. This proves that a transaction occurred at a specific point in time relative to others."
                                />
                            </div>
                            <div className="bg-black/40 rounded-[2.5rem] p-12 border border-white/5 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-10 text-center">Protocol Sequence Loop</h4>
                                <div className="flex items-center justify-between gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="flex-1 space-y-4">
                                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                <motion.div
                                                    animate={{ x: ["-100%", "100%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                    className="h-full w-1/2 bg-cyan-500/30"
                                                />
                                            </div>
                                            <div className="font-mono text-[8px] text-gray-600 text-center uppercase">Hash_{i}x</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section id="vdf">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Zap className="text-neon-green" /> Verifiable Delay Functions
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed font-medium">
                                <p>
                                    Kortana's DPoH uses a specific type of VDF. While the hash sequence must be produced **sequentially**, it can be **verified in parallel**.
                                </p>
                                <pre className="p-8 rounded-3xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-400 overflow-x-auto my-8">
                                    {`fn verify_sequence(start: Hash, count: u64, end: Hash) -> bool {
    let mut current = start;
    for _ in 0..count {
        current = sha256(current);
    }
    current == end
}`}
                                </pre>
                            </div>
                        </section>

                        {/* Section 4: Finality */}
                        <section id="finality">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Shield className="text-blue-400" /> Byzantine Finality
                            </h2>
                            <p className="text-gray-400 mb-10 font-medium leading-relaxed">
                                Combined with DPoH, Kortana uses a Tower BFT implementation. This provides **Optimistic Confirmation** in 400ms
                                and **Deterministic Finality** in 1.8 seconds.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatBox label="Vote Latency" value="~32ms" />
                                <StatBox label="Confirmation" value="400ms" />
                                <StatBox label="Hard Finality" value="1.8s" />
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">On this page</h3>
                            <nav className="space-y-4">
                                <TocLink label="The Problem of Time" href="#problem" />
                                <TocLink label="DPoH Architecture" href="#architecture" />
                                <TocLink label="Verifiable Delay" href="#vdf" />
                                <TocLink label="Byzantine Finality" href="#finality" />
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

function ConceptCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 group-hover:text-cyan-400">{title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
        </div>
    )
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-2xl font-black text-white tracking-widest">{value}</div>
        </div>
    )
}
