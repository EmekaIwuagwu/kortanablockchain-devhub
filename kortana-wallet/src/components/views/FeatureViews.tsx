'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Fingerprint, Lock as LockIcon, Leaf,
    Activity, Globe, Network, Database, ChevronRight,
    ArrowUpRight, Zap, ArrowDownLeft, ExternalLink,
    CheckCircle2, Trees, BrainCircuit, Lock
} from 'lucide-react';
import { ethers } from 'ethers';

import { collateralService } from '@/lib/CollateralService';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';
import { zkService, ZKProof } from '@/lib/ZKService';
import { NetworkType } from '@/lib/constants';

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
    <div className="flex items-center gap-4 md:gap-7 mb-4 lg:mb-10">
        <div className={`w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[2rem] ${iconBg} flex items-center justify-center ${iconColor} border ${iconBorder} shrink-0 shadow-2xl transition-all hover:scale-105`}>
            <Icon className="size-6 md:size-10 lg:size-12" />
        </div>
        <div className="min-w-0">
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-black text-white uppercase font-heading leading-none tracking-tighter">
                {title} <span className="text-gradient-kortana">{highlight}</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-sm lg:text-base mt-2 opacity-60">{subtitle}</p>
        </div>
    </div>
);

/* ============================================================
   COMPLIANCE VIEW (ZK PROOF ENGINE)
   ============================================================ */
