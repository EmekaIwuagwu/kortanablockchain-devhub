'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ExternalLink, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';
import { ethers } from 'ethers';

export const TransactionsView: React.FC = () => {
    const { address, network } = useWalletStore();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (address) fetchHistory();
    }, [address, network]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const history = await providerService.getAddressHistory(address!, network);
            setTransactions(history);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (value: string, from: string) => {
        const isOutflow = from.toLowerCase() === address?.toLowerCase();
        const formatted = parseFloat(ethers.formatEther(value)).toFixed(4);
        return {
            amount: `${isOutflow ? '-' : '+'}${formatted}`,
            color: isOutflow ? 'text-rose-400' : 'text-neon-green',
            icon: isOutflow ? ArrowUpRight : ArrowDownLeft
        };
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6 text-white pb-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg md:text-2xl font-black tracking-tighter text-white font-heading uppercase">
                    Live <span className="text-white/20">Ledger</span>
                </h3>
                <button
                    onClick={fetchHistory}
                    className="px-3 py-1.5 bg-white/5 rounded-full text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest border border-white/10 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                    <RefreshCw className="size-3" />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="animate-spin text-cyan-400" size={28} />
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Querying Blockchain...</p>
                </div>
            ) : (
                <div className="glass-panel border-white/5 bg-transparent rounded-xl md:rounded-2xl overflow-hidden">
                    {/* MOBILE: Card layout */}
                    <div className="md:hidden divide-y divide-white/5">
                        {transactions.length === 0 ? (
                            <div className="py-16 text-center opacity-30">
                                <ExternalLink size={32} className="mx-auto mb-3" />
                                <p className="uppercase font-black text-[9px] tracking-widest">No activity on {network}</p>
                            </div>
                        ) : transactions.map((tx, i) => {
                            const { amount, color, icon: Icon } = formatAmount(tx.value || '0', tx.from);
                            return (
                                <div key={tx.hash || i} className="p-4 hover:bg-white/[0.03] transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-mono text-[9px] text-cyan-400/80 truncate">{tx.hash || 'Internal Tx'}</p>
                                            <p className="text-[7px] font-bold text-gray-600 uppercase mt-0.5 truncate">
                                                {tx.from.slice(0, 6)}...{tx.from.slice(-4)} → {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-mono font-black text-sm ${color} flex items-center gap-1 justify-end`}>
                                                <Icon size={12} />
                                                {amount} <span className="text-gray-600 text-[8px]">DNR</span>
                                            </p>
                                            <p className="text-[7px] font-bold text-gray-600 mt-0.5">
                                                {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString() : 'Recent'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* DESKTOP: Table layout */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-gray-500">Transaction</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-gray-500">Method</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx, i) => {
                                    const { amount, color, icon: Icon } = formatAmount(tx.value || '0', tx.from);
                                    return (
                                        <tr key={tx.hash || i} className="group hover:bg-white/[0.03] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-mono text-[10px] text-cyan-400/80 group-hover:text-cyan-400 transition-colors truncate max-w-[160px]">
                                                        {tx.hash || 'Internal Tx'}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-gray-600 uppercase">
                                                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)} → {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')}`} />
                                                    {tx.method || (tx.from.toLowerCase() === address?.toLowerCase() ? 'Send' : 'Receive')}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-5 text-right font-mono font-black text-sm ${color}`}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Icon size={12} />
                                                    {amount} <span className="text-gray-600 text-[9px]">DNR</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right text-[8px] font-bold text-gray-500 uppercase whitespace-nowrap">
                                                {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Recent'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <ExternalLink size={36} />
                                                <p className="uppercase font-black text-[9px] tracking-widest">No activity found on {network}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
