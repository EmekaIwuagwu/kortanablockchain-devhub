'use client';

import { motion } from 'framer-motion';
import { Sparkles, Construction, Layers, Zap } from 'lucide-react';

export default function EcosystemShowcase() {
    return (
        <section className="py-32 relative overflow-hidden bg-gradient-to-b from-deep-space to-black/20">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        Foundation Layer
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                        A Borderless <span className="text-gradient">Ecosystem</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl text-xl leading-relaxed font-medium">
                        The Kortana Ecosystem is currently in its <strong>Genesis Phase</strong>.
                        We are building the core primitive layers for the next decade of industrial finance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FutureCard
                        icon={<Construction className="w-8 h-8 text-cyan-400" />}
                        title="Institutional DeFi"
                        desc="Advanced liquidity protocols and automated credit markets currently in stealth development."
                    />
                    <FutureCard
                        icon={<Layers className="w-8 h-8 text-purple-400" />}
                        title="RWA Tokenization"
                        desc="Legal frameworks and asset containers for bridging real-world value to the Kortana chain."
                    />
                    <FutureCard
                        icon={<Zap className="w-8 h-8 text-neon-green" />}
                        title="Native Infrastructure"
                        desc="High-performance indexers and oracle networks optimized for the Solaris engine."
                    />
                </div>

                <div className="mt-32 glass-panel p-16 rounded-[3rem] border-white/5 bg-white/[0.01] text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h3 className="text-3xl font-black text-white mb-6 tracking-tight italic">Building the Future.</h3>
                    <p className="text-gray-500 max-w-xl mx-auto mb-10 font-medium">
                        We are strictly focused on protocol stability and core-developer onboarding.
                        Public ecosystem deployment will commence following the Phase 2 audit completion.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button className="px-12 py-5 bg-white text-deep-space font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform">
                            View Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

function FutureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-10 rounded-[2.5rem] glass-panel border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-500 text-center">
            <div className="mb-8 p-6 bg-white/5 w-fit rounded-3xl mx-auto border border-white/5 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 text-gray-500 text-[8px] font-black uppercase tracking-widest mb-4 w-fit mx-auto">
                Development Phase
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
        </div>
    )
}
