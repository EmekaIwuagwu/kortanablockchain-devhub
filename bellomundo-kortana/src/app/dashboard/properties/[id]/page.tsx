"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ChevronLeft, MapPin, ShieldCheck, Heart,
    BedDouble, Bath, Square, ArrowRight,
    Zap, Wifi, Shield, Loader2, Globe, Cpu
} from "lucide-react";
import { useState } from "react";
import { executeSettlement } from "@/lib/walletProvider";


const properties = [
    { id: "1", title: "Aetheria Penthouse", type: "LUXURY PENTHOUSE", price: "2,400", location: "SKY DISTRICT, SECTOR 7", beds: 3, baths: 3.5, sqm: 240, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=100", isVerified: true, description: "Perched atop the legendary Zenith Spire, the Aetheria Penthouse offers a living experience beyond the clouds. Featuring zero-gravity meditation chambers and a 360-degree holographic view of Kortana City's skyline." },
    { id: "2", title: "Neo-Oasis Loft", type: "URBAN LOFT", price: "850", location: "COMMERCIAL CORE, SECTOR 2", beds: 1, baths: 1.5, sqm: 120, image: "https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?auto=format&fit=crop&w=2000&q=100", isVerified: true, description: "A minimalist's dream nestled securely in Sector 1's historic district. Rebuilt with self-healing concrete and integrated with localized micro-grids for infinite sustainability." },
    { id: "3", title: "Biolume Villa", type: "STAKED VILLA", price: "1,800", location: "CRYSTAL GARDENS, SECTOR 4", beds: 4, baths: 4.5, sqm: 320, image: "https://images.unsplash.com/photo-1613490908571-9ce224eb1496?auto=format&fit=crop&w=2000&q=100", isVerified: true, description: "The Biolume Villa is a masterpiece of organic architecture. Integrated with the city's mycelium energy network, the villa's exterior glows with bioluminescent flora that responds to the city's atmospheric pulse." },
    { id: "4", title: "Lumina Apartment", type: "SMART UNIT", price: "850", location: "DOWNTOWN, SECTOR 5", beds: 2, baths: 2, sqm: 85, image: "https://images.unsplash.com/photo-1536376074432-8d63d592bfde?auto=format&fit=crop&w=800&q=80", isVerified: true, description: "A high-efficiency residential unit designed for the active Kortana citizen. Full AI automation, adaptive furniture systems, and priority access to the Sector 5 kinetic walkways." },
    { id: "5", title: "Zen Garden Suites", type: "RESIDENTIAL NODE", price: "1,200", location: "ECHO PARK, SECTOR 2", beds: 2, baths: 2.5, sqm: 110, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", isVerified: true, description: "Tranquility in the heart of the Metropolis. These suites are surrounded by vertical forests and hydro-gardens, offering a sanctuary from the high-energy vibe of Kortana City." },
    { id: "6", title: "Solaris Tower Unit", type: "HIGH-RISE CORE", price: "3,500", location: "SKY DISTRICT, SECTOR 8", beds: 4, baths: 5, sqm: 450, image: "https://images.unsplash.com/photo-1493201481624-3c550549b84e?auto=format&fit=crop&w=800&q=80", isVerified: false, description: "The pinnacle of high-rise living in Sector 8. Large format floor plans with custom atmospheric controls and dedicated ultra-speed lift access." },
];

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [isBuying, setIsBuying] = useState(false);
    const [isOwned, setIsOwned] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const id = params.id as string;
    const property = properties.find(p => p.id === id);

    if (!property) return <div className="p-20 text-white">ASSET NOT FOUND IN KORTANA REGISTRY.</div>;

    const handleAcquire = async () => {
        console.log('[AUTHORIZE] Button clicked. wallet:', !!(window as any).ethereum, !!(window as any).kortana);
        setIsBuying(true);
        setTxError(null);
        setTxStatus('Connecting to wallet...');

        try {
            const priceEther = property.price.replace(/,/g, '');

            setTxStatus('Waiting for wallet approval...');
            const { txHash } = await executeSettlement({
                valueEther: priceEther,
                paymentType: 'housing',
                description: `Acquisition: ${property.title} in Kortana City`,
                serviceType: 'HOUSING',
                amount: property.price,
            });

            setTxStatus('Recording on ledger...');
            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    paymentType: 'housing',
                    recipient: 'TREASURY',
                    amount: priceEther,
                    amountDNR: parseFloat(priceEther),
                    description: `Acquisition: ${property.title} in Kortana City`,
                    serviceType: 'HOUSING',
                }),
            });

            router.push(`/dashboard/settlement/success?type=property&id=${id}&txHash=${txHash}`);

        } catch (e: any) {
            console.error('[Property TX] Failed:', e);
            const code = e?.code;
            const msg: string = e?.message || '';
            if (code === 4001 || msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
                setTxError('Transaction rejected. Please approve in your wallet.');
            } else {
                setTxError(msg || 'Settlement failed. Please try again.');
            }
        } finally {
            setIsBuying(false);
            setTxStatus(null);
        }
    };

    return (
        <div className="flex flex-col gap-12 pb-40">
            {/* Floating Status / Error Toast */}
            {(txError || txStatus) && (
                <div className={`fixed top-6 right-6 z-[500] max-w-sm p-6 rounded-3xl border text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-xl ${txError
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-primary-bright/20 border-primary-bright/40 text-primary-bright'
                    }`}>
                    {txError || txStatus}
                    {txError && <button onClick={() => setTxError(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>}
                </div>
            )}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all w-fit"
            >
                <ChevronLeft className="w-5 h-5" /> Back to Inventory
            </motion.button>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                {/* Left: Cinematic Image Gallery */}
                <div className="xl:col-span-7 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-[4rem] overflow-hidden aspect-video border border-white/10 group"
                    >
                        <img src={property.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian via-transparent to-transparent opacity-60" />

                        <div className="absolute bottom-10 left-10 flex gap-4">
                            <div className="px-6 py-2 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">Global Scan v.41</div>
                            {property.isVerified && <div className="px-6 py-2 rounded-2xl bg-primary-bright/20 backdrop-blur-3xl border border-primary-bright/20 text-[9px] font-black text-primary-bright uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> KORTANA VERIFIED</div>}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-white/5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                                <img src={property.image} className="w-full h-full object-cover grayscale" />
                            </div>
                        ))}
                    </div>

                    <div className="sexy-card !p-12 space-y-8 !bg-white/[0.01]">
                        <h2 className="text-[11px] text-white/20 font-black uppercase tracking-[0.6em]">Asset Narrative</h2>
                        <p className="text-xl text-neutral-dim font-medium leading-relaxed italic">
                            "{property.description}"
                        </p>
                    </div>
                </div>

                {/* Right: Technical Specs & Acquisition */}
                <div className="xl:col-span-5 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary-bright">
                            <Globe className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em]">Kortana City Real Estate</span>
                        </div>
                        <h1 className="text-7xl font-display font-black text-white leading-tight uppercase tracking-tight">{property.title}</h1>
                        <div className="flex items-center gap-4 text-white/30">
                            <MapPin className="w-5 h-5 text-secondary-warm" />
                            <span className="text-sm font-black uppercase tracking-widest">{property.location} <span className="text-white/10 mx-2">|</span> KORTANA CITY</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { icon: <BedDouble />, label: "SLEEP SYSTEMS", val: property.beds },
                            { icon: <Bath />, label: "HYGIENE NODES", val: property.baths },
                            { icon: <Square />, label: "SPATIAL VOLUME", val: `${property.sqm}m²` }
                        ].map((spec, i) => (
                            <div key={i} className="sexy-card !bg-white/5 !p-6 flex flex-col items-center gap-3 border-white/5">
                                <div className="text-primary-bright/40">{spec.icon}</div>
                                <div className="text-[10px] text-white font-black uppercase tracking-tighter">{spec.val}</div>
                                <div className="text-[7px] text-white/20 font-black uppercase tracking-widest leading-none text-center">{spec.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="sexy-card !bg-primary-bright/5 border-primary-bright/20 !p-12 space-y-8">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-[9px] text-primary-bright/60 font-black uppercase tracking-widest">Sovereign Settlement</span>
                                <div className="text-6xl text-white font-display font-black tracking-tighter">◈ {property.price}</div>
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block mt-2">DNR / MO</span>
                            </div>
                            <Heart className="w-8 h-8 text-white/10 hover:text-error transition-colors cursor-pointer mb-2" />
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleAcquire}
                                disabled={isBuying || isOwned}
                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'all' }}
                                className={`w-full py-8 rounded-3xl text-[11px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-6 transition-all shadow-2xl ${isOwned
                                    ? 'bg-success text-neutral-obsidian'
                                    : isBuying
                                        ? 'bg-primary-bright/60 text-neutral-obsidian cursor-wait'
                                        : 'bg-primary-bright text-neutral-obsidian hover:scale-[1.02] active:scale-95 shadow-primary-bright/30'
                                    }`}
                            >
                                {isBuying ? <Loader2 className="w-6 h-6 animate-spin" /> : isOwned ? <ShieldCheck className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                {isOwned ? "NODE SECURED" : isBuying ? txStatus || "TRANSMITTING..." : "AUTHORIZE SETTLEMENT"}
                            </button>
                            {txError && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest text-center">
                                    {txError}
                                </div>
                            )}
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] block text-center">Protocol V2.1 Encryption Active</span>
                        </div>
                    </div>

                    {/* Infrastructure Insights */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] text-white/20 font-black uppercase tracking-widest">Protocol Support</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: <Wifi />, label: "Giga-Mesh Fiber" },
                                { icon: <Shield />, label: "Security Node" },
                                { icon: <Cpu />, label: "AI Optimization" },
                                { icon: <ArrowRight />, label: "Transit Priority" }
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="p-2 bg-white/5 rounded-lg text-primary-bright/40">{p.icon}</div>
                                    <span className="text-[9px] text-white/60 font-black uppercase tracking-widest">{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
