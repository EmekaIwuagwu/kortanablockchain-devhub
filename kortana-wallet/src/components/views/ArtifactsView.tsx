'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, Gem, Shield, Star, ExternalLink, Box, Grid } from 'lucide-react';
import { artifactService, Artifact } from '@/lib/ArtifactService';
import { useWalletStore } from '@/store/useWalletStore';
import { NETWORKS, NetworkType } from '@/lib/constants';

export const ArtifactsView = () => {
    const { address, network } = useWalletStore();
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (address) {
            artifactService.getAccountArtifacts(address, network).then(setArtifacts);
        }
    }, [address, network]);

    const selected = artifacts.find(a => a.id === selectedId);

    const rarityColors = {
        Legendary: 'text-amber-400 border-amber-400/50 bg-amber-400/10 shadow-amber-400/20',
        Epic: 'text-purple-400 border-purple-400/50 bg-purple-400/10 shadow-purple-400/20',
        Rare: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10 shadow-cyan-400/20',
        Common: 'text-gray-400 border-gray-400/50 bg-gray-400/10'
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-10">
            {/* Header */}
            <div className="flex items-center gap-7 mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/20 shrink-0 shadow-2xl">
                    <Gem className="size-12" />
                </div>
                <div>
                    <h2 className="text-6xl font-black text-white uppercase font-heading leading-none tracking-tighter">
                        Enclave <span className="text-gradient-kortana">Artifacts</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-base mt-2 opacity-60">Genesis Shard Collection Registry</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Gallery Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {artifacts.map((artifact) => (
                        <motion.div
                            key={artifact.id}
                            layoutId={artifact.id}
                            onClick={() => setSelectedId(artifact.id)}
                            className={`glass-panel cursor-pointer group overflow-hidden border-white/5 transition-all p-4 rounded-[2.5rem] relative ${selectedId === artifact.id ? 'bg-white/10 ring-2 ring-cyan-400/50' : 'hover:bg-white/[0.05]'}`}
                            whileHover={{ y: -10 }}
                        >
                            <div className="aspect-square relative rounded-3xl overflow-hidden bg-black/40 border border-white/10">
                                <img src={artifact.image} alt={artifact.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${rarityColors[artifact.rarity]}`}>
                                    {artifact.rarity}
                                </div>
                            </div>
                            <div className="mt-6 px-2 space-y-1">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{artifact.name}</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{artifact.collection}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Inspector Panel */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {selected ? (
                            <motion.div
                                key={selected.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel p-10 rounded-[3.5rem] bg-gradient-to-b from-white/[0.04] to-transparent sticky top-4 border-white/5 shadow-2xl"
                            >
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className={`w-fit px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-xl ${rarityColors[selected.rarity]}`}>
                                            {selected.rarity}
                                        </div>
                                        <h2 className="text-4xl font-black text-white uppercase leading-none tracking-tighter">{selected.name}</h2>
                                        <p className="text-gray-400 text-sm leading-relaxed font-medium">{selected.description}</p>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    <div className="space-y-5">
                                        <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Sub-Quantum Attributes</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {selected.attributes.map((attr, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{attr.trait}</span>
                                                    <span className="text-xs font-black text-cyan-400 uppercase tracking-tighter group-hover:text-white transition-colors">{attr.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button className="w-full btn-launch py-6 gap-3 group">
                                            <ExternalLink size={20} className="group-hover:rotate-12 transition-transform" />
                                            <span>View in Explorer</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-panel p-10 rounded-[3.5rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6 h-[500px] opacity-40">
                                <Box size={64} className="text-gray-700 animate-pulse" />
                                <p className="text-xs font-black text-gray-600 uppercase tracking-[0.3em]">Select an artifact for spectral holographic analysis</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
