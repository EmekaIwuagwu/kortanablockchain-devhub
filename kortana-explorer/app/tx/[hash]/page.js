'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTransaction, getTransactionReceipt } from '@/lib/rpc';
import { ethers } from 'ethers';
import { Clock, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';

const TransactionDetail = () => {
    const { hash } = useParams();
    const [tx, setTx] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTx = async () => {
            try {
                const txData = await getTransaction(hash);
                const receiptData = await getTransactionReceipt(hash);
                setTx(txData);
                setReceipt(receiptData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTx();
    }, [hash]);

    if (loading) return <div className="container" style={{ padding: '4rem 0' }}>Loading transaction...</div>;
    if (!tx) return <div className="container" style={{ padding: '4rem 0' }}>Transaction not found.</div>;

    const DetailRow = ({ label, value, subValue, highlight = false }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', padding: '1.25rem 0', borderBottom: '1px solid var(--border)' }}>
            <div className="text-dim flex items-center gap-2">
                <Info size={14} /> {label}:
            </div>
            <div style={{ wordBreak: 'break-all' }}>
                <span style={{ color: highlight ? 'var(--primary-light)' : 'white' }}>{value}</span>
                {subValue && <div className="text-dim text-small" style={{ marginTop: '0.25rem' }}>{subValue}</div>}
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <h2 className="font-heading mb-4">Transaction Details</h2>

            <div className="glass-card">
                <DetailRow
                    label="Transaction Hash"
                    value={tx.hash}
                />
                <DetailRow
                    label="Status"
                    value={receipt?.status === 1 ? 'Success' : 'Failed'}
                    highlight={receipt?.status === 1}
                    subValue={receipt?.status === 1 ? <CheckCircle2 size={16} className="text-accent" /> : <XCircle size={16} className="text-error" />}
                />
                <DetailRow
                    label="Block"
                    value={tx.blockNumber}
                    highlight={true}
                />
                <DetailRow
                    label="From"
                    value={tx.from}
                    highlight={true}
                />
                <DetailRow
                    label="To"
                    value={tx.to}
                    highlight={true}
                />
                <DetailRow
                    label="Value"
                    value={`${ethers.formatEther(tx.value)} DNR`}
                />
                <DetailRow
                    label="Transaction Fee"
                    value={receipt ? `${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} DNR` : 'N/A'}
                />
                <DetailRow
                    label="Gas Limit"
                    value={tx.gasLimit.toString()}
                />
                <DetailRow
                    label="Gas Price"
                    value={`${ethers.formatUnits(tx.gasPrice, 'gwei')} Gwei`}
                />
            </div>

            {receipt?.logs?.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-heading mb-4">Logs ({receipt.logs.length})</h3>
                    {receipt.logs.map((log, i) => (
                        <div key={i} className="glass-card mb-4" style={{ fontSize: '0.9rem' }}>
                            <div className="text-dim mb-2">Address: <span className="text-accent">{log.address}</span></div>
                            <div className="text-dim mb-1">Topics:</div>
                            {log.topics.map((topic, j) => (
                                <div key={j} className="text-small" style={{ marginLeft: '1rem', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>
                                    [{j}] {topic}
                                </div>
                            ))}
                            <div className="text-dim mt-2">Data:</div>
                            <div className="text-small" style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                                {log.data}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionDetail;
