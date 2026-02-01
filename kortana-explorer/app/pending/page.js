'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPendingTransactions } from '@/lib/rpc';
import { ethers } from 'ethers';
import { Clock, Activity, ArrowRight, Loader } from 'lucide-react';

const PendingTransactions = () => {
    const [pendingTxs, setPendingTxs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const rawTxs = await getPendingTransactions();
                // Format RPC data for display
                const formatted = rawTxs.map(tx => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value), // Convert hex/wei to DNR
                    gas: BigInt(tx.gas).toString(), // Convert hex to string
                    timestamp: Date.now() // Mempool txs don't have block time yet
                }));
                setPendingTxs(formatted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPending();
        const interval = setInterval(fetchPending, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mempool</h1>
                    <p className="text-dim">Transactions waiting to be included in the next Kortana block.</p>
                </div>
                <div style={{ background: 'rgba(254, 228, 64, 0.1)', color: 'var(--warning)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(254, 228, 64, 0.2)' }} className="flex items-center gap-2">
                    <Activity size={20} className="animate-pulse" />
                    <span className="font-heading">Real-time Feed Active</span>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Txn Hash</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Value</th>
                            <th>Gas Limit</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingTxs.map((tx) => (
                            <tr key={tx.hash}>
                                <td>
                                    <Link href={`/tx/${tx.hash}`} className="text-accent text-small">
                                        {tx.hash.substring(0, 16)}...
                                    </Link>
                                </td>
                                <td>
                                    <Link href={`/address/${tx.from}`} className="text-dim text-small">
                                        {tx.from.substring(0, 10)}...
                                    </Link>
                                </td>
                                <td>
                                    <Link href={`/address/${tx.to}`} className="text-dim text-small">
                                        {tx.to.substring(0, 10)}...
                                    </Link>
                                </td>
                                <td className="font-heading">{tx.value} DNR</td>
                                <td className="text-dim">{tx.gas}</td>
                                <td>
                                    <div className="flex items-center gap-2 text-warning text-small">
                                        <Clock size={14} /> Pending
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="flex items-center justify-center" style={{ padding: '4rem' }}>
                        <Loader className="animate-spin text-primary-light" size={32} />
                    </div>
                )}
                {!loading && pendingTxs.length === 0 && (
                    <div className="text-dim" style={{ padding: '4rem', textAlign: 'center' }}>No pending transactions.</div>
                )}
            </div>
        </div>
    );
};

export default PendingTransactions;
