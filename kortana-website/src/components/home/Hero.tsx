'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Play, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { HeroVisual } from '@/components/home/HeroVisual'

export function Hero() {
    const [copied, setCopied] = useState(false)
    const rpcUrl = "https://poseidon-rpc.kortana.name.ng"

    const handleCopy = () => {
        navigator.clipboard.writeText(rpcUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            <HeroVisual />

            <div className="container mx-auto px-4 md:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/80">Testnet Live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                        SPEED <br />
                        WITHOUT <br />
                        <span className="gradient-text">LIMITS.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed font-light">
                        Kortana is the hyper-performance EVM Layer 1 built for the next generation of decentralized applications. Sub-second finality, nearly zero fees, and infinite scalability.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" variant="glow" className="gap-2">
                            Start Building <ArrowRight size={18} />
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2">
                            <FileText size={18} /> Read Docs
                        </Button>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Quick Connect</div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 max-w-md backdrop-blur-md">
                            <div className="w-8 h-8 rounded-lg bg-[#2EA3FF]/10 flex items-center justify-center text-[#2EA3FF]">
                                <Play size={14} fill="currentColor" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-white/40 font-mono truncate">RPC ENDPOINT</div>
                                <div className="text-xs font-mono text-white truncate">{rpcUrl}</div>
                            </div>
                            <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60">
                                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Content / Stats - Floating Elements */}
                {/* The 3D element is background, but we can have floating stats via absolute positioning or grid */}
                <div className="hidden lg:block relative h-[600px] pointer-events-none">
                    {/* Elements here would float over the 3D scene if needed */}
                </div>
            </div>

            {/* Bottom Ticker */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-md z-20">
                <StatsTicker />
            </div>
        </section>
    )
}

function StatsTicker() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label="Active Nodes" value="256" />
            <StatItem label="Block Time" value="400ms" />
            <StatItem label="Finality" value="< 1s" />
            <StatItem label="Avg Cost" value="$0.0001" />
        </div>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{label}</span>
            <span className="text-2xl font-black italic tracking-tight text-white">{value}</span>
        </div>
    )
}
