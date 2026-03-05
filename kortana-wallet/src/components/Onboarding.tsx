'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Download, ChevronRight, Shield, Sparkles,
    Lock, CheckCircle2, ArrowLeft, Key, Eye, EyeOff,
    LogIn, UserPlus, Copy, Fingerprint, Activity, Terminal
} from 'lucide-react';
import { generateMnemonic, createWalletFromMnemonic } from '@/lib/wallet';
import { useWalletStore } from '@/store/useWalletStore';
import { vaultService } from '@/lib/VaultService';

type Step = 'login' | 'register' | 'start' | 'generate' | 'verify' | 'password' | 'success' | 'import';

export const Onboarding: React.FC = () => {
    const {
        encryptedMnemonic,
        passwordHash,
        setEncryptedMnemonic,
        setAddress,
        setLocked,
        setPasswordHash,
        reset,
        setMnemonic: setMemoryMnemonic,
        setPrivateKey: setMemoryPrivateKey,
        showNotification
    } = useWalletStore();

    const [step, setStep] = useState<Step>('start');
    const [isShaking, setIsShaking] = useState(false);
    const [mnemonic, setNewMnemonic] = useState<string>('');
    const [mnemonicInput, setMnemonicInput] = useState<string>('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        if (passwordHash && encryptedMnemonic) {
            setStep('login');
        } else {
            setStep('start');
        }
    }, [passwordHash, encryptedMnemonic]);

    const handleCreateWallet = () => {
        const mn = generateMnemonic();
        setNewMnemonic(mn);
        setStep('generate');
    };

    const handleVerifyMnemonic = () => {
        if (mnemonicInput.trim() === mnemonic) {
            setStep('password');
        } else {
            showNotification('Invalid mnemonic phrase. Please check again.', 'error');
            triggerShake();
        }
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const handleSetPassword = () => {
        if (password.length < 8) { showNotification('Password must be at least 8 characters.', 'error'); triggerShake(); return; }
        if (password !== confirmPassword) { showNotification('Passwords do not match.', 'error'); triggerShake(); return; }
        const hash = vaultService.hashPassword(password);

        setPasswordHash(hash);
        const encrypted = vaultService.encrypt(mnemonic, password);
        setEncryptedMnemonic(encrypted);
        setStep('success');
    };

    const handleLogin = async () => {
        setIsAuthenticating(true);
        await new Promise(r => setTimeout(r, 1200)); // Cinematic delay

        const inputHash = vaultService.hashPassword(loginPassword);
        if (inputHash === passwordHash && encryptedMnemonic) {
            const dec = vaultService.decrypt(encryptedMnemonic, loginPassword);
            if (dec) {
                const wallet = createWalletFromMnemonic(dec);
                setMemoryMnemonic(dec);
                setMemoryPrivateKey(wallet.privateKey);
                setAddress(wallet.address);
                setLocked(false);
                showNotification('Wallet unlocked', 'success');
            } else {
                showNotification('Decryption failed. Data may be corrupted.', 'error');
                triggerShake();
            }
        } else {
            showNotification('Incorrect password.', 'error');
            triggerShake();
        }
        setIsAuthenticating(false);
    };

    const completeSetup = () => {
        const dec = vaultService.decrypt(encryptedMnemonic!, password);
        if (dec) {
            const wallet = createWalletFromMnemonic(dec);
            setMemoryMnemonic(dec);
            setMemoryPrivateKey(wallet.privateKey);
            setAddress(wallet.address);
            setLocked(false);
        }
    };

    const handleImportMnemonic = () => {
        const input = mnemonicInput.trim();
        if (!input || input.split(' ').length !== 12) {
            showNotification('Please enter a valid 12-word recovery phrase.', 'error');
            triggerShake();
            return;
        }

        setNewMnemonic(input);
        setStep('password');
    };

    return (
        <div className="grid place-items-center h-screen w-full bg-deep-space overflow-hidden relative p-4">
            {/* Cinematic Backgrounds */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] nebula-purple opacity-20 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] nebula-cyan opacity-15 animate-pulse" />
                <div className="grainy-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent to-transparent opacity-80" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isShaking ? {
                    x: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.4 }
                } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-sm md:max-w-md glass-panel p-10 rounded-[3rem] md:rounded-[4rem] relative z-10 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden"
            >
                {/* Visual pulse for biometric */}
                {isAuthenticating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-cyan-400/5 z-[60] flex flex-col items-center justify-center backdrop-blur-md"
                    >
                        <div className="relative">
                            <motion.div
                                className="w-32 h-32 md:w-40 md:h-40 border border-cyan-400/20 rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Fingerprint size={48} className="text-cyan-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="mt-8 text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Verifying Identity Shards</p>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'login' && (
                        <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 md:space-y-12">
                            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                                <motion.div className="relative group p-1">
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform" />
                                    <img src="/images/logo.png" alt="K" className="w-20 h-20 md:w-28 md:h-28 object-contain relative z-10 drop-shadow-2xl" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-white uppercase">Access <span className="text-gradient-kortana">Enclave</span></h1>
                                    <p className="text-gray-500 font-bold text-[10px] md:text-sm uppercase tracking-[0.4em]">Biometric Sign-In Required</p>
                                </div>
                            </div>
                            <div className="space-y-6 md:space-y-8">
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 pl-16 focus:border-cyan-500/50 outline-none transition-all text-white text-lg md:text-2xl font-black tracking-widest placeholder:text-gray-800 shadow-inner"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    />
                                    <button className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <button onClick={handleLogin} className="w-full btn-launch py-6 md:py-8 text-xl font-black shadow-kortana group">
                                    <span>Sync Enclave</span>
                                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                                <div className="flex justify-between px-2">
                                    <button onClick={reset} className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/40 hover:text-rose-500 transition-colors">Emergency Purge</button>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">v1.2.4-stable</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'start' && (
                        <motion.div key="start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-10 md:space-y-16">
                            <div className="flex flex-col items-center text-center space-y-6 md:space-y-10">
                                <motion.div
                                    animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                    className="w-24 h-24 md:w-36 md:h-36 relative"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-[50px] rounded-full" />
                                    <img src="/images/logo.png" alt="K" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(6,182,212,0.4)]" />
                                </motion.div>
                                <div className="space-y-3">
                                    <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-white">
                                        KORTANA <span className="text-gradient-kortana">POSEIDON</span>
                                    </h1>
                                    <p className="text-gray-400 font-bold text-xs md:text-lg tracking-[0.3em] uppercase opacity-70">Next-Gen Crypto Terminal</p>
                                </div>
                            </div>
                            <div className="space-y-5">
                                <button onClick={() => setStep('register')} className="w-full btn-launch py-6 md:py-8 gap-4 text-xl font-black">
                                    <UserPlus size={24} />
                                    <span>Initialize Wallet</span>
                                    <ChevronRight size={18} className="ml-auto opacity-50" />
                                </button>
                                <button onClick={() => setStep('import')} className="w-full btn-outline py-6 md:py-8 gap-4 text-xl font-black rounded-3xl">
                                    <Download size={24} className="text-cyan-400" />
                                    <span>Import Identity</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'register' && (
                        <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8 md:space-y-10 text-center">
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-cyan-400/10 rounded-[2rem] flex items-center justify-center text-cyan-400 mx-auto border border-cyan-400/20 shadow-inner">
                                    <Shield size={36} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase font-heading text-white">Sharding Shards</h1>
                                    <p className="text-gray-500 text-sm md:text-base px-4 leading-relaxed font-bold opacity-80 uppercase tracking-tight">Your 12-word recovery phrase is your uniquely generated master key. We never own your keys.</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4">
                                <button onClick={handleCreateWallet} className="w-full btn-launch py-6 md:py-8 text-xl font-black group">
                                    Generate Keys <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button onClick={() => setStep('start')} className="w-full text-xs font-black uppercase text-gray-700 tracking-[0.4em] hover:text-white transition-colors">Decline Access</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'generate' && (
                        <motion.div key="generate" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-full w-fit">
                                    <Activity size={14} className="text-neon-green" />
                                    <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em]">Master Key Shards</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Preserve This Matrix</h1>
                                <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-bold opacity-80 uppercase">You MUST write these 12 shards down on physical media. Loss means permanent asset lock.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 md:gap-4 relative">
                                <div className="absolute inset-0 bg-cyan-400/5 blur-3xl rounded-full" />
                                {mnemonic.split(' ').map((word, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-black/60 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-center hover:border-cyan-500/30 transition-all shadow-xl group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-100 transition-opacity">
                                            <Terminal size={10} className="text-cyan-400" />
                                        </div>
                                        <span className="text-white/10 text-[9px] font-black block mb-1 uppercase tracking-tighter">#{idx + 1}</span>
                                        <span className="font-mono text-xs md:text-lg font-black text-white tracking-tight">{word}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(mnemonic);
                                        showNotification('Secret Phrase Copied', 'success');
                                    }}
                                    className="w-full btn-outline py-5 md:py-6 text-sm font-black gap-3 rounded-2xl md:rounded-3xl"
                                >
                                    <Copy size={18} /> <span>Capture Shards</span>
                                </button>
                                <button onClick={() => setStep('verify')} className="w-full btn-launch py-5 md:py-8 text-xl font-black">
                                    I Have Established Backup
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'verify' && (
                        <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase font-heading text-white underline decoration-cyan-500/50 underline-offset-8">Verify Sync</h2>
                                <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-[0.3em]">Proof of Preservation Required</p>
                            </div>
                            <textarea
                                className="w-full bg-black/60 border border-white/5 rounded-[2rem] p-6 md:p-10 h-40 md:h-56 focus:border-cyan-500/50 outline-none text-white font-mono text-xs md:text-lg resize-none shadow-inner leading-relaxed"
                                placeholder="Paste or type your 12 master shards..."
                                onChange={(e) => setMnemonicInput(e.target.value)}
                            />
                            <button onClick={handleVerifyMnemonic} className="w-full btn-launch py-6 md:py-8 text-xl font-black">Authorize Matrix</button>
                        </motion.div>
                    )}

                    {step === 'password' && (
                        <motion.div key="password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase font-heading text-white">Biometric <span className="text-gradient-kortana">Sync</span></h2>
                                <p className="text-gray-500 text-[10px] md:text-sm uppercase tracking-[0.4em] font-bold">Hardened Enclave Encryption</p>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="password"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white focus:border-cyan-500/50 outline-none text-lg md:text-2xl font-black tracking-widest"
                                    placeholder="Enter Secure Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white focus:border-cyan-500/50 outline-none text-lg md:text-2xl font-black tracking-widest"
                                    placeholder="Confirm Protocol Password"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button onClick={handleSetPassword} className="w-full btn-launch py-6 md:py-8 text-xl font-black">Establish Enclave</button>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 md:space-y-16 py-8">
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                className="w-24 h-24 md:w-40 md:h-40 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green mx-auto border border-neon-green/20 shadow-green relative"
                            >
                                <div className="absolute inset-0 bg-neon-green/20 blur-3xl rounded-full" />
                                <CheckCircle2 size={64} className="md:size-96 relative z-10" />
                            </motion.div>
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-white uppercase">Enclave <span className="text-neon-green">Ready</span></h2>
                                <p className="text-gray-500 font-bold text-xs md:text-lg tracking-[0.4em] uppercase">Matrix Identity Synchronized</p>
                            </div>
                            <button onClick={completeSetup} className="w-full btn-launch py-6 md:py-10 text-2xl font-black shadow-green-bold">
                                Enter Enclave Dashboard
                            </button>
                        </motion.div>
                    )}

                    {step === 'import' && (
                        <motion.div key="import" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading tracking-tighter">Identity Restoration</h2>
                                <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-[0.3em]">Syncing with Distributed Shards</p>
                            </div>
                            <textarea
                                className="w-full bg-black/60 border border-white/5 rounded-[2rem] p-6 md:p-10 h-40 md:h-56 text-white font-mono text-xs md:text-xl resize-none outline-none focus:border-cyan-500/50 leading-relaxed shadow-inner"
                                placeholder="Enter your 12 master shards..."
                                onChange={(e) => setMnemonicInput(e.target.value)}
                            />
                            <div className="space-y-4">
                                <button onClick={handleImportMnemonic} className="w-full btn-launch py-6 md:py-8 text-xl font-black">Restore Identity</button>
                                <button onClick={() => setStep('start')} className="w-full text-xs font-black uppercase text-gray-700 tracking-[0.4em] hover:text-white transition-colors">Abort Procedure</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div >
    );
};
