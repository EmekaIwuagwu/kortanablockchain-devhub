'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function EcosystemPreview() {
    return (
        <section className="py-32 bg-gradient-to-b from-transparent to-black/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-6">
                            BUILT ON <span className="text-[#8A4BFF]">KORTANA.</span>
                        </h2>
                        <p className="text-xl text-white/50 max-w-lg">
                            Join the fastest growing ecosystem of DeFi, NFT, and Web3 applications.
                        </p>
                    </div>
                    <Link href="/ecosystem">
                        <Button variant="outline" className="gap-2">
                            View All Apps <ArrowUpRight size={16} />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProjectCard name="KortanaSwap" cat="DeFi" color="from-blue-500/20" />
                    <ProjectCard name="Poseidon NFT" cat="Marketplace" color="from-purple-500/20" />
                    <ProjectCard name="BridgeX" cat="Infrastructure" color="from-pink-500/20" />
                </div>

                <div className="mt-32 p-12 md:p-20 rounded-[3rem] glass-panel border-white/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#2EA3FF]/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">
                            Ready to <br /> Deploy?
                        </h2>
                        <p className="text-xl text-white/60">
                            Get your dApp running on Kortana Testnet in less than 5 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" variant="default">Read The Docs</Button>
                            <Button size="lg" variant="outline">Get Testnet Funds</Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ProjectCard({ name, cat, color }: { name: string, cat: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`h-[400px] rounded-[2rem] bg-gradient-to-b ${color} to-transparent border border-white/5 p-10 flex flex-col justify-between group cursor-pointer`}
        >
            <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold uppercase tracking-widest">{cat}</span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={20} />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-black text-white italic mb-2">{name}</h3>
                <p className="text-white/40 text-sm">Experience the next generation of {cat} on Kortana.</p>
            </div>
        </motion.div>
    )
}
