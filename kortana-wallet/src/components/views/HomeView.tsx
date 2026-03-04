'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Leaf, Database, Activity, Globe,
    TrendingUp, Send, ArrowDownLeft
} from 'lucide-react';

interface HomeViewProps {
    balance: string;
    network: string;
    tokens: any[];
    onFeatureClick: (id: string) => void;
    onRegisterToken: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ balance, network, tokens, onFeatureClick, onRegisterToken }) => {

    const features = [
        { id: 'compliance', title: 'ZK Compliance', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Privacy-first KYC/AML' },
        { id: 'esg', title: 'ESG Impact', icon: Leaf, color: 'text-neon-green', bg: 'bg-neon-green/10', desc: 'Sustainability tracking' },
        { id: 'stable', title: 'Stable Issue', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Fiat-backed issuance' },
        { id: 'risk', title: 'Risk AI', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'AI DeFi simulations' },
        { id: 'subnet', title: 'Sub-Nets', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Enterprise networks' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">

            {/* Balance + Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">

                {/* Balance Hero */}
                <div className="sm:col-span-2 relative glass-panel rounded-2xl md:rounded-[2.5rem] overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-4 sm:p-6 md:p-10 flex flex-col justify-between min-h-[160px] md:min-h-[280px]">
                    <div className="absolute top-0 right-0 p-4 md:p-10 opacity-5 select-none pointer-events-none">
                        <TrendingUp className="size-24 md:size-48" strokeWidth={1} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Total Balance</p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white font-heading leading-none">
                                {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <span className="text-lg sm:text-xl md:text-3xl font-black text-gray-700 font-heading">DNR</span>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                            <p className="text-sm md:text-base font-bold text-gray-400">$(calculating...) <span className="text-neon-green text-[9px] md:text-xs font-black ml-1">+0.0%</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 md:pt-8 relative z-10">
                        <button onClick={() => onFeatureClick('transact')} className="btn-launch text-xs">
                            <Send className="size-3.5 inline" /> <span>Send</span>
                        </button>
                        <button onClick={() => onFeatureClick('receive')} className="btn-outline text-xs">
                            <ArrowDownLeft className="size-3.5 text-cyan-400" /> <span>Receive</span>
                        </button>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 md:gap-4">
                    <div className="glass-panel p-4 md:p-6 rounded-2xl flex flex-col justify-between min-h-[90px]">
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Staking APY</p>
                            <h4 className="text-2xl md:text-3xl font-black text-white font-heading">18.4% <span className="text-neon-green text-[9px] font-bold font-sans">DNR</span></h4>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                            <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                        </div>
                    </div>
                    <div className="glass-panel p-4 md:p-6 rounded-2xl bg-cyan-400/5 relative overflow-hidden group min-h-[90px]">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl group-hover:bg-cyan-400/40 transition-all duration-700" />
                        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-cyan-400/60 mb-1">Network</p>
                        <h4 className="text-lg md:text-2xl font-black text-white font-heading uppercase tracking-tight">{network}</h4>
                    </div>
                </div>
            </div>

            {/* Assets Section */}
            <section className="space-y-3 md:space-y-5">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg md:text-2xl font-black tracking-tighter text-white font-heading uppercase">
                        Assets <span className="text-white/20">Enclave</span>
                    </h3>
                    <button
                        onClick={onRegisterToken}
                        className="text-[8px] md:text-[9px] font-black text-cyan-400 uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
                    >
                        + Register
                    </button>
                </div>

                <div className="glass-panel rounded-2xl md:rounded-[2rem] border-white/5 overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {/* Native DNR Row */}
                        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-3 md:gap-5 min-w-0">
                                <div className="w-9 h-9 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-white text-sm md:text-lg border border-white/10 group-hover:border-cyan-400/50 transition-colors shrink-0">
                                    D
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h4 className="text-sm md:text-lg font-black text-white leading-none">DNR</h4>
                                    <p className="text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest">Native Protocol Asset</p>
                                </div>
                            </div>
                            <div className="text-right space-y-0.5 shrink-0">
                                <p className="text-base md:text-2xl font-black text-white font-heading">
                                    {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[7px] md:text-[9px] font-bold text-neon-green uppercase tracking-widest">Unlocked</p>
                            </div>
                        </div>

                        {/* Token Rows */}
                        {tokens.map((token, i) => (
                            <div key={i} className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-3 md:gap-5 min-w-0">
                                    <div className="w-9 h-9 md:w-12 md:h-12 bg-purple-400/10 rounded-full flex items-center justify-center font-black text-purple-400 text-sm md:text-lg border border-purple-400/20 group-hover:border-purple-400 transition-colors shrink-0">
                                        {token.symbol?.[0] || 'T'}
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <h4 className="text-sm md:text-lg font-black text-white leading-none">{token.symbol}</h4>
                                        <p className="text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{token.name}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5 shrink-0">
                                    <p className="text-base md:text-2xl font-black text-white font-heading">
                                        {Number(token.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[7px] md:text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="space-y-3 md:space-y-5">
                <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-gray-500 px-1">Enclave Modules</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-4">
                    {features.map((feature) => (
                        <motion.button
                            key={feature.id}
                            whileHover={{ y: -3, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onFeatureClick(feature.id)}
                            className="glass-panel p-3 md:p-6 text-left group hover:bg-white/[0.05] relative overflow-hidden border-white/5 rounded-xl md:rounded-2xl"
                        >
                            <div className={`w-7 h-7 md:w-10 md:h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-all duration-500 shrink-0`}>
                                <feature.icon className={`${feature.color} group-hover:rotate-12 transition-transform`} size={14} />
                            </div>
                            <h4 className="font-black text-[9px] sm:text-[10px] md:text-sm text-white mb-0.5 leading-tight uppercase font-heading tracking-tight">{feature.title}</h4>
                            <p className="text-[7px] md:text-[9px] text-gray-500 leading-snug font-bold uppercase tracking-wide line-clamp-2 hidden sm:block">{feature.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </section>
        </motion.div>
    );
};
