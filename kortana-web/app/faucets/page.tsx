'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from "@/components/PageHeader";
import { Droplets, CheckCircle, AlertCircle, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { isValidEVMAddress } from "@/lib/validation";
import { NETWORK } from "@/lib/rpc";

export default function FaucetsPage() {
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [network, setNetwork] = useState('testnet');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationError, setValidationError] = useState('');
    const [txHash, setTxHash] = useState<string | undefined>(undefined);

    const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Clear previous errors
        setErrorMessage('');
        setValidationError('');
        
        if (!address) {
            setValidationError('Wallet address is required');
            return;
        }

        // Client-side validation using isValidEVMAddress()
        if (!isValidEVMAddress(address)) {
            setValidationError('Invalid wallet address format. Must be 0x followed by 40 hexadecimal characters.');
            setStatus('error');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/faucet/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, network }),
            });
            const data = await res.json();
            
            if (data.success) {
                setStatus('success');
                setErrorMessage('');
                setTxHash(data.txHash);
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'An error occurred. Please try again.');
                setTxHash(undefined);
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Network error. Please check your connection and try again.');
            setTxHash(undefined);
        }
    };

    const resetForm = () => {
        setAddress('');
        setStatus('idle');
        setErrorMessage('');
        setValidationError('');
        setTxHash(undefined);
    };

    const handleNetworkChange = (newNetwork: string) => {
        setNetwork(newNetwork);
        // Reset status when network changes
        setStatus('idle');
        setErrorMessage('');
        setValidationError('');
        setTxHash(undefined);
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
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            network === 'testnet' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                            <Droplets className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Request Tokens</h3>
                            <p className="text-gray-400 text-sm">
                                Limit: 500 DNR / 24h • <span className={`font-medium ${
                                    network === 'testnet' ? 'text-cyan-400' : 'text-purple-400'
                                }`}>{network === 'testnet' ? 'Testnet' : 'Devnet'}</span>
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleRequest} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Select Network</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1 bg-black/20 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => handleNetworkChange('testnet')}
                                    className={`py-3 rounded-md font-medium text-sm transition-all relative ${
                                        network === 'testnet' 
                                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/50' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {network === 'testnet' && (
                                        <motion.div
                                            layoutId="network-indicator"
                                            className="absolute inset-0 bg-cyan-600 rounded-md"
                                            style={{ zIndex: -1 }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">Testnet (Chain ID: 72511)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleNetworkChange('devnet')}
                                    className={`py-3 rounded-md font-medium text-sm transition-all relative ${
                                        network === 'devnet' 
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {network === 'devnet' && (
                                        <motion.div
                                            layoutId="network-indicator"
                                            className="absolute inset-0 bg-purple-600 rounded-md"
                                            style={{ zIndex: -1 }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">Devnet Local</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value);
                                        setValidationError('');
                                    }}
                                    placeholder="0x..."
                                    className={`w-full bg-black/30 border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none transition-all font-mono ${
                                        validationError 
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                                            : 'border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50'
                                    }`}
                                />
                            </div>
                            {validationError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm flex items-center gap-1"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {validationError}
                                </motion.p>
                            )}
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
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-linear-to-r from-cyan-500 to-purple-600 hover:opacity-90'}
                    `}
                        >
                            {status === 'loading' && (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            )}
                            {status === 'success' && (
                                <>
                                    Sent Successfully <CheckCircle className="w-5 h-5" />
                                </>
                            )}
                            {status === 'error' && <>Failed - Try Again</>}
                            {status === 'idle' && (
                                <>
                                    Airdrop 500 DNR <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {status === 'error' && errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                        >
                            <p className="text-red-400 font-medium flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {errorMessage}
                            </p>
                            <p className="text-red-300/50 text-xs mt-2">
                                Network: {network === 'testnet' ? 'Testnet (Chain ID: 72511)' : 'Devnet Local'}
                            </p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 space-y-4"
                        >
                            <div className={`p-4 rounded-lg border text-center ${
                                network === 'testnet' 
                                    ? 'bg-green-500/10 border-green-500/20' 
                                    : 'bg-purple-500/10 border-purple-500/20'
                            }`}>
                                <p className={`font-medium mb-2 ${
                                    network === 'testnet' ? 'text-green-400' : 'text-purple-400'
                                }`}>
                                    Transaction Sent!
                                </p>
                                <p className={`text-sm mb-1 ${
                                    network === 'testnet' ? 'text-green-300/70' : 'text-purple-300/70'
                                }`}>
                                    500 DNR tokens have been sent to your wallet
                                </p>
                                <p className={`text-xs mb-3 font-medium ${
                                    network === 'testnet' ? 'text-green-300' : 'text-purple-300'
                                }`}>
                                    Network: {network === 'testnet' ? 'Testnet (Chain ID: 72511)' : 'Devnet Local'}
                                </p>
                                {txHash && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <p className={`text-xs mb-2 ${
                                            network === 'testnet' ? 'text-green-300/50' : 'text-purple-300/50'
                                        }`}>
                                            Transaction Hash:
                                        </p>
                                        <p className={`text-xs font-mono mb-2 break-all ${
                                            network === 'testnet' ? 'text-green-300' : 'text-purple-300'
                                        }`}>
                                            {txHash}
                                        </p>
                                        <a 
                                            href={`${NETWORK[network as keyof typeof NETWORK].explorerUrl}/tx/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center gap-1 text-xs hover:underline ${
                                                network === 'testnet' ? 'text-green-300/70 hover:text-green-300' : 'text-purple-300/70 hover:text-purple-300'
                                            }`}
                                        >
                                            View on Explorer <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                                {!txHash && (
                                    <a 
                                        href={`${NETWORK[network as keyof typeof NETWORK].explorerUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-xs hover:underline flex items-center justify-center gap-1 ${
                                            network === 'testnet' ? 'text-green-300/70 hover:text-green-300' : 'text-purple-300/70 hover:text-purple-300'
                                        }`}
                                    >
                                        View on Explorer <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <button
                                onClick={resetForm}
                                className="w-full py-3 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-gray-300"
                            >
                                Request More Tokens
                            </button>
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
