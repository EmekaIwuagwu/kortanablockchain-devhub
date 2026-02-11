'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Download, ChevronRight, Shield, Sparkles,
    Lock, CheckCircle2, ArrowLeft, Key, Eye, EyeOff,
    LogIn, UserPlus, Copy
} from 'lucide-react';
import { generateMnemonic, createWalletFromMnemonic } from '@/lib/wallet';
import { useWalletStore } from '@/store/useWalletStore';

type Step = 'login' | 'register' | 'start' | 'generate' | 'verify' | 'password' | 'success' | 'import';

export const Onboarding: React.FC = () => {
    const { mnemonic: storedMnemonic, passwordHash, setMnemonic, setAddress, setLocked, setPasswordHash, reset } = useWalletStore();
    const [step, setStep] = useState<Step>('start');
    const [mnemonic, setNewMnemonic] = useState<string>('');
    const [mnemonicInput, setMnemonicInput] = useState<string>('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');

    useEffect(() => {
        if (storedMnemonic && passwordHash) {
            setStep('login');
        } else {
            setStep('start');
        }
    }, [storedMnemonic, passwordHash]);

    const handleCreateWallet = () => {
        const mn = generateMnemonic();
        setNewMnemonic(mn);
        setStep('generate');
    };

    const handleVerifyMnemonic = () => {
        if (mnemonicInput.trim() === mnemonic) {
            setStep('password');
        } else {
            alert('Invalid mnemonic phrase. Please check again.');
        }
    };

    const handleSetPassword = () => {
        if (password.length < 8) {
            alert('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        setPasswordHash(password); // Simplified hash for simulation
        setStep('success');
    };

    const handleLogin = () => {
        if (loginPassword === passwordHash) {
            setLocked(false);
        } else {
            alert('Incorrect password.');
        }
    };

    const completeSetup = () => {
        setMnemonic(mnemonic);
        const wallet = createWalletFromMnemonic(mnemonic);
        setAddress(wallet.address);
        setLocked(false);
    };

    const handleImportMnemonic = () => {
        if (!mnemonicInput.trim()) return;
        setNewMnemonic(mnemonicInput);
        setStep('password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative bg-deep-space overflow-hidden">
            <div className="grainy-overlay" />

            {/* Animated Nebulas */}
            <div className="nebula-purple absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30 select-none pointer-events-none" />
            <div className="nebula-cyan absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20 select-none pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-md w-full glass-panel p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] relative z-10"
            >
                <AnimatePresence mode="wait">
                    {step === 'login' && (
                        <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-10">
                            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                                <img src="/images/logo.png" alt="K" className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                                <div className="space-y-1 md:space-y-2">
                                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">Welcome Back</h1>
                                    <p className="text-gray-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">Poseidon Enclave Locked</p>
                                </div>
                            </div>
                            <div className="space-y-4 md:space-y-6">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 pr-12 md:pr-14 focus:border-cyan-500/50 outline-none transition-all text-white text-sm md:text-base"
                                        placeholder="Enter Password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    />
                                    <button className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} className="md:size-[18px]" /> : <Eye size={16} className="md:size-[18px]" />}
                                    </button>
                                </div>
                                <button onClick={handleLogin} className="w-full btn-launch">
                                    Unlock Wallet
                                </button>
                                <button onClick={reset} className="w-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-rose-500/40 hover:text-rose-500 transition-colors pt-1 md:pt-4">Reset Wallet</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'start' && (
                        <motion.div key="start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8 md:space-y-10">
                            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-20 h-20 md:w-28 md:h-28">
                                    <img src="/images/logo.png" alt="K" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]" />
                                </motion.div>
                                <div className="space-y-1 md:space-y-2">
                                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-white">
                                        KORTANA <span className="text-gradient-kortana">POSEIDON</span>
                                    </h1>
                                    <p className="text-gray-400 font-light text-sm md:text-lg tracking-wide uppercase">High-Frequency Wallet Enclave</p>
                                </div>
                            </div>
                            <div className="space-y-3 md:space-y-4 pt-4 md:pt-6">
                                <button onClick={() => setStep('register')} className="w-full btn-launch flex items-center justify-center gap-2 md:gap-3">
                                    <UserPlus size={18} className="md:size-[20px]" />
                                    <span>Register New Wallet</span>
                                    <ChevronRight size={16} className="ml-auto opacity-50 md:size-[18px]" />
                                </button>
                                <button onClick={() => setStep('import')} className="w-full btn-outline">
                                    <Download size={18} className="text-cyan-400 md:size-[20px]" />
                                    <span>Login with Seed Phrase</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'register' && (
                        <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-3 md:space-y-4 text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-cyan-400 mx-auto">
                                    <Shield size={24} className="md:size-[32px]" />
                                </div>
                                <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase font-heading text-white">Security Protocol</h1>
                                <p className="text-gray-500 text-xs md:text-sm">We're about to generate your unique 12-word recovery phrase. This is the ONLY way to recover your DNR assets.</p>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <button onClick={handleCreateWallet} className="w-full btn-launch flex items-center justify-center gap-2 md:gap-3">
                                    Generate Phrase <ChevronRight size={16} className="md:size-[18px]" />
                                </button>
                                <button onClick={() => setStep('start')} className="w-full text-[10px] md:text-xs font-black uppercase text-gray-700 tracking-[0.2em] hover:text-white transition-colors">Go Back</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'generate' && (
                        <motion.div key="generate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-neon-green/10 border border-neon-green/20 rounded-full w-fit">
                                    <Lock size={12} className="text-neon-green md:size-[14px]" />
                                    <span className="text-[9px] md:text-[10px] font-black text-neon-green uppercase tracking-widest">Secret Recovery Phrase</span>
                                </div>
                                <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white pt-1 md:pt-2 text-white">Write This Down</h2>
                                <p className="text-gray-400 text-[10px] md:text-sm leading-relaxed">Save these 12 words in a secure, offline location. Never share them.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                                {mnemonic.split(' ').map((word, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl text-center group hover:border-cyan-500/50 transition-colors">
                                        <span className="text-white/10 text-[8px] md:text-[10px] font-black block mb-0.5 md:mb-1 uppercase">{idx + 1}</span>
                                        <span className="font-mono text-[10px] md:text-sm font-bold text-white tracking-widest">{word}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 md:pt-4 flex flex-col gap-3 md:gap-4">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(mnemonic);
                                        const btn = document.getElementById('copy-btn');
                                        if (btn) {
                                            const originalText = btn.innerHTML;
                                            btn.innerHTML = '<span>Copied</span>';
                                            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                        }
                                    }}
                                    id="copy-btn"
                                    className="w-full btn-outline text-xs md:text-sm"
                                >
                                    <Copy size={14} className="md:size-[16px] mr-2" /> <span>Copy Phrase</span>
                                </button>
                                <button onClick={() => setStep('verify')} className="w-full btn-launch">
                                    <span>I Have Saved It</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ... other steps simplified for brevity but maintaining flow ... */}
                    {step === 'verify' && (
                        <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase font-heading text-white underline decoration-cyan-500/50 underline-offset-8">Verify Phrase</h2>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 h-32 md:h-40 outline-none text-white font-mono text-sm" placeholder="Paste or type phrase..." onChange={(e) => setMnemonicInput(e.target.value)} />
                            <button onClick={handleVerifyMnemonic} className="w-full btn-launch">Verify & Proceed</button>
                        </motion.div>
                    )}

                    {step === 'password' && (
                        <motion.div key="password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase font-heading text-white">Access Protocol</h2>
                                <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest font-bold">Set Enclave Password</p>
                            </div>
                            <div className="space-y-4 mt-4">
                                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none text-sm" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} />
                                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none text-sm" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <button onClick={handleSetPassword} className="w-full btn-launch">Finalize Setup</button>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 md:space-y-10">
                            <CheckCircle2 size={48} className="text-neon-green mx-auto md:size-[64px]" />
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">Registration Success</h2>
                                <p className="text-gray-400 font-bold text-[10px] md:text-xs tracking-widest uppercase">Your DNR Account is Ready</p>
                            </div>
                            <button onClick={completeSetup} className="w-full btn-launch">Open Dashboard</button>
                        </motion.div>
                    )}

                    {step === 'import' && (
                        <motion.div key="import" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                            <h2 className="text-xl md:text-3xl font-black text-white uppercase font-heading tracking-tighter">Login via Phrase</h2>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 h-32 md:h-40 text-white font-mono text-sm" placeholder="Enter recovery phrase" onChange={(e) => setMnemonicInput(e.target.value)} />
                            <button onClick={handleImportMnemonic} className="w-full btn-launch">Restore Access</button>
                            <button onClick={() => setStep('start')} className="w-full text-[10px] md:text-xs font-black uppercase text-gray-700 tracking-[0.2em] hover:text-white transition-colors">Exit</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
