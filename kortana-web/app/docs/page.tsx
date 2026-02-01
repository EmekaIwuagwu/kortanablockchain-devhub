'use client';

import PageHeader from "@/components/PageHeader";
import Link from 'next/link';
import { motion } from "framer-motion";
import {
    Book, Code, Terminal, FileText, Settings, Rocket,
    Database, Layers, Shield, Cpu, Globe, Zap,
    ChevronRight, ExternalLink, CpuIcon, Activity
} from "lucide-react";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-deep-space relative overflow-hidden">
            {/* Background Radiant Orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Industrial Developer Portal"
                subtitle="The complete technical resource for building on the Kortana high-fidelity network."
            />

            <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">

                {/* Search / CTA Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-8">
                    <div className="w-full md:w-2/3 glass-panel p-6 rounded-3xl flex items-center gap-4 border-white/5 bg-white/5">
                        <Rocket className="text-cyan-400 shrink-0" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Getting Started</div>
                            <div className="text-white font-bold">New to Kortana? Start with the 5-minute integration guide.</div>
                        </div>
                        <Link href="/docs/quick-start" className="px-6 py-2 bg-white text-deep-space text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
                            Quick Start
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Learn Section */}
                    <div className="md:col-span-1 border-r border-white/5 pr-12">
                        <div className="sticky top-32 space-y-12">
                            <div>
                                <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-10">Section 01</h2>
                                <h3 className="text-4xl font-black text-white tracking-tighter mb-6">LEARN</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">Fundamental concepts, protocol architecture, and tokenomics.</p>
                            </div>
                            <div className="space-y-4">
                                <SidebarLink href="/docs/introduction" label="Network Intro" />
                                <SidebarLink href="/docs/consensus" label="DPoH Consensus" />
                                <SidebarLink href="/docs/architecture" label="Solaris Engine" />
                                <SidebarLink href="/docs/tokenomics" label="DNR Utility" />
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="md:col-span-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Build Category */}
                            <DocSection
                                title="Build"
                                icon={<Code className="text-purple-400" />}
                                subtitle="Application Development"
                            >
                                <DocCard
                                    title="Smart Contracts"
                                    desc="EVM compatibility and Quorlin native contract guides."
                                    href="/docs/standards"
                                />
                                <DocCard
                                    title="Asset Containers"
                                    desc="The KIP-721 implementation for industrial RWA tokenization."
                                    href="/docs/standards"
                                />
                                <DocCard
                                    title="Protocol Standards"
                                    desc="Review KIP-20 and governance upgrade standards."
                                    href="/docs/standards"
                                />
                            </DocSection>

                            {/* Node Category */}
                            <DocSection
                                title="Operate"
                                icon={<Activity className="text-neon-green" />}
                                subtitle="Infrastructure & Nodes"
                            >
                                <DocCard
                                    title="Validator Setup"
                                    desc="Hardware specs and orchestration for full validator nodes."
                                    href="/docs/cli"
                                />
                                <DocCard
                                    title="Staking"
                                    desc="How to delegate DNR and participate in consensus rewards."
                                    href="/docs/tokenomics"
                                />
                                <DocCard
                                    title="Monitoring"
                                    desc="Real-time performance and health tracking for your node."
                                    href="/docs/cli"
                                />
                            </DocSection>

                            {/* Reference Category */}
                            <DocSection
                                title="Reference"
                                icon={<Terminal className="text-cyan-400" />}
                                subtitle="APIs & SDKs"
                                fullWidth
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <DocCard
                                        title="JSON-RPC 2.0"
                                        desc="Standard Ethereum API support."
                                        href="/docs/api"
                                        mono
                                    />
                                    <DocCard
                                        title="Rust SDK"
                                        desc="High-fidelity native bindings."
                                        href="/docs/rust-sdk"
                                        mono
                                    />
                                    <DocCard
                                        title="Kortana CLI"
                                        desc="Key management & debugging."
                                        href="/docs/cli"
                                        mono
                                    />
                                </div>
                            </DocSection>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function DocSection({ title, icon, subtitle, children, fullWidth = false }: { title: string, icon: React.ReactNode, subtitle: string, children: React.ReactNode, fullWidth?: boolean }) {
    return (
        <div className={`space-y-8 ${fullWidth ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">{icon}</div>
                <div>
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{subtitle}</div>
                    <div className="text-xl font-bold text-white uppercase tracking-tighter">{title}</div>
                </div>
            </div>
            <div className={`grid gap-4 ${fullWidth ? 'grid-cols-1' : 'grid-cols-1'}`}>
                {children}
            </div>
        </div>
    )
}

function DocCard({ title, desc, href, mono = false }: { title: string, desc: string, href: string, mono?: boolean }) {
    return (
        <Link href={href} className="group flex flex-col p-8 glass-panel rounded-[2rem] border-white/5 hover:border-cyan-500/50 hover:bg-white/[0.03] transition-all duration-500">
            <h4 className={`text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors ${mono ? 'font-mono uppercase tracking-widest' : ''}`}>
                {title}
            </h4>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{desc}</p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-all">
                Access Documentation <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    )
}

function SidebarLink({ href, label }: { href: string, label: string }) {
    return (
        <Link href={href} className="flex items-center justify-between group py-2">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
            <ChevronRight size={14} className="text-gray-800 group-hover:text-cyan-400 transition-colors" />
        </Link>
    )
}
