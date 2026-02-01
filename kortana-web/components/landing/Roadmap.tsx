'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function Roadmap() {
    const milestones = [
        {
            phase: "Phase 1: Genesis",
            title: "Foundational Infrastructure",
            status: "completed",
            items: ["Mainnet Beta Launch", "50 Active Validators", "Governance Portal Alpha", "EVM Compatibility Layer"]
        },
        {
            phase: "Phase 2: Expansion",
            title: "Ecosystem & Interoperability",
            status: "current",
            items: ["Kortana Interlink (IBC)", "Institutional DeFi Suite", "SDK 2.0 (Rust, Carbon)", "10k TPS Optimization"]
        },
        {
            phase: "Phase 3: Scaling",
            title: "Mass Adoption",
            status: "upcoming",
            items: ["Dynamic Sharding Implementation", "Mobile SDK for Native DApps", "Ecosystem Strategic Expansion", "RWA Legal Framework Integration"]
        },
        {
            phase: "Phase 4: Sovereign",
            title: "The Sovereign Internet",
            status: "upcoming",
            items: ["Self-Healing Protocol Upgrades", "Native ZK-Privacy Provers", "Decentralized GPU Compute Marketplace"]
        }
    ];

    return (
        <section className="py-24 relative bg-black/40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Strategic <span className="text-gradient">Roadmap</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Our vision for a decentralized financial operating system built for the next century of innovation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {milestones.map((milestone, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-8 rounded-3xl border relative overflow-hidden transition-all duration-500 ${milestone.status === 'current'
                                ? "bg-cyan-500/5 border-cyan-500/40 shadow-2xl shadow-cyan-500/10"
                                : "bg-white/5 border-white/10"
                                }`}
                        >
                            {milestone.status === 'current' && (
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-4">
                                {milestone.phase}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-6">
                                {milestone.title}
                            </h3>

                            <ul className="space-y-4">
                                {milestone.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        {milestone.status === 'completed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                        ) : milestone.status === 'current' ? (
                                            <Clock className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-700 mt-0.5 shrink-0" />
                                        )}
                                        <span className={`text-sm ${milestone.status === 'upcoming' ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
