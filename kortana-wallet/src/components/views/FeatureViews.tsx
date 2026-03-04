'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Fingerprint, Lock as LockIcon, Leaf,
    Activity, Globe, Network, Database, ChevronRight,
    ArrowUpRight, Zap, ArrowDownLeft, ExternalLink, CheckCircle2
} from 'lucide-react';

import { collateralService } from '@/lib/CollateralService';
import { useWalletStore } from '@/store/useWalletStore';
import { NETWORKS, NetworkType } from '@/lib/constants';
import { useState, useMemo, useEffect } from 'react';

/* ============================================================
   SECTION HEADER — Reused across feature views
   ============================================================ */
const ViewHeader: React.FC<{
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    iconBorder: string;
    title: string;
    highlight: string;
    subtitle: string;
}> = ({ icon: Icon, iconColor, iconBg, iconBorder, title, highlight, subtitle }) => (
    <div className="flex items-center gap-3 md:gap-5">
        <div className={`w-11 h-11 md:w-16 md:h-16 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} border ${iconBorder} shrink-0`}>
            <Icon className="size-5 md:size-8" />
        </div>
        <div className="min-w-0">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white uppercase font-heading leading-tight">
                {title} <span className="text-gradient-kortana">{highlight}</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[8px] md:text-[9px] mt-0.5">{subtitle}</p>
        </div>
    </div>
);

/* ============================================================
   COMPLIANCE VIEW
   ============================================================ */
export const ComplianceView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
        <ViewHeader
            icon={ShieldCheck} iconColor="text-cyan-400"
            iconBg="bg-cyan-400/10" iconBorder="border-cyan-400/20"
            title="ZK" highlight="Compliance"
            subtitle="Privacy-preserving identity verification enclave"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] space-y-4 md:space-y-6">
                <h3 className="text-base md:text-xl font-black text-white uppercase font-heading tracking-tight">Active Credentials</h3>
                <div className="space-y-3">
                    <div className="p-3 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-between text-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <Fingerprint className="text-cyan-400 size-4 md:size-5 shrink-0" />
                            <span className="font-bold text-white uppercase text-xs truncate">Biometric Shield</span>
                        </div>
                        <span className="text-neon-green text-[7px] md:text-[8px] font-black uppercase tracking-widest shrink-0 ml-2">Verified</span>
                    </div>
                </div>
                <button className="w-full btn-launch py-2.5 md:py-4">Generate ZK Proof</button>
            </div>

            <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-center items-center text-center space-y-3 md:space-y-5 min-h-[160px]">
                <div className="relative">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LockIcon className="text-cyan-400 size-5 md:size-7" />
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-white uppercase mb-1 text-sm">Anonymous Auth</h4>
                    <p className="text-[8px] md:text-[9px] text-gray-500 max-w-[200px]">
                        Prove eligibility without revealing personal data using Zero-Knowledge proofs.
                    </p>
                </div>
            </div>
        </div>
    </motion.div>
);

/* ============================================================
   ESG VIEW
   ============================================================ */
