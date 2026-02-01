'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Layers, Code, ShieldCheck } from 'lucide-react'

const features = [
    {
        icon: Layers,
        title: 'EVM Compatible',
        desc: 'Deploy existing Ethereum smart contracts instantly. Full compatibility with Hardhat, Truffle, and Remix.',
        color: 'text-[#00F0FF]'
    },
    {
        icon: Zap,
        title: 'Ludicrous Speed',
        desc: 'Parallel execution architecture enabling 50,000+ TPS with sub-second finality.',
        color: 'text-[#8A4BFF]'
    },
    {
        icon: ShieldCheck,
        title: 'Production Ready',
        desc: 'Battle-tested consensus mechanism secured by a decentralized network of validators.',
        color: 'text-[#FF00E5]'
    },
    {
        icon: Code,
        title: 'Developer First',
        desc: 'Comprehensive SDKs, detailed documentation, and robust tooling for building dApps.',
        color: 'text-[#2EA3FF]'
    }
]

export function Advantage() {
    return (
        <section className="py-32 relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-20 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-6">
                        ENGINEERED FOR <br />
                        <span className="gradient-text">PERFECTION.</span>
                    </h2>
                    <p className="text-xl text-white/50 leading-relaxed">
                        Kortana solves the scalability trilemma without compromising on decentralization or security.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-2 transition-transform duration-500"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                                <f.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{f.title}</h3>
                            <p className="text-white/40 leading-relaxed text-sm">{f.desc}</p>

                            <div className="absolute inset-0 border border-white/0 rounded-3xl group-hover:border-white/10 transition-colors pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
