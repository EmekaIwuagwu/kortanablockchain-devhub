'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, AlertTriangle, Copy } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { vaultService } from '@/lib/VaultService';

export const SettingsView: React.FC = () => {
    const { mnemonic, privateKey, network, setNetwork, setPasswordHash, reset, passwordHash, setEncryptedMnemonic } = useWalletStore();
    const [showKey, setShowKey] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const handlePasswordChange = () => {
        if (newPass.length < 8) return alert('Password too short');
        if (newPass !== confirmPass) return alert('Passwords do not match');
        const newHash = vaultService.hashPassword(newPass);
        setPasswordHash(newHash);
        if (mnemonic) {
            const newEncrypted = vaultService.encrypt(mnemonic, newPass);
            setEncryptedMnemonic(newEncrypted);
        }
        setNewPass('');
        setConfirmPass('');
        alert('Password updated successfully.');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto w-full space-y-4 md:space-y-8 pb-4">
            <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase font-heading text-white">
                Wallet <span className="text-gradient-kortana">Settings</span>
            </h2>

            <div className="space-y-4 md:space-y-6">

                {/* Network Switcher */}
                <section className="space-y-2">
                    <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Network Configuration</h3>
                    <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                            <p className="font-black text-white uppercase tracking-tight text-sm">Active Enclave</p>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {network === 'mainnet' ? 'Kortana Mainnet' : 'Kortana Testnet'}
                            </p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit shrink-0">
                            <button
                                onClick={() => setNetwork('mainnet')}
                                className={`px-3 md:px-5 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all
                                    ${network === 'mainnet' ? 'bg-cyan-500 text-deep-space shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
                            >Mainnet</button>
                            <button
                                onClick={() => setNetwork('testnet')}
                                className={`px-3 md:px-5 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all
                                    ${network === 'testnet' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'}`}
                            >Testnet</button>
                        </div>
                    </div>
                </section>

                {/* Private Key Export */}
                <section className="space-y-2 text-white">
                    <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Security & Export</h3>
                    <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl space-y-4 border-rose-500/10 hover:border-rose-500/30 transition-all">
                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                <Key className="size-4 md:size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-white uppercase text-sm">Export Private Key</h4>
                                <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-tight">EVM-compatible access credential</p>
                            </div>
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="w-full sm:w-auto btn-outline"
                            >{showKey ? 'Hide Key' : 'Reveal Key'}</button>
                        </div>

                        <AnimatePresence>
                            {showKey && privateKey && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-3 md:p-5 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 text-rose-500">
                                        <AlertTriangle className="size-3" />
                                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Never share your private key</span>
                                    </div>
                                    <div className="relative group">
                                        <p className="font-mono text-[8px] md:text-[10px] break-all text-white bg-black/40 p-3 rounded-lg border border-white/5 select-all">{privateKey}</p>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(privateKey)}
                                            className="absolute right-2 top-2 p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Copy className="size-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Change Password */}
                <section className="space-y-2 text-white">
                    <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Access Control</h3>
                    <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-0.5">New password</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-0.5">Confirm password</label>
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button onClick={handlePasswordChange} className="w-full btn-outline py-3">Update Access Password</button>
                    </div>
                </section>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-white/5">
                    <button
                        onClick={reset}
                        className="w-full p-3 md:p-5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all font-black uppercase tracking-widest text-[8px] md:text-[9px]"
                    >
                        Destroy Enclave & Clear All Data
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
