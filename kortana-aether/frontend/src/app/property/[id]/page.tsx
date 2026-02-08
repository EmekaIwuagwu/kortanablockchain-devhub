'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useParams } from 'next/navigation';
import { InvestmentModal } from '@/components/InvestmentModal';

export default function PropertyDetail() {
    const params = useParams();
    const id = params?.id as string;
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                    yieldNum: parseFloat(p.yield)
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
                property={{
                    id: id,
                    title: property.title,
                    tokenPrice: property.tokenPriceNum,
                    yield: property.yieldNum
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
                            <div className="text-center mb-8 pb-8 border-b border-gray-100">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Current Token Price</span>
                                <div className="text-5xl font-extrabold text-[#0A1929] mt-4">{property.tokenPrice}</div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Investment Amount (DNR)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xl font-bold text-[#0A1929] focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] transition-all"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">DNR</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                                    <span>Estimated Tokens:</span>
                                    <span className="font-bold text-[#0A1929]">0 Tokens</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-[#DC143C] text-white font-bold py-5 rounded-xl text-lg hover:bg-[#B22222] transition-colors shadow-xl shadow-[#DC143C]/30 transform active:scale-[0.98] transition-transform"
                            >
                                Invest Now
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                                By investing you agree to the <a href="#" className="underline hover:text-[#DC143C]">Terms of Service</a> & <a href="#" className="underline hover:text-[#DC143C]">Risk Disclosure</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
