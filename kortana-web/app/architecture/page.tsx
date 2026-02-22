'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers, Server, Cpu, Database, HardDrive } from 'lucide-react';
import PageHeader from "@/components/PageHeader";


export default function ArchitecturePage() {
    return (
        <div className="min-h-screen pb-20">
            <PageHeader
                title="Architecture"
                subtitle="A complete, production-grade blockchain from the ground up"
            />

            <section className="max-w-5xl mx-auto px-4 py-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl font-bold text-white mb-10 text-center"
                >
                    5-Layer Architecture
                </motion.h2>

                <div className="space-y-4">
                    <ArchitectureLayer
                        number={5}
                        title="Application Layer"
                        desc="Wallets, RPC, Explorers, DApps"
                        details="Standard JSON-RPC 2.0 interface, WebSocket subscription support, and high-performance indexing. Compatible with MetaMask, Remix, and all standard Ethereum tooling."
                        icon={<Layers />}
                    />
                    <ArchitectureLayer
                        number={4}
                        title="Consensus & Network"
                        desc="DPoH + Byzantine Finality + libp2p"
                        details="Delegated Proof-of-History (DPoH) creates a verifiable passage of time, enabling 2-second blocks. The libp2p gossipsub protocol ensures <500ms block propagation across the global network of validators."
                        icon={<Server />}
                    />
                    <ArchitectureLayer
                        number={3}
                        title="Execution (Dual VM)"
                        desc="EVM + Quorlin Virtual Machines"
                        details="The Dual VM architecture allows developers to deploy existing Solidity contracts (EVM) while offering a high-performance path via the Quorlin VM, optimized for parallel execution and massive scalability."
                        icon={<Cpu />}
                    />
                    <ArchitectureLayer
                        number={2}
                        title="State Management"
                        desc="Merkle-Patricia Trie + Accounts"
                        details="Kortana uses a customized Merkle-Patricia Trie for secure state integrity. Unlike traditional implementations, it features an optimized caching layer and snapshot mechanism for instant node syncing."
                        icon={<Database />}
                    />
                    <ArchitectureLayer
                        number={1}
                        title="Persistence"
                        desc="RocksDB Storage + State Snapshots"
                        details="Persistent storage is handled by a tuned RocksDB instance, designed for high-throughput I/O. Periodic state snapshots allow for rapid node recovery and history archiving."
                        icon={<HardDrive />}
                    />
                </div>
            </section>

            <section className="bg-midnight-blue/20 py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-purple-900/10 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-6">Consensus Mechanism: DPoH</h2>
                    <p className="text-gray-400 max-w-3xl mx-auto mb-12">
                        Delegated Proof-of-History (DPoH) solves the clock problem in distributed systems. By creating a cryptographic source of time, Kortana validators can produce blocks without communication overhead, achieving sub-2-second finality.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-8 rounded-xl bg-deep-space/60 backdrop-blur-md border border-white/10">
                            <div className="text-cyan-400 font-bold text-5xl mb-2 font-mono">2s</div>
                            <div className="text-white font-medium">Block Time</div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-8 rounded-xl bg-deep-space/60 backdrop-blur-md border border-white/10">
                            <div className="text-purple-400 font-bold text-5xl mb-2 font-mono">2s</div>
                            <div className="text-white font-medium">Finality</div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-8 rounded-xl bg-deep-space/60 backdrop-blur-md border border-white/10">
                            <div className="text-neon-green font-bold text-5xl mb-2 font-mono">50</div>
                            <div className="text-white font-medium">Validators</div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function ArchitectureLayer({ number, title, desc, details, icon }: { number: number, title: string, desc: string, details: string, icon: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={false}
            className={`border ${isOpen ? 'border-cyan-500/50 bg-white/10' : 'border-white/10 bg-white/5'} rounded-xl overflow-hidden transition-colors duration-300`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between text-left focus:outline-none"
            >
                <div className="flex items-center gap-6">
                    <span className={`font-mono text-sm ${isOpen ? 'text-cyan-400' : 'text-gray-500'}`}>LAYER {number}</span>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${isOpen ? 'text-white' : 'text-gray-300'} transition-colors`}>{title}</h3>
                            <p className={`text-sm ${isOpen ? 'text-cyan-300' : 'text-gray-500'}`}>{desc}</p>
                        </div>
                    </div>
                </div>
                <motion.div className="text-gray-400" animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 pt-0 pl-24 text-gray-300 leading-relaxed border-t border-white/5 mt-2">
                            <p className="pt-4">{details}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
