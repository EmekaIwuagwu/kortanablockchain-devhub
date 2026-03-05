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

    const handleLogin = () => {
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
        <div className="h-screen flex items-center justify-center p-4 relative bg-deep-space overflow-hidden">
            <div className="grainy-overlay" />
            <div className="nebula-purple absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30 select-none pointer-events-none" />
            <div className="nebula-cyan absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 select-none pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isShaking ? {
                    x: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.4 }
                } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-sm sm:max-w-md glass-panel p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] relative z-10"
            >

                <AnimatePresence mode="wait">

                    {/* LOGIN */}
                    {step === 'login' && (
                        <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-8">
                            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                                <img src="/images/logo.png" alt="K" className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                                <div className="space-y-1">
                                    <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase">Welcome Back</h1>
                                    <p className="text-gray-500 font-bold text-[8px] md:text-[9px] uppercase tracking-widest">Poseidon Enclave Locked</p>
                                </div>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 pr-12 focus:border-cyan-500/50 outline-none transition-all text-white text-sm"
                                        placeholder="Enter Password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <button onClick={handleLogin} className="w-full btn-launch py-3">Unlock Wallet</button>
                                <button onClick={reset} className="w-full text-[8px] font-black uppercase tracking-[0.25em] text-rose-500/40 hover:text-rose-500 transition-colors pt-1">Reset Wallet</button>
                            </div>
                        </motion.div>
                    )}

                    {/* START */}
                    {step === 'start' && (
                        <motion.div key="start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-8">
                            <div className="flex flex-col items-center text-center space-y-3 md:space-y-5">
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="w-16 h-16 md:w-24 md:h-24">
                                    <img src="/images/logo.png" alt="K" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]" />
                                </motion.div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                                        KORTANA <span className="text-gradient-kortana">POSEIDON</span>
                                    </h1>
                                    <p className="text-gray-400 font-light text-sm md:text-base tracking-wide uppercase">High-Frequency Wallet Enclave</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <button onClick={() => setStep('register')} className="w-full btn-launch py-3 gap-2">
                                    <UserPlus size={16} />
                                    <span>Register New Wallet</span>
                                    <ChevronRight size={14} className="ml-auto opacity-50" />
                                </button>
                                <button onClick={() => setStep('import')} className="w-full btn-outline py-3 gap-2">
                                    <Download size={16} className="text-cyan-400" />
                                    <span>Login with Seed Phrase</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* REGISTER */}
                    {step === 'register' && (
                        <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5 md:space-y-6">
                            <div className="space-y-3 text-center">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto">
                                    <Shield size={22} />
                                </div>
                                <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase font-heading text-white">Security Protocol</h1>
                                <p className="text-gray-500 text-xs leading-relaxed">We're generating your 12-word recovery phrase. This is the ONLY way to recover your DNR assets.</p>
                            </div>
                            <div className="space-y-3">
                                <button onClick={handleCreateWallet} className="w-full btn-launch py-3 gap-2">
                                    Generate Phrase <ChevronRight size={14} />
                                </button>
                                <button onClick={() => setStep('start')} className="w-full text-[9px] font-black uppercase text-gray-700 tracking-[0.2em] hover:text-white transition-colors">Go Back</button>
                            </div>
                        </motion.div>
                    )}

                    {/* GENERATE */}
                    {step === 'generate' && (
                        <motion.div key="generate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5 md:space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/20 rounded-full w-fit">
                                    <Lock size={11} className="text-neon-green" />
                                    <span className="text-[8px] font-black text-neon-green uppercase tracking-widest">Secret Recovery Phrase</span>
                                </div>
                                <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white pt-1">Write This Down</h2>
                                <p className="text-gray-400 text-[9px] md:text-xs leading-relaxed">Save these 12 words in a secure, offline location. Never share them.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                                {mnemonic.split(' ').map((word, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-2 md:p-3 rounded-xl text-center hover:border-cyan-500/50 transition-colors">
                                        <span className="text-white/10 text-[7px] font-black block mb-0.5 uppercase">{idx + 1}</span>
                                        <span className="font-mono text-[9px] md:text-[10px] font-bold text-white tracking-widest">{word}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2 md:gap-3">
                                <button
                                    onClick={() => navigator.clipboard.writeText(mnemonic)}
                                    className="w-full btn-outline py-2.5 text-xs gap-2"
                                >
                                    <Copy size={13} /> <span>Copy Phrase</span>
                                </button>
                                <button onClick={() => setStep('verify')} className="w-full btn-launch py-2.5">
                                    I Have Saved It
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* VERIFY */}
                    {step === 'verify' && (
                        <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 md:space-y-6">
                            <h2 className="text-lg md:text-2xl font-black tracking-tighter uppercase font-heading text-white underline decoration-cyan-500/50 underline-offset-8">Verify Phrase</h2>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 h-28 md:h-36 outline-none text-white font-mono text-xs resize-none"
                                placeholder="Paste or type your 12-word phrase..."
                                onChange={(e) => setMnemonicInput(e.target.value)}
                            />
                            <button onClick={handleVerifyMnemonic} className="w-full btn-launch py-3">Verify & Proceed</button>
                        </motion.div>
                    )}

                    {/* PASSWORD */}
                    {step === 'password' && (
                        <motion.div key="password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-lg md:text-2xl font-black tracking-tighter uppercase font-heading text-white">Access Protocol</h2>
                                <p className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Set Enclave Password</p>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="New Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="Confirm Password"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button onClick={handleSetPassword} className="w-full btn-launch py-3">Finalize Setup</button>
                        </motion.div>
                    )}

                    {/* SUCCESS */}
                    {step === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 md:space-y-8">
                            <CheckCircle2 size={48} className="text-neon-green mx-auto" />
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase">Registration Success</h2>
                                <p className="text-gray-400 font-bold text-[8px] md:text-[9px] tracking-widest uppercase">Your DNR Account is Ready</p>
                            </div>
                            <button onClick={completeSetup} className="w-full btn-launch py-3">Open Dashboard</button>
                        </motion.div>
                    )}

                    {/* IMPORT */}
                    {step === 'import' && (
                        <motion.div key="import" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
                            <h2 className="text-lg md:text-2xl font-black text-white uppercase font-heading tracking-tighter">Login via Phrase</h2>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 h-28 md:h-36 text-white font-mono text-xs resize-none outline-none focus:border-cyan-500/50"
                                placeholder="Enter 12-word recovery phrase..."
                                onChange={(e) => setMnemonicInput(e.target.value)}
                            />
                            <button onClick={handleImportMnemonic} className="w-full btn-launch py-3">Restore Access</button>
                            <button onClick={() => setStep('start')} className="w-full text-[8px] font-black uppercase text-gray-700 tracking-[0.2em] hover:text-white transition-colors">Exit</button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
    );
};
