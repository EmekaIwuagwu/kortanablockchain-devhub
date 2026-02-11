'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Book,
    Zap,
    Cpu,
    Globe,
    Layers,
    Clock,
    CircleDollarSign,
    Server,
    Download,
    ChevronRight,
    FileText,
    CheckCircle
} from 'lucide-react';

export default function WhitepaperContent() {
    const [activeSection, setActiveSection] = useState('abstract');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['abstract', 'architecture', 'consensus', 'execution', 'tokenomics', 'network'];
            const scrollPosition = window.scrollY + 200;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="max-w-400 mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16 relative z-10">
            <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-32 space-y-8">
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-white/2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 px-2">Table of Contents</h3>
                        <nav className="space-y-1">
                            <NavItem id="abstract" label="Abstract" icon={<FileText size={14} />} active={activeSection === 'abstract'} onClick={() => scrollToSection('abstract')} />
                            <NavItem id="architecture" label="System Architecture" icon={<Layers size={14} />} active={activeSection === 'architecture'} onClick={() => scrollToSection('architecture')} />
                            <NavItem id="consensus" label="DPoH Consensus" icon={<Clock size={14} />} active={activeSection === 'consensus'} onClick={() => scrollToSection('consensus')} />
                            <NavItem id="execution" label="Dual VM Execution" icon={<Cpu size={14} />} active={activeSection === 'execution'} onClick={() => scrollToSection('execution')} />
                            <NavItem id="tokenomics" label="Token Economics" icon={<CircleDollarSign size={14} />} active={activeSection === 'tokenomics'} onClick={() => scrollToSection('tokenomics')} />
                            <NavItem id="network" label="Network & Storage" icon={<Server size={14} />} active={activeSection === 'network'} onClick={() => scrollToSection('network')} />
                        </nav>
                    </div>

                    <button className="w-full py-4 bg-white text-deep-space font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl shadow-white/5 group">
                        <Download size={14} /> Download PDF
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-gray-600 font-mono">Version 2.0.0 • Production Ready</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-24">

                <Section id="abstract" title="Abstract" icon={<Book className="text-cyan-400" />}>
                    <p className="text-xl text-gray-300 font-medium leading-relaxed">
                        Kortana is a high-performance Layer 1 blockchain built for industrial-scale global credit markets and high-fidelity decentralized applications.
                        By combining a novel <strong>Delegated Proof-of-History (DPoH)</strong> consensus mechanism with the <strong>Solaris Execution Engine</strong>,
                        Kortana achieves throughput exceeding <strong>50,000 TPS</strong> with sub-second finality.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <StatCard value="50k+" label="TPS" />
                        <StatCard value="400ms" label="Block Propagation" />
                        <StatCard value="<2s" label="Finality" />
                    </div>
                </Section>

                <Section id="architecture" title="1. System Architecture" icon={<Layers className="text-purple-400" />}>
                    <p className="mb-6">
                        The Kortana architecture is composed of five distinct layers, each verifiable and optimized for specific tasks.
                        This separation of concerns allows for modular upgrades and specialized performance tuning.
                    </p>
                    <div className="space-y-4">
                        <ArchitectureItem
                            layer="Application Layer"
                            desc="Standard JSON-RPC 2.0 interface, WebSocket subscriptions, and high-performance indexing. Fully compatible with EVM tooling (MetaMask, Remix)."
                        />
                        <ArchitectureItem
                            layer="Consensus & Network"
                            desc="DPoH verified clock combined with Tower BFT for finality. libp2p gossipsub protocol ensures rapid block propagation across the validator set."
                        />
                        <ArchitectureItem
                            layer="Execution (Dual VM)"
                            desc="Simultaneous execution of EVM (Solidity) and Quorlin (Rust/WASM) smart contracts. Shared state access via authorized bridges."
                        />
                        <ArchitectureItem
                            layer="State Layer"
                            desc="Customized Merkle-Patricia Trie with optimized caching and snapshot capabilities for instant node syncing."
                        />
                        <ArchitectureItem
                            layer="Persistence"
                            desc="Tuned RocksDB instance for high-throughput I/O, storing block history, state snapshots, and transaction receipts."
                        />
                    </div>
                </Section>

                <Section id="consensus" title="2. Consensus Mechanism" icon={<Clock className="text-neon-green" />}>
                    <div className="prose prose-invert max-w-none text-gray-400 font-medium">
                        <p>
                            Traditional blockchains suffer from the `clock problem`—nodes must communicate to agree on time, creating latency.
                            Kortana solves this with <strong>Delegated Proof-of-History (DPoH)</strong>.
                        </p>
                        <h4 className="text-white font-bold mt-8 mb-4">How it works:</h4>
                        <ul className="list-none space-y-4 pl-0">
                            <li className="flex gap-3">
                                <CheckCircle size={18} className="text-cyan-400 shrink-0 mt-1" />
                                <span><strong>Verifiable Delay Function (VDF):</strong> Validators run a high-frequency recursive SHA-256 hash loop. This creates a cryptographically verifiable passage of time.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle size={18} className="text-cyan-400 shrink-0 mt-1" />
                                <span><strong>Leader Schedule:</strong> Because time is globally verifiable, the network knows exactly which validator should produce the next block without P2P negotiation.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle size={18} className="text-cyan-400 shrink-0 mt-1" />
                                <span><strong>Tower BFT:</strong> A PBFT-like consensus runs on top of the PoH clock to provide absolute finality. Votes are cast on the PoH hash sequence itself.</span>
                            </li>
                        </ul>
                    </div>
                </Section>

                <Section id="execution" title="3. Dual VM Execution" icon={<Cpu className="text-blue-400" />}>
                    <p className="mb-8">
                        Kortana implements a unique `Dual VM` architecture to solve the dilemma between compatibility and performance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8 rounded-2xl bg-white/2 border-white/5">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-purple-400" /> EVM Engine
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                Full support for Solidity smart contracts and Ethereum tooling.
                                Developers can deploy existing dApps with zero code changes.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Tag>Solidity</Tag>
                                <Tag>Vyper</Tag>
                                <Tag>Hardhat</Tag>
                            </div>
                        </div>
                        <div className="glass-panel p-8 rounded-2xl bg-white/2 border-white/5">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-neon-green" /> Quorlin VM
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                A high-performance, parallelized runtime for industrial applications.
                                Optimized for massive state access and concurrent transaction processing.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Tag>Rust</Tag>
                                <Tag>Parallel Execution</Tag>
                                <Tag>Low Latency</Tag>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Tokenomics */}
                <Section id="tokenomics" title="4. Token Economics" icon={<CircleDollarSign className="text-yellow-400" />}>
                    <div className="mb-10">
                        <p className="text-lg">
                            The <strong>DINAR (DNR)</strong> is the native utility token of Kortana, designed for long-term sustainability and network security.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Supply Distribution</h4>
                            <div className="space-y-3">
                                <DistributionBar label="Community & Ecosystem" percent="60%" color="bg-cyan-500" />
                                <DistributionBar label="Foundation Reserve" percent="25%" color="bg-purple-500" />
                                <DistributionBar label="Team & Contributors" percent="10%" color="bg-blue-500" />
                                <DistributionBar label="Dev Ecosystem" percent="5%" color="bg-neon-green" />
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-4">Total Supply: 1,000,000,000 DNR</p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deflationary Mechanics</h4>
                            <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 font-bold text-sm">Base Fee Burn</span>
                                    <span className="text-error-red font-mono font-bold">50%</span>
                                </div>
                                <p className="text-xs text-gray-500">Half of all transaction fees are permanently removed from circulation.</p>
                            </div>
                            <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 font-bold text-sm">Emission Halving</span>
                                    <span className="text-cyan-400 font-mono font-bold">Every ~1 Year</span>
                                </div>
                                <p className="text-xs text-gray-500">Block rewards decrease by 10% every 4,320,000 blocks.</p>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section id="network" title="5. Network Infrastructure" icon={<Server className="text-pink-400" />}>
                    <p>
                        The Kortana network layer utilizes <strong>libp2p</strong> for robust peer-to-peer communication.
                        It features a Kademlia-based DHT for peer discovery and the Gossipsub protocol for efficient message propagation.
                    </p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NetworkSpec label="P2P Protocol" value="libp2p + Noise" />
                        <NetworkSpec label="Max Mempool" value="10,000 Tx" />
                        <NetworkSpec label="Active Validators" value="50 Nodes" />
                        <NetworkSpec label="Storage Engine" value="RocksDB" />
                    </div>
                </Section>

            </div>
        </div>
    );
}

function Section({ id, title, icon, children }: { id: string, title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white">
                        {icon}
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">{title}</h2>
                </div>
                <div className="text-gray-400 font-medium leading-relaxed">
                    {children}
                </div>
                <div className="mt-16 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            </motion.div>
        </section>
    );
}

function NavItem({label, icon, active, onClick }: { id: string, label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
        >
            <span className={active ? 'opacity-100' : 'opacity-70'}>{icon}</span>
            {label}
            {active && <ChevronRight size={14} className="ml-auto" />}
        </button>
    );
}

function StatCard({ value, label }: { value: string, label: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 text-center">
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}

function ArchitectureItem({ layer, desc }: { layer: string, desc: string }) {
    return (
        <div className="p-6 rounded-xl bg-white/2 border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-48 shrink-0">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20">
                    {layer}
                </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        </div>
    );
}

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
            {children}
        </span>
    );
}

function DistributionBar({ label, percent, color }: { label: string, percent: string, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>{label}</span>
                <span className="text-white">{percent}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: percent }}></div>
            </div>
        </div>
    );
}

function NetworkSpec({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center p-4 border-b border-white/5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-mono text-cyan-400">{value}</span>
        </div>
    );
}
