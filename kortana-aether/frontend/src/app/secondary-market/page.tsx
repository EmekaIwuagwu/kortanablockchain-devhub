'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
    TrendingUp,
    ArrowUpRight,
    Search,
    Filter,
    ArrowRight,
    Activity,
    Clock,
    DollarSign,
    Plus,
    BarChart3
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';

const glass = "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl";

const marketData = [
    { name: '08:00', value: 1240 },
    { name: '10:00', value: 1280 },
    { name: '12:00', value: 1260 },
    { name: '14:00', value: 1320 },
    { name: '16:00', value: 1310 },
    { name: '18:00', value: 1350 },
    { name: '20:00', value: 1340 },
];

export default function SecondaryMarket() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [orders, setOrders] = useState<any[]>([]);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        try {
            const [ordersRes, activityRes] = await Promise.all([
                fetch('http://localhost:3001/api/market/orders'),
                fetch('http://localhost:3001/api/market/activity')
            ]);

            const ordersData = await ordersRes.json();
            const activityData = await activityRes.json();

            setOrders(ordersData.orders || []);
            setActivity(activityData.activity || []);
        } catch (error) {
            console.error('Market fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredListings = useMemo(() => {
        return orders.filter(o =>
            (search === '' || o.property?.title.toLowerCase().includes(search.toLowerCase())) &&
            (activeTab === 'ALL' || o.type === activeTab)
        );
    }, [orders, search, activeTab]);

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <div className="pt-40 pb-24 max-w-7xl mx-auto px-8">
                {/* Hero / Header */}
                <div className="grid lg:grid-cols-2 gap-16 mb-20 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center space-x-2 bg-[#DC143C]/10 text-[#DC143C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <Activity size={12} />
                            <span>Live P2P Exchange</span>
                        </motion.div>
                        <h1 className="text-5xl lg:text-7xl font-black text-[#0A1929] tracking-tighter mb-8 leading-[0.9]">
                            Secondary <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#0A1929]">Market Liquidity</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                            The primary gateway for trading tokenized real estate assets. Buy into sold-out properties or exit your positions instantly.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0A1929] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC143C]/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-white">AETHER Index (AET)</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-3xl font-black text-white">€1,340.24</span>
                                    <span className="text-[#00E676] text-xs font-bold bg-[#00E676]/10 px-2 py-1 rounded-lg flex items-center">
                                        <ArrowUpRight size={14} className="mr-1" />
                                        +4.2%
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl">
                                <TrendingUp className="text-[#DC143C]" size={24} />
                            </div>
                        </div>
                        <div className="h-[180px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={marketData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#DC143C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#DC143C" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Market Explorer */}
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Filters & Activity */}
                    <div className="space-y-12">
                        <section>
                            <h3 className="text-sm font-black text-[#0A1929] uppercase tracking-[0.2em] mb-6 flex items-center">
                                <Filter size={14} className="mr-2 text-[#DC143C]" />
                                Market Filter
                            </h3>
                            <div className="flex flex-col space-y-2">
                                {['ALL', 'SELL', 'BUY'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-left transition-all ${activeTab === t ? 'bg-[#0A1929] text-white shadow-xl translate-x-2' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {t === 'ALL' ? 'All Orders' : t === 'SELL' ? 'Sell Orders' : 'Buy Orders'}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-[#0A1929] uppercase tracking-[0.2em] mb-6 flex items-center">
                                <Clock size={14} className="mr-2 text-[#DC143C]" />
                                Recent Activity
                            </h3>
                            <div className="space-y-6">
                                {activity.length > 0 ? activity.map((act, i) => (
                                    <div key={i} className="flex justify-between items-start group">
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase">{act.property?.symbol}</div>
                                            <div className="text-[13px] font-black text-[#0A1929] group-hover:text-[#DC143C] transition-colors line-clamp-1">{act.property?.title}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[13px] font-black text-[#00E676]">€{parseFloat(act.price).toFixed(2)}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">14:02</div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-gray-400 font-medium italic">No recent settlements...</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by property, city or symbol..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-[#0A1929] outline-none focus:border-[#DC143C] transition-all shadow-sm"
                                />
                            </div>
                            <button className="w-full md:w-auto bg-[#DC143C] text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#DC143C]/20 flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all">
                                <Plus size={18} />
                                <span>Place Limit Order</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-64 bg-gray-100 rounded-[3rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence>
                                    {filteredListings.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shadow-md">
                                                        <img src={JSON.parse(order.property?.images || '[]')[0] || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-[#DC143C] uppercase tracking-widest bg-[#DC143C]/5 px-2 py-0.5 rounded-md inline-block mb-1">{order.type} Order</div>
                                                        <h4 className="font-black text-xl text-[#0A1929] tracking-tight line-clamp-1">{order.property?.title}</h4>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ASK/BID</div>
                                                    <div className="text-2xl font-black text-[#0A1929]">€{parseFloat(order.price).toFixed(2)}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="bg-gray-50 p-4 rounded-2xl">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Amount</div>
                                                    <div className="font-bold text-[#0A1929]">{parseInt(order.amount)} Tokens</div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Location</div>
                                                    <div className="font-bold text-[#0A1929] truncate">{order.property?.country}</div>
                                                </div>
                                            </div>

                                            <button className="w-full py-5 rounded-2xl bg-[#0A1929] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#DC143C] transition-all flex items-center justify-center group/btn">
                                                <span>Execute {order.type === 'SELL' ? 'Buy' : 'Sell'}</span>
                                                <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {!loading && filteredListings.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BarChart3 size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-black text-[#0A1929] mb-2">No Market Orders</h3>
                                <p className="text-gray-400 font-medium">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
