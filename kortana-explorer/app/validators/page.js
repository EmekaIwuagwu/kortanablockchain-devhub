'use client';

import React, { useEffect, useState } from 'react';
import { getValidators } from '@/lib/rpc';
import Link from 'next/link';
import { Shield, ChevronRight, BarChart3, Users, Zap, Search } from 'lucide-react';

const ValidatorsPage = () => {
    const [validators, setValidators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchValidators = async () => {
            const data = await getValidators();
            setValidators(data);
            setLoading(false);
        };
        fetchValidators();
    }, []);

    const filteredValidators = validators.filter(v =>
        v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>Loading validators...</div>;

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Validators</h1>
                    <p className="text-dim">Network security handled by {validators.length} active nodes.</p>
                </div>
                <div className="stats-grid" style={{ marginBottom: 0, gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: 'var(--accent)' }}><Zap size={24} /></div>
                        <div>
                            <div className="text-dim text-small font-heading">TOTAL STAKE</div>
                            <div className="font-heading">2.4M DNR</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card mb-6" style={{ padding: '0.5rem 1rem' }}>
                <div className="flex items-center gap-3">
                    <Search size={18} className="text-dim" />
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        className="search-input"
                        style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.75rem 0' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Validator</th>
                            <th>Total Stake</th>
                            <th>Commission</th>
                            <th>Uptime</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredValidators.map((v, i) => (
                            <tr key={v.address}>
                                <td style={{ width: '80px', textAlign: 'center' }}>
                                    <span className="font-heading text-dim">#{i + 1}</span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div style={{
                                            padding: '10px',
                                            borderRadius: '50%',
                                            background: `linear-gradient(45deg, var(--primary), var(--secondary))`,
                                            color: 'white'
                                        }}>
                                            <Shield size={18} />
                                        </div>
                                        <div>
                                            <div className="font-heading">{v.name}</div>
                                            <Link href={`/address/${v.address}`} className="text-accent text-small">
                                                {v.address.substring(0, 10)}...{v.address.substring(34)}
                                            </Link>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-heading">{parseFloat(v.stake).toLocaleString()} DNR</div>
                                    <div className="text-dim text-small">Share: {(v.stake / 24000).toFixed(2)}%</div>
                                </td>
                                <td>{v.commission}%</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                            <div style={{ width: `${v.uptime}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }}></div>
                                        </div>
                                        <span className="text-small">{v.uptime}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        background: v.status === 'Active' ? 'rgba(0, 245, 212, 0.1)' : 'rgba(255, 93, 143, 0.1)',
                                        color: v.status === 'Active' ? 'var(--accent)' : 'var(--error)'
                                    }}>
                                        {v.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ValidatorsPage;
