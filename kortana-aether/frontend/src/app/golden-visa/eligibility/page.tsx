'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Euro, User, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function GoldenVisaCheck() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nationality: '',
        budget: '',
        family: 'no',
        residency_type: '',
    });

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const steps = [
        { id: 1, title: 'Personal', icon: <User size={20} /> },
        { id: 2, title: 'Investment', icon: <Euro size={20} /> },
        { id: 3, title: 'Details', icon: <FileText size={20} /> },
        { id: 4, title: 'Result', icon: <Check size={20} /> },
    ];

    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <Header />

            <div className="pt-32 pb-24 container mx-auto px-6 max-w-4xl">
                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-12 relative z-10">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-[#DC143C] -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s) => (
                        <div key={s.id} className={`flex flex-col items-center cursor-default ${step >= s.id ? 'text-[#DC143C]' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-300 ${step >= s.id ? 'border-[#DC143C] bg-white shadow-md scale-110' : 'border-gray-300 bg-gray-50'
                                }`}>
                                {s.icon}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 min-h-[500px] relative overflow-hidden"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h1 className="text-3xl font-bold text-[#0A1929]">Check Your Eligibility</h1>
                                <p className="text-gray-500">Let's start with some basic information to determine which program fits you best.</p>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Nationality (Current Citizenship)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-[#0A1929] focus:outline-none focus:border-[#DC143C] transition-colors"
                                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="us">United States</option>
                                        <option value="uk">United Kingdom</option>
                                        <option value="cn">China</option>
                                        <option value="br">Brazil</option>
                                        <option value="other">Other (Non-EU)</option>
                                        <option value="eu">EU Member State</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Are you applying for family members?</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Yes', 'No'].map(opt => (
                                            <button
                                                key={opt}
                                                className={`p-4 rounded-xl border font-bold transition-all ${formData.family === opt.toLowerCase()
                                                        ? 'bg-[#DC143C] text-white border-[#DC143C] shadow-lg'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, family: opt.toLowerCase() })}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button onClick={handleNext} className="bg-[#0A1929] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#DC143C] transition-colors flex items-center">
                                        Continue <ChevronRight size={20} className="ml-2" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold text-[#0A1929]">Investment Preferences</h2>
                                <p className="text-gray-500">Golden Visa programs have different minimum investment thresholds.</p>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Estimated Budget</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: '€250k - €350k', value: 'low' },
                                            { label: '€350k - €500k', value: 'mid' },
                                            { label: '€500k+', value: 'high' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                className={`p-6 rounded-xl border text-left transition-all ${formData.budget === opt.value
                                                        ? 'bg-[#DC143C]/5 border-[#DC143C] ring-1 ring-[#DC143C]'
                                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, budget: opt.value })}
                                            >
                                                <span className={`block text-lg font-bold mb-1 ${formData.budget === opt.value ? 'text-[#DC143C]' : 'text-[#0A1929]'}`}>{opt.label}</span>
                                                <span className="text-sm text-gray-400">Suitable for Greece/Portugal low density</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-8">
                                    <button onClick={handlePrev} className="text-gray-500 hover:text-[#0A1929] font-bold px-4">Back</button>
                                    <button onClick={handleNext} className="bg-[#0A1929] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#DC143C] transition-colors flex items-center">
                                        Continue <ChevronRight size={20} className="ml-2" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 text-center py-10"
                            >
                                <div className="animate-spin w-16 h-16 border-4 border-[#DC143C] border-t-transparent rounded-full mx-auto mb-6"></div>
                                <h2 className="text-2xl font-bold text-[#0A1929]">Analyzing Eligibility...</h2>
                                <p className="text-gray-500">Checking against current regulations in Portugal, Spain, and Greece.</p>

                                {/* Simulate loading */}
                                {setTimeout(() => setStep(4), 2000) && null}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="w-24 h-24 bg-[#00E676]/10 text-[#00E676] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <h2 className="text-4xl font-extrabold text-[#0A1929] mb-4">You Are Eligible!</h2>
                                <p className="text-xl text-gray-600 max-w-lg mx-auto mb-10">
                                    Based on your profile, you qualify for the <span className="text-[#DC143C] font-bold">Portugal Golden Visa</span> via our €280k renovation fund route.
                                </p>

                                <div className="bg-gray-50 rounded-2xl p-8 mb-10 text-left border border-gray-100">
                                    <h3 className="font-bold text-[#0A1929] mb-4 flex items-center"><CheckCircleIcon className="text-[#00E676] mr-2" size={18} /> Qualified Paths</h3>
                                    <ul className="space-y-3">
                                        <li className="flex justify-between items-center text-gray-600">
                                            <span>Portugal (Low Density)</span>
                                            <span className="font-bold text-[#0A1929]">€280,000 Min</span>
                                        </li>
                                        <li className="flex justify-between items-center text-gray-600">
                                            <span>Greece (Selected Areas)</span>
                                            <span className="font-bold text-[#0A1929]">€250,000 Min</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link href="/marketplace?filter=golden-visa" className="bg-[#DC143C] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#B22222] transition-colors shadow-lg">
                                        View Eligible Properties
                                    </Link>
                                    <button className="bg-white text-[#0A1929] border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                        Download Report
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}

const CheckCircleIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
