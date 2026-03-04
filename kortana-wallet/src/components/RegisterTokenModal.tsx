'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, PlusCircle, CheckCircle2 } from 'lucide-react';
import { tokenService } from '@/lib/TokenService';
import { useWalletStore } from '@/store/useWalletStore';

interface RegisterTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RegisterTokenModal: React.FC<RegisterTokenModalProps> = ({ isOpen, onClose }) => {
    const { address, network, tokens, setTokens } = useWalletStore();
    const [tokenAddress, setTokenAddress] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundToken, setFoundToken] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!address || !tokenAddress.startsWith('0x')) {
            setError('Invalid contract address');
            return;
        }

        setIsSearching(true);
        setError('');
        setFoundToken(null);

        try {
            const data = await tokenService.getTokenData(tokenAddress, address, network);
            if (data) {
                setFoundToken(data);
            } else {
                setError('Token not found. Verify address and network.');
            }
        } catch (err) {
            setError('Failed to fetch token data.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleRegister = () => {
        if (!foundToken) return;

        // Prevent duplicates
        if (tokens.some(t => t.address.toLowerCase() === foundToken.address.toLowerCase() && t.network === network)) {
            setError('This asset is already registered in your Enclave.');
            return;
        }

        setTokens([...tokens, foundToken]);
        onClose();
        setTokenAddress('');
        setFoundToken(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-deep-space/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg glass-panel p-8 md:p-12 overflow-hidden bg-deep-space/90 border-white/10"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-heading">Register <span className="text-cyan-400">Enclave Asset</span></h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Add custom protocol tokens to your dashboard</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Contract Address</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={tokenAddress}
                                            onChange={(e) => setTokenAddress(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm focus:border-cyan-400/50 outline-none"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                            className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-400 rounded-xl text-black font-black text-[10px] uppercase hover:bg-white transition-colors disabled:opacity-50"
                                        >
                                            {isSearching ? 'Scanning...' : 'Scan'}
                                        </button>
                                    </div>
                                    {error && <p className="text-rose-500 text-[10px] font-bold uppercase ml-1 animate-pulse">{error}</p>}
                                </div>

                                {foundToken && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-6 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center font-black text-black">
                                                {foundToken.symbol?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase">{foundToken.name}</h4>
                                                <p className="text-[10px] text-cyan-400 font-bold tracking-widest">{foundToken.symbol} • Decimals: {foundToken.decimals}</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="text-cyan-400" size={24} />
                                    </motion.div>
                                )}
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={!foundToken}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-[2rem] hover:bg-cyan-400 transition-all transform active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2 group"
                            >
                                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span>Authorize Asset Registration</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
