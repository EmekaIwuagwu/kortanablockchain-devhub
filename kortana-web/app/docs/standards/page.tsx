'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Book, FileCode, CheckCircle2, ChevronRight, Info, ShieldCheck, Database } from "lucide-react";

export default function StandardsPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Token Standards"
                subtitle="The building blocks for institutional-grade digital assets."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-24">

                        {/* Overview */}
                        <section id="overview">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 italic">Asset Portability.</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                                Kortana supports standard EVM token interfaces, referred to as **KIPs** (Kortana Improvement Proposals).
                                These are fully compatible with Ethereum standards but optimized for the Solaris execution engine.
                            </p>
                        </section>

                        {/* KIP-20 */}
                        <section id="kip20">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                                    <Database size={20} className="text-cyan-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">KIP-20: Fungible Assets</h3>
                            </div>
                            <p className="text-gray-400 mb-8 font-medium">The standard for liquidity, governance tokens, and native stablecoins.</p>
                            <pre className="p-8 rounded-[2rem] bg-black/60 border border-white/5 font-mono text-xs text-cyan-400 overflow-x-auto mb-8">
                                {`import "@kortana/contracts/token/KIP20/KIP20.sol";

contract GlobalStablecoin is KIP20 {
    constructor() KIP20("USD Kortana", "USDK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}`}
                            </pre>
                        </section>

                        {/* KIP-721 / Asset Containers */}
                        <section id="kip721">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <ShieldCheck size={20} className="text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">KIP-721: Asset Containers</h3>
                            </div>
                            <p className="text-gray-400 mb-8 font-medium">
                                Beyond simple NFTs, Kortana's **Asset Containers** allow for embedding legal metadata,
                                fractional ownership rules, and automated compliance directly into the token URI.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FeatureItem title="Legal Embed" desc="Cryptographically signed PDF/Legal links in metadata." />
                                <FeatureItem title="Logic Hooks" desc="On-transfer compliance checks for KYC/AML." />
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">On this page</h3>
                            <nav className="space-y-4">
                                <TocLink label="KIP-20 (Fungible)" href="#kip20" />
                                <TocLink label="KIP-721 (RWA)" href="#kip721" />
                                <TocLink label="Global Metadata" href="#metadata" />
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

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-cyan-400" /> {title}
            </h4>
            <p className="text-gray-500 text-xs font-medium">{desc}</p>
        </div>
    )
}
