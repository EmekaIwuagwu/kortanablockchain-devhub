'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/PageHeader";
import { Activity, Box, Clock, Zap, Map, Server } from "lucide-react";
import { getBlockHeight, NETWORK } from '@/lib/rpc';


export default function NetworkStatusPage() {
    const [blockHeight, setBlockHeight] = useState("...");

    useEffect(() => {
        const fetchHeight = async () => {
            const height = await getBlockHeight();
            if (height !== "N/A") setBlockHeight(height);
        };
        fetchHeight();
        const interval = setInterval(fetchHeight, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-deep-space pb-20">
            <PageHeader
                title="Network Status"
                subtitle="Real-time performance metrics and validator health"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">

                {/* Main Status Indicator */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-12 flex items-center gap-4 animate-pulse-subtle">
                    <div className="p-3 bg-green-500/20 rounded-full">
                        <Activity className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">All Systems Operational</h3>
                        <p className="text-green-300/80 text-sm">Mainnet is producing blocks normally. No incidents reported.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <StatusCard label="Current TPS" value="1,245" icon={<Zap className="text-yellow-400" />} />
                    <StatusCard label="Block Height" value={blockHeight} icon={<Box className="text-cyan-400" />} />
                    <StatusCard label="Avg Block Time" value={`${NETWORK.mainnet.blockTime.toFixed(1)}s`} icon={<Clock className="text-purple-400" />} />
                    <StatusCard label="Active Validators" value="50 / 50" icon={<Server className="text-neon-green" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-panel p-8 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6">Transaction History (14 Days)</h3>
                        <div className="h-64 flex items-end gap-2">
                            {/* Mock Chart Bars */}
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/50 transition-colors rounded-t-sm relative group"
                                    style={{ height: `${30 + Math.random() * 70}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {Math.floor(100 + Math.random() * 50)}k Tx
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6">Validator Map</h3>
                        <div className="space-y-4">
                            <RegionBar region="North America" percent="40%" />
                            <RegionBar region="Europe" percent="35%" />
                            <RegionBar region="Asia Pacific" percent="20%" />
                            <RegionBar region="Other" percent="5%" />
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <button className="text-cyan-400 font-bold hover:text-white transition-colors text-sm">
                                View Validator Leaderboard →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
                <p className="text-2xl font-bold text-white font-mono">{value}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
                {icon}
            </div>
        </div>
    )
}

function RegionBar({ region, percent }: { region: string, percent: string }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2 text-gray-300">
                <span>{region}</span>
                <span>{percent}</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500/50" style={{ width: percent }}></div>
            </div>
        </div>
    )
}
