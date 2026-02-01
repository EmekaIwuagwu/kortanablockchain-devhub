'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getLatestBlocks } from '@/lib/rpc';

const BlocksPage = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const blocksPerPage = 20;

    useEffect(() => {
        const fetchBlocks = async () => {
            setLoading(true);
            try {
                // Fetch blocks based on the current page
                // getLatestBlocks(count) always gets from the top.
                // We might need a better RPC call for pagination, 
                // but for now we'll fetch a larger set and slice it if needed,
                // or just fetch the specific range.
                const count = blocksPerPage;
                const latestBlocks = await getLatestBlocks(count + (page * blocksPerPage));
                // Slice the result to get the current "page"
                const paginatedBlocks = latestBlocks.slice(page * blocksPerPage, (page + 1) * blocksPerPage);
                setBlocks(paginatedBlocks);
            } catch (err) {
                console.error("Error fetching blocks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlocks();
    }, [page]);

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading mb-2">Blocks</h1>
                    <p className="text-dim">Viewing blocks on the Kortana network</p>
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
                        disabled={blocks.length < blocksPerPage}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', opacity: blocks.length < blocksPerPage ? 0.5 : 1 }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Block</th>
                            <th>Hash</th>
                            <th>Timestamp</th>
                            <th>Transactions</th>
                            <th>Miner</th>
                            <th>Gas Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>Loading blocks...</td></tr>
                        ) : blocks.map((block) => (
                            <tr key={block.number}>
                                <td>
                                    <Link href={`/block/${block.number}`} className="text-accent font-heading">
                                        #{block.number}
                                    </Link>
                                </td>
                                <td style={{ maxWidth: '200px' }}>
                                    <Link href={`/block/${block.hash}`} className="text-dim text-small" style={{ wordBreak: 'break-all' }}>
                                        {block.hash?.substring(0, 15)}...
                                    </Link>
                                </td>
                                <td suppressHydrationWarning>
                                    <span className="text-small">{new Date(block.timestamp * 1000).toLocaleString()}</span>
                                </td>
                                <td>
                                    <div className="btn btn-primary btn-small" style={{ pointerEvents: 'none', background: 'rgba(157, 78, 221, 0.1)', color: 'var(--primary-light)' }}>
                                        {block.transactions?.length || 0} Txns
                                    </div>
                                </td>
                                <td>
                                    <Link href={`/address/${block.miner}`} className="text-accent text-small">
                                        {block.miner?.substring(0, 16)}...
                                    </Link>
                                </td>
                                <td className="text-small">
                                    {block.gasUsed?.toString() || '0'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && blocks.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center' }} className="text-dim">No blocks found.</div>
                )}
            </div>
        </div>
    );
};

export default BlocksPage;
