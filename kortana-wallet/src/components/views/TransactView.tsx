'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader2, Lock, ArrowRight,
    CheckCircle2, ExternalLink, AlertCircle,
    ChevronLeft, Zap, Wallet, Activity
} from 'lucide-react';
import { ethers } from 'ethers';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';
import { vaultService } from '@/lib/VaultService';
import { priceService } from '@/lib/PriceService';
import { NETWORKS, KORTANA_BRIDGE_ADDRESS } from '@/lib/constants';

const BRIDGE_ABI = [
    "function bridgeNative(uint256 targetChainId) external payable"
];

type TransactStep = 'input' | 'confirm' | 'password' | 'processing' | 'success';

export const TransactView: React.FC = () => {
    const {
        privateKey,
        network,
        setBalance,
        address,
        passwordHash,
        encryptedMnemonic,
        showNotification
    } = useWalletStore();

    const [step, setStep] = useState<TransactStep>('input');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [usdValue, setUsdValue] = useState('0.00');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [gasEstimate, setGasEstimate] = useState<string>('0.0001');
    const [isBridging, setIsBridging] = useState(false);
    const [targetNetwork, setTargetNetwork] = useState('sepolia');

    // Live USD Calculation logic
    useEffect(() => {
        if (!amount || isNaN(parseFloat(amount))) {
            setUsdValue('0.00');
            return;
        }
        const val = priceService.getValue(amount, 'DNR');
        setUsdValue(val);
    }, [amount]);

    const handleContinue = async () => {
        if (!recipient || !amount) return setError('Please fill in all fields.');
        if (!ethers.isAddress(recipient)) return setError('Invalid recipient address.');
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return setError('Invalid amount.');

        setError(null);
        setLoading(true);
        try {
            const provider = providerService.getProvider(network);
            const estimate = await provider.estimateGas({
                to: recipient,
                value: ethers.parseEther(amount),
                from: address!
            });
            const feeData = await provider.getFeeData();
            const totalGas = estimate * (feeData.gasPrice || BigInt(1000000000));
            setGasEstimate(ethers.formatEther(totalGas));
            setStep('confirm');
        } catch (err: any) {
            setGasEstimate('0.00021');
            setStep('confirm');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => setStep('password');

    const handlePasswordSubmit = async () => {
        const inputHash = vaultService.hashPassword(password);
        if (inputHash !== passwordHash) {
            setError('Incorrect password.');
            return;
        }
        setError(null);
        setStep('processing');
        try {
            let activeKey = privateKey;
            if (!activeKey && encryptedMnemonic) {
                const decMnemonic = vaultService.decrypt(encryptedMnemonic, password);
                if (decMnemonic) {
                    const wallet = ethers.Wallet.fromPhrase(decMnemonic);
                    activeKey = wallet.privateKey;
                }
            }
            if (!activeKey) throw new Error('Could not unlock wallet.');

            const provider = providerService.getProvider(network);
            const wallet = new ethers.Wallet(activeKey, provider);

            let tx;
            if (isBridging) {
                const bridge = new ethers.Contract(KORTANA_BRIDGE_ADDRESS, BRIDGE_ABI, wallet);
                const targetId = NETWORKS[targetNetwork as keyof typeof NETWORKS].chainId;
                tx = await bridge.bridgeNative(targetId, {
                    value: ethers.parseEther(amount)
                });
            } else {
                tx = await wallet.sendTransaction({
                    to: recipient,
                    value: ethers.parseEther(amount),
                });
            }

            setTxHash(tx.hash);
            await tx.wait();

            const newBalance = await providerService.getBalance(address!, network);
            setBalance(newBalance);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Transaction failed.');
            setStep('input');
        }
    };

    const reset = () => {
        setStep('input');
        setAmount('');
        setRecipient('');
        setPassword('');
        setError(null);
        setTxHash(null);
    };

    const explorerUrl = txHash ? `${NETWORKS[network].explorer}/tx/${txHash}` : '#';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto w-full pb-4">
            <AnimatePresence mode="wait">

                {/* INPUT STEP */}
                {step === 'input' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-6"
                    >
                        <div className="space-y-1">
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase text-white font-heading">
                                Transact <span className="text-gradient-kortana">Assets</span>
                            </h2>
                            <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">Broadcast value across the enclave</p>
                        </div>

                        <div className="flex bg-black/20 p-1.5 rounded-2xl md:rounded-[1.5rem] border border-white/5 mx-1">
                            <button
                                onClick={() => setIsBridging(false)}
                                className={`flex-1 py-3 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-xl transition-all ${!isBridging ? 'bg-cyan-500 text-deep-space shadow-kortana' : 'text-gray-500 hover:text-white'}`}
                            >
                                Direct Send
                            </button>
                            <button
                                onClick={() => setIsBridging(true)}
                                className={`flex-1 py-3 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-xl transition-all ${isBridging ? 'bg-purple-500 text-deep-space shadow-purple' : 'text-gray-500 hover:text-white'}`}
                            >
                                Bridge Shard
                            </button>
                        </div>

                        <div className="glass-panel p-4 md:p-10 rounded-2xl md:rounded-[3rem] space-y-8 relative overflow-hidden backdrop-blur-xl border-white/5 shadow-2xl">
                            {/* Recipient */}
                            <div className="space-y-3">
                                <label className="text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Wallet size={12} className={isBridging ? 'text-purple-400' : 'text-cyan-400'} /> {isBridging ? 'Destination Address' : 'Recipient Address'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 md:pl-7 flex items-center pointer-events-none">
                                        <Search className="text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    </div>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-7 pl-12 md:pl-20 focus:border-cyan-500/50 outline-none transition-all text-sm md:text-lg text-white font-mono placeholder:text-gray-800"
                                        placeholder={isBridging ? "Target Shard Address" : "Enter Enclave Address (0x...)"}
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                    />
                                </div>
                            </div>

                            {isBridging && (
                                <div className="space-y-3">
                                    <label className="text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Destination Shard</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['sepolia', 'avalancheFuji', 'baseSepolia', 'polygonAmoy'].map((net) => (
                                            <button
                                                key={net}
                                                onClick={() => setTargetNetwork(net)}
                                                className={`p-4 border rounded-2xl text-[10px] md:text-xs font-black uppercase transition-all ${targetNetwork === net ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                                            >
                                                {NETWORKS[net as keyof typeof NETWORKS].name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <label className="text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} className="text-purple-400" /> Amount
                                    </label>
                                    <span className="text-[10px] md:text-sm font-black text-white/40 uppercase tracking-widest">≈ ${usdValue} USD</span>
                                </div>
                                <div className="relative group">
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 text-4xl md:text-7xl font-black text-white font-heading focus:border-purple-500/50 outline-none transition-all placeholder:text-white/5 pr-20 md:pr-32"
                                        placeholder="0.00"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end">
                                        <span className="text-lg md:text-3xl font-black text-gray-700 uppercase">DNR</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                                    <AlertCircle className="text-rose-500 shrink-0" size={20} />
                                    <p className="text-[10px] md:text-xs font-black text-rose-500 uppercase tracking-widest">{error}</p>
                                </motion.div>
                            )}

                            <button
                                onClick={handleContinue}
                                disabled={loading}
                                className="w-full btn-launch !rounded-2xl md:!rounded-[2rem] py-5 md:py-10 group shadow-kortana hover:shadow-[0_0_50px_rgba(6,182,212,0.4)]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Calculating Pulse...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-lg md:text-2xl font-black uppercase">Continue Securely</span>
                                        <ArrowRight className="size-5 md:size-6 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* CONFIRM STEP */}
                {step === 'confirm' && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.05 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep('input')} className="p-3 hover:bg-white/5 rounded-full transition-colors border border-white/5">
                                <ChevronLeft size={24} className="text-gray-400" />
                            </button>
                            <div>
                                <h2 className="text-lg md:text-3xl font-black tracking-tighter uppercase text-white font-heading leading-tight">
                                    Confirm <span className="text-gradient-kortana">Payload</span>
                                </h2>
                                <p className="text-[8px] md:text-[10px] text-gray-500 tracking-[0.3em] font-bold uppercase">Final validation before signing</p>
                            </div>
                        </div>

                        <div className="glass-panel p-5 md:p-12 rounded-2xl md:rounded-[3.5rem] space-y-8 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl border-white/5">
                            <div className="p-6 md:p-12 bg-black/40 rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl" />

                                <div className="text-center space-y-2">
                                    <p className="text-[9px] md:text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Payload Value</p>
                                    <div className="space-y-1">
                                        <h3 className="text-4xl md:text-7xl font-black text-white font-heading">{amount} <span className="text-gray-700 text-xl md:text-3xl">DNR</span></h3>
                                        <p className="text-cyan-400 text-[10px] md:text-lg font-black uppercase tracking-[0.2em]">≈ ${usdValue} USD</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 w-full" />

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-xs font-black text-gray-600 uppercase tracking-[0.3em]">Destination</label>
                                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 group hover:border-cyan-400/30 transition-all">
                                            <p className="font-mono text-[10px] md:text-base text-gray-300 break-all leading-relaxed">{recipient}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-4 md:p-6 rounded-2xl">
                                        <span className="text-[8px] md:text-xs font-black text-gray-600 uppercase tracking-[0.3em]">Network Enclave Fee</span>
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-500 shadow-yellow" />
                                            <p className="font-mono text-xs md:text-lg text-white font-black">{gasEstimate} <span className="text-gray-600">DNR</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleConfirm} className="w-full btn-launch !rounded-2xl md:!rounded-[2.5rem] py-6 md:py-10 text-xl md:text-2xl">
                                Proceed to Signing
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* PASSWORD STEP */}
                {step === 'password' && (
                    <motion.div
                        key="password"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase text-white font-heading leading-tight">
                                Unlock <span className="text-gradient-kortana">Enclave</span>
                            </h2>
                            <p className="text-[10px] text-gray-500 tracking-[0.4em] font-bold uppercase">Biometric or Pass-Sync Required</p>
                        </div>

                        <div className="glass-panel p-8 md:p-14 rounded-2xl md:rounded-[4rem] space-y-10 max-w-sm mx-auto shadow-2xl relative overflow-hidden bg-black/60">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />

                            <motion.div
                                className="w-20 h-20 md:w-32 md:h-32 bg-cyan-400/5 rounded-full flex items-center justify-center text-cyan-400 mx-auto border border-cyan-400/20 relative z-10"
                                animate={{ boxShadow: ["0 0 20px rgba(34,211,238,0.1)", "0 0 40px rgba(34,211,238,0.3)", "0 0 20px rgba(34,211,238,0.1)"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Lock size={40} className="md:size-56" />
                            </motion.div>

                            <div className="space-y-4 relative z-10">
                                <label className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-[0.4em] text-center block">Secure Key Access</label>
                                <input
                                    type="password"
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 text-center text-2xl md:text-4xl font-black text-white focus:border-cyan-500/50 outline-none shadow-inner"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                />
                            </div>

                            {error && <p className="text-rose-500 text-center text-[10px] font-black uppercase tracking-widest">{error}</p>}

                            <div className="flex gap-4 relative z-10">
                                <button onClick={() => setStep('confirm')} className="flex-1 btn-outline py-4 md:py-6">Back</button>
                                <button onClick={handlePasswordSubmit} className="flex-1 btn-launch py-4 md:py-6">Authorize</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PROCESSING STEP */}
                {step === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 md:py-40 space-y-12"
                    >
                        <div className="relative">
                            <div className="w-32 h-32 md:w-48 md:h-48 border-8 border-cyan-400/10 rounded-full" />
                            <motion.div
                                className="absolute inset-0 border-t-8 border-cyan-400 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "circIn" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="text-cyan-400/30 animate-pulse" size={32} />
                            </div>
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl md:text-5xl font-black text-white uppercase font-heading tracking-tighter">Broadcasting Pulse</h3>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.5em] text-[10px] md:text-base animate-pulse">Syncing with Poseidon Mainnet Shards</p>
                        </div>
                    </motion.div>
                )}

                {/* SUCCESS STEP */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="glass-panel p-8 md:p-20 rounded-2xl md:rounded-[5rem] text-center space-y-10 border-neon-green/10 bg-gradient-to-br from-neon-green/[0.05] to-transparent shadow-[0_0_100px_rgba(34,197,94,0.1)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green/40 to-transparent" />

                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-20 h-20 md:w-32 md:h-32 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green mx-auto border border-neon-green/20 shadow-green"
                            >
                                <CheckCircle2 className="size-10 md:size-16" />
                            </motion.div>

                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-6xl font-black text-white uppercase font-heading tracking-tighter">Transmission <span className="text-neon-green">Finalized</span></h3>
                                <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-lg">Immutable ledger entry established.</p>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-left space-y-4 backdrop-blur-md">
                                <div className="flex justify-between items-center gap-6">
                                    <div className="space-y-2 truncate flex-1 min-w-0">
                                        <p className="text-[9px] md:text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Transaction Hash</p>
                                        <p className="font-mono text-[10px] md:text-lg text-cyan-400 truncate tracking-tight">{txHash}</p>
                                    </div>
                                    <a
                                        href={explorerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 w-12 h-12 md:w-20 md:h-20 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-neon-green hover:text-deep-space transition-all border border-white/5 hover:scale-105 active:scale-95 shadow-xl"
                                    >
                                        <ExternalLink size={24} className="md:size-32" />
                                    </a>
                                </div>
                            </div>

                            <button onClick={reset} className="w-full btn-outline py-5 md:py-10 text-lg md:text-2xl font-black rounded-2xl md:rounded-[2.5rem]">
                                Return to Enclave Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
