'use client';

import PageHeader from "@/components/PageHeader";
import { Copy, Terminal, Server, Code2, Wrench, Search, ChevronRight, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DevelopersPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden text-medium">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Industrial Dev Portal"
                subtitle="High-fidelity tools and protocol specifications for the next generation of finance."
            />

            <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

                    {/* Quick Actions */}
                    <div className="space-y-8">
                        <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8">Onboarding</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/docs" className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/50 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                                <Code2 className="w-8 h-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-2">Documentation</h3>
                                <p className="text-gray-500 text-xs font-medium leading-relaxed">System architecture & API specs.</p>
                                <ChevronRight className="absolute bottom-8 right-8 text-gray-800 group-hover:text-cyan-400 transition-colors" size={16} />
                            </Link>
                            <Link href="/faucets" className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/50 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                                <Wrench className="w-8 h-8 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-2">Network Faucet</h3>
                                <p className="text-gray-500 text-xs font-medium leading-relaxed">Provision testnet DNR assets.</p>
                                <ChevronRight className="absolute bottom-8 right-8 text-gray-800 group-hover:text-purple-400 transition-colors" size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Endpoint Info */}
                    <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent shadow-2xl">
                        <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <Server className="w-4 h-4 text-neon-green" /> Network Integration
                        </h2>

                        <div className="space-y-6">
                            <EndpointItem label="Network ID" value="Kortana Poseidon" />
                            <EndpointItem label="RPC Gateway" value="https://poseidon-rpc.kortana.name.ng" copyable />
                            <EndpointItem label="Chain Index" value="72511" />
                            <EndpointItem label="Asset Symbol" value="DNR" />
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-12">Industrial Toolchain</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ToolCard
                            title="Kortana-CLI"
                            desc="Low-level node orchestration and key management written in Rust."
                            cmd="npm i -g @kortana/cli"
                            color="cyan"
                        />
                        <ToolCard
                            title="Solaris-Verify"
                            desc="Advanced plugin for Hardhat to verify parallel state contracts."
                            cmd="npm i @kortana/verify"
                            color="purple"
                        />
                        <ToolCard
                            title="Native-SDK"
                            desc="C++ and Rust bindings for sub-millisecond transaction signing."
                            cmd="cargo add kortana-sdk"
                            color="green"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function EndpointItem({ label, value, copyable = false }: { label: string, value: string, copyable?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <div className={`flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl group hover:bg-black/60 transition-colors border border-white/5 ${copyable ? 'cursor-pointer' : ''}`}>
                <code className="text-cyan-400 text-xs font-mono tracking-tighter">{value}</code>
                {copyable && <Copy className="w-3 h-3 text-gray-600 group-hover:text-white transition-colors" />}
            </div>
        </div>
    )
}

function ToolCard({ title, desc, cmd, color }: { title: string, desc: string, cmd: string, color: string }) {
    const colorClass = color === 'cyan' ? 'text-cyan-400' : color === 'purple' ? 'text-purple-400' : 'text-neon-green';
    const borderClass = color === 'cyan' ? 'hover:border-cyan-500/30' : color === 'purple' ? 'hover:border-purple-500/30' : 'hover:border-neon-green/30';

    return (
        <div className={`glass-panel p-10 rounded-[2.5rem] border border-white/5 transition-all duration-500 bg-white/[0.01] ${borderClass} group`}>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${colorClass}`}>{title}</div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 h-12">{desc}</p>
            <div className="bg-black/80 rounded-2xl p-4 flex items-center gap-4 border border-white/5 font-mono text-[10px] text-gray-400 group-hover:text-white transition-colors">
                <span className={colorClass}>$</span>
                <span>{cmd}</span>
                <Copy size={12} className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    )
}
