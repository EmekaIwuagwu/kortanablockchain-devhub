'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, ExternalLink, Wallet } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import contracts from '@/config/contracts.json';

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'FRACTIONAL' | 'RESIDENCY';
    initialAmount?: number;
    property: {
        id: string;
        title: string;
        tokenPrice: number; // in DNR
        yield: number;
        sellerAddress?: string;
    };
}

export const InvestmentModal = ({ isOpen, onClose, property, mode = 'FRACTIONAL', initialAmount }: InvestmentModalProps) => {
    const { isConnected, address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState<number>(initialAmount || (mode === 'RESIDENCY' ? 5000 : property.tokenPrice));
    const [error, setError] = useState<string | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState<string>('');
    const [appsLoading, setAppsLoading] = useState(false);

    useEffect(() => {
        if (initialAmount) setAmount(initialAmount);
        else setAmount(mode === 'RESIDENCY' ? 5000 : property.tokenPrice);

        if (isOpen && mode === 'RESIDENCY' && address) {
            fetchApps();
        }
    }, [isOpen, mode, initialAmount, address]);

    const fetchApps = async () => {
        setAppsLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/golden-visa/list/${address}`);
            const data = await res.json();
            const list = data.applications || [];
            setApplications(list);
            if (list.length > 0) {
                setSelectedRepoId(list[0].id.toString());
            } else {
                // If no apps, maybe create one?
                const newRes = await fetch('http://localhost:3001/api/golden-visa/new', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userAddress: address })
                });
                const newData = await newRes.json();
                if (newData.application) {
                    setApplications([newData.application]);
                    setSelectedRepoId(newData.application.id.toString());
                }
            }
        } catch (err) {
            console.error('Error fetching apps:', err);
        } finally {
            setAppsLoading(false);
        }
    };

    // FOCUS: Pure DNR Transfer (No smart contracts needed for simple testing)
    const {
        data: hash,
        sendTransactionAsync,
        isPending: isSendPending
    } = useSendTransaction();

    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed && receipt) {
            setStep(3);
        }
    }, [isConfirmed, receipt]);

    if (!isOpen) return null;

    const handleInvest = async () => {
        if (!isConnected) {
            openConnectModal?.();
            return;
        }

        setError(null);

        try {
            // Calculate total DNR to pay (Base + 1% Fee as shown in UI)
            const amountWei = parseEther((amount * 1.01).toFixed(18).toString());

            // Cleanup target address (fix too-long addresses if they exist in DB)
            let platformTarget = (property.sellerAddress || contracts.platformAddress || "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9");
            if (platformTarget.length > 42 && platformTarget.startsWith('0x')) {
                platformTarget = platformTarget.substring(0, 42);
            }

            // Direct DNR Transfer
            const txHash = await sendTransactionAsync({
                to: platformTarget as `0x${string}`,
                value: amountWei,
            });

            // Update local DB for tracking (non-blocking)
            if (mode === 'RESIDENCY') {
                try {
                    await fetch(`http://localhost:3001/api/golden-visa/deposit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userAddress: address?.toLowerCase(),
                            propertyId: property.id,
                            applicationId: selectedRepoId,
                            amount: amount,
                            txHash: txHash || 'pending'
                        })
                    });
                } catch (apiErr) {
                    console.error("Non-critical DB update error:", apiErr);
                }
            }
        } catch (err: any) {
            console.error("Transfer Error:", err);
            setError(err.message || 'Transaction failed. Ensure you have enough DNR.');
        }
    };

    const isLoading = isSendPending || isConfirming;

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
                        <div className="flex justify-between items-center p-8 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-[#0A1929]">
                                {step === 3 ? 'Transaction Successful' : 'Secure DNR Payment'}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8">
                            {step < 3 ? (
                                <div className="space-y-6">
                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-lg mr-4 flex items-center justify-center">
                                            <Wallet size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#0A1929]">{property.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                Net DNR Settlement Plan
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                                            {mode === 'RESIDENCY' ? 'Residency Deposit (DNR)' : 'Investment (DNR)'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="w-full text-4xl font-black text-[#0A1929] bg-transparent border-b-2 border-gray-200 focus:border-[#DC143C] py-2 focus:outline-none transition-colors"
                                            />
                                            <span className="absolute right-0 bottom-4 text-xl font-bold text-gray-400">DNR</span>
                                        </div>
                                    </div>

                                    {mode === 'RESIDENCY' && applications.length > 0 && (
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                                                Link to Application
                                            </label>
                                            <select
                                                value={selectedRepoId}
                                                onChange={(e) => setSelectedRepoId(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0A1929] focus:outline-none focus:border-[#DC143C]"
                                            >
                                                {applications.map(app => (
                                                    <option key={app.id} value={app.id}>
                                                        Application #{app.id} ({app.status})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="bg-[#DC143C]/5 p-6 rounded-2xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 font-medium">Network Fee (Included)</span>
                                            <span className="font-black text-[#0A1929]">{(amount * 0.01).toFixed(2)} DNR</span>
                                        </div>
                                        <div className="border-t border-[#DC143C]/10 pt-3 flex justify-between font-black text-lg text-[#0A1929]">
                                            <span>Total Payment</span>
                                            <span>{(amount * 1.01).toLocaleString()} DNR</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-4">
                                        <button
                                            onClick={handleInvest}
                                            disabled={isLoading}
                                            className="w-full bg-[#0A1929] text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-[#DC143C] transition-all shadow-xl disabled:opacity-70 flex justify-center items-center"
                                        >
                                            {isLoading ? 'Awaiting Network...' : 'Confirm DNR Payment'}
                                        </button>

                                        <button
                                            onClick={async () => {
                                                setError("Requesting DNR Faucet...");
                                                const res = await fetch('http://localhost:3001/api/users/faucet', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ walletAddress: address })
                                                });
                                                if (res.ok) {
                                                    setError("1,000 DNR added! Reloading...");
                                                    setTimeout(() => window.location.reload(), 2000);
                                                } else {
                                                    setError("Faucet failed.");
                                                }
                                            }}
                                            className="text-[10px] font-black uppercase text-[#DC143C] text-center"
                                        >
                                            Get Test DNR (Faucet)
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm flex items-center">
                                            <AlertTriangle size={16} className="mr-2" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#0A1929] mb-2">Payment Confirmed!</h2>
                                    <p className="text-gray-500 mb-8 font-medium">
                                        Your {amount.toLocaleString()} DNR has been sent to the settlement address.
                                    </p>

                                    <div className="bg-gray-50 p-4 rounded-xl text-[10px] text-gray-400 mb-8 truncate font-mono">
                                        Tx: {hash}
                                    </div>

                                    <div className="space-y-4">
                                        <a
                                            href={`https://explorer-testnet.kortana.worchsester.xyz/tx/${hash}`}
                                            target="_blank"
                                            className="w-full bg-[#00E676] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <ExternalLink size={14} />
                                            <span>Blockchain Receipt</span>
                                        </a>
                                        <button onClick={onClose} className="w-full bg-[#0A1929] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest">
                                            Return to Portal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
