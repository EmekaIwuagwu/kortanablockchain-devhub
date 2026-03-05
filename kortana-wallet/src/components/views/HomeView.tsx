'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Leaf, BrainCircuit, Database,
    ArrowUpRight, ArrowDownLeft, ChevronRight,
    Loader2, Zap, Activity
} from 'lucide-react';
import { priceService } from '@/lib/PriceService';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';

interface HomeViewProps {
    onFeatureClick: (id: string) => void;
    onRegisterToken: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onFeatureClick, onRegisterToken }) => {
    const { address, network, balance, tokens } = useWalletStore();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const dnrPrice = priceService.getValue(balance, 'DNR');
    const dnrChange = priceService.get24hChange('DNR');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!address) return;
            setLoading(true);
            try {
                const txs = await providerService.getAddressHistory(address, network);
                setHistory(txs.slice(0, 5));
            } catch (e) {
                console.error("Failed to fetch history:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [address, network]);

    const features = [
        { id: 'compliance', title: 'ZK Compliance', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Privacy-first KYC/AML' },
        { id: 'esg', title: 'ESG Impact', icon: Leaf, color: 'text-neon-green', bg: 'bg-neon-green/10', desc: 'Sustainability tracking' },
        { id: 'risk', title: 'Risk AI', icon: BrainCircuit, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Security monitoring' },
        { id: 'stable', title: 'Stable Issue', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Asset minting' },
    ];

    // Sub-Quantum Pulse Line for the UI
    const pulsePath = "M0 50 Q 25 10, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50";

    return (
        <div className="space-y-6 md:space-y-12 pb-8">
            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 md:p-14 rounded-2xl md:rounded-[4rem] relative overflow-hidden bg-gradient-kortana group shadow-2xl"
            >
                {/* Pulse Background Animation */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        <motion.path
                            d={pulsePath}
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1, x: [-20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <ShieldCheck className="size-48 md:size-64 lg:size-80 text-white" />
                </div>

                <div className="relative z-10 space-y-4 md:space-y-8">
                    <div className="space-y-1">
                        <p className="text-[10px] md:text-sm font-black text-white/50 uppercase tracking-[0.5em] flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            Total Enclave Value
                        </p>
                        <h2 className="text-5xl md:text-8xl lg:text-9xl font-black text-white font-heading tracking-tighter leading-none">
                            ${dnrPrice}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="px-5 py-2 md:px-8 md:py-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
                            <span className="text-white font-black text-xs md:text-2xl">{balance} <span className="text-white/50">DNR</span></span>
                        </div>
                        <div className={`px-5 py-2 md:px-8 md:py-3 rounded-full border flex items-center gap-2 shadow-2xl ${dnrChange >= 0 ? 'bg-neon-green/10 border-neon-green/20 text-neon-green' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                            <span className="font-black text-[10px] md:text-xl uppercase tracking-widest">{dnrChange >= 0 ? '+' : ''}{dnrChange}%</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {features.map((f, i) => (
                    <motion.button
                        key={f.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        onClick={() => onFeatureClick(f.id)}
                        className="glass-panel p-5 md:p-10 rounded-2xl md:rounded-[3rem] text-left hover:bg-white/[0.05] transition-all group border-white/5 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <f.icon className="size-24" />
                        </div>
                        <div className={`w-10 h-10 md:w-16 md:h-16 rounded-2xl ${f.bg} flex items-center justify-center ${f.color} mb-6 border border-white/5 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                            <f.icon className="size-6 md:size-10" />
                        </div>
                        <h3 className="font-black text-white uppercase text-[10px] md:text-xl tracking-tighter leading-none mb-2 relative z-10">{f.title}</h3>
                        <p className="text-[8px] md:text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60 leading-tight relative z-10">{f.desc}</p>
                    </motion.button>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-6 md:p-12 rounded-2xl md:rounded-[3.5rem] bg-gradient-to-br from-white/[0.02] to-transparent shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div className="flex items-center gap-3">
                            <Activity className="text-cyan-400 size-5 md:size-7" />
                            <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter font-heading">Recent <span className="text-gradient-kortana">Pulse</span></h3>
                        </div>
                        <button className="text-[10px] md:text-sm font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Audit Ledger</button>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 md:h-32 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                                ))}
                            </div>
                        ) : history.length > 0 ? (
                            history.map((tx: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 md:p-7 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all cursor-pointer shadow-lg hover:shadow-cyan-400/5"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-10 h-10 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border shadow-2xl transition-transform group-hover:scale-110 ${tx.type === 'Sent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/20' : 'bg-neon-green/10 border-neon-green/20 text-neon-green shadow-neon-green/20'}`}>
                                            {tx.type === 'Sent' ? <ArrowUpRight className="size-5 md:size-8" /> : <ArrowDownLeft className="size-5 md:size-8" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase text-xs md:text-xl tracking-tighter">{tx.type} Signal</p>
                                            <p className="text-[8px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">{tx.time || 'Confirmed'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-white text-xs md:text-xl tracking-tight leading-none">{tx.amount} <span className="text-[8px] md:text-xs text-gray-600 uppercase">DNR</span></p>
                                        <div className="flex items-center justify-end gap-1.5 mt-2">
                                            <Zap size={10} className="text-cyan-400" />
                                            <p className="text-[7px] md:text-[9px] text-cyan-400 font-black uppercase tracking-[0.2em]">Verified</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-24 bg-black/40 rounded-3xl border border-white/5 border-dashed relative group">
                                <Activity className="size-16 md:size-24 text-gray-800 mx-auto mb-6 opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                                <h4 className="text-xs md:text-lg font-black text-gray-500 uppercase tracking-[0.5em] mb-2">Shard Registry Empty</h4>
                                <p className="text-[8px] md:text-[10px] text-gray-700 font-bold uppercase tracking-widest px-10">No recent sub-quantum signatures detected in the {network} partition.</p>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sub-Assets */}
                <div className="glass-panel p-6 md:p-12 rounded-2xl md:rounded-[3.5rem] bg-gradient-to-br from-white/[0.02] to-transparent shadow-2xl flex flex-col relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 opacity-5">
                        <Database size={200} />
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter mb-10 font-heading relative z-10">Asset <span className="text-gradient-kortana">Vault</span></h3>
                    <div className="flex-1 space-y-6 relative z-10">
                        {tokens.map((token: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group cursor-pointer shadow-xl"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:border-cyan-400/50 transition-colors shadow-blue">
                                        <Database className="size-5 md:size-8" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-white uppercase text-xs md:text-lg truncate tracking-tight">{token.symbol}</p>
                                        <p className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase tracking-widest">Enclave Asset</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-white text-xs md:text-lg">{token.balance}</p>
                                    <p className="text-[8px] md:text-[10px] text-neon-green font-black uppercase tracking-widest">Safe</p>
                                </div>
                            </motion.div>
                        ))}
                        {tokens.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full border border-dashed border-white/10 flex items-center justify-center opacity-30">
                                    <Database className="size-10 md:size-16 text-gray-600 outline-none" />
                                </div>
                                <p className="text-[9px] md:text-xs font-black text-gray-600 uppercase tracking-[0.3em]">No sub-tokens pulse detected</p>
                                <button
                                    onClick={onRegisterToken}
                                    className="px-6 py-3 border border-cyan-400/30 rounded-full text-[9px] md:text-xs font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-400/10 transition-all shadow-kortana active:scale-95"
                                >
                                    Register Asset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
