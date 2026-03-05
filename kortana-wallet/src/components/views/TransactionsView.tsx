'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter, ExternalLink, ArrowUpRight, ArrowDownLeft,
    Loader2, RefreshCw, Terminal, Clock, Shield, Search,
    ChevronRight, Zap, Database
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';
import { NETWORKS, NetworkType } from '@/lib/constants';
import { ethers } from 'ethers';

export const TransactionsView: React.FC = () => {
    const { address, network } = useWalletStore();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (address) fetchHistory();
    }, [address, network]);

    const fetchHistory = async () => {
        setIsRefreshing(true);
        if (transactions.length === 0) setLoading(true);
        try {
            const history = await providerService.getAddressHistory(address!, network);
            setTransactions(history);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const formatAmount = (value: string, from: string) => {
        const isOutflow = from.toLowerCase() === address?.toLowerCase();
        const formatted = parseFloat(ethers.formatEther(value)).toFixed(4);
        return {
            amount: `${isOutflow ? '-' : '+'}${formatted}`,
            color: isOutflow ? 'text-rose-400' : 'text-neon-green',
            icon: isOutflow ? ArrowUpRight : ArrowDownLeft,
            bg: isOutflow ? 'bg-rose-400/5' : 'bg-neon-green/5',
            border: isOutflow ? 'border-rose-400/10' : 'border-neon-green/10'
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-10 text-white pb-10"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-cyan animate-pulse" />
                        <h3 className="text-2xl md:text-5xl font-black tracking-tighter text-white font-heading uppercase">
                            Live <span className="text-gradient-kortana">Ledger</span>
                        </h3>
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-[0.4em] opacity-60">Real-Time Enclave Audit Trail</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            placeholder="SEARCH HASH..."
                            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase outline-none focus:border-cyan-400/30 w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchHistory}
                        disabled={isRefreshing}
                        className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                        <RefreshCw className={`size-5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="glass-panel p-20 rounded-[3rem] border-white/5 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 border-2 border-dashed border-cyan-400/20 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Database size={32} className="text-cyan-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.5em]">Synchronizing Ledger</p>
                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Querying Kortana {network} Enclaves...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 md:space-y-8">
                    {/* Stats Summary Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-panel p-5 rounded-3xl border-white/5 bg-white/[0.02]">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Signals</p>
                            <p className="text-xl md:text-2xl font-black text-white">{transactions.length}</p>
                        </div>
                        <div className="glass-panel p-5 rounded-3xl border-white/5 bg-white/[0.02]">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Active Network</p>
                            <p className="text-xl md:text-2xl font-black text-cyan-400 uppercase tracking-tighter">{network}</p>
                        </div>
                    </div>

                    {/* Ledger List (Refactored to vertical flex cards to avoid horizontal scroll) */}
                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <div className="glass-panel py-24 text-center space-y-6 rounded-[3rem] border-white/5">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                    <Terminal size={32} className="text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <p className="uppercase font-black text-xs md:text-lg tracking-[0.5em] text-gray-600">Empty Archive</p>
                                    <p className="text-[8px] md:text-xs font-bold text-gray-800 uppercase tracking-widest px-10">Historical records for {address} are currently non-existent on the {network} partition.</p>
                                </div>
                                <button onClick={fetchHistory} className="btn-outline px-8 py-3 text-[10px] font-black uppercase tracking-widest">Scan Again</button>
                            </div>
                        ) : (
                            transactions.map((tx, i) => {
                                const { amount, color, icon: Icon, bg, border } = formatAmount(tx.value || '0', tx.from);

                                return (
                                    <motion.div
                                        key={tx.hash || i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => window.open(`${NETWORKS[network as NetworkType]?.explorer || 'https://explorer.testnet.kortana.xyz'}/tx/${tx.hash}`, '_blank')}
                                        className="group glass-panel p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 shadow-xl"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${bg} ${border} border flex items-center justify-center ${color} shadow-inner group-hover:scale-110 transition-transform shrink-0`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between md:justify-start gap-3">
                                                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${color}`}>
                                                        {tx.from.toLowerCase() === address?.toLowerCase() ? 'Outflow Pulse' : 'Inflow Pulse'}
                                                    </span>
                                                    <span className="md:hidden text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                                        {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString() : 'Recent'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 group/hash">
                                                    <p className="font-mono text-[11px] md:text-sm text-white font-black tracking-tighter truncate opacity-80 group-hover/hash:opacity-100 transition-opacity">
                                                        {tx.hash}
                                                    </p>
                                                    <ExternalLink size={12} className="text-gray-600 shrink-0 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                                <div className="flex items-center gap-2 opacity-40">
                                                    <Shield size={10} className="text-neon-green" />
                                                    <span className="text-[8px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest">SECURE_SHARD_VERIFIED</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0 gap-2">
                                            <div className="text-left md:text-right">
                                                <div className={`text-xl md:text-3xl font-black font-heading tracking-tighter ${color} flex items-center md:justify-end gap-2`}>
                                                    {amount} <span className="text-[10px] md:text-lg text-gray-500 font-sans tracking-normal font-bold">DNR</span>
                                                </div>
                                                <div className="hidden md:flex items-center justify-end gap-1.5 opacity-60">
                                                    <Zap size={10} className="text-cyan-400" />
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{tx.method || 'Direct Transfer'}</span>
                                                </div>
                                            </div>

                                            <div className="text-right space-y-0.5">
                                                <div className="text-[10px] md:text-xs font-black text-white flex items-center justify-end gap-2 uppercase tracking-tighter opacity-70">
                                                    <Clock size={12} className="text-gray-600" />
                                                    {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString() : 'RECENT'}
                                                </div>
                                                <div className="hidden md:block text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] text-right">
                                                    {tx.timestamp ? new Date(tx.timestamp * 1000).toDateString() : 'REAL-TIME'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex w-10 h-10 rounded-full border border-white/5 items-center justify-center text-white/5 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
