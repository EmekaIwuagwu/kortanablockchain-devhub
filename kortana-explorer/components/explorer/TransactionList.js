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
                            <td>
                                <div className="flex items-center gap-3">
                                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0, 245, 212, 0.05)' }}>
                                        <FileText size={20} className="text-accent" />
                                    </div>
                                    <div style={{ maxWidth: '150px' }}>
                                        <Link href={`/tx/${tx.hash}`} className="text-accent text-small" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {tx.hash?.substring(0, 18)}...
                                        </Link>
                                        <div className="text-dim text-small">Confirmed</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="text-small text-dim" style={{ minWidth: '35px' }}>From</div>
                                        <Link href={`/address/${tx.from}`} className="text-accent text-small">
                                            {tx.from?.substring(0, 8)}...{tx.from?.substring(38)}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-small text-dim" style={{ minWidth: '35px' }}>To</div>
                                        <Link href={`/address/${tx.to}`} className="text-accent text-small">
                                            {tx.to?.substring(0, 8)}...{tx.to?.substring(38)}
                                        </Link>
                                    </div>
                                </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div className="font-heading" style={{ fontSize: '0.9rem' }}>
                                    {tx.value_formatted || '0.00'} DNR
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
