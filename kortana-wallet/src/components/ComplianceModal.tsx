'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle2, X } from 'lucide-react';

interface ComplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');

    const startVerification = async () => {
        setStatus('verifying');
        // Simulate ZK-Proof generation and RPC call
        await new Promise(resolve => setTimeout(resolve, 3000));
        setStatus('success');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="max-w-md w-full glass-card p-8 space-y-6 relative"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                {status === 'verifying' ? <Loader2 className="animate-spin" size={32} /> : <ShieldCheck size={32} />}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold italic">ZK Compliance</h2>
                                <p className="text-white/60">
                                    {status === 'idle' && "Verify your identity using Zero-Knowledge proofs for regulated financial interactions."}
                                    {status === 'verifying' && "Generating ZK-Proof and verifying identity on-chain..."}
                                    {status === 'success' && "Identity verified successfully! You can now access regulated financial services."}
                                </p>
                            </div>

                            {status === 'idle' && (
                                <button
                                    onClick={startVerification}
                                    className="w-full btn-primary"
                                >
                                    Start Verification
                                </button>
                            )}

                            {status === 'success' && (
                                <button
                                    onClick={onClose}
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} className="text-green-400" /> Done
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
