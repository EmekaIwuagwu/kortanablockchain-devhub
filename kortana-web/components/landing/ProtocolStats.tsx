'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBlockHeight } from '@/lib/rpc';

export default function ProtocolStats() {
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
        <div className="w-full bg-deep-space/80 backdrop-blur-md border-y border-white/5 py-4 overflow-hidden relative z-30 mb-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                <div className="flex gap-12 animate-marquee whitespace-nowrap">
                    <StatItem label="TOTAL TRANSACTIONS" value="142,593,021" />
                    <StatItem label="BLOCK HEIGHT" value={blockHeight} />
                    <StatItem label="ACTIVE ACCOUNTS" value="2,504,119" />
                    <StatItem label="AVG BLOCK TIME" value="5.01s" color="cyan" />
                    <StatItem label="TOTAL STAKED" value="450,000,000 DNR" />
                    <StatItem label="NODES" value="50" color="green" />
                </div>
            </div>
        </div>
    )
}

function StatItem({ label, value, color = 'white' }: { label: string, value: string, color?: 'white' | 'cyan' | 'green' }) {
    const colors = {
        white: "text-white",
        cyan: "text-cyan-400",
        green: "text-neon-green"
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs font-bold tracking-widest">{label}</span>
            <span className={`text-lg font-mono font-medium ${colors[color]}`}>{value}</span>
        </div>
    )
}
