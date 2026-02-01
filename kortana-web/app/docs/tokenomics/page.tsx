'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Coins, Flame, Shield, TrendingUp, ChevronRight, Activity, Wallet, PieChart } from "lucide-react";
import { motion } from "framer-motion";

export default function TokenomicsPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="DNR Tokenomics"
                subtitle="The economic engine powering global industrial finance."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-32">

                        {/* Section 1: Utility */}
                        <section id="utility">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-12 flex items-center gap-3">
                                <Coins className="text-cyan-400" /> Token Utility
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <UtilityCard
                                    icon={<Activity className="text-cyan-400" />}
                                    title="Network Fees"
                                    desc="All transaction fees on Kortana are paid in DNR. 50% of the fee is burned."
                                />
                                <UtilityCard
                                    icon={<Shield className="text-purple-400" />}
                                    title="Security"
                                    desc="Validators stake DNR to secure the network and earn delegation rewards."
                                />
                                <UtilityCard
                                    icon={<TrendingUp className="text-neon-green" />}
                                    title="Governance"
                                    desc="DNR holders vote on protocol upgrades and ecosystem development."
                                />
                            </div>
                        </section>

                        {/* Section 2: Supply & Burn */}
                        <section id="supply">
                            <div className="flex flex-col lg:flex-row gap-16 items-center">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                        <Flame className="text-orange-500" /> Supply & Burn
                                    </h2>
                                    <p className="text-gray-400 text-lg leading-relaxed mb-8 font-medium">
                                        Kortana implements a disinflationary model. While there is an initial issuance, the burn mechanism ensures equilibrium.
                                    </p>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center p-6 glass-panel rounded-2xl border-white/5 bg-white/[0.02]">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Supply</span>
                                            <span className="text-lg font-black text-white">1.0B DNR</span>
                                        </div>
                                        <div className="flex justify-between items-center p-6 glass-panel rounded-2xl border-white/5 bg-white/[0.02]">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Burn Rate</span>
                                            <span className="text-lg font-black text-orange-400">0.05% / Wk</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full bg-gradient-to-br from-white/10 to-transparent p-1 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                    <div className="aspect-square bg-black/40 rounded-[2rem] flex items-center justify-center p-12 relative overflow-hidden group">
                                        <PieChart size={120} className="text-cyan-400/10 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-700" />
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">Economy</h3>
                            <nav className="space-y-4">
                                <TocLink label="Token Utility" href="#utility" />
                                <TocLink label="Supply & Burn" href="#supply" />
                                <TocLink label="Staking" href="#staking" />
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

function UtilityCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-[2rem] glass-panel border-white/5 hover:border-white/20 transition-all text-center">
            <div className="mb-6 p-4 bg-white/5 w-fit rounded-2xl mx-auto border border-white/5">
                {icon}
            </div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">{title}</h4>
            <p className="text-gray-500 text-xs leading-relaxed font-medium">{desc}</p>
        </div>
    )
}