export const ESGView = () => {
    const [score, setScore] = useState(850);

    useEffect(() => {
        const interval = setInterval(() => {
            setScore(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Leaf} iconColor="text-neon-green"
                iconBg="bg-neon-green/10" iconBorder="border-neon-green/20"
                title="ESG" highlight="Impact"
                subtitle="Sustainability rewards & ecological scoring"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {/* Score Panel */}
                <div className="sm:col-span-2 glass-panel p-5 md:p-10 rounded-2xl md:rounded-[3rem] relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-neon-green/10 rounded-full blur-[80px]" />
                    <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                        <h3 className="text-5xl md:text-7xl font-black text-white font-heading">{score}</h3>
                        <span className="text-neon-green font-black uppercase tracking-widest text-xs md:text-sm">Impact Score</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[8px] md:text-[9px] tracking-[0.2em] mb-5 md:mb-8">Kortana Ecological Footprint Rating</p>
                    <div className="p-4 md:p-5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                        <p className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Carbon Saved Sync</p>
                        <p className="text-xl md:text-2xl font-black text-white">{(score / 685.4).toFixed(2)} T</p>
                    </div>
                </div>

                {/* Claim Panel */}
                <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col justify-between gap-4">
                    <div className="space-y-2 text-white">
                        <h4 className="text-base md:text-lg font-black text-white uppercase">Green Rewards</h4>
                        <p className="text-[8px] md:text-[9px] text-gray-500 leading-relaxed">Claim your DNR rewards for maintaining a high ESG score.</p>
                    </div>
                    <button className="w-full btn-launch !bg-neon-green !text-deep-space py-3 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                        Claim {(score / 17).toFixed(2)} DNR
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   RISK AI VIEW
   ============================================================ */
export const RiskAIView = () => {
    const [riskLevel, setRiskLevel] = useState(12);
    const [bars, setBars] = useState([40, 70, 45, 90, 65, 80, 50]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRiskLevel(prev => Math.max(5, Math.min(45, prev + (Math.random() > 0.5 ? 2 : -2))));
            setBars(prev => prev.map(bar => Math.max(10, Math.min(100, bar + (Math.random() > 0.5 ? 5 : -5)))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Activity} iconColor="text-red-400"
                iconBg="bg-red-400/10" iconBorder="border-red-400/20"
                title="Risk" highlight="Enclave"
                subtitle="AI-driven predictive security analysis"
            />

            <div className="glass-panel p-4 md:p-10 rounded-2xl md:rounded-[3rem] relative overflow-hidden bg-gradient-to-br from-red-500/[0.03] to-transparent border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-center text-white">
                    <div className="space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <span className="text-neon-green text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em]">Simulator: Operational</span>
                            <h3 className="text-xl md:text-3xl font-black text-white uppercase font-heading tracking-tight">
                                Predatory <span className="text-red-400">Pattern</span>
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                Our AI flagged a <span className="text-red-400 font-black">{riskLevel}%</span> risk volatility in Sub-Net liquidity providers.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <button className="btn-launch !bg-red-400 !text-deep-space px-4 py-2.5 text-[9px]">Restrict Pulsing</button>
                            <button className="btn-outline px-4 py-2.5 text-[9px]">Authorize Risk</button>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-32 md:h-48 glass-panel border-white/5 bg-black/40 rounded-xl md:rounded-2xl flex items-center justify-center p-3 md:p-6">
                        <div className="w-full h-full flex items-end gap-1.5 md:gap-2">
                            {bars.map((h, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: `${h}%` }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                    className={`w-full bg-gradient-to-t ${riskLevel > 25 ? 'from-red-500/40 to-red-400' : 'from-cyan-500/40 to-cyan-400'} rounded-t-md transition-colors duration-500`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   SUBNET VIEW
   ============================================================ */
export const SubNetView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
        <ViewHeader
            icon={Globe} iconColor="text-blue-400"
            iconBg="bg-blue-400/10" iconBorder="border-blue-400/20"
            title="Network" highlight="Sub-Nets"
            subtitle="Enterprise partition and sidechain management"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            {['Finance-XL', 'Gaming-Core', 'Gov-Enclave'].map((net) => (
                <div key={net} className="glass-panel p-4 md:p-7 rounded-xl md:rounded-[2rem] space-y-4 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400">
                            <Network className="size-4 md:size-5" />
                        </div>
                        <span className="text-neon-green text-[7px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green" /> Connected
                        </span>
                    </div>
                    <div>
                        <h4 className="text-base md:text-xl font-black text-white uppercase font-heading tracking-tight">{net}</h4>
                        <p className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Shard ID: 9283-XLM</p>
                    </div>
                    <button className="w-full py-2.5 md:py-3 border border-white/5 bg-white/5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-400 group-hover:text-deep-space transition-all">
                        Switch
                    </button>
                </div>
            ))}
        </div>
    </motion.div>
);

/* ============================================================
   STABLE VIEW
   ============================================================ */
export const StableView = () => {
    const { address, balance, network, privateKey } = useWalletStore();
    const [collateral, setCollateral] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const kUSDAmount = useMemo(() => collateralService.calculateMintAmount(collateral), [collateral]);

    const handleMint = async () => {
        if (!address || !privateKey) return alert('No Enclave session.');
        if (!collateral || parseFloat(collateral) <= 0) return alert('Input amount.');
        setIsMinting(true);
        try {
            const hash = await collateralService.mintKUSD(address, collateral, network, privateKey);
            setTxHash(hash);
            setCollateral('');
            alert(`Minting pulse broadcasted! Hash: ${hash}`);
        } catch (error: any) {
            alert(`Minting failed: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Database} iconColor="text-purple-400"
                iconBg="bg-purple-400/10" iconBorder="border-purple-400/20"
                title="Stable" highlight="Issue"
                subtitle="Secure collateralized asset minting"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Mint Form */}
                <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] space-y-4 md:space-y-6 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                    <h3 className="text-base md:text-xl font-black text-white uppercase tracking-tight">Mint Enclave Stable</h3>

                    <div className="space-y-3 md:space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between px-1">
                                <label className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">Collateral (DNR)</label>
                                <span className="text-[7px] md:text-[9px] font-bold text-cyan-400 uppercase cursor-pointer" onClick={() => setCollateral(balance)}>Max: {balance}</span>
                            </div>
                            <input
                                type="number"
                                value={collateral}
                                onChange={(e) => setCollateral(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 text-2xl md:text-4xl font-black text-white outline-none focus:border-cyan-400/50 transition-colors placeholder-white/5"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="p-2.5 bg-white/5 rounded-full border border-white/10">
                                <ArrowDownLeft className="size-5 text-purple-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Receive kUSD</label>
                            <input
                                className="w-full bg-cyan-400/5 border border-cyan-400/20 rounded-xl md:rounded-2xl p-3 md:p-5 text-2xl md:text-4xl font-black text-cyan-400 outline-none"
                                value={kUSDAmount}
                                readOnly
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleMint}
                        disabled={isMinting}
                        className="w-full btn-launch py-3 md:py-5 disabled:opacity-50 gap-2"
                    >
                        {isMinting ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                        ) : (
                            <>
                                <Database size={16} />
                                <span>Initiate Minting Pulse</span>
                            </>
                        )}
                    </button>

                    {txHash && (
                        <div
                            className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-xl flex items-center justify-between cursor-pointer"
                            onClick={() => window.open(`https://poseidon-explorer.testnet.kortana.xyz/tx/${txHash}`, '_blank')}
                        >
                            <div className="space-y-0.5 min-w-0">
                                <p className="text-[7px] font-black text-neon-green uppercase tracking-widest">Transaction Verified</p>
                                <p className="text-[9px] font-mono text-white/60 truncate">{txHash}</p>
                            </div>
                            <ExternalLink size={13} className="text-neon-green shrink-0 ml-2" />
                        </div>
                    )}
                </div>

                {/* Info Panels */}
                <div className="space-y-3 md:space-y-5">
                    <div className="glass-panel p-4 md:p-7 rounded-2xl md:rounded-[2rem] bg-purple-400/5 border-purple-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                        <h4 className="font-black text-white uppercase tracking-tight mb-3 text-xs md:text-sm">Minting Equilibrium</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-6xl font-black text-white font-heading">150%</span>
                            <span className="text-purple-400 font-black text-[8px] md:text-[9px] uppercase tracking-widest">Over-Collateralized</span>
                        </div>
                        <p className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-3">Safe liquidation threshold: 110%</p>
                    </div>

                    <div className="glass-panel p-4 md:p-7 rounded-2xl md:rounded-[2rem] space-y-4 border-white/10">
                        <div className="space-y-2">
                            <p className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">Global Stability Reserve</p>
                            <div className="flex justify-between items-end flex-wrap gap-2">
                                <span className="text-2xl md:text-3xl font-black text-white font-heading">$10.42M</span>
                                <span className="text-neon-green text-[7px] md:text-[8px] font-bold uppercase tracking-widest">+2.4% / Week</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '42%' }}
                                transition={{ duration: 2 }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-0.5">
                                <p className="text-[7px] font-bold text-gray-500 uppercase">Collateral Locked</p>
                                <p className="font-black text-xs text-white font-heading">8.42M DNR</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[7px] font-bold text-gray-500 uppercase">kUSD In Circulation</p>
                                <p className="font-black text-xs text-white font-heading">5.61M kUSD</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
