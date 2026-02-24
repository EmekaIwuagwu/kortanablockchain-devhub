"use client";

import { motion } from 'framer-motion';
import { Star, Rocket, Crown, Check, ArrowRight } from 'lucide-react';

interface Tier {
    id: string;
    name: string;
    min: string;
    max: string;
    price: string;
    bonus: string;
    benefits: string[];
    icon: any;
    highlighted?: boolean;
}

const tiers: Tier[] = [
    {
        id: 'starter',
        name: 'STARTER',
        min: '$100',
        max: '$1,000',
        price: '$0.05',
        bonus: '10% Referral',
        benefits: ['Early access to updates', 'Community Discord access', 'Direct support'],
        icon: Star
    },
    {
        id: 'professional',
        name: 'PROFESSIONAL',
        min: '$1,001',
        max: '$10,000',
        price: '$0.04',
        bonus: '10% Ref + 5% Early Bird',
        benefits: ['Everything in Starter', 'Whitepaper access', 'Quarterly strategy calls', 'Priority support'],
        icon: Rocket,
        highlighted: true
    },
    {
        id: 'enterprise',
        name: 'ENTERPRISE',
        min: '$10,001+',
        max: 'Unlimited',
        price: '$0.03',
        bonus: '10% Ref + 7% EB + VIP',
        benefits: ['Everything in Professional', '1:1 advisory sessions', 'Custom allocation terms', 'Governance voting rights'],
        icon: Crown
    }
];

interface TierCardsProps {
    onSelectTier: (tier: string) => void;
    selectedTier?: string;
}

export default function TierCards({ onSelectTier, selectedTier }: TierCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;

                return (
                    <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelectTier(tier.id)}
                        className={`cursor-pointer relative p-8 rounded-3xl border transition-all duration-300 ${tier.highlighted
                            ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                            } ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-600/30' : ''}`}
                    >
                        {tier.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                                Most Popular
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${tier.highlighted ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                <Icon size={24} className="text-white" />
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white">{tier.price}</span>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Per Token</p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{tier.name}</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Contribution: <span className="text-white font-medium">{tier.min} - {tier.max}</span>
                        </p>

                        <div className="space-y-4 mb-8">
                            {tier.benefits.map((benefit) => (
                                <div key={benefit} className="flex gap-3 items-center">
                                    <div className="bg-green-500/20 p-0.5 rounded-full">
                                        <Check size={14} className="text-green-500" />
                                    </div>
                                    <span className="text-xs text-gray-300">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Bonus Structure</p>
                            <p className="text-xs font-bold text-indigo-400">{tier.bonus}</p>
                        </div>

                        <button
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${tier.highlighted || isSelected
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {isSelected ? 'Continue to Payment' : `Continue with ${tier.name.charAt(0) + tier.name.slice(1).toLowerCase()}`}
                            <ArrowRight size={16} />
                        </button>
                    </motion.div>
                );
            })}
        </div>
    );
}
