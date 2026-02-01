'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlock } from '@/lib/rpc';
import Link from 'next/link';
import { Box, Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const BlockDetail = () => {
    const { id } = useParams();
    const [block, setBlock] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                // If id is a hex string (0x...), use it directly as a hash
                // Otherwise try to parse as number
                let blockId = id;
                if (typeof id === 'string' && !id.startsWith('0x') && !isNaN(id)) {
                    blockId = parseInt(id);
                }

                const blockData = await getBlock(blockId);
                setBlock(blockData);
            } catch (err) {
                console.error("Error fetching block:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlock();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '4rem 0' }}>Loading block...</div>;
    if (!block) return <div className="container" style={{ padding: '4rem 0' }}>Block not found.</div>;

    const DetailRow = ({ label, value, highlight = false, link = null }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', padding: '1.25rem 0', borderBottom: '1px solid var(--border)' }}>
            <div className="text-dim">{label}:</div>
            <div style={{ wordBreak: 'break-all' }}>
                {link ? (
                    <Link href={link} className="text-accent">{value}</Link>
                ) : (
                    <span style={{ color: highlight ? 'var(--primary-light)' : 'white' }}>{value}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div className="flex items-center gap-4 mb-6">
                <h2 className="font-heading">Block #{block.number}</h2>
                <div className="flex gap-2">
                    <Link href={`/block/${block.number - 1}`} className="btn btn-primary" style={{ padding: '4px 12px' }}><ChevronLeft size={16} /></Link>
                    <Link href={`/block/${block.number + 1}`} className="btn btn-primary" style={{ padding: '4px 12px' }}><ChevronRight size={16} /></Link>
                </div>
            </div>

            <div className="glass-card mb-8">
                <DetailRow label="Block Height" value={block.number} highlight={true} />
                <DetailRow label="Timestamp" value={new Date(block.timestamp * 1000).toLocaleString()} />
                <DetailRow label="Transactions" value={`${block.transactions.length} transactions`} />
                <DetailRow label="Validated By" value={block.miner} link={`/address/${block.miner}`} />
                <DetailRow label="Gas Used" value={block.gasUsed.toString()} />
                <DetailRow label="Gas Limit" value={block.gasLimit.toString()} />
                <DetailRow label="Hash" value={block.hash} />
                <DetailRow label="Parent Hash" value={block.parentHash} link={`/block/${block.parentHash}`} />
            </div>

            <h3 className="font-heading mb-4">Transactions in this Block</h3>
            <div className="glass-card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Txn Hash</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {block.transactions.map((tx, i) => (
                            <tr key={i}>
                                <td><Link href={`/tx/${tx.hash || tx}`} className="text-accent">{(tx.hash || tx).substring(0, 20)}...</Link></td>
                                <td><Link href={`/address/${tx.from}`} className="text-accent">{tx.from ? tx.from.substring(0, 16) + '...' : '0x...'}</Link></td>
                                <td><Link href={`/address/${tx.to}`} className="text-accent">{tx.to ? tx.to.substring(0, 16) + '...' : (tx.from ? 'Contract' : '0x...')}</Link></td>
                                <td>{tx.value ? ethers.formatEther(tx.value) : '0'} DNR</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {block.transactions.length === 0 && (
                    <div className="text-dim" style={{ padding: '2rem', textAlign: 'center' }}>No transactions in this block.</div>
                )}
            </div>
        </div>
    );
};

export default BlockDetail;
