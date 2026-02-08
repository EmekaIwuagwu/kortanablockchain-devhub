'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAccount } from 'wagmi';

export default function AdminDashboard() {
    const { address, isConnected } = useAccount();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [distributing, setDistributing] = useState<string | null>(null);

    const isAdmin = address?.toLowerCase() === '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9';

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/properties');
                const data = await response.json();
                setProperties(data.properties || []);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) {
            fetchProperties();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleDistributeYield = async (propertyAddress: string) => {
        if (!confirm('Are you sure you want to distribute monthly yield for this property? This will send real Dinar to all investors.')) return;

        setDistributing(propertyAddress);
        try {
            const response = await fetch('http://localhost:3001/api/properties/yield-distribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyAddress })
            });
            const data = await response.json();
            alert(data.message || 'Yield distribution started!');
        } catch (error) {
            console.error('Error distributing yield:', error);
            alert('Failed to start yield distribution.');
        } finally {
            setDistributing(null);
        }
    };

    if (!isConnected || !isAdmin) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center px-6">
                <Header />
                <h1 className="text-4xl font-extrabold text-[#0A1929] mb-4">Access Denied</h1>
                <p className="text-gray-500 max-w-md">You do not have administrative privileges to access this dashboard. Please connect with an authorized admin wallet.</p>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Header />

            <div className="pt-40 pb-20 container mx-auto px-6">
                <div className="mb-12">
                    <span className="text-[#DC143C] font-bold tracking-widest uppercase text-sm mb-2 block">System Administration</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1929] mb-4">Admin Dashboard</h1>
                    <p className="text-gray-500 text-lg max-w-2xl">Manage real estate assets, monitor platform performance, and execute scheduled yield distributions.</p>
                </div>

                {/* Properties Management */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-[#0A1929]">Property Asset Management</h3>
                        <button className="bg-[#DC143C] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#B22222] transition-colors shadow-lg">
                            + Add New Property
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-8">Property & Symbol</th>
                                    <th className="p-8">Contract Address</th>
                                    <th className="p-8">Valuation</th>
                                    <th className="p-8">Yield (APY)</th>
                                    <th className="p-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {properties.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 mr-4 flex items-center justify-center font-bold text-[#DC143C]">
                                                    {p.symbol}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0A1929]">{p.title}</div>
                                                    <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">{p.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 font-mono text-xs text-gray-400 truncate max-w-[200px]">{p.address}</td>
                                        <td className="p-8 font-bold text-[#0A1929]">${parseFloat(p.valuationUSD).toLocaleString()}</td>
                                        <td className="p-8 text-[#00E676] font-bold">{p.yield}%</td>
                                        <td className="p-8 text-right space-x-3">
                                            <button
                                                onClick={() => handleDistributeYield(p.address)}
                                                disabled={distributing === p.address}
                                                className="px-6 py-2 bg-[#0A1929] text-white rounded-lg font-bold text-sm hover:bg-[#DC143C] transition-all disabled:opacity-50"
                                            >
                                                {distributing === p.address ? 'Processing...' : 'Distribute Yield'}
                                            </button>
                                            <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-sm hover:border-[#DC143C] hover:text-[#DC143C] transition-all">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Future: Platform Stats / User Activity */}
                <div className="mt-16 grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="text-xl font-bold text-[#0A1929] mb-4">Investor Insights</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                <span className="text-gray-500 font-medium">Total Registered Users</span>
                                <span className="text-2xl font-bold text-[#0A1929]">482</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                <span className="text-gray-500 font-medium">Pending Verifications</span>
                                <span className="text-2xl font-bold text-[#DC143C]">12</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="text-xl font-bold text-[#0A1929] mb-4">Platform Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                <span className="text-gray-500 font-medium">On-chain Bot Status</span>
                                <span className="flex items-center font-bold text-[#00E676]">
                                    <span className="w-2 h-2 bg-[#00E676] rounded-full mr-2 animate-pulse"></span>
                                    ONLINE
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                <span className="text-gray-500 font-medium">Last Sync Block</span>
                                <span className="text-xl font-bold text-gray-400">#4,821,902</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
