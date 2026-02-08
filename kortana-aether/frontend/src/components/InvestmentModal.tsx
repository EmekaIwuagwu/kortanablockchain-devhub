'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import contracts from '@/config/contracts.json';
import abis from '@/config/abis.json';

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        id: string;
        title: string;
        tokenPrice: number; // in DNR
        yield: number;
    };
}

export const InvestmentModal = ({ isOpen, onClose, property }: InvestmentModalProps) => {
    const { isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState<number>(property.tokenPrice || 100);
    const [error, setError] = useState<string | null>(null);

    const {
        data: hash,
        writeContractAsync,
        isPending: isWritePending
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            setStep(3);
        }
    }, [isConfirmed]);

    if (!isOpen) return null;

    const handleInvest = async () => {
        if (!isConnected) {
            openConnectModal?.();
            return;
        }

        setError(null);

        try {
            // Find property contract address
            const propertyConfig = contracts.properties.find(p => p.id.toString() === property.id);
            if (!propertyConfig) throw new Error("Property contract not found: " + property.id);

            // Calculate amounts (Assuming 1 Token = X Dinar)
            // Here assuming 1:1 ratio for simplicity or calculate based on price
            // tokenAmount = investment / price_per_token
            // If tokenPrice is 500 DNR, and you invest 1000 DNR, you get 2 Tokens.
            const tokenAmount = amount / property.tokenPrice;

            // Convert to wei (18 decimals)
            const tokenAmountWei = parseEther(tokenAmount.toString());
            const dinarAmountWei = parseEther(amount.toString());

            const tx = await writeContractAsync({
                address: contracts.escrowManager as `0x${string}`,
                abi: abis.EscrowManager,
                functionName: 'initiateEscrow',
                args: [
                    contracts.platformAddress, // Seller (Platform)
                    propertyConfig.address,    // Property Token Address
                    tokenAmountWei,            // Amount of tokens to buy
                    dinarAmountWei             // Amount of Dinar to pay
                ],
                value: dinarAmountWei // Send Dinar (native coin)
            });

            // Transaction sent, wait for confirmation via hook
            setStep(2); // Mining step (optional, currently straight to success or loading)

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Transaction failed');
        }
    };

    const isLoading = isWritePending || isConfirming;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-8 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-[#0A1929]">{step === 3 ? 'Investment Successful' : 'Invest in Asset'}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {step < 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop)` }}></div>
                                        <div>
                                            <h4 className="font-bold text-[#0A1929]">{property.title}</h4>
                                            <p className="text-sm text-gray-500">{property.yield}% APY • Fixed Income</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Investment Amount (DNR)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="w-full text-4xl font-bold text-[#0A1929] bg-transparent border-b-2 border-gray-200 focus:border-[#DC143C] py-2 focus:outline-none transition-colors"
                                                min={property.tokenPrice}
                                            />
                                            <span className="absolute right-0 bottom-4 text-xl font-bold text-gray-400">DNR</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Min. Investment: {property.tokenPrice} DNR</p>
                                    </div>

                                    <div className="bg-[#DC143C]/5 p-6 rounded-xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Projected Monthly Income</span>
                                            <span className="font-bold text-[#00E676]">+{((amount * property.yield / 100) / 12).toFixed(2)} DNR</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Platform Fee (1%)</span>
                                            <span className="font-bold text-[#0A1929]">{(amount * 0.01).toFixed(2)} DNR</span>
                                        </div>
                                        <div className="border-t border-[#DC143C]/10 pt-3 flex justify-between font-bold text-lg text-[#0A1929]">
                                            <span>Total</span>
                                            <span>{(amount * 1.01).toFixed(2)} DNR</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-start text-sm">
                                            <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleInvest}
                                        disabled={isLoading}
                                        className="w-full bg-[#DC143C] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#B22222] transition-colors shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>{isWritePending ? 'Confirm in Wallet...' : 'Confirming on Blockchain...'}</span>
                                            </div>
                                        ) : (
                                            !isConnected ? 'Connect Wallet' : 'Confirm Investment'
                                        )}
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center py-6">
                                    <div className="w-20 h-20 bg-[#00E676] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#00E676]/30 animate-scale-up">
                                        <CheckCircle size={40} strokeWidth={3} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#0A1929] mb-2">Successfully Invested!</h2>
                                    <p className="text-gray-500 mb-8">You have successfully purchased {amount} DNR worth of ownership tokens.</p>

                                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-8 truncate font-mono">
                                        Tx Hash: {hash}
                                    </div>

                                    <button onClick={onClose} className="w-full bg-[#0A1929] text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors">
                                        View in Portfolio
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
