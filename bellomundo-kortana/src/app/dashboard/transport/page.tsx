"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Car, Zap, Ship, QrCode, Navigation, History, ArrowRight,
    Activity, BatteryCharging, Shield, Loader2, X, Wallet,
    CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { executeSettlement } from "@/lib/walletProvider";

const evCatalog = [
    { id: "v1", make: "VOLT", model: "NEXUS PRIME", price: "28,500", range: "650 KM", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=2000&q=100", acceleration: "2.1s" },
    { id: "v2", make: "SOLARIS", model: "GT-X CORE", price: "42,000", range: "800 KM", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80", acceleration: "1.9s" },
    { id: "v3", make: "AETHER", model: "NIMBUS ALPHA", price: "19,800", range: "450 KM", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80", acceleration: "3.4s" },
];

export default function TransportPage() {
    const router = useRouter();

    // Micro-service states
    const [activeService, setActiveService] = useState<string | null>(null);
    const [serviceSyncing, setServiceSyncing] = useState(false);
    const [serviceSuccess, setServiceSuccess] = useState(false);
    const [serviceError, setServiceError] = useState<string | null>(null);
    const [serviceStatus, setServiceStatus] = useState<string | null>(null);

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState("EV Acquisition");

    const handleMicroService = async (amount: string, description: string) => {
        setServiceSyncing(true);
        setServiceError(null);
        setServiceStatus('Connecting to wallet...');
        try {
            setServiceStatus('Waiting for wallet approval...');
            const { txHash } = await executeSettlement({
                valueEther: amount,
                paymentType: 'transport',
                description: description,
                serviceType: 'TRANSPORT',
                amount: amount,
            });

            setServiceStatus('Recording on ledger...');
            setServiceSuccess(true);

            await fetch("/api/transactions", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    paymentType: "transport",
                    amountDNR: parseFloat(amount),
                    description: description,
                    serviceType: "TRANSPORT",
                }),
            });

            setTimeout(() => {
                setActiveService(null);
                setServiceSuccess(false);
                setServiceStatus(null);
            }, 3000);
        } catch (e: any) {
            console.error('[Transport Microservice] Failed:', e);
            const code = e?.code;
            const msg: string = e?.message || '';
            if (code === 4001 || msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
                setServiceError('Transaction rejected. Please approve in your wallet.');
            } else {
                setServiceError(msg || 'Service settlement failed.');
            }
        } finally {
            setServiceSyncing(false);
            setServiceStatus(null);
        }
    };

    return (
        <div className="flex flex-col gap-16 max-w-[1440px] mx-auto">
            {/* Service Modal */}
            <AnimatePresence>
                {activeService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !serviceSyncing && setActiveService(null)}
                            className="absolute inset-0 bg-neutral-obsidian/90 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl sexy-card p-12 overflow-hidden border-white/10"
                        >
                            <button onClick={() => setActiveService(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center gap-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-primary-bright/10 border border-primary-bright/20 flex items-center justify-center text-primary-bright">
                                    {activeService === 'CAB' ? <QrCode className="w-10 h-10" /> : <Zap className="w-10 h-10" />}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">
                                        {activeService === 'CAB' ? 'URBAN FARE SETTLEMENT' : 'GRID ENERGY AUTH'}
                                    </h2>
                                    <p className="text-neutral-dim text-sm font-medium tracking-wide">
                                        {activeService === 'CAB' ? 'Authorizing P2P transfer to autonomous vehicle BN-924' : 'Connecting to local high-speed energy buffer for sector charging'}
                                    </p>
                                </div>

                                {serviceSuccess ? (
                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4 py-8 text-success font-black uppercase tracking-[0.4em] text-xs">
                                        <CheckCircle2 className="w-16 h-16" />
                                        Protocol Successful
                                    </motion.div>
                                ) : (
                                    <div className="w-full space-y-6">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <Wallet className="w-6 h-6 text-white/20" />
                                                <div className="text-left">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Settlement Value</span>
                                                    <span className="text-2xl font-display font-black text-white">◈ {activeService === 'CAB' ? '5.40' : '15.00'} <span className="text-xs text-primary-bright/40 ml-1">DNR</span></span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleMicroService(activeService === 'CAB' ? '5.4' : '15', activeService === 'CAB' ? 'Cab Fare: BN-924' : 'Grid Charge: Sector 5')}
                                                disabled={serviceSyncing}
                                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'all' }}
                                                className="btn-sexy gap-4 !px-8"
                                            >
                                                {serviceSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                                {serviceSyncing ? 'SYNCING...' : 'AUTHORIZE'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {serviceStatus && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-primary-bright font-black uppercase tracking-widest">
                                                    {serviceStatus}
                                                </motion.div>
                                            )}
                                            {serviceError && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                                                    {serviceError}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <Navigation className="w-4 h-4" />
                        Autonomous Mobility Grid
                    </div>
                    <h1 className="text-7xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                        URBAN <br />
                        <span className="sexy-gradient-text">TRANSIT.</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-3 opacity-40">
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Fleet Status</span>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="text-xs font-mono text-white">4,821 ACTIVE VEHICLES</span>
                    </div>
                </div>
            </motion.div>

            {/* Service Selection - High-End Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { icon: <Car />, label: "EV Acquisition" },
                    { icon: <History />, label: "Lease Protocols" },
                    { icon: <BatteryCharging />, label: "Grid Charging" },
                    { icon: <Ship />, label: "Cab Settlement" }
                ].map((item, idx) => {
                    const isActive = selectedCategory === item.label;
                    return (
                        <motion.button
                            key={idx}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedCategory(item.label)}
                            className={`sexy-card flex flex-col items-center gap-6 p-10 group transition-all duration-500 ${isActive ? 'border-primary-bright/30 bg-white/[0.05]' : 'border-white/5'}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary-bright text-neutral-obsidian shadow-[0_0_20_rgba(56,189,248,0.5)]' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>{item.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Conditional Content based on selectedCategory */}
            <AnimatePresence mode="wait">
                {selectedCategory === "EV Acquisition" && (
                    <motion.section
                        key="ev-catalog"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="flex items-center justify-between mb-16 px-4">
                            <h2 className="text-[11px] text-white font-black uppercase tracking-[0.8em]">Available Fleet</h2>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">3 Models Found</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {evCatalog.map((ev, idx) => {
                                return (
                                    <motion.div
                                        key={ev.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => router.push(`/dashboard/transport/${ev.id}`)}
                                        className="sexy-card !p-0 overflow-hidden group border-white/5 hover:border-primary-bright/20 shadow-2xl cursor-pointer"
                                    >
                                        <div className="h-[350px] overflow-hidden relative">
                                            <img src={ev.image} alt={ev.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian via-neutral-obsidian/40 to-transparent" />

                                            <div className="absolute top-8 left-8">
                                                <div className="text-4xl text-white font-display font-black tracking-tighter uppercase whitespace-pre-line">
                                                    ◈ {ev.price} <br />
                                                    <span className="text-sm text-white/40 tracking-[0.2em]">DNR SETTLEMENT</span>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-8 left-8 flex gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Velocity</span>
                                                    <span className="text-xs font-mono text-white text-primary-bright font-black">{ev.acceleration}</span>
                                                </div>
                                                <div className="h-8 w-[1px] bg-white/10" />
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Radius</span>
                                                    <span className="text-xs font-mono text-white font-black">{ev.range}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-10 space-y-8">
                                            <div>
                                                <span className="text-[10px] text-primary-bright font-black tracking-[0.4em] uppercase mb-2 block">{ev.make} SERIES</span>
                                                <h3 className="text-4xl text-white font-display font-black tracking-tight group-hover:text-primary-bright transition-colors duration-500 uppercase">{ev.model}</h3>
                                            </div>
                                            <button
                                                className="btn-sexy w-full group"
                                            >
                                                Inspect Technical Spec
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.section>
                )}

                {(selectedCategory === "Cab Settlement" || selectedCategory === "Grid Charging" || selectedCategory === "Lease Protocols") && (
                    <motion.div
                        key="micro-services"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-40"
                    >
                        {/* Cab Service */}
                        {(selectedCategory === "Cab Settlement" || selectedCategory === "Lease Protocols") && (
                            <div onClick={() => setActiveService('CAB')} className="sexy-card flex flex-col md:flex-row items-center gap-12 !bg-white/[0.01] hover:!bg-white/[0.03] transition-all cursor-pointer group border-white/5">
                                <div className="w-40 h-40 bg-neutral-obsidian rounded-[2.5rem] flex items-center justify-center text-white border border-white/10 p-6">
                                    <QrCode className="w-full h-full text-primary-bright group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="flex-1 space-y-6 text-center md:text-left">
                                    <div className="space-y-4">
                                        <h3 className="text-4xl text-white font-display font-black tracking-tight uppercase">CAB SETTLEMENT</h3>
                                        <p className="text-neutral-dim leading-relaxed font-medium text-sm tracking-wide">Scan vehicle QR to authorize instant peer-to-peer DNR fare settlement.</p>
                                    </div>
                                    <button className="text-primary-bright font-black uppercase tracking-[0.6em] text-[10px] flex items-center justify-center md:justify-start gap-4 group-hover:gap-8 transition-all duration-700">
                                        INITIALIZE SCANNER <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Grid Service */}
                        {(selectedCategory === "Grid Charging" || selectedCategory === "Lease Protocols") && (
                            <div onClick={() => setActiveService('GRID')} className="sexy-card flex flex-col md:flex-row items-center gap-12 !bg-white/[0.01] hover:!bg-white/[0.03] transition-all cursor-pointer group border-white/5">
                                <div className="w-40 h-40 bg-neutral-obsidian rounded-[2.5rem] flex items-center justify-center text-secondary-warm border border-white/10 p-6">
                                    <Zap className="w-full h-full fill-current group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="flex-1 space-y-6 text-center md:text-left">
                                    <div className="space-y-4">
                                        <h3 className="text-4xl text-white font-display font-black tracking-tight uppercase">GRID CHARGING</h3>
                                        <p className="text-neutral-dim leading-relaxed font-medium text-sm tracking-wide">Locate autonomous high-speed energy buffers in your current sector.</p>
                                    </div>
                                    <button className="text-secondary-warm font-black uppercase tracking-[0.6em] text-[10px] flex items-center justify-center md:justify-start gap-4 group-hover:gap-8 transition-all duration-700">
                                        LOCATE TERMINAL <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
