"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search } from 'lucide-react';

const faqs = [
    {
        q: "What is this presale?",
        a: "The Kortana presale is an exclusive event for early community members to secure DNR tokens at a significant discount before the public launch. The funds raised are used to accelerate the development of the mainnet, grants for developers, and liquidity provision."
    },
    {
        q: "How do I participate?",
        a: "Simply select your desired contribution tier, fill out the registration form with your valid ERC-20 wallet address and contact details. Once you register, you will receive an email with payment instructions and your unique referral link."
    },
    {
        q: "What are the tiers and benefits?",
        a: "There are three tiers: Starter ($100-$1,000), Professional ($1,001-$10,000), and Enterprise ($10,001+). Higher tiers offer deeper token discounts (up to 40% off), priority support, and exclusive access to governance advisory sessions."
    },
    {
        q: "When can I claim my tokens?",
        a: "Tokens will be distributed directly to your registered wallet address approximately 15 days after the presale phase closes. You do not need to manually claim them; our automated distribution engine handles the process."
    },
    {
        q: "How does the referral program work?",
        a: "When you register, you get a unique referral link. Share it with friends—if they register and participate, you earn a 10% bonus on their contribution amount in DNR tokens, and they get a 5% early bird bonus too."
    },
    {
        q: "Is my money safe?",
        a: "Security is our top priority. We have completed internal audits and have professional third-party audits (Trail of Bits and Certik) in progress or scheduled. All reports are published for transparency."
    },
    {
        q: "Can I use an exchange wallet address?",
        a: "No! Please use a self-custodial wallet like MetaMask, TrustWallet, or Ledger. We distribute tokens using smart contracts, and exchange addresses may not be compatible, leading to permanent loss of tokens."
    },
    {
        q: "Are there country restrictions?",
        a: "Yes, due to regulatory requirements, we cannot accept participants from sanctioned jurisdictions or the United States (unless accredited). Please check your local laws before registering."
    }
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFaqs = faqs.filter(faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h3 className="text-3xl font-black text-white font-space">Frequently Asked Questions</h3>
                <p className="text-gray-400 text-sm">Everything you need to know about the Kortana presale event.</p>

                <div className="relative max-w-md mx-auto mt-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 text-white transition text-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                    >
                        <button
                            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                            className="w-full p-6 text-left flex justify-between items-center group"
                        >
                            <span className="font-bold text-white group-hover:text-indigo-400 transition">{faq.q}</span>
                            <div className={`p-2 rounded-lg transition-all ${activeIndex === index ? 'bg-indigo-600' : 'bg-white/5'}`}>
                                {activeIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {activeIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {filteredFaqs.length === 0 && (
                    <p className="text-center text-gray-600 py-12 italic">No matching questions found.</p>
                )}
            </div>

            <div className="text-center bg-indigo-600/10 p-8 rounded-3xl border border-indigo-500/20">
                <p className="text-sm text-white font-bold mb-4">Still have questions?</p>
                <a
                    href="mailto:support@kortana.network"
                    className="inline-block px-8 py-3 bg-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
                >
                    Contact Support Team
                </a>
            </div>
        </div>
    );
}
