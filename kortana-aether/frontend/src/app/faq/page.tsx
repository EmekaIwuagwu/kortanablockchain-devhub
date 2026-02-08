'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#DC143C]/20 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
            >
                <span className="font-bold text-lg text-[#0A1929]">{question}</span>
                <ChevronDown className={`transform transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <Header />

            <section className="pt-40 pb-20 container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-[#DC143C] font-bold tracking-widest uppercase text-sm mb-2 block">Help Center</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1929] mb-6">Frequently Asked Questions</h1>
                    <p className="text-gray-500 text-lg">Everything you need to know about investing in fractional real estate and the Golden Visa program with AETHER.</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    <FAQItem
                        question="How does fractional real estate investment work?"
                        answer="AETHER tokenizes high-value real estate assets into smaller, affordable digital tokens. When you buy tokens, you legally own a share of the property and are entitled to your portion of rental income and capital appreciation, secured by the Kortana blockchain."
                    />
                    <FAQItem
                        question="Is the Golden Visa program guaranteed?"
                        answer="While investment in our approved properties meets the necessary criteria for Golden Visa programs in Portugal, Greece, and Spain, the final approval is subject to government processing. We partner with top-tier legal firms to handle your application and maximize your success rate."
                    />
                    <FAQItem
                        question="What is the minimum investment?"
                        answer="For general fractional investment, you can start with as little as 50 DNR. For Golden Visa eligibility, you must meet the respective government's minimum threshold (e.g., €250,000 for Greece, €500,000 for Portugal) in total token value."
                    />
                    <FAQItem
                        question="How often are rental yields paid?"
                        answer="Rental income is distributed monthly directly to your wallet in DNR. You can track your upcoming payouts in the Portfolio dashboard."
                    />
                    <FAQItem
                        question="Can I sell my tokens?"
                        answer="Yes! AETHER features a secondary marketplace where you can list your property tokens for sale at any time. This provides liquidity typically not available in traditional real estate investing."
                    />
                    <FAQItem
                        question="What fees does AETHER charge?"
                        answer="We charge a transparent 1% transaction fee on initial purchases and secondary market trades. An annual property management fee (approx. 0.5-1%) is deducted from gross rental income before distribution."
                    />
                </div>
            </section>

            <Footer />
        </main>
    );
}
