'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Building2,
    Wallet,
    ExternalLink,
    Search,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TransactionsRegistry() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/transactions');
            const data = await response.json();
            setTransactions(data.transactions || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.property?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.wallet?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-[#0A1929] mb-2 tracking-tight">System Ledger</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Full Transaction History & Audit Log</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Hash, Wallet, Property..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-[#0A1929] outline-none focus:border-[#DC143C] transition-colors w-80 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-[#0A1929] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8">Type & Identity</th>
                                <th className="p-8">Asset</th>
                                <th className="p-8">Financials</th>
                                <th className="p-8">Blockchain Hash</th>
                                <th className="p-8 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold italic">Loading ledger records...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold italic">No records found.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'INVESTMENT' ? 'bg-green-50 text-green-600' : 'bg-[#DC143C]/5 text-[#DC143C]'
                                                    }`}>
                                                    {tx.type === 'INVESTMENT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0A1929] text-xs uppercase tracking-wider">{tx.type.replace('_', ' ')}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono mt-1">{tx.wallet || 'System Payout'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 font-bold text-[#0A1929] text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Building2 size={14} className="text-gray-300" />
                                                <span>{tx.property}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center space-x-1 text-[#00E676] font-black">
                                                <span>{tx.amount}</span>
                                                <span className="text-[10px] uppercase">DNR</span>
                                            </div>
                                            {tx.tokenAmount && (
                                                <div className="text-[10px] text-gray-400 font-bold">{tx.tokenAmount} Tokens</div>
                                            )}
                                        </td>
                                        <td className="p-8">
                                            <a
                                                href={`https://explorer-testnet.kortana.worchsester.xyz/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 text-gray-400 hover:text-[#DC143C] transition-colors font-mono text-[11px]"
                                            >
                                                <span>{tx.txHash?.substring(0, 10)}...{tx.txHash?.substring(tx.txHash.length - 8)}</span>
                                                <ExternalLink size={12} />
                                            </a>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="text-xs font-bold text-[#0A1929]">{new Date(tx.date).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
                                                {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
