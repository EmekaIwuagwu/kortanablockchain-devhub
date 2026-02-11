'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Send, ArrowDownLeft, ShieldCheck,
    Leaf, LayoutGrid, Settings, LogOut,
    TrendingUp, Activity, BadgeCheck, ExternalLink,
    Copy, ChevronRight, Zap, Database, Globe, Cpu,
    ArrowUpRight, Wallet as WalletIcon, Search, Filter,
    Layers, Key, Eye, EyeOff, Check, AlertTriangle,
    ArrowLeft, BarChart3, Fingerprint, Coins, Network, Lock as LockIcon
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { ComplianceModal } from './ComplianceModal';
import { ethers } from 'ethers';

// --- Sub-components for different pages ---

const HomeView = ({ balance, network, onFeatureClick }: { balance: string, network: string, onFeatureClick: (id: string) => void }) => {
    const features = [
        { id: 'compliance', title: 'ZK Compliance', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Privacy-first KYC/AML verification' },
        { id: 'esg', title: 'ESG Impact', icon: Leaf, color: 'text-neon-green', bg: 'bg-neon-green/10', desc: 'Sustainability & rewards tracking' },
        { id: 'stable', title: 'Stable Issue', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Secure fiat-backed issuance' },
        { id: 'risk', title: 'Risk AI', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'AI simulations for DeFi actions' },
        { id: 'subnet', title: 'Sub-Nets', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Enterprise permissioned networks' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-12 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="md:col-span-2 relative glass-panel rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-6 md:p-12 flex flex-col justify-between min-h-[200px] md:min-h-[400px]">
                    <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 select-none pointer-events-none">
                        <TrendingUp className="size-20 md:size-60" strokeWidth={1} />
                    </div>
                    <div className="space-y-1 md:space-y-2 relative z-10">
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[7px] md:text-[10px]">Total Balance Home</p>
                        <div className="flex items-baseline gap-1.5 md:gap-4 flex-wrap">
                            <h2 className="text-2xl md:text-8xl font-black tracking-tighter text-white font-heading leading-none">{balance}</h2>
                            <span className="text-base md:text-4xl font-black text-gray-700 font-heading">DNR</span>
                        </div>
                        <div className="flex items-center gap-4 pt-1 md:pt-2">
                            <p className="text-xs md:text-2xl font-bold text-gray-400">$12,542.90 <span className="text-neon-green text-[9px] md:text-sm font-black ml-1 md:ml-2">+12.4%</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 pt-4 md:pt-12 relative z-10">
                        <button onClick={() => onFeatureClick('transact')} className="btn-launch">
                            <Send className="size-3.5 md:size-4 inline mr-2" /> <span>Send</span>
                        </button>
                        <button className="btn-outline">
                            <ArrowDownLeft className="size-3.5 md:size-4 text-cyan-400 inline mr-2" /> <span>Receive</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-8">
                    <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col justify-between">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Staking APY</p>
                            <h4 className="text-2xl md:text-4xl font-black text-white font-heading">18.4% <span className="text-neon-green text-[10px] font-bold font-sans">DNR</span></h4>
                        </div>
                        <div className="w-full h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 md:mt-4">
                            <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                        </div>
                    </div>
                    <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-cyan-400/5 relative overflow-hidden group min-h-[140px]">
                        <div className="absolute top-[-20%] right-[-10%] w-24 md:w-32 h-24 md:h-32 bg-cyan-400/20 rounded-full blur-2xl md:blur-3xl group-hover:bg-cyan-400/40 transition-all duration-700" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-cyan-400/60 mb-1">Active Network</p>
                        <h4 className="text-xl md:text-3xl font-black text-white font-heading uppercase tracking-tight">{network}</h4>
                    </div>
                </div>
            </div>

            <section className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between px-2 border-l-3 md:border-l-4 border-cyan-400 pl-4 md:pl-6">
                    <div>
                        <h3 className="text-xl md:text-3xl font-black tracking-tighter text-white font-heading uppercase">Proprietary Enclave</h3>
                        <p className="text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Hardware-level protocol integrations</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
                    {features.map((feature) => (
                        <motion.button
                            key={feature.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => onFeatureClick(feature.id)}
                            className="glass-panel p-4 md:p-8 text-left group hover:bg-white/[0.05] relative overflow-hidden border-white/5 rounded-xl md:rounded-[2rem]"
                        >
                            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${feature.bg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-all duration-500`}>
                                <feature.icon className={`${feature.color} group-hover:rotate-12 transition-transform`} size={18} />
                            </div>
                            <h4 className="font-black text-[10px] md:text-lg text-white mb-1 md:mb-2 leading-tight uppercase font-heading tracking-tight">{feature.title}</h4>
                            <p className="text-[7px] md:text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide line-clamp-2">{feature.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </section>
        </motion.div>
    );
};

const TransactView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase text-white font-heading">Transact <span className="text-gradient-kortana">Assets</span></h2>
        <div className="glass-panel p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Recipient Address</label>
                <div className="relative group">
                    <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 pl-12 md:pl-16 focus:border-cyan-500/50 outline-none transition-all text-sm md:text-base text-white font-mono" placeholder="0x ... or Domain Name" />
                </div>
            </div>
            <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Amount (DNR)</label>
                <div className="relative">
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 text-2xl md:text-5xl font-black text-white font-heading focus:border-purple-500/50 outline-none transition-all placeholder:text-white/10" placeholder="0.00" />
                    <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-base md:text-2xl font-black text-gray-700 uppercase">DNR</div>
                </div>
            </div>
            <button className="w-full btn-launch !rounded-xl md:!rounded-2xl">Send Transaction</button>
        </div>
    </motion.div>
);

const BridgeView = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8 md:space-y-12">
        <div className="text-center space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-6xl font-black tracking-tighter uppercase text-white font-heading">Cross-Chain <span className="text-gradient-kortana">Bridge</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Bridge your DNR assets between Kortana and other networks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative items-center">
            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 md:space-y-6">
                <p className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">Source Network</p>
                <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-400/20 rounded-lg md:rounded-xl flex items-center justify-center text-cyan-400 font-black text-sm md:text-base">K</div>
                        <span className="font-black text-white text-xs md:text-base uppercase tracking-tight">Kortana Mainnet</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-700" />
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-deep-space shadow-2xl hidden md:flex">
                <ArrowUpRight className="size-5 md:size-6 rotate-45" />
            </div>

            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 md:space-y-6">
                <p className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest">Target Network</p>
                <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:border-purple-500/50 transition-all">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-400/20 rounded-lg md:rounded-xl flex items-center justify-center text-purple-400 font-black text-sm md:text-base">E</div>
                        <span className="font-black text-white text-xs md:text-base uppercase tracking-tight">Ethereum Node</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8">
            <div className="flex items-center justify-between px-2">
                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount to Bridge</label>
                <span className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">Max Available</span>
            </div>
            <div className="relative">
                <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 text-2xl md:text-5xl font-black text-white font-heading focus:border-cyan-500/50 outline-none" placeholder="0.00" />
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 font-black text-gray-700 text-base md:text-2xl">DNR</div>
            </div>
            <div className="p-3 md:p-6 bg-cyan-400/5 rounded-xl md:rounded-2xl border border-cyan-400/10 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <Zap className="text-cyan-400" size={14} />
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-tight">Est. Finality Time</span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">~2.5 Sec</span>
            </div>
            <button className="w-full btn-launch !rounded-xl md:!rounded-2xl">Initiate Bridge</button>
        </div>
    </motion.div>
);

const TransactionsView = () => {
    const transactions = [
        { type: 'Transfer', hash: '0x1a2b...3c4d', amount: '-12.50 DNR', status: 'Confirmed', time: '12m ago', color: 'text-error-red' },
        { type: 'Deposit', hash: '0xef5g...7h8i', amount: '+450.00 DNR', status: 'Confirmed', time: '1h ago', color: 'text-neon-green' },
        { type: 'Mint', hash: '0x9j10...k11l', amount: '0.00 DNR', status: 'Failed', time: '3h ago', color: 'text-gray-500' },
    ];
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8 text-white">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl md:text-3xl font-black tracking-tighter text-white font-heading uppercase">User <span className="text-white/20">Transactions</span></h3>
                <div className="flex gap-2">
                    <button className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 rounded-full text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/10 whitespace-nowrap"><Filter className="inline mr-1 md:mr-2 size-2.5 md:size-3" /> Filter</button>
                </div>
            </div>
            <div className="glass-panel overflow-x-auto border-white/5 bg-transparent p-px rounded-2xl">
                <table className="w-full text-left min-w-[500px] md:min-w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-4 md:px-8 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">Hash</th>
                            <th className="px-4 md:px-8 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">Type</th>
                            <th className="px-4 md:px-8 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                            <th className="px-4 md:px-8 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((tx, i) => (
                            <tr key={i} className="group hover:bg-white/[0.03] transition-colors cursor-pointer">
                                <td className="px-4 md:px-8 py-4 md:py-6 font-mono text-[10px] md:text-xs text-cyan-400/80 group-hover:text-cyan-400 underline underline-offset-4">{tx.hash}</td>
                                <td className="px-4 md:px-8 py-4 md:py-6"><span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5 md:gap-2"><div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyan-400" /> {tx.type}</span></td>
                                <td className={`px-4 md:px-8 py-4 md:py-6 text-right font-mono font-bold text-xs md:text-sm ${tx.color}`}>{tx.amount}</td>
                                <td className="px-4 md:px-8 py-4 md:py-6 text-right text-[8px] md:text-[10px] font-bold text-gray-500 uppercase">{tx.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// --- Feature Content Components ---

const ComplianceView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <ShieldCheck className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">ZK <span className="text-gradient-kortana">Compliance</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Privacy-preserving identity verification enclave</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase font-heading tracking-tight">Active Credentials</h3>
                <div className="space-y-4">
                    <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Fingerprint className="text-cyan-400 size-5 md:size-6" />
                            <span className="font-bold text-white uppercase text-xs md:text-sm">Biometric Shield</span>
                        </div>
                        <span className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                </div>
                <button className="w-full btn-launch mt-4 py-3 md:py-4 text-xs md:text-base">Generate ZK Proof</button>
            </div>
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-center items-center text-center space-y-4 md:space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-3 md:border-4 border-dashed border-cyan-400/30 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LockIcon className="text-cyan-400 size-6 md:size-8" />
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-white uppercase mb-2 text-sm md:text-base">Anonymous Auth</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 max-w-[240px]">Prove eligibility without revealing sensitive personal data using Zero-Knowledge proofs.</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const ESGView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
                <Leaf className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">ESG <span className="text-gradient-kortana">Impact</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Sustainability rewards & ecological scoring</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-neon-green/10 rounded-full blur-[80px] md:blur-[100px]" />
                <div className="flex items-baseline gap-2 md:gap-4 mb-2 flex-wrap">
                    <h3 className="text-5xl md:text-8xl font-black text-white font-heading">850</h3>
                    <span className="text-neon-green font-black uppercase tracking-widest text-xs md:text-base">Impact Score</span>
                </div>
                <p className="text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-[0.2em] mb-8 md:mb-12">Kortana Ecological Footprint Rating</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                    <div className="p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Carbon Saved</p>
                        <p className="text-xl md:text-2xl font-black text-white">1.24 T</p>
                    </div>
                </div>
            </div>
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between gap-6">
                <div className="space-y-3 md:space-y-4 text-white">
                    <h4 className="text-lg md:text-xl font-black text-white uppercase">Green Rewards</h4>
                    <p className="text-[10px] md:text-xs text-gray-500">Claim your DNR rewards for maintaining a high ESG score this month.</p>
                </div>
                <button className="w-full btn-launch !bg-neon-green !text-deep-space py-3 md:py-4 text-xs md:text-base">Claim 50.00 DNR</button>
            </div>
        </div>
    </motion.div>
);

const RiskAIView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-red-400/10 flex items-center justify-center text-red-400 border border-red-400/20">
                <Activity className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">Risk <span className="text-gradient-kortana">Enclave</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">AI-driven predictive security analysis</p>
            </div>
        </div>

        <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] relative overflow-hidden bg-gradient-to-br from-red-500/[0.03] to-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center text-white">
                <div className="space-y-4 md:space-y-8">
                    <div className="space-y-2">
                        <span className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Simulator Status: Online</span>
                        <h3 className="text-2xl md:text-4xl font-black text-white uppercase font-heading tracking-tight">Predatory <span className="text-red-400">Pattern</span></h3>
                        <p className="text-gray-500 text-[10px] md:text-sm leading-relaxed">Our AI has simulated your next 100 potential transactions. We have flagged a 12% risk increase in Sub-Net liquidity pools.</p>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                        <button className="flex-1 sm:flex-none px-4 md:px-8 py-3 md:py-4 bg-red-400 text-deep-space font-black uppercase text-[10px] md:text-xs rounded-xl md:rounded-2xl">Restrict</button>
                        <button className="flex-1 sm:flex-none px-4 md:px-8 py-3 md:py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] md:text-xs rounded-xl md:rounded-2xl">Ignore</button>
                    </div>
                </div>
                <div className="h-48 md:h-64 glass-panel border-white/5 bg-black/40 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center p-4 md:p-8">
                    <div className="w-full h-full flex items-end gap-2 md:gap-3 justify-between">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                className="w-full bg-gradient-to-t from-red-500/20 to-red-400 rounded-t-lg"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const SubNetView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20">
                <Globe className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">Network <span className="text-gradient-kortana">Sub-Nets</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Enterprise partition and sidechain management</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {['Finance-XL', 'Gaming-Core', 'Gov-Enclave'].map((net) => (
                <div key={net} className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 md:space-y-6 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400">
                            <Network className="size-4 md:size-5" />
                        </div>
                        <span className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-neon-green" /> Connected</span>
                    </div>
                    <div>
                        <h4 className="text-xl md:text-2xl font-black text-white uppercase font-heading tracking-tight">{net}</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Shard ID: 9283-XLM</p>
                    </div>
                    <button className="w-full py-3 md:py-4 border border-white/5 bg-white/5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-400 group-hover:text-deep-space transition-all">Switch</button>
                </div>
            ))}
        </div>
    </motion.div>
);

const StableView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-purple-400/10 flex items-center justify-center text-purple-400 border border-purple-400/20">
                <Database className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">Stable <span className="text-gradient-kortana">Issue</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Secure collateralized asset minting</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-10">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight text-white">Mint Enclave Stable</h3>
                <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-white">Collateral Amount (DNR)</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-xl md:text-2xl font-black text-white outline-none" placeholder="1000.00" />
                    </div>
                    <div className="flex items-center justify-center text-white/20">
                        <ArrowDownLeft className="size-6 md:size-8" />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-white">Receive kUSD</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-xl md:text-2xl font-black text-white outline-none bg-cyan-400/5 border-cyan-400/20" placeholder="850.00" readOnly />
                    </div>
                </div>
                <button className="w-full btn-launch py-3 md:py-4 text-xs md:text-base">Confirm Minting</button>
            </div>

            <div className="space-y-6 md:space-y-8">
                <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-purple-400/5 border-purple-400/20 text-white">
                    <h4 className="font-black text-white uppercase tracking-tight mb-2 md:mb-4 text-sm md:text-base">Minting Ratio</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-6xl font-black text-white font-heading">150%</span>
                        <span className="text-purple-400 font-black text-[8px] md:text-xs uppercase">Over-Collateralized</span>
                    </div>
                </div>
                <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-3 md:space-y-4 text-white">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Stablecoin Stability Pool</p>
                    <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest">
                            <span className="text-white">Global kUSD Cap</span>
                            <span className="text-cyan-400">$10,482,000</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[42%] h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const SettingsView = () => {
    const { mnemonic, network, setNetwork, setPasswordHash, reset, passwordHash } = useWalletStore();
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const handleRevealKey = () => {
        if (mnemonic) {
            try {
                const wallet = ethers.Wallet.fromPhrase(mnemonic);
                setPrivateKey(wallet.privateKey);
                setShowKey(true);
            } catch (e) {
                console.error(e);
                alert("Failed to export private key.");
            }
        }
    };

    const handlePasswordChange = () => {
        if (newPass.length < 8) return alert("Password too short");
        if (newPass !== confirmPass) return alert("Passwords do not match");
        setPasswordHash(newPass);
        setNewPass('');
        setConfirmPass('');
        alert("Password updated successfully.");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6 md:space-y-12">
            <h2 className="text-xl md:text-4xl font-black tracking-tighter uppercase font-heading text-white">Wallet <span className="text-gradient-kortana">Settings</span></h2>

            <div className="space-y-6 md:space-y-8">
                {/* Network Switcher */}
                <section className="space-y-3 md:space-y-4">
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Network Configuration</h3>
                    <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="font-black text-white uppercase tracking-tight text-sm md:text-base text-white">Active Enclave</p>
                            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">{network === 'mainnet' ? 'Kortana Mainnet' : 'Kortana Testnet-1'}</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit shrink-0">
                            <button
                                onClick={() => setNetwork('mainnet')}
                                className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${network === 'mainnet' ? 'bg-cyan-500 text-deep-space shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
                            >Mainnet</button>
                            <button
                                onClick={() => setNetwork('testnet')}
                                className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${network === 'testnet' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'}`}
                            >Testnet</button>
                        </div>
                    </div>
                </section>

                {/* Private Key Export */}
                <section className="space-y-3 md:space-y-4 text-white">
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Security & Export</h3>
                    <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] space-y-6 border-rose-500/10 hover:border-rose-500/30 transition-all">
                        <div className="flex items-center gap-3 md:gap-4 flex-wrap sm:flex-nowrap">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                <Key className="size-5 md:size-6" />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <h4 className="font-black text-white uppercase text-sm md:text-base text-white">Export Private Key</h4>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-tight">EVM-compatible access</p>
                            </div>
                            <button
                                onClick={handleRevealKey}
                                className="w-full sm:w-auto btn-outline whitespace-nowrap"
                            >Reveal Key</button>
                        </div>

                        <AnimatePresence>
                            {showKey && privateKey && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-4 md:p-6 bg-rose-500/5 border border-rose-500/20 rounded-xl md:rounded-2xl space-y-4 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <AlertTriangle className="size-3 md:size-3.5" />
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Never share your private key</span>
                                        </div>
                                        <button onClick={() => setShowKey(false)} className="text-gray-500 hover:text-white text-[8px] md:text-[10px] font-black uppercase">Hide</button>
                                    </div>
                                    <div className="relative group">
                                        <p className="font-mono text-[10px] md:text-xs break-all text-white bg-black/40 p-3 md:p-4 rounded-lg md:rounded-xl border border-white/5 select-all">{privateKey}</p>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(privateKey)}
                                            className="absolute right-2 top-2 p-1.5 md:p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        ><Copy className="size-3 md:size-3.5" /></button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Change Password */}
                <section className="space-y-3 md:space-y-4">
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Access Control</h3>
                    <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 text-white">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New password</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-white">Confirm password</label>
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button onClick={handlePasswordChange} className="w-full btn-outline">Update Access Password</button>
                    </div>
                </section>

                <div className="pt-6 md:pt-8 border-t border-white/5">
                    <button onClick={reset} className="w-full p-4 md:p-6 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl md:rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px]">Destroy Enclave & Clear All Data</button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Dashboard Component ---

export const Dashboard: React.FC = () => {
    const { address, balance, network, reset, setLocked } = useWalletStore();
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    const handleLogout = () => {
        setLocked(true);
    };

    const handleFeatureClick = (id: string) => {
        setActiveTab(id);
    };

    return (
        <div className="flex h-screen bg-deep-space text-white overflow-hidden relative font-sans">
            <div className="grainy-overlay" />

            {/* Background Nebulas */}
            <div className="nebula-purple absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-30 select-none pointer-events-none" />
            <div className="nebula-cyan absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-20 select-none pointer-events-none" />

            {/* Sidebar */}
            <aside className="flex w-14 md:w-20 lg:w-72 glass-panel border-r-0 rounded-none bg-deep-space/60 backdrop-blur-3xl px-1.5 md:px-3 lg:px-6 py-6 flex-col z-20 transition-all duration-300">
                <div className="mb-8 lg:mb-12 flex items-center justify-center lg:justify-start gap-4 lg:px-2">
                    <img src="/images/logo.png" alt="K" className="w-8 h-8 lg:w-12 lg:h-12 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                    <div className="hidden lg:block">
                        <h2 className="font-black text-2xl tracking-tighter leading-none uppercase">Kortana</h2>
                        <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase mt-1">Poseidon</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5 md:space-y-2">
                    {[
                        { id: 'home', icon: LayoutGrid, label: 'Home' },
                        { id: 'transact', icon: Send, label: 'Transact' },
                        { id: 'bridge', icon: Layers, label: 'Bridge' },
                        { id: 'history', icon: History, label: 'Transactions' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-center lg:justify-start gap-4 p-2.5 md:p-4 rounded-lg md:rounded-2xl transition-all duration-300 group
                                ${activeTab === item.id ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            title={item.label}
                        >
                            <item.icon strokeWidth={activeTab === item.id ? 2.5 : 2} className={`size-4.5 md:size-5 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                            <span className="hidden lg:block font-bold tracking-tight text-sm uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center lg:justify-start gap-4 p-2.5 md:p-4 rounded-lg md:rounded-2xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                        title="Lock Enclave"
                    >
                        <LogOut className="size-4.5 md:size-5" />
                        <span className="hidden lg:block text-xs uppercase tracking-[0.2em]">Lock Enclave</span>
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <main className="flex-1 overflow-y-auto p-4 md:p-12 relative z-10 space-y-6 md:space-y-12 max-w-[1600px] mx-auto w-full">
                {/* Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 md:gap-3">
                            {['compliance', 'esg', 'stable', 'risk', 'subnet'].includes(activeTab) && (
                                <button onClick={() => setActiveTab('home')} className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ArrowLeft className="size-4 md:size-5 text-gray-500" />
                                </button>
                            )}
                            <h1 className="text-sm md:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm font-heading">POSEIDON <span className="text-gradient-kortana">ENCLAVE</span></h1>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-0.5 md:py-1.5 bg-white/5 rounded-full w-fit group cursor-pointer hover:bg-white/10 transition-all border border-white/5 ml-0.5 md:ml-11" onClick={() => {
                            navigator.clipboard.writeText(address || '');
                            alert('Address Copied');
                        }}>
                            <span className="font-mono text-[8px] md:text-[10px] text-gray-500 tracking-wider">
                                {address?.slice(0, 8)}...{address?.slice(-6)}
                            </span>
                            <Copy className="size-2 md:size-3 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 mt-1 md:mt-0">
                        <div className={`px-3 md:px-5 py-1 md:py-2.5 glass-panel rounded-full flex items-center gap-1.5 md:gap-3 border-opacity-30 border ${network === 'mainnet' ? 'border-cyan-400 bg-cyan-400/5' : 'border-purple-400 bg-purple-400/5'}`}>
                            <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full animate-pulse ${network === 'mainnet' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                            <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${network === 'mainnet' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                {network.toUpperCase()} SYNC
                            </span>
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl glass-panel flex items-center justify-center hover:scale-110 transition-transform cursor-pointer text-cyan-400 shrink-0">
                            <Zap className="size-3.5 md:size-5" />
                        </div>
                    </div>
                </div>

                {/* Tab Content Rendering */}
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && <HomeView key="home" balance={balance} network={network} onFeatureClick={handleFeatureClick} />}
                    {activeTab === 'transact' && <TransactView key="transact" />}
                    {activeTab === 'bridge' && <BridgeView key="bridge" />}
                    {activeTab === 'history' && <TransactionsView key="history" />}
                    {activeTab === 'settings' && <SettingsView key="settings" />}

                    {/* Feature Specific Views */}
                    {activeTab === 'compliance' && <ComplianceView key="compliance" />}
                    {activeTab === 'esg' && <ESGView key="esg" />}
                    {activeTab === 'stable' && <StableView key="stable" />}
                    {activeTab === 'risk' && <RiskAIView key="risk" />}
                    {activeTab === 'subnet' && <SubNetView key="subnet" />}
                </AnimatePresence>
            </main>

            <ComplianceModal isOpen={isComplianceOpen} onClose={() => setIsComplianceOpen(false)} />
        </div>
    );
};
