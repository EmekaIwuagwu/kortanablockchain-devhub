'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    TrendingUp,
    History,
    Plus,
    Tag,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const mockTrades = [
    { id: 1, property: "Modern Villa in Cascais", amount: 150, price: 124.50, type: "BUY", time: "2 mins ago" },
    { id: 2, property: "Athens Luxury Suites", amount: 50, price: 132.20, type: "SELL", time: "15 mins ago" },
    { id: 3, property: "Montenegro Coastal Retreat", amount: 200, price: 145.00, type: "BUY", time: "1 hour ago" },
];

const mockMarketCap = [
    { name: 'Jan', price: 120 },
    { name: 'Feb', price: 125 },
    { name: 'Mar', price: 123 },
    { name: 'Apr', price: 128 },
    { name: 'May', price: 130 },
    { name: 'Jun', price: 135 },
];

const ListingCard = ({ listing }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
    >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#DC143C]">
                    <Tag size={20} />
                </div>
                <div>
                    <h3 className="font-black text-[#0A1929] group-hover:text-[#DC143C] transition-colors">{listing.property}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{listing.location}</p>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${listing.change > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {listing.change > 0 ? '+' : ''}{listing.change}%
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Asking Price</p>
                <p className="text-lg font-black text-[#0A1929]">{listing.price} DNR</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Available</p>
                <p className="text-lg font-black text-[#0A1929]">{listing.amount} Units</p>
            </div>
        </div>

        <button className="w-full bg-[#0A1929] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#DC143C] transition-all shadow-lg shadow-[#0A1929]/10 active:scale-95">
            Buy Now
        </button>
    </motion.div>
);

export default function SecondaryMarket() {
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');

    const listings = [
        { id: 1, property: "Modern Villa in Cascais", location: "Cascais, Portugal", price: 125.40, amount: 250, change: 2.4 },
        { id: 2, property: "Athens Luxury Suites", location: "Athens, Greece", price: 132.10, amount: 15, change: -1.2 },
        { id: 3, property: "Montenegro Coastal Retreat", location: "Budva, Montenegro", price: 145.00, amount: 500, change: 5.8 },
        { id: 4, property: "Porto Riverside Loft", location: "Porto, Portugal", price: 98.20, amount: 120, change: 0.5 },
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <div className="pt-40 pb-24 max-w-7xl mx-auto px-8">
                {/* Hero / Header */}
                <div className="grid lg:grid-cols-2 gap-16 mb-20 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center space-x-2 bg-[#DC143C]/10 text-[#DC143C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <TrendingUp size={12} />
                            <span>P2P Liquidity Protocol</span>
                        </motion.div>
                        <h1 className="text-6xl font-black text-[#0A1929] tracking-tighter mb-6 leading-[0.9]">
                            Secondary <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#0A1929]">Market Exchange</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium mb-10 leading-relaxed max-w-lg">
                            Instant exit liquidity for your real estate tokens. Trade directly with other investors on the Kortana network.
                        </p>
                        <div className="flex space-x-4">
                            <button className="bg-[#0A1929] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#DC143C] transition-all flex items-center space-x-3 group">
                                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                <span>Create Sell Order</span>
                            </button>
                            <button className="bg-white border border-gray-100 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-[#0A1929] transition-all flex items-center space-x-3">
                                <Shield size={18} />
                                <span>My Orders</span>
                            </button>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0A1929] p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden h-[400px]"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC143C]/20 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-black text-white/40 uppercase tracking-[0.2em] mb-4">Market Index (AET)</h3>
                            <div className="flex items-end space-x-4 mb-8">
                                <span className="text-5xl font-black text-white">$135.20</span>
                                <span className="text-green-400 font-bold mb-2 flex items-center">
                                    <ArrowUpRight size={16} className="mr-1" /> 12.5%
                                </span>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockMarketCap}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#DC143C" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="price" stroke="#DC143C" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                                        <Tooltip />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Market Explorer */}
                <div className="grid lg:grid-cols-4 gap-12">

                    {/* Left Filters */}
                    <div className="space-y-10">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-[#0A1929] mb-8 flex items-center">
                                <Filter size={18} className="mr-3 text-[#DC143C]" /> Refine Search
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            placeholder="City, Asset, or ID..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 pl-12 text-xs font-bold focus:outline-none focus:border-[#DC143C] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['ALL', 'RESIDENTIAL', 'COMMERCIAL', 'GOLDEN VISA'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setActiveTab(t)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === t ? 'bg-[#0A1929] text-white' : 'bg-gray-50 text-gray-400 hover:text-[#0A1929]'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-[#0A1929] mb-8 flex items-center">
                                <History size={18} className="mr-3 text-[#DC143C]" /> Recent Activity
                            </h3>
                            <div className="space-y-6">
                                {mockTrades.map(trade => (
                                    <div key={trade.id} className="flex justify-between items-center group cursor-pointer">
                                        <div>
                                            <p className="text-[10px] font-black text-[#0A1929] group-hover:text-[#DC143C] transition-colors line-clamp-1">{trade.property}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{trade.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[10px] font-black ${trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</p>
                                            <p className="text-[10px] font-bold text-[#0A1929] mt-1">{trade.amount} @ ${trade.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {listings.map(item => (
                                <ListingCard key={item.id} listing={item} />
                            ))}
                        </div>

                        {/* Empty State / Pagination */}
                        <div className="mt-16 text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">End of live listings</p>
                            <h3 className="text-xl font-black text-[#0A1929] mt-2 mb-6">Want to liquidate your holdings?</h3>
                            <button className="bg-[#0A1929] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#DC143C] transition-all shadow-xl">List My Tokens</button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
