"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, Navigation, BatteryCharging, Shield,
    ArrowRight, Zap, Loader2, Gauge, Cpu, Timer,
    CheckCircle2, Globe, Map
} from "lucide-react";
import { useState } from "react";
import { executeSettlement } from "@/lib/walletProvider";

const evCatalog = [
    {
        id: "v1",
        make: "VOLT",
        model: "NEXUS PRIME",
        price: "28,500",
        range: "650 KM",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=2000&q=100",
        acceleration: "2.1s",
        description: "The Nexus Prime is the benchmark of Kortana City mobility. Featuring a liquid-cooled solid-state battery and Level 5 autonomous capabilities, it is designed for the high-velocity citizen."
    },
    {
        id: "v2",
        make: "SOLARIS",
        model: "GT-X CORE",
        price: "42,000",
        range: "800 KM",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        acceleration: "1.9s",
        description: "Pure performance. The GT-X Core integrates direct solar-mesh charging with a high-torque dual motor system. It is the fastest legalized vehicle within Kortana City sectors."
    },
    {
        id: "v3",
        make: "AETHER",
        model: "NIMBUS ALPHA",
        price: "19,800",
        range: "450 KM",
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
        acceleration: "3.4s",
        description: "The Nimbus Alpha focuses on urban agility. With its compact adaptive chassis, it can navigate the dense historic sectors of Kortana City with unparalleled ease."
    },
];

