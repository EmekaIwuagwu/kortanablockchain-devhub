'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Share2, QrCode, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWalletStore } from '@/store/useWalletStore';

export const ReceiveView: React.FC = () => {
    const { address } = useWalletStore();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto w-full space-y-8 text-center pb-4"
        >
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-black tracking-tighter uppercase text-white font-heading leading-tight">
                    Receive <span className="text-gradient-kortana">Assets</span>
                </h2>
                <div className="flex items-center justify-center gap-2 opacity-50">
                    <ShieldCheck size={12} className="text-cyan-400" />
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[8px] md:text-xs">Safe-Sign Enclave Address</p>
                </div>
            </div>

            <div className="glass-panel p-6 md:p-12 rounded-2xl md:rounded-[4rem] flex flex-col items-center gap-8 md:gap-12 relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent border-white/5 shadow-2xl">
                <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-cyan-400/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-purple-500/5 rounded-full blur-[100px]" />

                {/* QR Code Container */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-[2s]" />
                    <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl relative z-10 transition-all duration-500 group-hover:rotate-1 group-hover:scale-[1.02]">
                        {address ? (
                            <QRCodeSVG
                                value={address}
                                size={180}
                                level="H"
                                includeMargin={false}
                                className="md:size-[220px]"
                            />
                        ) : (
                            <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] bg-gray-100 animate-pulse rounded-2xl" />
                        )}
                    </div>
                    <div className="absolute -bottom-4 -right-4 p-3 bg-deep-space rounded-xl border border-white/10 text-cyan-400 rotate-12 shadow-xl">
                        <QrCode size={20} />
                    </div>
                </div>

                <div className="w-full space-y-6 md:space-y-8 relative z-10">
                    <div className="space-y-3">
                        <p className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-[0.4em] text-center">Your Ledger Identity</p>
                        <div
                            onClick={handleCopy}
                            className="bg-black/40 border border-white/10 rounded-2xl md:rounded-[2rem] p-5 md:p-8 break-all font-mono text-[10px] md:text-base text-white select-all group relative text-center cursor-pointer hover:border-cyan-400/30 transition-all shadow-inner"
                        >
                            {address}
                            <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors pointer-events-none rounded-2xl" />
                        </div>
                    </div>

                    <div className="flex gap-3 md:gap-5">
                        <button
                            onClick={handleCopy}
                            className="flex-[2] btn-launch !rounded-2xl md:!rounded-[2.5rem] p-4 md:p-8 gap-3 text-lg md:text-xl font-black group shadow-kortana"
                        >
                            {copied ? <Check size={20} className="text-neon-green" /> : <Copy size={20} className="group-hover:scale-110 transition-transform" />}
                            <span>{copied ? 'Captured' : 'Copy Identity'}</span>
                        </button>
                        <button className="flex-1 p-4 md:p-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2.5rem] text-white hover:bg-white/10 transition-all flex items-center justify-center group">
                            <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-5 md:p-10 bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl md:rounded-[3rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/20" />
                <p className="text-[9px] md:text-[11px] font-black text-rose-400 uppercase tracking-widest leading-relaxed opacity-80">
                    Caution: Only broadcast DNR and compatible assets to this identity.
                    Mainnet shards are immutable and irreversible.
                </p>
            </div>
        </motion.div>
    );
};
