'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Copy, Globe, Shield, Zap, Server, Database, ChevronRight, CheckCircle2 } from "lucide-react";

export default function NetworkPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Network Config"
                subtitle="High-fidelity connectivity details for all Kortana environments."
            />

            <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16 relative z-10">
                <DocsSidebar />

                <div className="flex-1 space-y-16">

                    {/* Testnet Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                                <Globe className="text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Poseidon Testnet</h2>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Public RWA Sandbox • v2.0.4</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                Live
                            </div>
                        </div>

                        <div className="glass-panel rounded-[2.5rem] border-white/5 bg-black/40 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Parameter</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Configuration Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ConfigRow label="Network Name" value="Kortana Testnet" />
                                    <ConfigRow label="RPC Endpoint" value="https://poseidon-rpc.kortana.worchsester.xyz" isCopy />
                                    <ConfigRow label="Chain ID" value="72511" />
                                    <ConfigRow label="Currency" value="DNR" />
                                    <ConfigRow label="Block Explorer" value="https://explorer.testnet.kortana.org" isCopy />
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Mainnet Section */}
                    <section className="opacity-50">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <Shield className="text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Kortana Mainnet</h2>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Institutional Layer • Pending Launch</p>
                            </div>
                        </div>

                        <div className="glass-panel rounded-[2.5rem] border-white/5 bg-black/40 p-12 text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <Database size={40} className="mx-auto text-gray-800 mb-6" />
                                <h4 className="text-white font-black text-xs uppercase tracking-[0.4em] mb-4">Under Construction</h4>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">Mainnet endpoints are currently restricted to authorized genesis validators.</p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}

function ConfigRow({ label, value, isCopy = false }: { label: string, value: string, isCopy?: boolean }) {
    return (
        <tr className="border-b border-white/[0.02] hover:bg-white/[0.02] group transition-all">
            <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</td>
            <td className="px-8 py-6">
                <div className="flex items-center justify-between gap-4">
                    <code className="text-sm font-mono text-white group-hover:text-cyan-400 transition-colors">{value}</code>
                    {isCopy && (
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-700 hover:text-white transition-all">
                            <Copy size={12} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    )
}