export default function TransportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [isBuying, setIsBuying] = useState(false);
    const [isOwned, setIsOwned] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const id = params.id as string;
    const vehicle = evCatalog.find(v => v.id === id);

    // Load ownership from localStorage on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`transport_owned_${id}`);
            if (saved === 'true') {
                setIsOwned(true);
            }
        }
    });

    if (!vehicle) return <div className="p-20 text-white font-black">FLEET ID NOT FOUND IN KORTANA REGISTRY.</div>;

    const handleAcquire = async () => {
        setIsBuying(true);
        setTxError(null);
        setTxStatus('Connecting to wallet...');
        try {
            const priceEther = vehicle.price.replace(/,/g, '');
            setTxStatus('Waiting for wallet approval...');
            const { txHash, from } = await executeSettlement({
                valueEther: priceEther,
                paymentType: 'transport',
                description: `Fleet Acquisition: ${vehicle.make} ${vehicle.model} in Kortana City`,
                serviceType: 'TRANSPORT',
                amount: vehicle.price,
            });

            setTxStatus('Recording on ledger...');

            // Persist locally
            localStorage.setItem(`transport_owned_${id}`, 'true');
            setIsOwned(true);

            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    paymentType: 'transport',
                    recipient: 'TREASURY',
                    amount: priceEther,
                    amountDNR: parseFloat(priceEther),
                    description: `Fleet Acquisition: ${vehicle.make} ${vehicle.model} in Kortana City`,
                    serviceType: 'TRANSPORT',
                }),
            });

            setTxStatus('Protocol Successful.');
            setTimeout(() => {
                router.push(`/dashboard/settlement/success?type=transport&id=${id}&txHash=${txHash}`);
            }, 1500);
        } catch (e: any) {
            console.error('[Transport TX] Failed:', e);
            const code = e?.code;
            const msg: string = e?.message || '';
            if (code === 4001 || msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
                setTxError('Transaction rejected. Please approve in your wallet.');
            } else {
                setTxError(msg || 'Fleet acquisition failed. Please try again.');
            }
        } finally {
            setIsBuying(false);
            setTxStatus(null);
        }
    };

    return (
        <div className="flex flex-col gap-12 pb-40">
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all w-fit"
            >
                <ChevronLeft className="w-5 h-5" /> Back to Fleet Catalog
            </motion.button>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                <div className="xl:col-span-7 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-[4rem] overflow-hidden aspect-video border border-white/10 group bg-neutral-obsidian"
                    >
                        <img src={vehicle.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian via-transparent to-transparent opacity-60" />

                        <div className="absolute top-10 left-10 flex gap-4">
                            <span className="px-6 py-2 rounded-2xl bg-primary-bright/20 backdrop-blur-3xl border border-primary-bright/20 text-[9px] font-black text-primary-bright uppercase tracking-widest flex items-center gap-2">
                                <Navigation className="w-4 h-4" /> KORTANA FLEET AUTH
                            </span>
                        </div>
                    </motion.div>

                    <div className="sexy-card !p-12 space-y-8 !bg-white/[0.01]">
                        <h2 className="text-[11px] text-white/20 font-black uppercase tracking-[0.6em]">Engineering Narrative</h2>
                        <p className="text-xl text-neutral-dim font-medium leading-relaxed italic">
                            "{vehicle.description}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="sexy-card !bg-white/[0.01] !p-10 space-y-6">
                            <h4 className="text-[10px] text-white/40 font-black uppercase tracking-widest">Fleet Specifications</h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Powertrain", val: "Triple-Motor AWS" },
                                    { label: "Braking", val: "Kinetic-Regen V4" },
                                    { label: "Navigation", val: "Level 5 Autonomous" },
                                    { label: "Connectivity", val: "Quantum-Link" }
                                ].map((s, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">{s.label}</span>
                                        <span className="text-[10px] text-white font-black uppercase">{s.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sexy-card !bg-white/[0.01] !p-10 flex flex-col justify-center items-center gap-6">
                            <div className="w-20 h-20 rounded-full border border-primary-bright/20 flex items-center justify-center relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-t-2 border-primary-bright rounded-full"
                                />
                                <Timer className="w-8 h-8 text-primary-bright" />
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">Efficiency Rating</div>
                                <div className="text-2xl text-white font-display font-black tracking-tight uppercase">98.4% OPTIMAL</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-5 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary-bright">
                            <Map className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em]">Kortana City Mobility Grid</span>
                        </div>
                        <h1 className="text-7xl font-display font-black text-white leading-tight uppercase tracking-tight">{vehicle.make} <br /> <span className="sexy-gradient-text">{vehicle.model}</span></h1>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { icon: <Gauge />, label: "ACCELERATION", val: vehicle.acceleration },
                            { icon: <BatteryCharging />, label: "MAX RANGE", val: vehicle.range }
                        ].map((spec, i) => (
                            <div key={i} className="sexy-card !bg-white/5 !p-8 flex flex-col items-center gap-4">
                                <div className="text-primary-bright/60">{spec.icon}</div>
                                <div className="text-2xl text-white font-display font-black tracking-tight">{spec.val}</div>
                                <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">{spec.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="sexy-card !bg-primary-bright/5 border-primary-bright/20 !p-12 space-y-8">
                        <div>
                            <span className="text-[9px] text-primary-bright/60 font-black uppercase tracking-widest">Fleet Acquisition Settlement</span>
                            <div className="text-6xl text-white font-display font-black tracking-tighter">◈ {vehicle.price}</div>
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block mt-2">DNR ONE-TIME AUTHORIZATION</span>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleAcquire}
                                disabled={isBuying || isOwned}
                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'all' }}
                                className={`w-full py-8 rounded-3xl text-[11px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-6 transition-all shadow-2xl ${isOwned ? 'bg-success text-neutral-obsidian' : 'bg-primary-bright text-neutral-obsidian hover:scale-[1.02] active:scale-95 shadow-primary-bright/30'}`}
                            >
                                {isBuying ? <Loader2 className="w-6 h-6 animate-spin" /> : isOwned ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                {isOwned ? "VEHICLE SECURED" : isBuying ? "TRANSMITTING..." : "INITIALIZE ACQUISITION"}
                            </button>

                            <AnimatePresence>
                                {txStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-[10px] text-primary-bright font-black uppercase tracking-[0.2em] text-center"
                                    >
                                        {txStatus}
                                    </motion.div>
                                )}
                                {txError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest text-center"
                                    >
                                        {txError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] block text-center">Smart-Contract License Key Included</span>
                        </div>
                    </div>

                    <div className="sexy-card !bg-white/[0.01] border-white/5 !p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <Shield className="text-primary-bright w-6 h-6" />
                            <h4 className="text-white font-display font-black uppercase tracking-widest">Ownership Privileges</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Unlimited Grid Charging (All Sectors)",
                                "Priority Lane Access within Kortana Core",
                                "Autonomous Valet & Maintenance Sync",
                                "Secondary Marketplace Staking Support"
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-4 text-[10px] text-white/60 font-medium uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-bright" />
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