export const ComplianceView = () => {
    const { address, showNotification } = useWalletStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeProof, setActiveProof] = useState<ZKProof | null>(null);

    const handleGenerateProof = async () => {
        if (!address) return;
        setIsGenerating(true);
        try {
            const proof = await zkService.generateProof(address, 'Biometric Eligibility');
            const txHash = await zkService.broadcastProof(proof);
            setActiveProof(proof);
            showNotification(`ZK Proof Broadcasted: ${txHash.slice(0, 12)}...`, 'success');
        } catch (error) {
            showNotification('Proof generation failed in Enclave.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={ShieldCheck} iconColor="text-cyan-400"
                iconBg="bg-cyan-400/10" iconBorder="border-cyan-400/20"
                title="ZK" highlight="Compliance"
                subtitle="Privacy-preserving identity verification enclave"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-2 glass-panel p-4 md:p-10 lg:p-14 rounded-2xl md:rounded-[3rem] space-y-4 md:space-y-8 bg-gradient-to-br from-white/[0.04] to-transparent">
                    <h3 className="text-base md:text-xl lg:text-3xl font-black text-white uppercase font-heading tracking-tight">Active Credentials</h3>
                    <div className="space-y-4">
                        <div className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] flex items-center justify-between text-white hover:bg-white/[0.08] transition-all group shadow-xl">
                            <div className="flex items-center gap-4 md:gap-7 min-w-0">
                                <div className="p-3 md:p-5 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-colors">
                                    <Fingerprint className="text-cyan-400 size-5 md:size-8 shrink-0" />
                                </div>
                                <div className="space-y-1">
                                    <span className="font-black text-white uppercase text-xs md:text-xl truncate block">Biometric Shield</span>
                                    <span className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Poseidon Enclave Level 4</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                                <span className="text-neon-green text-[8px] md:text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-neon-green/10 rounded-full border border-neon-green/20">Verified</span>
                                <span className="text-[6px] md:text-[8px] text-gray-600 font-bold uppercase">Expires: 2029.04.12</span>
                            </div>
                        </div>

                        {activeProof && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 md:p-8 bg-cyan-400/5 border border-cyan-400/20 rounded-2xl md:rounded-[2rem] space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Active ZK session proof</span>
                                    <CheckCircle2 className="text-cyan-400 size-4" />
                                </div>
                                <p className="font-mono text-[10px] text-cyan-400/50 break-all">{activeProof.hash}</p>
                            </motion.div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            disabled={isGenerating}
                            onClick={handleGenerateProof}
                            className="flex-1 btn-launch py-3 md:py-6 text-sm lg:text-lg flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                    <span>Generating Circuit...</span>
                                </>
                            ) : (
                                <span>Generate ZK Proof</span>
                            )}
                        </button>
                        <button className="flex-1 btn-outline py-3 md:py-6 text-sm lg:text-lg">Refresh Sync</button>
                    </div>
                </div>

                <div className="glass-panel p-4 md:p-10 rounded-2xl md:rounded-[3rem] bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-center items-center text-center space-y-4 md:space-y-7 min-h-[220px] lg:min-h-full">
                    <div className="relative">
                        <div className={`w-20 h-20 md:w-32 md:h-32 lg:w-48 lg:h-48 rounded-full border-2 md:border-4 border-dashed border-cyan-400/30 ${isGenerating ? 'animate-spin-slow' : 'animate-spin'}`} style={{ animationDuration: isGenerating ? '1s' : '12s' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div animate={{ scale: isGenerating ? [1, 1.4, 1] : [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: isGenerating ? 0.5 : 3, repeat: Infinity }}>
                                <LockIcon className="text-cyan-400 size-6 md:size-12 lg:size-16" />
                            </motion.div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black text-white uppercase mb-2 text-sm md:text-2xl">Anonymous Auth</h4>
                        <p className="text-[8px] md:text-[10px] lg:text-xs text-gray-500 max-w-[280px] font-bold uppercase tracking-widest leading-relaxed">
                            {isGenerating ? 'Computing cryptographic parameters in secure environment...' : 'Prove eligibility without revealing personal data using Zero-Knowledge proofs.'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   ESG VIEW (IMPACT ENGINE)
   ============================================================ */
export const ESGView = () => {
    const { address, network, privateKey, showNotification } = useWalletStore();

    const score = useMemo(() => {
        if (!address) return 0;
        const hash = address.slice(-4);
        return 700 + (parseInt(hash, 16) % 250);
    }, [address]);

    const handleClaim = async () => {
        if (!address || !privateKey) return;
        try {
            const provider = providerService.getProvider(network);
            const signer = new ethers.Wallet(privateKey, provider);
            // Simulate an on-chain claim via direct value transfer for demo purposes
            const tx = await signer.sendTransaction({
                to: address,
                value: ethers.parseEther((score / 1700).toFixed(4)),
            });
            showNotification(`ESG Reward claimed: ${tx.hash.slice(0, 12)}...`, 'success');
        } catch (e) {
            showNotification('Enclave claim failed. Check RPC status.', 'error');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Leaf} iconColor="text-neon-green"
                iconBg="bg-neon-green/10" iconBorder="border-neon-green/20"
                title="ESG" highlight="Impact"
                subtitle="Sustainability rewards & ecological scoring"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-2 glass-panel p-6 md:p-12 lg:p-20 rounded-2xl md:rounded-[4rem] relative overflow-hidden bg-gradient-to-br from-neon-green/10 to-transparent">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Trees className="size-48 md:size-64 lg:size-80 text-neon-green rotate-12" />
                    </div>

                    <div className="flex items-baseline gap-4 md:gap-7 mb-3 md:mb-6 flex-wrap relative z-10">
                        <h3 className="text-6xl md:text-8xl lg:text-9xl font-black text-white font-heading tracking-tighter shadow-green">{score}</h3>
                        <span className="text-neon-green font-black uppercase tracking-[0.4em] text-xs md:text-2xl pt-2">Impact Score</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[8px] md:text-xs lg:text-sm tracking-[0.4em] mb-10 md:mb-16 relative z-10">Kortana Ecological Footprint Rating (Global)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 relative z-10">
                        <div className="p-5 md:p-8 bg-white/5 rounded-2xl lg:rounded-[2rem] border border-white/5 backdrop-blur-md text-glow-green">
                            <p className="text-[7px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-1 xl:mb-3">Carbon Offset Credit Sync</p>
                            <p className="text-2xl md:text-4xl lg:text-5xl font-black text-white">{(score / 685.4).toFixed(3)} T</p>
                            <div className="mt-2 text-neon-green text-[7px] md:text-[9px] font-black uppercase tracking-widest">+12.4% / Month</div>
                        </div>
                        <div className="p-5 md:p-8 bg-white/5 rounded-2xl lg:rounded-[2rem] border border-white/5 backdrop-blur-md">
                            <p className="text-[7px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-1 xl:mb-3">Ecosystem Efficiency</p>
                            <p className="text-2xl md:text-4xl lg:text-5xl font-black text-white">99.4%</p>
                            <div className="mt-2 text-cyan-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">Optimized Pulse</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-5 md:p-10 rounded-2xl md:rounded-[3rem] flex flex-col justify-between gap-6 border-neon-green/10 bg-neon-green/[0.02] shadow-2xl">
                    <div className="space-y-4 md:space-y-8 text-white">
                        <div className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-neon-green/10 rounded-2xl lg:rounded-[2rem] flex items-center justify-center text-neon-green shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <Zap className="size-6 md:size-10 lg:size-12" />
                        </div>
                        <div className="space-y-2 lg:space-y-4">
                            <h4 className="text-lg md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">Green Rewards</h4>
                            <p className="text-[8px] md:text-xs lg:text-sm text-gray-500 leading-relaxed font-bold uppercase tracking-widest opacity-80">Claim your Enclave rewards for ecosystem contribution.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClaim}
                        className="w-full btn-launch !bg-neon-green !text-deep-space py-4 md:py-8 lg:py-10 lg:text-xl font-black hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all">
                        Claim {(score / 17).toFixed(2)} DNR
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   RISK AI VIEW (NETWORK PULSE)
   ============================================================ */
export const RiskAIView = () => {
    const { network } = useWalletStore();
    const [riskLevel, setRiskLevel] = useState(12);
    const [bars, setBars] = useState([40, 70, 45, 90, 65, 80, 50]);
    const [gasPrice, setGasPrice] = useState('0.0');

    useEffect(() => {
        const updateRisk = async () => {
            const gas = await providerService.getGasPrice(network);
            setGasPrice(gas);
            const baseRisk = parseFloat(gas) > 50 ? 25 : 8;
            setRiskLevel(baseRisk + Math.floor(Math.random() * 10));
            setBars(prev => prev.map(() => 30 + Math.floor(Math.random() * 70)));
        };
        updateRisk();
        const interval = setInterval(updateRisk, 5000);
        return () => clearInterval(interval);
    }, [network]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={BrainCircuit} iconColor="text-rose-500"
                iconBg="bg-rose-500/10" iconBorder="border-rose-500/20"
                title="Risk" highlight="Enigma AI"
                subtitle="Real-time threat detection and pool volatility metrics"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-2 glass-panel p-6 md:p-14 rounded-2xl md:rounded-[3.5rem] bg-gradient-to-br from-rose-500/5 to-transparent flex flex-col md:flex-row items-center gap-10">
                    <div className="relative shrink-0">
                        <svg className="w-48 h-48 md:w-64 md:h-64">
                            <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-white/5 stroke-[10]" />
                            <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-rose-500 stroke-[10] transition-all duration-1000" strokeDasharray={`${riskLevel * 2.8}, 280`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-rose-500 leading-none">{riskLevel}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Index Score</span>
                        </div>
                    </div>
                    <div className="space-y-6 flex-1 text-center md:text-left">
                        <div className="space-y-2">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Security <span className="text-rose-500">Stance</span></h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs opacity-60">AI Analysis of {network.toUpperCase()} liquidity shards</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-gray-600 font-black uppercase block mb-1">Network Stress</span>
                                <span className="text-xl font-black text-white">{riskLevel > 20 ? 'ELEVATED' : 'NOMINAL'}</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-gray-600 font-black uppercase block mb-1">Current Gas</span>
                                <span className="text-xl font-black text-white">{gasPrice} Gwei</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 md:p-10 rounded-2xl md:rounded-[3rem] flex flex-col gap-6 md:gap-10">
                    <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Sub-Quantum Pulse</h4>
                    <div className="flex-1 flex items-end justify-between gap-1 h-32 md:h-full">
                        {bars.map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                className={`w-3 md:w-5 bg-gradient-to-t ${height > 70 ? 'from-rose-600 to-rose-400' : 'from-indigo-600 to-cyan-400'} rounded-full shadow-2xl`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   SUBNET VIEW (SHARD SYNC)
   ============================================================ */
export const SubNetView = () => {
    const { network, setNetwork, showNotification } = useWalletStore();
    const [syncing, setSyncing] = useState<string | null>(null);

    const handleSync = async (netId: string) => {
        setSyncing(netId);
        await new Promise(r => setTimeout(r, 2000));
        const target: NetworkType = netId.includes('Gov') || netId.includes('AI') ? 'mainnet' : 'testnet';
        setNetwork(target);
        showNotification(`Shard Synchronized: ${netId} active.`, 'success');
        setSyncing(null);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Globe} iconColor="text-blue-400"
                iconBg="bg-blue-400/10" iconBorder="border-blue-400/20"
                title="Network" highlight="Sub-Nets"
                subtitle="Enterprise partition and sidechain management"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {['Finance-XL', 'Gaming-Core', 'Gov-Enclave', 'Data-Lake', 'Shard-Omega', 'AI-Grid'].map((net) => (
                    <div key={net} className="glass-panel p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] space-y-6 md:space-y-10 hover:bg-white/[0.05] transition-all group border-white/5 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:border-blue-400/50 transition-all shadow-blue">
                                <Network className="size-5 md:size-9" />
                            </div>
                            <span className="text-neon-green text-[8px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-green shadow-2xl" /> Active
                            </span>
                        </div>
                        <div>
                            <h4 className="text-xl md:text-3xl font-black text-white uppercase font-heading tracking-tighter leading-none">{net}</h4>
                            <p className="text-[8px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.4em] mt-3 opacity-60">Partition Shard ID: 0x{Math.floor(Math.random() * 10000)}</p>
                        </div>
                        <button
                            disabled={!!syncing}
                            onClick={() => handleSync(net)}
                            className="w-full py-4 md:py-6 border border-white/5 bg-white/5 rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-[0.4em] group-hover:bg-blue-400 group-hover:text-deep-space transition-all flex items-center justify-center gap-2"
                        >
                            {syncing === net ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <span>Sync Shard</span>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

/* ============================================================
   STABLE VIEW (MINTING PULSE)
   ============================================================ */
export const StableView = () => {
    const { address, balance, network, privateKey, registerToken, showNotification } = useWalletStore();
    const [collateral, setCollateral] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [kUSDAmount, setKUSDAmount] = useState('0.00');

    useEffect(() => {
        const updateAmount = async () => {
            const amount = await collateralService.getMintableAmount(collateral);
            setKUSDAmount(amount);
        };
        updateAmount();
    }, [collateral]);

    const handleMint = async () => {
        if (!address || !privateKey) return showNotification('No Enclave session.', 'error');
        if (!collateral || parseFloat(collateral) <= 0) return showNotification('Input amount.', 'error');
        setIsMinting(true);
        try {
            const hash = await collateralService.mintKUSD(address, collateral, network, privateKey);
            registerToken({
                address: '0x321a421293214212932142129321421293214212',
                symbol: 'kUSD',
                decimals: 18,
                name: 'Kortana USD Pulse',
                balance: kUSDAmount,
                network: network
            });
            setTxHash(hash);
            setCollateral('');
            showNotification(`Minting pulse finalized: ${kUSDAmount} kUSD issued.`, 'success');
        } catch (error: any) {
            showNotification(`Minting failed: ${error.message}`, 'error');
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <div className="glass-panel p-6 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] space-y-6 md:space-y-10 border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl relative overflow-hidden">
                    <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">Mint Enclave Stable</h3>
                    <div className="space-y-6 md:space-y-10">
                        <div className="space-y-3">
                            <div className="flex justify-between px-2 items-end">
                                <label className="text-[8px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Collateral (DNR Enclave)</label>
                                <span className="text-[8px] md:text-sm font-black text-cyan-400 uppercase cursor-pointer hover:text-white transition-colors tracking-widest" onClick={() => setCollateral(balance)}>MAX</span>
                            </div>
                            <input
                                type="number"
                                value={collateral}
                                onChange={(e) => setCollateral(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-3xl md:text-6xl lg:text-7xl font-black text-white outline-none focus:border-cyan-400/50 transition-all placeholder-white/5 shadow-inner"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex items-center justify-center relative">
                            <div className="w-full h-px bg-white/10 absolute" />
                            <div className="p-4 bg-deep-space rounded-full border border-white/10 relative z-10">
                                <ArrowDownLeft className="size-6 text-purple-400" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[8px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Receive kUSD Pulse</label>
                            <input
                                className="w-full bg-purple-400/5 border border-purple-400/20 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-3xl md:text-6xl lg:text-7xl font-black text-purple-400 outline-none shadow-inner"
                                value={kUSDAmount}
                                readOnly
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleMint}
                        disabled={isMinting}
                        className="w-full btn-launch !bg-purple-400 !text-deep-space py-5 md:py-10 lg:text-2xl font-black disabled:opacity-50 transition-all"
                    >
                        {isMinting ? <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-full inline-block" /> : 'Initiate Minting Pulse'}
                    </button>
                </div>

                <div className="space-y-6 md:space-y-12">
                    <div className="glass-panel p-6 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] bg-purple-400/5 border-purple-400/10 relative overflow-hidden group shadow-2xl">
                        <h4 className="font-black text-white uppercase tracking-[0.4em] mb-6 text-xs md:text-xl opacity-60">Minting Equilibrium</h4>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl md:text-8xl lg:text-9xl font-black text-white font-heading tracking-tighter">150%</span>
                            <span className="text-purple-400 font-black text-[10px] md:text-2xl uppercase tracking-widest">Over-Collateralized</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] space-y-8 md:space-y-12 border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="space-y-4">
                            <p className="text-[9px] md:text-sm font-black text-gray-500 uppercase tracking-[0.5em]">Global Stability Reserve</p>
                            <span className="text-4xl md:text-7xl font-black text-white font-heading tracking-tighter">$10.42M <span className="text-xs md:text-xl text-gray-600 font-bold uppercase tracking-widest">USD</span></span>
                        </div>
                        <div className="w-full h-3 md:h-6 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                            <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
