'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, AlertTriangle, Copy, Globe, Shield,
    Lock, Trash2, ChevronRight, Activity, Cpu,
    Fingerprint, Eye, EyeOff, Database
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { vaultService } from '@/lib/VaultService';

export const SettingsView: React.FC = () => {
    const {
        mnemonic, privateKey, network, setNetwork,
        setPasswordHash, reset, showNotification,
        setEncryptedMnemonic
    } = useWalletStore();

    const [showKey, setShowKey] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordChange = () => {
        if (newPass.length < 8) return showNotification('Password too short', 'error');
        if (newPass !== confirmPass) return showNotification('Passwords do not match', 'error');
        const newHash = vaultService.hashPassword(newPass);
        setPasswordHash(newHash);
        if (mnemonic) {
            const newEncrypted = vaultService.encrypt(mnemonic, newPass);
            setEncryptedMnemonic(newEncrypted);
        }
        setNewPass('');
        setConfirmPass('');
        showNotification('Enclave password established', 'success');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto w-full space-y-8 md:space-y-12 pb-10 px-1"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 shadow-inner">
                            <Cpu size={24} />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-heading text-white">
                            Control <span className="text-gradient-kortana">Center</span>
                        </h2>
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-[0.4em] opacity-60">Hardened Enclave Configurations</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 shrink-0">
                    <button
                        onClick={() => setNetwork('mainnet')}
                        className={`px-6 md:px-8 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all
                            ${network === 'mainnet' ? 'bg-cyan-500 text-deep-space shadow-kortana active:scale-95' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >Mainnet</button>
                    <button
                        onClick={() => setNetwork('testnet')}
                        className={`px-6 md:px-8 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all
                            ${network === 'testnet' ? 'bg-purple-500 text-white shadow-purple active:scale-95' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >Testnet</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

                {/* Security Section */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Shield size={14} className="text-cyan-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Security Protocols</h3>
                        </div>

                        <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-rose-500/10 hover:border-rose-500/30 transition-all space-y-6 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shrink-0">
                                    <Key size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-white uppercase text-lg md:text-xl tracking-tighter leading-none">Export Private Key</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-1 opacity-70">Master authentication credential</p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                {showKey && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="space-y-4 pt-2 overflow-hidden"
                                    >
                                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-2 text-rose-500">
                                                <AlertTriangle size={14} className="animate-pulse" />
                                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Permanent Asset Risk If Shared</span>
                                            </div>
                                            <div className="relative">
                                                <p className="font-mono text-[9px] md:text-xs break-all text-white bg-black/60 p-4 rounded-xl border border-white/5 select-all leading-relaxed shadow-inner">{privateKey}</p>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(privateKey!);
                                                        showNotification('Key Copied', 'success');
                                                    }}
                                                    className="absolute right-3 top-3 p-2 bg-white/5 rounded-xl hover:bg-rose-500 transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="w-full btn-outline py-4 md:py-6 text-[10px] md:text-sm font-black uppercase tracking-widest gap-2"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    <span>{showKey ? 'Hide Credentials' : 'Reveal Identity Shard'}</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Activity size={14} className="text-cyan-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Network State</h3>
                        </div>
                        <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.01] flex items-center justify-between">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest opacity-60">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neon-green shadow-green animate-ping" />
                                    <span className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter">Synchronized</span>
                                </div>
                            </div>
                            <Globe size={32} className="text-white/10" />
                        </div>
                    </section>
                </div>

                {/* Access Section */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Lock size={14} className="text-cyan-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Identity Protection</h3>
                        </div>
                        <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 space-y-6 shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                                    <Fingerprint size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-lg tracking-tighter">Password Reset</h4>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">Update Enclave entry code</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Establish New Protocol</label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white focus:border-cyan-500/50 outline-none text-base md:text-xl font-black tracking-widest transition-all placeholder:text-gray-800"
                                            placeholder="••••••••"
                                        />
                                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Confirm Shard Matrix</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white focus:border-cyan-500/50 outline-none text-base md:text-xl font-black tracking-widest transition-all placeholder:text-gray-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    onClick={handlePasswordChange}
                                    className="w-full btn-launch py-5 md:py-6 text-sm font-black uppercase tracking-[0.2em] shadow-kortana active:scale-95"
                                >
                                    Update Security Key
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Trash2 size={14} className="text-rose-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60">Destruction Protocol</h3>
                        </div>
                        <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-rose-500/10 bg-rose-500/[0.02] hover:bg-rose-500/[0.05] transition-all group cursor-pointer" onClick={reset}>
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                                    <Trash2 size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-rose-500 uppercase text-lg tracking-tighter group-hover:text-rose-400">Emergency Purge</h4>
                                    <p className="text-[8px] md:text-[9px] text-rose-500/40 font-black uppercase tracking-widest leading-none mt-1 group-hover:text-rose-500/60">Wipe all identity shards and encrypted data</p>
                                </div>
                                <ChevronRight className="text-rose-500/20 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="flex justify-center pt-10">
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] flex items-center gap-3">
                    <Database size={12} /> Kortana Wallet Enclave v1.2.4 Final
                </p>
            </div>
        </motion.div>
    );
};
