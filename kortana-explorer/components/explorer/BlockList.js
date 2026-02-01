import React from 'react';
import Link from 'next/link';
import { Box, Clock } from 'lucide-react';

const BlockList = ({ blocks = [] }) => {
    return (
        <div className="glass-card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-heading">Latest Blocks</h3>
                <Link href="/blocks" className="btn btn-primary btn-small" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>View All</Link>
            </div>

            <table className="data-table">
                <tbody>
                    {blocks.map((block) => (
                        <tr key={block.number}>
                            <td style={{ width: '150px' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                                        <Box size={20} className="text-accent" />
                                    </div>
                                    <div>
                                        <Link href={`/block/${block.number}`} className="font-heading" style={{ color: 'white' }}>
                                            {block.number}
                                        </Link>
                                        <div className="text-dim text-small flex items-center gap-1">
                                            <Clock size={12} /> {block.timestamp_human || '5s ago'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="text-small text-dim">Validated By</div>
                                <Link href={`/address/${block.miner}`} className="text-accent text-small">
                                    {block.miner?.substring(0, 16)}...
                                </Link>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div className="btn btn-primary btn-small" style={{ display: 'inline-flex', pointerEvents: 'none', background: 'rgba(157, 78, 221, 0.1)', color: 'var(--primary-light)', padding: '4px 12px' }}>
                                    {block.transactions?.length || 0} Txns
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BlockList;
