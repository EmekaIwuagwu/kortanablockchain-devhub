'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Terminal, Copy, ChevronRight, Zap, Globe, Database } from "lucide-react";

export default function ApiPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="JSON-RPC API"
                subtitle="Standard Ethereum JSON-RPC 2.0 implementation with solaris extensions."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-20">

                        <section id="intro">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 italic">Raw Interface.</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                                Kortana maintains full 1:1 compatibility with the Ethereum JSON-RPC 2.0 specification.
                                Developers can use standard libraries like `ethers.js`, `web3.js`, or `viem` to interact with the network.
                            </p>
                        </section>

                        <div className="space-y-8">
                            <MethodCard
                                method="eth_blockNumber"
                                desc="Returns the latest block number indexed by the Kortana network."
                                result="0x4A2C1 (303809)"
                            />
                            <MethodCard
                                method="eth_getBalance"
                                desc="Retrieves the DNR balance of a specific wallet address."
                                result="0xde0b6b3a7640000 (1.0 DNR)"
                            />
                            <MethodCard
                                method="eth_estimateGas"
                                desc="Calculates the solaris gas required for a specific transaction."
                                result="0x5208"
                            />
                            <MethodCard
                                method="kortana_getNetworkStatus"
                                desc="Native extension: returns TPS, node count, and epoch health."
                                result="{ tps: 52000, nodes: 140 }"
                            />
                        </div>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">API Methods</h3>
                            <nav className="space-y-4">
                                <TocLink label="Standard ETH" href="#eth" />
                                <TocLink label="Kortana Core" href="#kortana" />
                                <TocLink label="Batch Queries" href="#batch" />
                            </nav>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function MethodCard({ method, desc, result }: { method: string, desc: string, result: string }) {
    return (
        <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-black/40 hover:border-cyan-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <code className="text-lg font-mono text-cyan-400 font-bold group-hover:text-white transition-colors uppercase tracking-tight">{method}</code>
                <button className="p-2 bg-white/5 rounded-lg text-gray-700 hover:text-white transition-all"><Copy size={12} /></button>
            </div>
            <p className="text-gray-500 text-sm mb-6 font-medium">{desc}</p>
            <div className="bg-black/60 p-6 rounded-2xl border border-white/5">
                <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-3">Sample Return</div>
                <code className="text-xs text-green-400/80 font-mono italic">{result}</code>
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
