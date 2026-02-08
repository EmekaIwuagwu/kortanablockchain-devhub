'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

const DashboardCard = ({ title, value, subtext, icon, trend }: { title: string, value: string, subtext: string, icon: string, trend?: string }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-[#0A1929]">{value}</h3>
            </div>
            <div className="p-4 bg-[#DC143C]/5 text-[#DC143C] rounded-2xl">
                {icon === 'dollar' && <span className="text-2xl">💰</span>}
                {icon === 'chart' && <span className="text-2xl">📈</span>}
                {icon === 'home' && <span className="text-2xl">🏠</span>}
                {icon === 'pie' && <span className="text-2xl">📊</span>}
            </div>
        </div>
        <div className="flex items-center text-sm font-medium">
            {trend && <span className="px-2 py-1 bg-[#00E676]/10 text-[#00E676] rounded-lg mr-3">↗ {trend}</span>}
            <span className="text-gray-400">{subtext}</span>
        </div>
    </div>
);

export default function Portfolio() {
    const { address, isConnected } = useAccount();
    const [investments, setInvestments] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!address) {
                setLoading(false);
                return;
            }

            try {
                // Fetch Investments
                const invResponse = await fetch(`http://localhost:3001/api/investments/user/${address}`);
                const invData = await invResponse.json();
                setInvestments(invData.investments || []);

                // Fetch Payouts
                const payResponse = await fetch(`http://localhost:3001/api/investments/payouts/user/${address}`);
                const payData = await payResponse.json();
                setPayouts(payData.payouts || []);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isConnected) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [address, isConnected]);

    const stats = {
        totalValue: investments.reduce((acc, inv) => acc + parseFloat(inv.tokenAmount) * (inv.property?.valuationUSD / (inv.property?.totalSupply / 10 ** 18)), 0),
        monthlyIncome: investments.reduce((acc, inv) => acc + (parseFloat(inv.tokenAmount) * (inv.property?.valuationUSD / (inv.property?.totalSupply / 10 ** 18)) * (inv.property?.yield / 100)) / 12, 0),
        totalEarned: payouts.reduce((acc, p) => acc + parseFloat(ethers.formatEther(p.amountDinar)), 0),
        propertiesOwned: new Set(investments.map(inv => inv.propertyAddress)).size
    };

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-gray-50/50">
                <Header />
                <div className="pt-40 pb-20 container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-extrabold text-[#0A1929] mb-4">Connect Your Wallet</h1>
                    <p className="text-gray-500 mb-8">Please connect your wallet to view your real estate portfolio.</p>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Header />

            <div className="pt-40 pb-20 container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-[#DC143C] font-bold tracking-widest uppercase text-sm mb-2 block">Your Assets</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1929] mb-4">Portfolio Dashboard</h1>
                        <p className="text-gray-500 text-lg max-w-2xl">Track real-time performance, rental yields, and property appreciation across your global holdings.</p>
                    </div>
                    <Link href="/marketplace" className="hidden md:block bg-[#0A1929] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#DC143C] transition-colors shadow-lg">
                        Browse Marketplace
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-8 mb-16">
                    <DashboardCard
                        title="Total Value Locked"
                        value={`${stats.totalValue.toLocaleString()} DNR`}
                        subtext={`≈ $${stats.totalValue.toLocaleString()} USD`}
                        icon="dollar"
                    />
                    <DashboardCard
                        title="Monthly Income"
                        value={`${stats.monthlyIncome.toFixed(2)} DNR`}
                        subtext="Next payout: Mar 1st"
                        icon="chart"
                    />
                    <DashboardCard
                        title="Properties Owned"
                        value={stats.propertiesOwned.toString()}
                        subtext="Live Assets"
                        icon="home"
                    />
                    <DashboardCard
                        title="Total Earned"
                        value={`${stats.totalEarned.toFixed(4)} DNR`}
                        subtext="Realized rental income"
                        icon="pie"
                    />
                </div>

                {/* Holdings Table */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="text-2xl font-bold text-[#0A1929]">Active Holdings</h3>
                        <div className="flex space-x-4">
                            <button className="px-6 py-2 rounded-lg bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100">Export CSV</button>
                            <button className="px-6 py-2 rounded-lg bg-[#DC143C]/10 text-[#DC143C] font-bold text-sm hover:bg-[#DC143C]/20">Generate Tax Report</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-8">Property</th>
                                    <th className="p-8">Tokens Held</th>
                                    <th className="p-8">Current Value</th>
                                    <th className="p-8">Yield (APY)</th>
                                    <th className="p-8">Status</th>
                                    <th className="p-8 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {investments.length > 0 ? investments.map((inv, i) => {
                                    const tokenValue = parseFloat(inv.tokenAmount) * (inv.property?.valuationUSD / (inv.property?.totalSupply / 10 ** 18));
                                    return (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-8 font-bold text-[#0A1929] text-lg group-hover:text-[#DC143C] transition-colors">{inv.property?.title || 'Unknown Property'}</td>
                                            <td className="p-8 text-gray-600 font-medium">{inv.tokenAmount} tokens</td>
                                            <td className="p-8 text-gray-900 font-bold">{tokenValue.toLocaleString()} DNR</td>
                                            <td className="p-8 text-[#00E676] font-bold bg-[#00E676]/5 rounded-xl w-fit mx-8 px-4 py-1">{inv.property?.yield}%</td>
                                            <td className="p-8">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="p-8 text-right">
                                                <Link href={`/property/${inv.property?.id}`} className="text-[#0A1929] font-bold hover:text-[#DC143C] transition-colors underline decoration-2 underline-offset-4">
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-gray-400 font-medium">No active holdings found. Start investing in the marketplace!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Earnings History */}
                <div className="mt-16 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h3 className="text-2xl font-bold text-[#0A1929]">Earnings History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-8">Asset</th>
                                    <th className="p-8">Amount</th>
                                    <th className="p-8">Date</th>
                                    <th className="p-8">Tx Hash</th>
                                    <th className="p-8 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payouts.length > 0 ? payouts.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-8 font-bold text-[#0A1929]">{p.property?.title || 'Unknown Property'}</td>
                                        <td className="p-8 text-[#00E676] font-bold">+{parseFloat(ethers.formatEther(p.amountDinar)).toFixed(4)} DNR</td>
                                        <td className="p-8 text-gray-500">{new Date(p.distributionDate).toLocaleDateString()}</td>
                                        <td className="p-8 truncate max-w-[150px] font-mono text-xs text-gray-400">{p.txHash}</td>
                                        <td className="p-8 text-right">
                                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Received</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-gray-400 font-medium">No earnings recorded yet. Payouts are distributed monthly.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
