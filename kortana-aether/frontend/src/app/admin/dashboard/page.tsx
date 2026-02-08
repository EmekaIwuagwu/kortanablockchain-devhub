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
    Clock,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden mt-12">
                <div className="p-12 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-gray-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-[#0A1929]">Tokenized Assets</h3>
                        <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest flex items-center">
                            <Clock size={14} className="mr-2" /> Real-time Inventory Management
                        </p>
                    </div>
                    <Link href="/admin/properties/add" className="flex items-center space-x-3 bg-[#DC143C] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#B22222] transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-[#DC143C]/20">
                        <Plus size={20} />
                        <span>Tokenize New Asset</span>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-[#0A1929] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-10">Asset Entity</th>
                                <th className="p-10">Registry Address</th>
                                <th className="p-10">Market Valuation</th>
                                <th className="p-10">Yield / Status</th>
                                <th className="p-10 text-right">Operational Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {properties.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="p-10">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                                                <img src={p.images?.[0] || 'https://via.placeholder.com/80'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-black text-lg text-[#0A1929] group-hover:text-[#DC143C] transition-colors">{p.title}</div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{p.type} • {p.symbol}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="font-mono text-[10px] text-gray-400 bg-gray-100/50 border border-gray-100 px-4 py-2.5 rounded-xl inline-block">
                                            {p.address.substring(0, 16)}...
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="font-black text-xl text-[#0A1929]">${(parseFloat(p.valuationUSD) / 1000).toFixed(1)}K</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Kortana Value</div>
                                    </td>
                                    <td className="p-10">
                                        <div className="font-black text-[#00E676] text-lg">{p.yield}% APY</div>
                                        <span className="px-3 py-1 bg-green-50 text-[10px] font-black text-green-600 rounded-lg uppercase border border-green-100">Live</span>
                                    </td>
                                    <td className="p-10 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleDistributeYield(p.address)}
                                                disabled={distributing === p.address}
                                                className={`px-8 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 ${distributing === p.address
                                                    ? 'bg-gray-100 text-gray-400'
                                                    : 'bg-[#0A1929] text-white hover:bg-[#DC143C] shadow-lg hover:shadow-[#DC143C]/20'
                                                    }`}
                                            >
                                                <Zap size={14} className={distributing === p.address ? '' : 'text-[#FACD15]'} />
                                                <span>{distributing === p.address ? 'SYNCING...' : 'DISBURSE YIELD'}</span>
                                            </button>
                                        </div>
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
