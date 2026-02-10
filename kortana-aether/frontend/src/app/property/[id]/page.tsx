'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useParams } from 'next/navigation';
import { InvestmentModal } from '@/components/InvestmentModal';
import { TrendingUp, Globe, ShoppingBag } from 'lucide-react';

export default function PropertyDetail() {
    const params = useParams();
    const id = params?.id as string;
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState<'FRACTIONAL' | 'RESIDENCY'>('FRACTIONAL');
    const [investAmount, setInvestAmount] = useState<number>(0);

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;
            try {
                const response = await fetch(`http://localhost:3001/api/properties/${id}`);
                const data = await response.json();
                const p = data.property;

                if (!p) return;

                // Map backend fields to frontend expectations
                const mapped = {
                    title: p.title,
                    location: `${p.location}, ${p.country}`,
                    desc: p.metadataURI || 'Premium real estate asset on the Kortana blockchain.',
                    price: `$${parseFloat(p.valuationUSD).toLocaleString()}`,
                    tokenPrice: `${(parseFloat(p.valuationUSD) / (parseFloat(p.totalSupply) / 10 ** 18)).toFixed(2)} DNR`,
                    yield: `${parseFloat(p.yield)}%`,
                    images: p.images,
                    tokenPriceNum: parseFloat(p.valuationUSD) / (parseFloat(p.totalSupply) / 10 ** 18),
                    yieldNum: parseFloat(p.yield),
                    sellerAddress: p.sellerAddress
                };

                setProperty(mapped);
            } catch (error) {
                console.error('Error fetching property:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] text-2xl font-bold">Loading...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] text-2xl font-bold">Property Not Found</div>;

    return (
        <main className="min-h-screen bg-[#FDFDFD]">
            <Header />

            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={mode}
                initialAmount={investAmount}
                property={{
                    id: id,
                    title: property.title,
                    tokenPrice: property.tokenPriceNum,
                    yield: property.yieldNum,
                    sellerAddress: property.sellerAddress
                }}
            />

            {/* Hero Image */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover fixed z-0 top-0 left-0" // Parallax effect
                    style={{ height: '60vh' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929] via-[#0A1929]/40 to-transparent z-10"></div>

                <div className="absolute bottom-0 left-0 w-full z-20 pb-16 pt-32 bg-gradient-to-t from-[#0A1929] to-transparent">
                    <div className="container mx-auto px-6 text-white">
                        <span className="bg-[#DC143C] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block shadow-lg shadow-[#DC143C]/40">
                            verified asset
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">{property.title}</h1>
                        <p className="text-2xl opacity-90 flex items-center font-light">
                            <span className="mr-3 text-[#DC143C]">📍</span> {property.location}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative z-30 bg-[#FDFDFD] -mt-8 rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] pt-16 pb-24">
                <div className="container mx-auto px-6 grid md:grid-cols-3 gap-16">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-12">
                        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                            <h2 className="text-3xl font-bold text-[#0A1929] mb-6">Property Overview</h2>
                            <p className="text-gray-600 leading-relaxed text-lg font-light tracking-wide">{property.desc}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-gray-100">
                                <div className="text-center group">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-[#DC143C] transition-colors">Target APY</div>
                                    <div className="text-[#00E676] font-extrabold text-2xl">{property.yield}</div>
                                </div>
                                <div className="text-center group">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-[#DC143C] transition-colors">Asset Value</div>
                                    <div className="text-[#0A1929] font-extrabold text-2xl">{property.price}</div>
                                </div>
                                <div className="text-center group">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-[#DC143C] transition-colors">Min. Investment</div>
                                    <div className="text-[#0A1929] font-extrabold text-2xl">{property.tokenPrice}</div>
                                </div>
                                <div className="text-center group">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-[#DC143C] transition-colors">Investors</div>
                                    <div className="text-[#0A1929] font-extrabold text-2xl">124</div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h2 className="text-3xl font-bold text-[#0A1929] mb-8">Financial Breakdown</h2>
                            <div className="space-y-6">
                                <div className="flex justify-between border-b border-gray-100 pb-4 hover:pl-4 transition-all cursor-default group">
                                    <span className="text-gray-500 font-medium group-hover:text-[#0A1929]">Annual Gross Rent</span>
                                    <span className="font-bold text-xl">€85,000</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-4 hover:pl-4 transition-all cursor-default group">
                                    <span className="text-gray-500 font-medium group-hover:text-[#0A1929]">Service Fees (1%)</span>
                                    <span className="font-bold text-xl text-red-500">-€850</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-4 hover:pl-4 transition-all cursor-default group">
                                    <span className="text-gray-500 font-medium group-hover:text-[#0A1929]">Maintenance Reserve</span>
                                    <span className="font-bold text-xl text-red-500">-€2,500</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-[#0A1929] font-bold text-xl">Net Annual Yield</span>
                                    <span className="text-[#00E676] font-bold text-3xl">€81,650</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Investment Card */}
                    <div className="relative">
                        <div className="sticky top-32 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200 border border-gray-100">
                            <div className="mb-8">
                                <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Select Your Path</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setMode('FRACTIONAL')}
                                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${mode === 'FRACTIONAL' ? 'border-[#DC143C] bg-[#DC143C]/5' : 'border-gray-50 bg-gray-50/50 grayscale hover:grayscale-0'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#DC143C]">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-black text-[#0A1929] uppercase">Asset Fractional</div>
                                                <div className="text-[10px] text-gray-400 font-bold">Standard Yield Investment</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === 'FRACTIONAL' ? 'border-[#DC143C]' : 'border-gray-300'}`}>
                                            {mode === 'FRACTIONAL' && <div className="w-2.5 h-2.5 bg-[#DC143C] rounded-full" />}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMode('RESIDENCY')}
                                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${mode === 'RESIDENCY' ? 'border-[#DC143C] bg-[#DC143C]/5' : 'border-gray-50 bg-gray-50/50 grayscale hover:grayscale-0'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0A1929]">
                                                <Globe size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-black text-[#0A1929] uppercase">Residency Path</div>
                                                <div className="text-[10px] text-gray-400 font-bold">Golden Visa Qualification</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === 'RESIDENCY' ? 'border-[#DC143C]' : 'border-gray-300'}`}>
                                            {mode === 'RESIDENCY' && <div className="w-2.5 h-2.5 bg-[#DC143C] rounded-full" />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="text-center mb-8 pb-8 border-b border-gray-100">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{mode === 'FRACTIONAL' ? 'Market Token Price' : 'Residency Milestone Amount'}</span>
                                <div className="text-5xl font-extrabold text-[#0A1929] mt-4">
                                    {mode === 'FRACTIONAL' ? property.tokenPrice : `${investAmount.toLocaleString()} DNR`}
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{mode === 'FRACTIONAL' ? 'Investment Amount' : 'Deposit Amount'} (DNR)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={investAmount}
                                            onChange={(e) => setInvestAmount(Number(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xl font-bold text-[#0A1929] focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] transition-all"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">DNR</span>
                                    </div>
                                </div>

                                {mode === 'RESIDENCY' && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        {(() => {
                                            const threshold = property.location.includes('Portugal') ? 500000 :
                                                property.location.includes('Greece') ? 250000 : 450000;
                                            const progress = Math.min(100, (investAmount / threshold) * 100);
                                            return (
                                                <>
                                                    <div className="flex justify-between text-xs font-black uppercase text-blue-600 mb-2">
                                                        <span>Threshold Progress</span>
                                                        <span>{progress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-blue-200/30 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <p className="mt-2 text-[10px] text-blue-400 font-bold uppercase tracking-tighter">
                                                        Goal: {threshold.toLocaleString()} DNR for {property.location.split(',')[1] || 'Residency'}
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-[#DC143C] text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-[#B22222] transition-all shadow-xl shadow-[#DC143C]/30 transform active:scale-[0.98] flex items-center justify-center space-x-2"
                            >
                                <ShoppingBag size={18} />
                                <span>{mode === 'FRACTIONAL' ? 'Authorize Investment' : 'Submit Residency Deposit'}</span>
                            </button>

                            <p className="text-center text-[10px] text-gray-400 mt-6 font-black uppercase tracking-widest leading-relaxed">
                                Assets are held in a <span className="text-[#0A1929]">Legal SPV</span> & secured on-chain
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
