'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Disc as Discord, Activity } from 'lucide-react';
import { getBlockHeight } from '@/lib/rpc';

export default function Footer() {
    const [blockHeight, setBlockHeight] = useState("...");

    useEffect(() => {
        const fetchHeight = async () => {
            const height = await getBlockHeight();
            if (height !== "N/A") setBlockHeight(height);
        };
        fetchHeight();
        const interval = setInterval(fetchHeight, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="bg-[#05071a] border-t border-white/5 relative z-10 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 text-center md:text-left">

                    {/* Brand Column */}
                    <div className="space-y-8 flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-9 h-9 opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110">
                                <Image src="/logo.png" alt="Kortana" fill className="object-contain" />
                            </div>
                            <span className="font-black text-xl tracking-widest text-white font-sans uppercase">
                                KORTANA
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium">
                            Industrial-scale Layer 1 blockchain built for global credit markets.
                            High-fidelity execution. Sovereign security.
                        </p>
                        <div className="flex space-x-3">
                            <SocialLink href="#" icon={<Twitter size={18} />} />
                            <SocialLink href="#" icon={<Github size={18} />} />
                            <SocialLink href="#" icon={<Discord size={18} />} />
                        </div>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Technical Resources</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/docs">Docs Hub</FooterLink>
                            <FooterLink href="/technology">Core Tech</FooterLink>
                            <FooterLink href="/tokenomics">Economics</FooterLink>
                            <FooterLink href="/whitepaper">Whitepaper</FooterLink>
                        </ul>
                    </div>

                    {/* Ecosystem Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Network Ecosystem</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/developers">Dev Portal</FooterLink>
                            <FooterLink href="https://explorer.mainnet.kortana.xyz" target="_blank">Mainnet Explorer</FooterLink>
                            <FooterLink href="https://explorer.kortana.worchsester.xyz" target="_blank">Testnet Explorer</FooterLink>
                            <FooterLink href="/faucets">Testnet Faucet</FooterLink>
                            <FooterLink href="/community">Join Community</FooterLink>
                        </ul>
                    </div>

                    {/* Network Status Widget */}
                    <div className="glass-panel p-8 rounded-3xl border-white/5 bg-white/2] backdrop-blur-xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Activity size={40} />
                        </div>
                        <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                            <div className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Network</h3>
                        </div>

                        <div className="space-y-5">
                            <StatusItem label="Block Height" value={blockHeight} />
                            <StatusItem label="Block Time" value="2.0s" color="cyan" />
                            <StatusItem label="Chain ID" value="9002" color="green" />
                            <StatusItem label="Total Supply" value="500B DNR" />
                            <StatusItem label="Symbol" value="DNR" color="cyan" />
                            <StatusItem label="Finality" value="< 2s BFT" color="green" />
                        </div>
                        <button
                            onClick={async () => {
                                const { addKortanaNetwork } = await import('@/lib/wallet');
                                await addKortanaNetwork();
                            }}
                            className="mt-6 w-full text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                        >
                            + Add to MetaMask
                        </button>
                    </div>
                </div>

                <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
                        © {new Date().getFullYear()} KORTANA FOUNDATION • INDUSTRIAL BLOCKCHAIN
                    </p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function StatusItem({ label, value, color }: { label: string, value: string, color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-bold font-mono ${color === 'cyan' ? 'text-cyan-400' : color === 'green' ? 'text-neon-green' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}

function FooterLink({ href, children, target }: { href: string; children: React.ReactNode, target?: string }) {
    return (
        <li>
            <Link href={href} target={target} className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2 group justify-center md:justify-start">
                <span className="w-1 h-1 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a href={href} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all border border-transparent hover:border-white/10">
            {icon}
        </a>
    );
}

