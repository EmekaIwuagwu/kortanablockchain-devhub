'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from "@/components/PageHeader";
import { Droplets, CheckCircle, AlertCircle, Copy, ArrowRight } from "lucide-react";

export default function FaucetsPage() {
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [network, setNetwork] = useState('testnet');

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;

        setStatus('loading');

        // Simulate API call
        setTimeout(() => {
            if (address.length < 10) {
                setStatus('error');
            } else {
                setStatus('success');
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-deep-space pb-20">
            <PageHeader
                title="Kortana Faucet"
                subtitle="Get free testnet tokens to build and experiment"
            />

            <div className="max-w-xl mx-auto px-4 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-900/10"
                >
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Request Tokens</h3>
                            <p className="text-gray-400 text-sm">Limit: 10 DNR / 24h</p>
                        </div>
                    </div>

                    <form onSubmit={handleRequest} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Select Network</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1 bg-black/20 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setNetwork('testnet')}
                                    className={`py-2 rounded-md font-medium text-sm transition-all ${network === 'testnet' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Testnet (Chain ID: 72511)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNetwork('devnet')}
                                    className={`py-2 rounded-md font-medium text-sm transition-all ${network === 'devnet' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Devnet Local
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-500/10 text-blue-200 text-sm mb-4">
                            <p className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Tokens are for testing only and have no real value.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                    ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90'}
                    `}
                        >
                            {status === 'loading' && <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>}
                            {status === 'success' && <>Sent Successfully <CheckCircle className="w-5 h-5" /></>}
                            {status === 'error' && <>Failed - Try Again</>}
                            {status === 'idle' && <>Airdrop 10 DNR <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
                        >
                            <p className="text-green-400 font-medium mb-2">Transaction Sent!</p>
                            <a href="#" className="text-xs text-green-300/70 hover:text-green-300 flex items-center justify-center gap-1">
                                View on Explorer <ArrowRight className="w-3 h-3" />
                            </a>
                        </motion.div>
                    )}
                </motion.div>

                <div className="mt-12 text-center">
                    <h4 className="text-gray-400 font-medium mb-4">Don't have a wallet?</h4>
                    <div className="flex justify-center gap-4">
                        <button className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-gray-300 text-sm font-medium">
                            Download MetaMask
                        </button>
                        <button className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-gray-300 text-sm font-medium">
                            Read Wallet Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
