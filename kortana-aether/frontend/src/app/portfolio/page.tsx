'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import {
    TrendingUp,
    PieChart as PieIcon,
    Globe,
    DollarSign,
    Home,
    BarChart3,
    ArrowUpRight,
    Layers,
    Clock,
    Download,
    FileText
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] group-hover:scale-150 transition-transform duration-700 rounded-bl-[4rem]`}></div>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <div className="flex items-center space-x-1 text-[#00E676] font-bold text-xs bg-[#00E676]/10 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={14} />
                    <span>{trend}</span>
                </div>
            )}
        </div>
        <div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{title}</p>
            <h3 className="text-3xl font-black text-[#0A1929]">{value}</h3>
            <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest">{subtext}</p>
        </div>
    </motion.div>
);

const COLORS = ['#DC143C', '#0A1929', '#2563EB', '#8B5CF6', '#F59E0B', '#10B981'];

export default function Portfolio() {
    const { address, isConnected } = useAccount();
    const [investments, setInvestments] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [gvApplications, setGvApplications] = useState<any[]>([]);
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

                // Fetch Golden Visa Applications (with deposits)
                const gvResponse = await fetch(`http://localhost:3001/api/golden-visa/list/${address}`);
                const gvData = await gvResponse.json();
                setGvApplications(gvData.applications || []);

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

    // Computed Stats
    const stats = useMemo(() => {
        const totalValue = investments.reduce((acc, inv) => {
            const valuation = parseFloat(inv.property?.valuationUSD || 0);
            const supply = parseFloat(inv.property?.totalSupply || 1) / 10 ** 18;
            return acc + (parseFloat(inv.tokenAmount) * (valuation / (supply || 1)));
        }, 0);

        const monthlyYield = investments.reduce((acc, inv) => {
            const valuation = parseFloat(inv.property?.valuationUSD || 0);
            const supply = parseFloat(inv.property?.totalSupply || 1) / 10 ** 18;
            const yieldRate = parseFloat(inv.property?.yield || 0) / 100;
            const investmentValue = parseFloat(inv.tokenAmount) * (valuation / (supply || 1));
            return acc + (investmentValue * yieldRate) / 12;
        }, 0);

        const totalEarned = payouts.reduce((acc, p) => acc + parseFloat(ethers.formatEther(p.amountDinar)), 0);

        // Count residency assets
        const gvDeposits = gvApplications.flatMap(app => app.goldenVisaDeposits || []);
        const residencyTotal = gvDeposits.reduce((acc, dep) => acc + parseFloat(dep.amount), 0);

        const propertiesCount = new Set([
            ...investments.map(inv => inv.propertyAddress),
            ...gvDeposits.map(dep => dep.propertyId)
        ]).size;

        return { totalValue: totalValue + residencyTotal, monthlyYield, totalEarned, propertiesCount, residencyTotal };
    }, [investments, payouts]);

    // Allocation Data
    const allocationData = useMemo(() => {
        const groups: { [key: string]: number } = {};
        investments.forEach(inv => {
            const label = inv.property?.country || 'Unknown';
            const valuation = parseFloat(inv.property?.valuationUSD || 0);
            const supply = parseFloat(inv.property?.totalSupply || 1) / 10 ** 18;
            const value = parseFloat(inv.tokenAmount) * (valuation / (supply || 1));
            groups[label] = (groups[label] || 0) + value;
        });
        return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }, [investments]);

    // Growth Data (Last 6 months simulated from payouts + projections)
    const growthData = useMemo(() => {
        const data = [
            { name: 'Sep', value: stats.totalValue * 0.92 },
            { name: 'Oct', value: stats.totalValue * 0.95 },
            { name: 'Nov', value: stats.totalValue * 0.94 },
            { name: 'Dec', value: stats.totalValue * 0.98 },
            { name: 'Jan', value: stats.totalValue * 0.99 },
            { name: 'Feb', value: stats.totalValue },
        ];
        return data;
    }, [stats.totalValue]);

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-[#F8FAFC]">
                <Header />
                <div className="pt-60 pb-20 container mx-auto px-6 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <Globe className="text-[#DC143C]" size={40} />
                    </div>
                    <h1 className="text-5xl font-black text-[#0A1929] mb-4 tracking-tighter">Your Assets, Anywhere</h1>
                    <p className="text-gray-500 mb-12 max-w-md mx-auto font-medium">Connect your wallet to access your encrypted real-estate portfolio and earn passive yield on Kortana.</p>
                </div>
                <Footer />
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <div className="pt-40 pb-20 max-w-7xl mx-auto px-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center space-x-2 bg-[#DC143C]/10 text-[#DC143C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <TrendingUp size={12} />
                            <span>Portfolio Analytics</span>
                        </motion.div>
                        <h1 className="text-5xl lg:text-6xl font-black text-[#0A1929] tracking-tighter mb-4">
                            Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#0A1929]">Command Center</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                            Aggregating real-time valuation, rental yields, and geographic allocation for your tokenized holdings.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-[#0A1929] transition-all">
                            <Download size={20} />
                        </button>
                        <Link href="/marketplace" className="bg-[#0A1929] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#DC143C] hover:scale-105 active:scale-95 transition-all">
                            Expand Holdings
                        </Link>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <StatCard
                        title="Net Asset Value"
                        value={`€${stats.totalValue.toLocaleString()}`}
                        subtext="Kortana Registry Value"
                        icon={DollarSign}
                        trend="12.4%"
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Projected Yield"
                        value={`€${stats.monthlyYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        subtext="Estimated Monthly DNR"
                        icon={BarChart3}
                        color="bg-[#DC143C]"
                    />
                    <StatCard
                        title="Registry Entries"
                        value={stats.propertiesCount.toString()}
                        subtext="Active Smart Contracts"
                        icon={Home}
                        color="bg-indigo-600"
                    />
                    <StatCard
                        title="Total Distribution"
                        value={`€${stats.totalEarned.toLocaleString()}`}
                        subtext="Realized DNR Earnings"
                        icon={TrendingUp}
                        trend="+€210"
                        color="bg-[#00E676]"
                    />
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Performance Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-[#0A1929] p-10 rounded-[3.5rem] shadow-2xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC143C]/20 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-white">Portfolio Velocity</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Valuation performance over time</p>
                            </div>
                            <div className="flex bg-white/5 rounded-xl p-1">
                                {['1W', '1M', '3M', '6M', '1Y'].map((t) => (
                                    <button key={t} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${t === '6M' ? 'bg-[#DC143C] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC143C" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#DC143C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0A1929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#DC143C"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Diversification Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl"
                    >
                        <h3 className="text-2xl font-black text-[#0A1929] mb-8">Geographic Mix</h3>
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData.length > 0 ? allocationData : [{ name: 'Empty', value: 1 }]}
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <PieIcon className="text-gray-200" size={32} />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Allocation</span>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            {allocationData.map((item, index) => (
                                <div key={item.name} className="flex justify-between items-center group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-xs font-black text-gray-400 group-hover:text-[#0A1929] transition-colors uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-[#0A1929]">{((item.value / stats.totalValue) * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-12">

                    {/* Active Holdings */}
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-lg overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                    <Layers className="text-[#0A1929]" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#0A1929]">Tokenized Inventory</h3>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Real-time registry verification</p>
                                </div>
                            </div>
                            <div className="flex space-x-3 w-full md:w-auto">
                                <button className="flex-1 px-6 py-4 rounded-xl border border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                                    <Download size={14} />
                                    <span>Export Deeds</span>
                                </button>
                                <button className="flex-1 px-6 py-4 rounded-xl bg-[#DC143C]/10 text-[#DC143C] font-black text-[10px] uppercase tracking-widest hover:bg-[#DC143C]/20 transition-all flex items-center justify-center space-x-2">
                                    <FileText size={14} />
                                    <span>Tax Summary</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[900px]">
                                <thead className="bg-[#F8FAFC] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="p-10">Asset Entity</th>
                                        <th className="p-10 text-center">Tokens Owned</th>
                                        <th className="p-10 text-center">Current Valuation</th>
                                        <th className="p-10 text-center">Yield Rank</th>
                                        <th className="p-10 text-right">Operational Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {investments.length > 0 || gvApplications.some(app => app.goldenVisaDeposits?.length > 0) ? (
                                        <>
                                            {/* Standard Investments */}
                                            {investments.map((inv, i) => {
                                                const valuation = parseFloat(inv.property?.valuationUSD || 0);
                                                const supply = parseFloat(inv.property?.totalSupply || 1) / 10 ** 18;
                                                const marketValue = parseFloat(inv.tokenAmount) * (valuation / (supply || 1));

                                                return (
                                                    <motion.tr
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={`inv-${i}`}
                                                        className="hover:bg-[#F8FAFC] transition-all group"
                                                    >
                                                        <td className="p-10">
                                                            <div className="flex items-center space-x-6">
                                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform text-xs">
                                                                    <img src={JSON.parse(inv.property?.images || '[]')[0] || 'https://via.placeholder.com/80'} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-lg text-[#0A1929] group-hover:text-[#DC143C] transition-colors">{inv.property?.title}</div>
                                                                    <div className="flex items-center space-x-2 mt-1">
                                                                        <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black">FRACTIONAL</span>
                                                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{inv.property?.location}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-10 text-center">
                                                            <div className="font-black text-[#0A1929] text-xl">{parseInt(inv.tokenAmount).toLocaleString()}</div>
                                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">{inv.property?.symbol} UNITS</div>
                                                        </td>
                                                        <td className="p-10 text-center">
                                                            <div className="font-black text-[#0A1929] text-xl">€{marketValue.toLocaleString()}</div>
                                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">Live NAV</div>
                                                        </td>
                                                        <td className="p-10 text-center">
                                                            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-xl font-black text-sm">
                                                                {inv.property?.yield}% APY
                                                            </div>
                                                        </td>
                                                        <td className="p-10 text-right">
                                                            <Link href={`/property/${inv.property?.id}`} className="inline-flex items-center space-x-2 bg-white border border-gray-100 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#0A1929] hover:bg-[#0A1929] hover:text-white transition-all shadow-sm">
                                                                <span>Control</span>
                                                                <ArrowUpRight size={14} />
                                                            </Link>
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}

                                            {/* Residency Deposits */}
                                            {gvApplications.flatMap(app => (app.golden_visa_deposits || app.goldenVisaDeposits || []).map((dep: any, i: number) => (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    key={`gv-${app.id}-${i}`}
                                                    className="hover:bg-red-50/30 transition-all group"
                                                >
                                                    <td className="p-10">
                                                        <div className="flex items-center space-x-6">
                                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                                                                <img src={JSON.parse(dep.property?.images || '[]')[0] || 'https://via.placeholder.com/80'} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-lg text-[#0A1929] group-hover:text-[#DC143C] transition-colors">{dep.property?.title}</div>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className="text-[8px] bg-[#DC143C]/10 text-[#DC143C] px-2 py-0.5 rounded-full font-black">RESIDENCY</span>
                                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Application #{app.id}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-center">
                                                        <div className="font-black text-[#0A1929] text-xl">1</div>
                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">DEPOSIT UNIT</div>
                                                    </td>
                                                    <td className="p-10 text-center">
                                                        <div className="font-black text-[#DC143C] text-xl">€{parseFloat(dep.amount).toLocaleString()}</div>
                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">Locked Capital</div>
                                                    </td>
                                                    <td className="p-10 text-center">
                                                        <div className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-black text-xs uppercase">
                                                            Residency Path
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-right">
                                                        <Link href="/golden-visa" className="inline-flex items-center space-x-2 bg-white border border-gray-100 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#0A1929] hover:bg-[#DC143C] hover:text-white transition-all shadow-sm">
                                                            <span>Manage Visa</span>
                                                            <ArrowUpRight size={14} />
                                                        </Link>
                                                    </td>
                                                </motion.tr>
                                            )))}
                                        </>
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-32 text-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Layers size={32} className="text-gray-300" />
                                                </div>
                                                <h3 className="text-xl font-black text-[#0A1929] mb-2">Portfolio Empty</h3>
                                                <p className="text-gray-400 font-medium max-w-xs mx-auto mb-8">Tokenize your first piece of global real estate on the marketplace.</p>
                                                <Link href="/marketplace" className="inline-block bg-[#0A1929] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Start Investing</Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Earnings Stream */}
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-lg overflow-hidden relative">
                        <div className="p-10 border-b border-gray-50 flex items-center space-x-4">
                            <div className="p-3 bg-[#00E676]/10 rounded-2xl">
                                <Clock size={24} className="text-[#00E676]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#0A1929]">Distribution Ledger</h3>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Monthly automatic DNR payouts</p>
                            </div>
                        </div>
                        {payouts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-[#F8FAFC] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="p-10">Asset Origin</th>
                                            <th className="p-10">Distribution Date</th>
                                            <th className="p-10 text-center">Payout Amount</th>
                                            <th className="p-10 text-center">Verified TX</th>
                                            <th className="p-10 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payouts.map((p, i) => (
                                            <tr key={i} className="hover:bg-[#F8FAFC] transition-all">
                                                <td className="p-10 font-bold text-[#0A1929]">{p.property?.title}</td>
                                                <td className="p-10 text-gray-500 font-medium">{new Date(p.distributionDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="p-10 text-center">
                                                    <div className="font-black text-[#00E676] text-lg">+{parseFloat(ethers.formatEther(p.amountDinar)).toFixed(4)} DNR</div>
                                                </td>
                                                <td className="p-10 text-center">
                                                    <div className="font-mono text-[10px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-100">
                                                        {p.txHash.substring(0, 16)}...
                                                    </div>
                                                </td>
                                                <td className="p-10 text-right">
                                                    <span className="px-5 py-2 bg-[#00E676] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm shadow-[#00E676]/20">
                                                        Settled
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BarChart3 size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-[#0A1929] mb-2">No Distributions Yet</h3>
                                <p className="text-gray-400 font-medium mb-8">Earn monthly passive yield automatically as soon as the rental cycle completes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
