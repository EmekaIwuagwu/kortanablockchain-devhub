'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

const Step = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
    <div className="flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#DC143C]/20 transition-all duration-300 group">
        <div className="w-20 h-20 bg-[#fef2f2] text-[#DC143C] font-extrabold text-3xl flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform">
            {num}
        </div>
        <h3 className="text-xl font-bold text-[#0A1929] mb-4 group-hover:text-[#DC143C] transition-colors">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default function GoldenVisa() {
    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <section className="pt-40 pb-24 relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#DC143C]/5 to-transparent pointer-events-none" />

                <div className="container mx-auto px-6 text-center z-10 relative">
                    <span className="inline-block px-4 py-1.5 text-[#DC143C] font-bold bg-[#DC143C]/10 rounded-full text-xs uppercase tracking-widest mb-8">
                        Global Citizenship Program
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0A1929] mb-8 leading-tight">
                        Secure Your Future with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#B22222]">Golden Visa Properties</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Invest in specifically curated properties eligible for residency by investment programs in Portugal, Greece, and Spain directly through the Kortana blockchain.
                    </p>
                    <Link href="/golden-visa/eligibility" className="inline-block bg-[#DC143C] text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-[#B22222] transition-all hover:-translate-y-1 shadow-xl shadow-[#DC143C]/30">
                        Check Your Eligibility
                    </Link>
                </div>
            </section>

            <section className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                        <div>
                            <h2 className="text-4xl font-extrabold text-[#0A1929] mb-4">Investment Process</h2>
                            <p className="text-gray-500 text-lg">Your simplified path to European residency.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <Step
                            num="01"
                            title="Select Eligible Asset"
                            desc="Choose from our curated marketplace of pre-approved Golden Visa eligible developments in target jurisdictions."
                        />
                        <Step
                            num="02"
                            title="Invest with DNR"
                            desc="Purchase property tokens equivalent to the minimum investment threshold (e.g., €500k) using Dinar."
                        />
                        <Step
                            num="03"
                            title="Legal Processing"
                            desc="Our partner legal firms automatically initiate your residency application once the investment is verified on-chain."
                        />
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#0A1929] text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">Why Choose AETHER <br /><span className="text-[#DC143C]">for Residency?</span></h2>
                        <ul className="space-y-8">
                            {[
                                { title: "Vetted & Compliant", desc: "All listings are vetted by top-tier law firms to ensure full program eligibility." },
                                { title: "Fractional Entry", desc: "Start building your qualifying portfolio over time before committing to the full application." },
                                { title: "On-Chain Tracking", desc: "Track your legal application status directly on the Kortana blockchain dashboard." },
                                { title: "Rental Income", desc: "Earn consistent rental yields in DNR while your residency application processes." }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start group">
                                    <div className="mt-1 mr-6 w-8 h-8 bg-[#DC143C] rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-[#DC143C]/20 group-hover:scale-110 transition-transform">✓</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 group-hover:text-[#DC143C] transition-colors">{item.title}</h4>
                                        <p className="text-gray-400 leading-relaxed text-lg">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-8 flex items-center">
                            <span className="w-2 h-8 bg-[#DC143C] rounded-full mr-4"></span>
                            Investment Calculator
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Target Country</label>
                                <div className="relative">
                                    <select className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white appearance-none hover:border-[#DC143C]/50 focus:border-[#DC143C] transition-colors">
                                        <option>Portugal (Min €500k)</option>
                                        <option>Greece (Min €250k)</option>
                                        <option>Spain (Min €500k)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Investment Amount (€)</label>
                                <input type="number" className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white font-mono" defaultValue="500000" />
                            </div>

                            <div className="pt-8 border-t border-white/10 mt-8 space-y-4">
                                <div className="flex justify-between text-gray-400">
                                    <span>Estimated Legal Fees</span>
                                    <span>€12,500</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xl font-bold">Total Requirements</span>
                                    <span className="text-3xl font-bold text-[#00E676] font-mono">€512,500</span>
                                </div>
                            </div>

                            <button className="w-full bg-white text-[#0A1929] font-bold py-4 rounded-xl mt-6 hover:bg-gray-100 hover:scale-[1.02] transition-all shadow-lg text-lg">
                                Calculate Details
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
