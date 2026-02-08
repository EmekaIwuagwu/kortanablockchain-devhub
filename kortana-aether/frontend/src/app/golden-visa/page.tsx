'use client';

import React, { useState } from 'react';
import {
    ShieldCheck,
    Upload,
    FileCheck,
    Plane,
    Globe,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoldenVisa() {
    const [step, setStep] = useState(1);
    const [dragging, setDragging] = useState(false);

    const steps = [
        { id: 1, title: 'Eligibility Check', icon: ShieldCheck },
        { id: 2, title: 'Document Vault', icon: Upload },
        { id: 3, title: 'Legal Review', icon: FileCheck },
        { id: 4, title: 'Residency Grant', icon: Plane },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24">
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0A1929] rounded-xl flex items-center justify-center text-white font-black text-lg">A</div>
                        <span className="font-bold text-[#0A1929] text-xl tracking-tight">Aether Golden Visa <span className="text-[#DC143C]">Program</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                        <Lock size={14} />
                        <span>Bank-Grade Encryption</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Left Panel: Context */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center space-x-2 bg-[#DC143C]/10 text-[#DC143C] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <Globe size={14} />
                            <span>Global Mobility</span>
                        </motion.div>
                        <h1 className="text-5xl lg:text-6xl font-black text-[#0A1929] leading-tight mb-8">
                            Secure your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#0A1929]">European Residency</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12">
                            Leverage your real-estate portfolio on Aether to qualify for fast-track residency programs in Portugal, Greece, and Montenegro.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start space-x-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#0A1929]">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#0A1929] mb-1">Automatic Qualification</h3>
                                    <p className="text-gray-400 text-sm">Invest &gt;€500k in eligible assets to trigger the application.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#0A1929]">
                                    <FileCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#0A1929] mb-1">Legal Concierge</h3>
                                    <p className="text-gray-400 text-sm">Our partner law firms handle usage of digital deeds for immigration.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Application Status/Upload */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-12 relative overflow-hidden">

                        {/* Progress Stepper */}
                        <div className="flex justify-between relative mb-16">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10"></div>
                            {steps.map((s) => (
                                <div key={s.id} className="relative flex flex-col items-center group cursor-pointer" onClick={() => setStep(s.id)}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${step >= s.id
                                        ? 'bg-[#0A1929] border-[#0A1929] text-white shadow-lg'
                                        : 'bg-white border-gray-200 text-gray-300'
                                        }`}>
                                        <s.icon size={18} />
                                    </div>
                                    <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${step >= s.id ? 'text-[#0A1929]' : 'text-gray-300'
                                        }`}>{s.title}</span>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Zone */}
                        <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative"
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                        >
                            {dragging && (
                                <div className="absolute inset-0 bg-[#DC143C]/5 border-2 border-[#DC143C] rounded-3xl z-20 flex items-center justify-center">
                                    <p className="text-[#DC143C] font-bold">Drop files to upload</p>
                                </div>
                            )}

                            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                <Upload size={32} className="text-[#0A1929]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0A1929] mb-2">Upload Proof of Funds</h3>
                            <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">
                                Drag & drop your bank issuance letter or tax return here. PDF, JPG supported.
                            </p>
                            <button className="bg-[#0A1929] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-[#0A1929]/20 hover:scale-105 transition-transform">
                                Browse Files
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-400 font-medium">
                            <Lock size={12} />
                            <span>Documents are stored in an encrypted IPFS Vault</span>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
