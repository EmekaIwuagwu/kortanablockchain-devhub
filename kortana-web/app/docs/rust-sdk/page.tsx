'use client';

import PageHeader from "@/components/PageHeader";
import DocsSidebar from "@/components/DocsSidebar";
import { Code2, Copy, ChevronRight, Zap, Terminal, Box, Cpu } from "lucide-react";

export default function RustSdkPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden text-medium">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Rust SDK"
                subtitle="The high-fidelity core library for performance-critical Kortana apps."
            />

            <div className="max-w-[1600px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">

                {/* Left Sidebar */}
                <DocsSidebar />

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-12">

                    {/* Middle: Detailed Text */}
                    <div className="xl:col-span-3 space-y-24">

                        <section id="cargo">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3 italic">
                                Cargo setup.
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                                Incorporate the Kortana SDK into your Rust project to access low-level protocol primitives
                                and high-performance RPC bindings.
                            </p>
                            <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-black/40">
                                <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Cargo.toml</div>
                                <code className="text-cyan-400 font-mono text-sm block">
                                    [dependencies]<br />
                                    kortana-sdk = "0.1.0"
                                </code>
                            </div>
                        </section>

                        <section id="usage">
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                <Terminal className="text-cyan-400" /> Connecting to Core
                            </h2>
                            <p className="text-gray-400 mb-8 font-medium">Asynchronous connection establishment using the Solaris networking stack.</p>
                            <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/10 font-mono text-xs text-white overflow-x-auto">
                                <pre className="text-cyan-400/80">
                                    {`use kortana_sdk::{Client, Network};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to Poseidon Testnet
    let client = Client::new(Network::Testnet);
    
    // Fetch live block statistics
    let block_height = client.get_block_height().await?;
    println!("Industrial State Sync: {}", block_height);
    
    Ok(())
}`}
                                </pre>
                            </div>
                        </section>

                        <section id="examples">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <CodeExample
                                    icon={<Box className="text-purple-400" />}
                                    title="Contract Deploy"
                                    desc="Compile and deploy WASM/Solidity contracts via the SDK."
                                />
                                <CodeExample
                                    icon={<Cpu className="text-neon-green" />}
                                    title="Keypair Ops"
                                    desc="Industrial-grade cryptography and signature verification."
                                />
                            </div>
                        </section>

                    </div>

                    {/* Right: TOC */}
                    <div className="hidden xl:block">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">Library Guide</h3>
                            <nav className="space-y-4">
                                <TocLink label="Cargo Integration" href="#cargo" />
                                <TocLink label="Basic Usage" href="#usage" />
                                <TocLink label="Contract Logic" href="#contracts" />
                                <TocLink label="Performance" href="#perf" />
                            </nav>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function CodeExample({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-3xl glass-panel border-white/5 hover:border-white/20 transition-all flex items-start gap-6 group">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-2">{title}</h4>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">{desc}</p>
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
