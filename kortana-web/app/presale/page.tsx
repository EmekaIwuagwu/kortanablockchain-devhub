"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/presale/HeroSection';
import CountdownTimer from '@/components/presale/CountdownTimer';
import TierCards from '@/components/presale/TierCards';
import RegistrationForm from '@/components/presale/RegistrationForm';
import StatsDashboard from '@/components/presale/StatsDashboard';
import AuditSection from '@/components/presale/AuditSection';
import ReferralProgram from '@/components/presale/ReferralProgram';
import FAQ from '@/components/presale/FAQ';
import NewsletterSignup from '@/components/presale/NewsletterSignup';

export default function PresalePage() {
    const [selectedTier, setSelectedTier] = useState('professional');
    const registrationRef = useRef<HTMLDivElement>(null);

    const scrollToRegistration = (tier: string) => {
        setSelectedTier(tier);
        registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="bg-deep-space min-h-screen text-white pb-24">
            <HeroSection />

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Decorative gradients */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />

                    <div className="relative z-10 space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black font-space">Time is Running Out</h2>
                            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
                                Phase 1 ends in less than 45 days. Secure your $DNR tokens at the lowest possible entry price before Phase 2 begins.
                            </p>
                        </div>

                        <CountdownTimer endDate={process.env.NEXT_PUBLIC_PRESALE_END_DATE || '2026-03-11T00:00:00Z'} />
                    </div>
                </div>
            </section>

            <section id="tiers" className="max-w-7xl mx-auto px-6 mb-32">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-black font-space">Contribution Tiers</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Choose the tier that fits your investment strategy. Each tier comes with unique bonuses and network benefits.</p>
                </div>
                <TierCards onSelectTier={scrollToRegistration} selectedTier={selectedTier} />
            </section>

            <section id="registration-section" ref={registrationRef} className="max-w-4xl mx-auto px-6 mb-32 pt-20">
                <RegistrationForm selectedTier={selectedTier} onSuccess={(data) => console.log('Success:', data)} />
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <ReferralProgram />
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-black font-space">Live Network Metrics</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Real-time participation transparency. Watch the community grow in real-time.</p>
                </div>
                <StatsDashboard />
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <NewsletterSignup />
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32 bg-white/5 py-24 rounded-[64px] border border-white/5">
                <AuditSection />
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <FAQ />
            </section>

            <section className="max-w-7xl mx-auto px-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <motion.div
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative z-10 space-y-8"
                    >
                        <h2 className="text-4xl md:text-6xl font-black font-space leading-tight">Ready to Shape the <br /> Future of Finance?</h2>
                        <p className="text-lg text-indigo-100/80 max-w-xl mx-auto">
                            Join 500+ investors already committed to the Kortana ecosystem. Whitelist spots are filling up fast.
                        </p>
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => registrationRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-12 py-5 bg-white text-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all"
                            >
                                Register For Presale Now
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
