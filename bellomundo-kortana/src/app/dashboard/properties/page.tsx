"use client";

import { motion } from "framer-motion";
import PropertyCard from "@/components/Properties/PropertyCard";
import { Search, SlidersHorizontal, Map, Globe, Plus } from "lucide-react";

const properties = [
    { id: "1", title: "Aetheria Penthouse", type: "LUXURY PENTHOUSE", price: "2,400", location: "SKY DISTRICT, SECTOR 7", beds: 3, baths: 3.5, sqm: 240, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=100", isVerified: true },
    { id: "2", title: "Neo-Oasis Loft", type: "URBAN LOFT", price: "850", location: "COMMERCIAL CORE, SECTOR 2", beds: 1, baths: 1.5, sqm: 120, image: "https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?auto=format&fit=crop&w=2000&q=100", isVerified: true },
    { id: "3", title: "Biolume Villa", type: "STAKED VILLA", price: "1,800", location: "CRYSTAL GARDENS, SECTOR 4", beds: 4, baths: 4.5, sqm: 320, image: "https://images.unsplash.com/photo-1613490908571-9ce224eb1496?auto=format&fit=crop&w=2000&q=100", isVerified: true },
    { id: "4", title: "Lumina Apartment", type: "SMART UNIT", price: "850", location: "DOWNTOWN, SECTOR 5", beds: 2, baths: 2, sqm: 85, image: "https://images.unsplash.com/photo-1536376074432-8d63d592bfde?auto=format&fit=crop&w=800&q=80", isVerified: true },
    { id: "5", title: "Zen Garden Suites", type: "RESIDENTIAL NODE", price: "1,200", location: "ECHO PARK, SECTOR 2", beds: 2, baths: 2.5, sqm: 110, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", isVerified: true },
    { id: "6", title: "Solaris Tower Unit", type: "HIGH-RISE CORE", price: "3,500", location: "SKY DISTRICT, SECTOR 8", beds: 4, baths: 5, sqm: 450, image: "https://images.unsplash.com/photo-1493201481624-3c550549b84e?auto=format&fit=crop&w=800&q=80", isVerified: false },
];

export default function PropertiesPage() {
    return (
        <div className="flex flex-col gap-16">
            {/* Header & Advanced Search Overlay */}
            <div className="flex flex-col gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                            <Globe className="w-4 h-4" />
                            Global Architectural Ledger
                        </div>
                        <h1 className="text-7xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                            RESIDENTIAL <br />
                            <span className="sexy-gradient-text">INVENTORY.</span>
                        </h1>
                    </div>

                    <div className="flex gap-6">
                        <button className="btn-sexy min-w-[220px]">
                            <Map className="w-4 h-4" /> Spatial View
                        </button>
                        <button className="btn-sexy-gold min-w-[220px]">
                            <Plus className="w-4 h-4" /> List Asset
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="sexy-card flex flex-col md:flex-row items-center gap-8 !p-4 !bg-white/[0.02]"
                >
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="QUERY SYSTEM BY BUILDING, SECTOR, OR PROTOCOL..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-[11px] font-black tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-primary-bright/30 transition-all uppercase"
                        />
                    </div>

                    <div className="h-12 w-[1px] bg-white/5 hidden md:block" />

                    <div className="flex items-center gap-12 px-6">
                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black">Asset Topology</span>
                            <select className="bg-transparent text-white font-black text-xs uppercase tracking-widest focus:outline-none cursor-pointer">
                                <option className="bg-neutral-obsidian">All Classifications</option>
                                <option className="bg-neutral-obsidian">Penthouses</option>
                                <option className="bg-neutral-obsidian">Villas</option>
                                <option className="bg-neutral-obsidian">Smart Units</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black">Settlement Bracket</span>
                            <select className="bg-transparent text-white font-black text-xs uppercase tracking-widest focus:outline-none cursor-pointer">
                                <option className="bg-neutral-obsidian">Open DNR Range</option>
                                <option className="bg-neutral-obsidian">400 - 800 DNR</option>
                                <option className="bg-neutral-obsidian">800 - 1500 DNR</option>
                                <option className="bg-neutral-obsidian">1500+ DNR</option>
                            </select>
                        </div>

                        <button className="p-5 rounded-3xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 group">
                            <SlidersHorizontal className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Architectural Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-40">
                {properties.map((prop, idx) => (
                    <PropertyCard key={prop.id} property={prop} />
                ))}
            </div>
        </div>
    );
}
