'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    ArrowUpRight,
    Home,
    DollarSign,
    Zap,
    Globe,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <div className="flex items-center space-x-1 text-[#00E676] font-bold text-sm bg-[#00E676]/10 px-3 py-1.5 rounded-lg">
                    <TrendingUp size={14} />
                    <span>+{trend}%</span>
                </div>
            )}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-3xl font-extrabold text-[#0A1929]">{value}</h3>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [distributing, setDistributing] = useState<string | null>(null);

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
        fetchProperties();
    }, []);

    const handleDistributeYield = async (propertyAddress: string) => {
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
        } finally {
            setDistributing(null);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#0A1929] mb-2">Platform Overview</h1>
                    <p className="text-gray-400 font-medium">Monitoring real-time liquidity and asset distribution</p>
                </div>
                <div className="text-sm font-bold text-gray-400 bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm">
                    KORTANA TESTNET: <span className="text-[#00E676] ml-2">● OPERATIONAL</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total TVL"
                    value="$24.8M"
                    icon={DollarSign}
                    trend="12.4"
                    color="bg-blue-600"
                />
                <StatCard
                    title="Active Properties"
                    value={properties.length.toString()}
                    icon={Home}
                    color="bg-[#DC143C]"
                />
                <StatCard
                    title="Total Investors"
                    value="1,284"
                    icon={Globe}
                    trend="5.2"
                    color="bg-indigo-600"
                />
                <StatCard
                    title="Yield Distributed"
                    value="842.1k DNR"
                    icon={Zap}
                    color="bg-amber-500"
                />
            </div>

            {/* Secondary Section: Analytics & Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Custom Analytic Chart (Visual Placeholder with CSS/SVG) */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-2xl font-bold text-[#0A1929] mb-8">Asset Liquidity Trend</h3>
                    <div className="h-64 flex items-end justify-between space-x-4">
                        {[40, 65, 45, 80, 55, 90, 75, 40, 60, 85, 95, 80].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0A1929] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                                <div
                                    className="w-full bg-[#DC143C]/20 group-hover:bg-[#DC143C] transition-all rounded-t-lg"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                        <span>Nov</span>
                    </div>
                </div>

                {/* Pie Chart Representation */}
                <div className="bg-[#0A1929] p-10 rounded-[2.5rem] shadow-xl text-white relative flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold mb-8">Portfolio Allocation</h3>
                    <div className="relative w-48 h-48 mb-8">
                        {/* CSS-only Donut Chart */}
                        <div className="w-full h-full rounded-full border-[1.5rem] border-[#DC143C]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
                        <div className="absolute inset-0 w-full h-full rounded-full border-[1.5rem] border-blue-500 rotate-[120deg]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold">85%</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Occupied</span>
                        </div>
                    </div>
                    <div className="space-y-4 w-full">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-[#DC143C]"></span>
                                <span>Residential</span>
                            </div>
                            <span>65%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Commercial</span>
                            </div>
                            <span>35%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Management Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mt-12">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-[#0A1929]">Managed Assets</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1">Execute yield distributions and manage asset status</p>
                    </div>
                    <button className="flex items-center space-x-2 bg-[#0A1929] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#DC143C] transition-all">
                        <ArrowUpRight size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="p-10">Asset Details</th>
                                <th className="p-10">Contract</th>
                                <th className="p-10">Valuation</th>
                                <th className="p-10">APY</th>
                                <th className="p-10 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {properties.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-10">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-[#DC143C] text-lg">
                                                {p.symbol}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-[#0A1929]">{p.title}</div>
                                                <div className="text-xs text-gray-400 font-bold uppercase mt-0.5">{p.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="font-mono text-[10px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            {p.address.substring(0, 12)}...{p.address.substring(34)}
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="font-extrabold text-[#0A1929]">${parseFloat(p.valuationUSD).toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">USD Valuation</div>
                                    </td>
                                    <td className="p-10">
                                        <div className="font-extrabold text-[#00E676]">{p.yield}%</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Target APY</div>
                                    </td>
                                    <td className="p-10 text-right">
                                        <button
                                            onClick={() => handleDistributeYield(p.address)}
                                            disabled={distributing === p.address}
                                            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all ${distributing === p.address
                                                    ? 'bg-gray-100 text-gray-400'
                                                    : 'bg-[#DC143C]/10 text-[#DC143C] hover:bg-[#DC143C] hover:text-white shadow-sm'
                                                }`}
                                        >
                                            {distributing === p.address ? 'Processing...' : 'Execute Payout'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
