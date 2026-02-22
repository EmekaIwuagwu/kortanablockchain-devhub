'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, Globe, Zap, Cpu, Users, Coins, Activity, Database } from 'lucide-react';
import { getBlockHeight } from '@/lib/rpc';

export default function KeyMetrics() {
    const [metrics, setMetrics] = useState({
        blockHeight: "...",
        blockTime: 2.0,
        validators: 50,
        chainId: 9002,
        tps: 0
    });

    useEffect(() => {
        const fetchHeight = async () => {
            const height = await getBlockHeight();
            if (height !== "N/A") setMetrics(prev => ({ ...prev, blockHeight: height }));
        };
        fetchHeight();
        const heightInterval = setInterval(fetchHeight, 5000);

        const simulateInterval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                tps: Math.floor(1200 + Math.random() * 100),
            }));
        }, 3000);

        return () => {
            clearInterval(heightInterval);
            clearInterval(simulateInterval);
        };
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-24 relative z-20 px-4 max-w-7xl mx-auto">
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                <MetricCard
                    variants={item}
                    icon={<Database className="w-5 h-5 text-cyan-400" />}
                    label="Block Height"
                    value={metrics.blockHeight}
                    sub="Live RPC Sync"
                />
                <MetricCard
                    variants={item}
                    icon={<Clock className="w-5 h-5 text-purple-400" />}
                    label="Block Time"
                    value={`${metrics.blockTime.toFixed(1)}s`}
                    sub="Deterministic 2s"
                />
                <MetricCard
                    variants={item}
                    icon={<Cpu className="w-5 h-5 text-neon-green" />}
                    label="Validators"
                    value={`${metrics.validators}`}
                    sub="PoH Secured"
                />
                <MetricCard
                    variants={item}
                    icon={<Globe className="w-5 h-5 text-blue-400" />}
                    label="Chain ID"
                    value={`${metrics.chainId}`}
                    sub="Mainnet Network"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-12 glass-panel p-10 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent shadow-2xl overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-32 -mt-32 group-hover:bg-cyan-500/10 transition-colors"></div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    <SecondaryStat label="Total Supply" value="500B" icon={<Coins />} unit="DNR" />
                    <SecondaryStat label="Global Capacity" value="50,000+" icon={<Activity />} unit="TPS" color="cyan" />
                    <SecondaryStat label="Unique Holders" value="12,450+" icon={<Users />} unit="WALLETS" />
                    <SecondaryStat label="Gas Cost" value="< 0.001" icon={<Zap />} unit="DNR" color="green" />
                </div>
            </motion.div>
        </section>
    );
}

function MetricCard({ label, value, sub, variants, icon }: { label: string, value: string, sub: string, variants: any, icon: React.ReactNode }) {
    return (
        <motion.div variants={variants} className="glass-panel p-8 rounded-3xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                {icon}
            </div>
            <div className="mb-4 p-2 bg-white/5 w-fit rounded-lg border border-white/5">
                {icon}
            </div>
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</h3>
            <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors font-sans tracking-tighter">
                {value}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-700 uppercase tracking-widest">{sub}</div>

            <div className="mt-6 w-full h-[1px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                />
            </div>
        </motion.div>
    )
}

function SecondaryStat({ label, value, unit, icon, color }: { label: string, value: string, unit: string, icon: React.ReactNode, color?: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="mb-3 text-gray-700 opacity-50 group-hover:opacity-100 transition-opacity">
                {icon}
            </div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black text-white tracking-tighter ${color === 'cyan' ? 'text-cyan-400' : color === 'green' ? 'text-neon-green' : ''}`}>
                    {value}
                </span>
                <span className="text-[10px] font-bold text-gray-800">{unit}</span>
            </div>
        </div>
    )
}
