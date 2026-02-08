'use client';

import React from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Wallet, Search, TrendingUp, ShieldCheck, Banknote, Building2 } from 'lucide-react';

const Step = ({ icon, title, desc, stepNum }: { icon: React.ReactNode, title: string, desc: string, stepNum: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: stepNum * 0.2 }}
        className="relative flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 hover:border-[#DC143C]/30 transition-all duration-500 group"
    >
        <div className="absolute -top-6 w-12 h-12 bg-[#0A1929] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-[#0A1929]/20 z-10 group-hover:scale-110 transition-transform">
            {stepNum}
        </div>
        <div className="mt-6 mb-6 p-4 bg-gray-50 rounded-2xl text-[#DC143C] group-hover:bg-[#DC143C] group-hover:text-white transition-colors duration-300">
            {React.cloneElement(icon as React.ReactElement, { size: 40 })}
        </div>
        <h3 className="text-2xl font-bold text-[#0A1929] mb-4">{title}</h3>
        <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
    </motion.div>
);

export default function HowItWorks() {
    return (
        <main className="min-h-screen bg-[#FDFDFD]">
            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-20 bg-[#0A1929] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#DC143C]/20 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight"
                    >
                        Real Estate investing, <span className="text-[#DC143C]">Simplified.</span>
                    </motion.h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        From wallet connection to daily rental income, see how AETHER transforms property ownership on the Kortana blockchain.
                    </p>
                </div>
            </section>

            {/* Steps Grid */}
            <section className="py-24 container mx-auto px-6 relative">
                {/* Connecting Line (Desktop Only) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10 translate-y-12"></div>

                <div className="grid md:grid-cols-3 gap-12">
                    <Step
                        stepNum={1}
                        icon={<Wallet />}
                        title="Connect & Verify"
                        desc="Link your digital wallet. Complete a quick KYC process to unlock full access to global investment opportunities compliant with local regulations."
                    />
                    <Step
                        stepNum={2}
                        icon={<Building2 />}
                        title="Select & Invest"
                        desc="Browse vetted, high-yield properties. Purchase fractional tokens starting from just 100 DNR using secure smart contracts."
                    />
                    <Step
                        stepNum={3}
                        icon={<Banknote />}
                        title="Earn & Grow"
                        desc="Receive daily rental yields directly to your wallet in DNR. Track appreciation and sell your tokens instantly on our marketplace."
                    />
                </div>
            </section>

            {/* Detailed Breakdown */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-[#0A1929] text-center mb-16">The Technology Behind The Trust</h2>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm h-fit text-[#DC143C]">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#0A1929] mb-2">SPV Structure</h3>
                                    <p className="text-gray-600 leading-relaxed">Every property is held by a distinct Special Purpose Vehicle (LLC). Your tokens represent legal shares in this entity.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm h-fit text-[#DC143C]">
                                    <TrendingUp size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#0A1929] mb-2">Smart Contract Automation</h3>
                                    <p className="text-gray-600 leading-relaxed">Rental collection, fee deduction, and yield distribution are handled automatically by code. No middlemen delays.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm h-fit text-[#DC143C]">
                                    <Search size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#0A1929] mb-2">Transparent Ledger</h3>
                                    <p className="text-gray-600 leading-relaxed">All transaction history, ownership records, and payouts are immutable and publicly verifiable on the Kortana blockchain.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
                                alt="Blockchain Technology"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929] via-transparent to-transparent opacity-80"></div>
                            <div className="absolute bottom-12 left-12 right-12 text-white">
                                <div className="text-6xl font-bold mb-2">100%</div>
                                <div className="text-xl font-medium opacity-80">Transparent & On-Chain</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
