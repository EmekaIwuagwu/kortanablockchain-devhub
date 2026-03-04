'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Share2 } from 'lucide-react';
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto w-full space-y-4 md:space-y-8 text-center pb-4"
        >
            <div className="space-y-1 md:space-y-2">
                <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase text-white font-heading">
                    Receive <span className="text-gradient-kortana">Assets</span>
                </h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Scan or copy address to deposit funds</p>
            </div>

            <div className="glass-panel p-5 md:p-10 rounded-2xl md:rounded-[3rem] flex flex-col items-center gap-5 md:gap-8 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-28 h-28 bg-cyan-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-28 h-28 bg-purple-500/10 rounded-full blur-3xl" />

                {/* QR Code */}
                <div className="p-3 md:p-5 bg-white rounded-2xl md:rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500">
                    {address ? (
                        <QRCodeSVG
                            value={address}
                            size={150}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/images/logo.png",
                                x: undefined,
                                y: undefined,
                                height: 32,
                                width: 32,
                                excavate: true,
                            }}
                        />
                    ) : (
                        <div className="w-[150px] h-[150px] bg-gray-100 animate-pulse rounded-xl" />
                    )}
                </div>

                <div className="w-full space-y-3 md:space-y-4 relative z-10">
                    <div className="space-y-1.5">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">Kortana Net Address</p>
                        <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 break-all font-mono text-[9px] md:text-xs text-white select-all group relative text-left">
                            {address}
                            <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors pointer-events-none rounded-xl" />
                        </div>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                        <button
                            onClick={handleCopy}
                            className="flex-1 btn-launch !rounded-xl md:!rounded-2xl gap-2"
                        >
                            {copied ? <Check size={15} /> : <Copy size={15} />}
                            <span className="text-[8px] md:text-[10px]">{copied ? 'Copied!' : 'Copy Address'}</span>
                        </button>
                        <button className="p-2.5 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white hover:bg-white/10 transition-colors">
                            <Share2 size={15} />
                        </button>
                        <button className="p-2.5 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white hover:bg-white/10 transition-colors">
                            <Download size={15} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl md:rounded-2xl text-center">
                <p className="text-[8px] md:text-[9px] font-bold text-rose-400 uppercase tracking-[0.15em] leading-relaxed">
                    Only send DNR and EVM-compatible assets to this address on the Kortana network.
                    Sending other assets may result in permanent loss.
                </p>
            </div>
        </motion.div>
    );
};
