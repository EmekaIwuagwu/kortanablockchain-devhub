'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Terminal, Copy, ChevronRight, Zap, Globe, Database, Shield, Cpu } from "lucide-react";

export default function CliPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden text-medium">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Kortana CLI"
                subtitle="The primary toolkit for industrial node management and testing."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-24">

                        <section id="install">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3 italic">
                                Installation.
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                                The Kortana CLI tool is built in Rust for maximum performance and security.
                                It is available via NPM for easy distribution or can be compiled from source.
                            </p>
                            <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-black/40 relative group">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-red-400/40"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400/40"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400/40"></div>
                                </div>
                                <code className="text-cyan-400 font-mono text-sm block">
                                    <span className="text-gray-700 select-none mr-4">$</span>
                                    npm install -g @kortana/cli
                                </code>
                            </div>
                        </section>

                        <section id="keys">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Shield className="text-purple-400" /> Key Management
                            </h2>
                            <p className="text-gray-400 mb-8 font-medium">Generate industrial-grade ED25519 keypairs for validator identities.</p>
                            <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-black/40">
                                <code className="text-gray-300 font-mono text-xs block mb-4"># Generate a secure keyfile</code>
                                <code className="text-cyan-400 font-mono text-sm block">
                                    <span className="text-gray-700 select-none mr-4">$</span>
                                    kortana-cli keygen --outfile id.json
                                </code>
                            </div>
                        </section>

                        <section id="nodes">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Cpu className="text-neon-green" /> Running a Node
                            </h2>
                            <p className="text-gray-400 mb-8 font-medium">Join the network as a validator using your identity keypair.</p>
                            <div className="bg-black/60 p-8 rounded-[2rem] border border-white/10 font-mono text-xs text-white overflow-x-auto">
                                <div className="text-gray-600 mb-4 tracking-widest uppercase">// High-fidelity validator startup</div>
                                <div className="space-y-2">
                                    <div className="flex gap-4">
                                        <span className="text-gray-700 select-none">$</span>
                                        <span className="text-cyan-400">kortana-node</span>
                                    </div>
                                    <div className="pl-8 text-gray-400">--validator</div>
                                    <div className="pl-8 text-gray-400">--identity ./id.json</div>
                                    <div className="pl-8 text-gray-400">--network poseidon</div>
                                    <div className="pl-8 text-gray-400">--log-level info</div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">CLI Usage</h3>
                            <nav className="space-y-4">
                                <TocLink label="Installation" href="#install" />
                                <TocLink label="Key Recovery" href="#keys" />
                                <TocLink label="Node Config" href="#nodes" />
                                <TocLink label="RPC Commands" href="#rpc" />
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
