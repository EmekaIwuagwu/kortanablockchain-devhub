'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Layers, ShieldCheck, Globe } from 'lucide-react';

export default function WhyKortana() {
    return (
        <section className="py-24 px-4 max-w-7xl mx-auto relative overflow-hidden">
            {/* Background Radiant Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] -z-10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] -z-10 rounded-full animate-pulse delay-1000"></div>

            <div className="text-center mb-24 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                >
                    Core Platform Pillars
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8"
                >
                    Engineered for <br /><span className="text-gradient">Industrial Performance</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-medium"
                >
                    We solved the blockchain trilemma from first principles.
                    Security that scales. Performance that persists.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                    title="EVM Compatible"
                    desc="Deploy Solidity contracts unchanged. Use Hardhat, Truffle, and Remix instantly with full tooling support."
                    icon={<Layers className="w-6 h-6" />}
                    link="Learn more"
                    delay={0}
                    color="cyan"
                />
                <FeatureCard
                    title="Proprietary VM"
                    desc="Parallel execution engine capable of 50,000+ TPS by processing non-conflicting transactions simultaneously."
                    icon={<Zap className="w-6 h-6" />}
                    link="See benchmarks"
                    delay={0.1}
                    color="purple"
                />
                <FeatureCard
                    title="DPoH Consensus"
                    desc="Novel Delegated Proof-of-History provides an immutable record of time for secure, ultra-low latency finality."
                    icon={<ShieldCheck className="w-6 h-6" />}
                    link="Deep dive"
                    delay={0.2}
                    color="neon"
                />
                <FeatureCard
                    title="Global Reach"
                    desc="Enterprise-grade architecture with regulatory compliance frameworks built directly into the protocol level."
                    icon={<Globe className="w-6 h-6" />}
                    link="Start building"
                    delay={0.3}
                    color="blue"
                />
            </div>
        </section>
    )
}

function FeatureCard({ title, desc, icon, link, delay, color }: { title: string, desc: string, icon: React.ReactNode, link: string, delay: number, color: string }) {
    const accents: Record<string, string> = {
        cyan: "text-cyan-400 bg-cyan-500/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50",
        purple: "text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/50",
        neon: "text-neon-green bg-neon-green/10 group-hover:bg-neon-green/20 group-hover:border-neon-green/50",
        blue: "text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="glass-panel p-10 rounded-[2.5rem] group flex flex-col items-start text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
        >
            <div className={`p-4 rounded-2xl mb-8 border border-white/5 transition-all duration-500 ${accents[color]}`}>
                {icon}
            </div>

            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                {title}
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed mb-10 group-hover:text-gray-300 transition-colors">
                {desc}
            </p>

            <a href="#" className="mt-auto group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">
                {link}
                <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
            </a>
        </motion.div>
    )
}
