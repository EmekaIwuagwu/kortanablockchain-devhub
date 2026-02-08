'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Home,
    DollarSign,
    Zap,
    Globe,
    Clock,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { formatEther } from 'viem';

const StatCard = ({ title, value, icon: Icon, trend, color, prefix = "" }: any) => (
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
            <h3 className="text-3xl font-extrabold text-[#0A1929]">{prefix}{value}</h3>
        </div>
    </div>
);

const MOCK_MONTHLY_DATA = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
];

const COLORS = ['#DC143C', '#2563EB', '#8B5CF6', '#F59E0B'];

export default function AdminDashboard() {
    const [properties, setProperties] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [typeData, setTypeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [distributing, setDistributing] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propRes, statsRes] = await Promise.all([
                    fetch('http://localhost:3001/api/properties'),
                    fetch('http://localhost:3001/api/properties/admin/stats')
                ]);

                const propData = await propRes.json();
                const statsData = await statsRes.json();

                setProperties(propData.properties || []);
                setStats(statsData.stats);

                // Format type distribution for PieChart
                const formattedType = statsData.typeDistribution.map((t: any) => ({
                    name: t.type,
                    value: parseInt(t.count)
                }));
                setTypeData(formattedType);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-[#0A1929] mb-2 tracking-tight">System Oversight</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Real-time Network Feed // Node: Aether-001</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Network Status</div>
                        <div className="text-sm font-black text-[#00E676] flex items-center justify-end">
                            <span className="w-2 h-2 bg-[#00E676] rounded-full mr-2 animate-pulse"></span>
                            PROTOCOL SYNCED
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total TVL"
                    value={stats?.totalTVL ? (stats.totalTVL / 1000000).toFixed(1) + "M" : "0.0M"}
                    prefix="$"
                    icon={DollarSign}
                    trend="14.8"
                    color="bg-blue-600"
                />
                <StatCard
                    title="Registry Count"
                    value={stats?.activeProperties.toString() || "0"}
                    icon={Home}
                    color="bg-[#DC143C]"
                />
                <StatCard
                    title="Network Nodes"
                    value={stats?.totalInvestors.toString() || "0"}
                    icon={Globe}
                    trend="2.4"
                    color="bg-indigo-600"
                />
                <StatCard
                    title="Disbursed Yield"
                    value={stats?.totalYieldPaid ? parseFloat(formatEther(BigInt(stats.totalYieldPaid))).toFixed(1) + "k" : "0.0k"}
                    prefix="Ð"
                    icon={Zap}
                    color="bg-amber-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-[#0A1929]">Liquidity Velocity</h3>
                        <select className="bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer">
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_MONTHLY_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '12px' }}
                                />
                                <Bar dataKey="value" fill="#DC143C" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#0A1929] p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem]"></div>
                    <h3 className="text-xl font-black mb-10 relative z-10">Asset Diversification</h3>
                    <div className="h-64 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData.length > 0 ? typeData : [{ name: 'Empty', value: 1 }]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {(typeData.length > 0 ? typeData : [{ name: 'Empty', value: 1 }]).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A1929', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                        {typeData.map((item, index) => (
                            <div key={item.name} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-[#DC143C]/50 transition-all cursor-default">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{item.name}</span>
                                </div>
                                <span className="text-xs font-black">{item.value}</span>
                            </div>
                        ))}
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
