'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAddressBalance, getTokenMetadata, getAddressHistory, getTransactionCount, provider } from '@/lib/rpc';
import { Wallet, Copy, ExternalLink, Activity, Box, Database, Clock, ArrowRight, Ban } from 'lucide-react';
import { ethers } from 'ethers';
import Link from 'next/link';

const AddressDetail = () => {
    const { address } = useParams();
    const [balance, setBalance] = useState('0');
    const [nonce, setNonce] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transactions');
    const [tokens, setTokens] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const [bal, count, history] = await Promise.all([
                    getAddressBalance(address),
                    getTransactionCount(address),
                    getAddressHistory(address)
                ]);

                setBalance(bal);
                setNonce(count);
                setTransactions(history);

                // Try to see if this address is a token contract
                const tokenData = await getTokenMetadata(address);
                if (tokenData) {
                    setTokens([tokenData]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, [address]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    if (loading) return (
        <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
            <div className="empty-icon" style={{ margin: '0 auto' }}>
                <Activity size={32} className="animate-pulse" />
            </div>
            <h2 className="font-heading mt-4">Exploring Address...</h2>
        </div>
    );

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            {/* Address Header */}
            <div className="glass-card mb-8" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div style={{ padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', boxShadow: '0 8px 16px rgba(157, 78, 221, 0.2)' }}>
                            <Wallet size={28} />
                        </div>
                        <div>
                            <div className="text-dim text-small font-heading" style={{ letterSpacing: '0.05em', marginBottom: '4px' }}>ADDRESS</div>
                            <div className="flex items-center gap-3">
                                <h2 className="font-heading" style={{ fontSize: '1.5rem', wordBreak: 'break-all' }}>{address}</h2>
                                <button onClick={copyToClipboard} className="nav-link" style={{ padding: '4px' }}>
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="glass-card" style={{
                    background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(60, 9, 108, 0.2))',
                    border: '1px solid rgba(157, 78, 221, 0.2)'
                }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dim text-small font-heading">DINAR BALANCE</span>
                        <Database size={18} className="text-accent" />
                    </div>
                    <div className="flex items-end gap-2">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1' }}>{balance}</h1>
                        <span className="font-heading text-accent" style={{ fontSize: '1rem', marginBottom: '6px' }}>DNR</span>
                    </div>
                    <div className="text-dim text-small mt-2">≈ ${(parseFloat(balance) * 1.24).toLocaleString()} USD</div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dim text-small font-heading">TOTAL TRANSACTIONS</span>
                        <Activity size={18} className="text-primary-light" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1' }}>{transactions.length}</h1>
                    <div className="text-dim text-small mt-2">Transactions on Kortana</div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dim text-small font-heading">NONCE</span>
                        <Box size={18} className="text-warning" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1' }}>{nonce}</h1>
                    <div className="text-dim text-small mt-2">Last confirmed txn index</div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="mt-12">
                <div className="tabs-container mb-6">
                    <div className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Transactions</div>
                    <div className={`tab ${activeTab === 'internal' ? 'active' : ''}`} onClick={() => setActiveTab('internal')}>Internal Txns</div>
                    <div className={`tab ${activeTab === 'tokens' ? 'active' : ''}`} onClick={() => setActiveTab('tokens')}>Token Transfers</div>
                    <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
                </div>

                <div className="glass-card" style={{ padding: '0', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeTab === 'transactions' ? (
                        transactions.length > 0 ? (
                            <div style={{ width: '100%' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Txn Hash</th>
                                            <th>Nonce</th>
                                            <th>Age</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.hash}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                                            <ArrowRight size={14} className="text-dim" />
                                                        </div>
                                                        <Link href={`/tx/${tx.hash}`} className="text-accent text-small">
                                                            {tx.hash.substring(0, 14)}...
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-primary-light text-small">
                                                        {parseInt(tx.nonce, 16)}
                                                    </span>
                                                </td>
                                                <td className="text-dim text-small">Mined</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/address/${tx.from}`} className={tx.from.toLowerCase() === address.toLowerCase() ? 'text-white' : 'text-accent text-small'}>
                                                            {tx.from.toLowerCase() === address.toLowerCase() ? 'Me' : tx.from.substring(0, 8) + '...'}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/address/${tx.to}`} className={tx.to?.toLowerCase() === address.toLowerCase() ? 'text-white' : 'text-accent text-small'}>
                                                            {tx.to?.toLowerCase() === address.toLowerCase() ? 'Me' : (tx.to ? tx.to.substring(0, 8) + '...' : 'Contract Creation')}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="font-mono text-small">
                                                        {ethers.formatEther(tx.value)} DNR
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state text-center py-20">
                                <Ban size={48} className="text-dim mb-4" style={{ margin: '0 auto' }} />
                                <h3 className="font-heading text-dim">No transactions found</h3>
                                <p className="text-dim text-small mt-2">This address has not initiated any transactions on the Kortana network.</p>
                            </div>
                        )
                    ) : (activeTab === 'tokens' && tokens.length > 0 ? (
                        <div style={{ width: '100%', padding: '1rem' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Symbol</th>
                                        <th>Decimals</th>
                                        <th>Contract</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map(t => (
                                        <tr key={t.address}>
                                            <td className="font-heading">{t.name}</td>
                                            <td className="text-accent">{t.symbol}</td>
                                            <td>{t.decimals}</td>
                                            <td className="text-small text-dim">{t.address}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <Clock size={32} />
                            </div>
                            <div>
                                <h3 className="font-heading mb-2">Data not available</h3>
                                <p className="text-dim text-small" style={{ maxWidth: '400px', margin: '0 auto' }}>
                                    Historical internal transactions and token transfers for this address have not been indexed yet.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddressDetail;
