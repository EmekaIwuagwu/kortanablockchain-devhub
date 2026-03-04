'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader2, Lock, ArrowRight,
    CheckCircle2, ExternalLink, AlertCircle,
    ChevronLeft, Zap
} from 'lucide-react';
import { ethers } from 'ethers';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';
import { vaultService } from '@/lib/VaultService';
import { NETWORKS } from '@/lib/constants';

type TransactStep = 'input' | 'confirm' | 'password' | 'processing' | 'success';

export const TransactView: React.FC = () => {
    const {
        privateKey,
        network,
        setBalance,
        address,
        passwordHash,
        encryptedMnemonic,
        setMnemonic,
        setPrivateKey
    } = useWalletStore();

    const [step, setStep] = useState<TransactStep>('input');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [gasEstimate, setGasEstimate] = useState<string>('0.0001');

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
            const tx = await wallet.sendTransaction({
                to: recipient,
                value: ethers.parseEther(amount),
            });
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
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 md:space-y-6"
                    >
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase text-white font-heading">
                            Transact <span className="text-gradient-kortana">Assets</span>
                        </h2>
                        <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] space-y-4 md:space-y-6 relative overflow-hidden">
                            {/* Recipient */}
                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Recipient Address</label>
                                <div className="relative group">
                                    <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={15} />
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 pl-10 md:pl-14 focus:border-cyan-500/50 outline-none transition-all text-xs text-white font-mono placeholder:text-gray-700"
                                        placeholder="0x... or Domain Name"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Amount (DNR)</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 text-2xl md:text-5xl font-black text-white font-heading focus:border-purple-500/50 outline-none transition-all placeholder:text-white/5 pr-16"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm md:text-xl font-black text-gray-800 uppercase pointer-events-none">DNR</div>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                                    <AlertCircle className="text-rose-500 shrink-0" size={16} />
                                    <p className="text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-wider">{error}</p>
                                </motion.div>
                            )}

                            <button
                                onClick={handleContinue}
                                disabled={loading}
                                className="w-full btn-launch !rounded-xl md:!rounded-2xl py-3 md:py-5 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <span>Continue Securely</span>
                                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
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
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                        className="space-y-4 md:space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <button onClick={() => setStep('input')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-lg md:text-2xl font-black tracking-tighter uppercase text-white font-heading">
                                Confirm <span className="text-gradient-kortana">Payload</span>
                            </h2>
                        </div>

                        <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] space-y-5">
                            <div className="p-4 md:p-8 bg-gradient-to-br from-white/[0.03] to-transparent rounded-xl md:rounded-[2rem] border border-white/5 space-y-4">
                                <div className="text-center space-y-1">
                                    <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Amount to Transfer</p>
                                    <h3 className="text-3xl md:text-5xl font-black text-white font-heading">{amount} <span className="text-gray-700 text-base md:text-2xl">DNR</span></h3>
                                </div>
                                <div className="h-px bg-white/5 w-full" />
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-1">
                                        <p className="text-[7px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest">Recipient</p>
                                        <p className="font-mono text-[9px] md:text-xs text-cyan-400 break-all bg-black/20 p-2 rounded-lg">{recipient}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[7px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest">Est. Network Fee</p>
                                        <div className="flex items-center gap-2">
                                            <Zap size={10} className="text-yellow-500" />
                                            <p className="font-mono text-[10px] md:text-xs text-white">{gasEstimate} DNR</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleConfirm} className="w-full btn-launch !rounded-xl md:!rounded-2xl py-3 md:py-5">
                                Proceed to Signing
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* PASSWORD STEP */}
                {step === 'password' && (
                    <motion.div
                        key="password"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 md:space-y-6"
                    >
                        <h2 className="text-lg md:text-2xl font-black tracking-tighter uppercase text-white font-heading text-center">
                            Unlock <span className="text-gradient-kortana">Enclave</span>
                        </h2>
                        <div className="glass-panel p-6 md:p-10 rounded-2xl md:rounded-[3rem] space-y-6 max-w-sm mx-auto">
                            <div className="w-14 h-14 md:w-20 md:h-20 bg-cyan-400/10 rounded-full flex items-center justify-center text-cyan-400 mx-auto border border-cyan-400/20 animate-pulse">
                                <Lock size={24} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center block">Enter Access Password</label>
                                <input
                                    type="password"
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 text-center text-xl md:text-2xl font-black text-white focus:border-cyan-500/50 outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                />
                            </div>
                            {error && <p className="text-rose-500 text-center text-[9px] font-black uppercase tracking-widest">{error}</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setStep('confirm')} className="flex-1 btn-outline">Back</button>
                                <button onClick={handlePasswordSubmit} className="flex-1 btn-launch">Confirm</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PROCESSING STEP */}
                {step === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 md:py-32 space-y-8"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 md:w-28 md:h-28 border-4 border-cyan-400/20 rounded-full" />
                            <motion.div
                                className="absolute inset-0 border-t-4 border-cyan-400 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl md:text-3xl font-black text-white uppercase font-heading">Broadcasting...</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px]">Submitting to Poseidon Network</p>
                        </div>
                    </motion.div>
                )}

                {/* SUCCESS STEP */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5 md:space-y-8"
                    >
                        <div className="glass-panel p-6 md:p-12 rounded-2xl md:rounded-[3rem] text-center space-y-6 md:space-y-8 border-neon-green/10 bg-gradient-to-br from-neon-green/[0.03] to-transparent">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green mx-auto border border-neon-green/20">
                                <CheckCircle2 className="size-8 md:size-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl md:text-4xl font-black text-white uppercase font-heading">Transmission <span className="text-neon-green">Success</span></h3>
                                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Your assets are now on the ledger.</p>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6">
                                <div className="flex justify-between items-center text-left gap-3">
                                    <div className="space-y-0.5 truncate min-w-0">
                                        <p className="text-[7px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest">Transaction Hash</p>
                                        <p className="font-mono text-[9px] md:text-[10px] text-cyan-400 truncate">{txHash}</p>
                                    </div>
                                    <a
                                        href={explorerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 w-9 h-9 md:w-11 md:h-11 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-cyan-400 hover:text-deep-space transition-all"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>

                            <button onClick={reset} className="w-full btn-outline py-3 md:py-5">
                                Back to Enclave
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
