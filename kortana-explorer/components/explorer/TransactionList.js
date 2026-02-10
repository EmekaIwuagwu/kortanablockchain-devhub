import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

const TransactionList = ({ transactions = [] }) => {
    return (
        <div className="glass-card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-heading">Latest Transactions</h3>
                <Link href="/txs" className="btn btn-primary btn-small" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>View All</Link>
            </div>

            <table className="data-table">
                <tbody>
                    {transactions.length > 0 ? transactions.map((tx) => (
                        <tr key={tx.hash}>
                            <td style={{ width: '40%' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0, 245, 212, 0.05)', flexShrink: 0 }}>
                                        <FileText size={18} className="text-accent" />
                                    </div>
                                    <div style={{ minWidth: '0', flex: 1 }}>
                                        <Link href={`/tx/${tx.hash}`} className="text-accent text-small" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {tx.hash?.substring(0, 14)}...
                                        </Link>
                                        <div className="text-dim text-small">Confirmed</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ width: '35%' }}>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-small text-dim" style={{ minWidth: '32px', fontSize: '0.75rem' }}>From</span>
                                        <Link href={`/address/${tx.from}`} className="text-accent text-small" style={{ fontSize: '0.8rem' }}>
                                            {tx.from?.substring(0, 6)}...{tx.from?.substring(38)}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-small text-dim" style={{ minWidth: '32px', fontSize: '0.75rem' }}>To</span>
                                        <Link href={`/address/${tx.to}`} className="text-accent text-small" style={{ fontSize: '0.8rem' }}>
                                            {tx.to?.substring(0, 6)}...{tx.to?.substring(38)}
                                        </Link>
                                    </div>
                                </div>
                            </td>
                            <td style={{ textAlign: 'right', width: '25%' }}>
                                <div className="font-heading" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {parseFloat(tx.value_formatted || '0').toFixed(4)} DNR
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                                No transactions found in recent blocks.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionList;
