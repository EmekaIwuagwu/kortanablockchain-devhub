'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, ChevronLeft, ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getGlobalTransactions, provider } from '@/lib/rpc';
import { ethers } from 'ethers';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const txsPerPage = 25;

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                // Fetch global transactions instead of scanning blocks
                const allTxs = await getGlobalTransactions();

                const paginatedTxs = allTxs.slice(page * txsPerPage, (page + 1) * txsPerPage);
                setTransactions(paginatedTxs.map(tx => ({
                    ...tx,
                    value_formatted: ethers.formatEther(tx.value || 0)
                })));
            } catch (err) {
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [page]);

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading mb-2">Transactions</h1>
                    <p className="text-dim">Viewing latest transactions on the Kortana network</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', opacity: page === 0 ? 0.5 : 1 }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setPage(page + 1)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Txn Hash</th>
                            <th>Method</th>
                            <th>Block</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Value</th>
                            <th>Fee (DNR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>Scanning blocks for transactions...</td></tr>
                        ) : transactions.map((tx) => (
                            <tr key={tx.hash}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-accent" />
                                        <Link href={`/tx/${tx.hash}`} className="text-accent text-small">
                                            {tx.hash?.substring(0, 14)}...
                                        </Link>
                                    </div>
                                </td>
                                <td>
                                    <div className="text-small" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', display: 'inline-block' }}>
                                        {tx.data && tx.data !== '0x' ? (tx.data.length > 10 ? 'Contract Call' : 'Transfer') : 'Transfer'}
                                    </div>
                                </td>
                                <td>
                                    <Link href={`/block/${tx.blockNumber}`} className="text-accent text-small">
                                        #{tx.blockNumber}
                                    </Link>
                                </td>
                                <td>
                                    <Link href={`/address/${tx.from}`} className="text-accent text-small">
                                        {tx.from?.substring(0, 10)}...
                                    </Link>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <ArrowRight size={12} className="text-dim" />
                                        <Link href={`/address/${tx.to}`} className="text-accent text-small">
                                            {tx.to?.substring(0, 10)}...
                                        </Link>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-heading" style={{ fontSize: '0.9rem' }}>{tx.value_formatted} DNR</span>
                                </td>
                                <td className="text-dim text-small">
                                    {(Number(tx.gasLimit || 0) * Number(tx.gasPrice || 0) / 1e18).toFixed(6)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && transactions.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center' }} className="text-dim">No transactions found in recent blocks.</div>
                )}
            </div>

            {/* Removed dynamic scanner button as we now use a global index */}
        </div>
    );
};

export default TransactionsPage;
