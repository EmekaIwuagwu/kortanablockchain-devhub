'use client';

import React from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function Marketplace() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Properties');
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hideInvested, setHideInvested] = useState(true);
    const { address } = useAccount();

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const url = new URL('http://localhost:3001/api/properties');
                url.searchParams.append('page', page.toString());
                url.searchParams.append('limit', '9');
                url.searchParams.append('excludeInvested', hideInvested ? 'true' : 'false');
                if (address) {
                    url.searchParams.append('userAddress', address);
                }
                if (activeFilter !== 'All Properties') {
                    url.searchParams.append('type', activeFilter);
                }
                if (searchTerm) {
                    url.searchParams.append('search', searchTerm);
                }

                console.log('Fetching properties from:', url.toString());
                const response = await fetch(url.toString());

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (!data || !Array.isArray(data.properties)) {
                    console.error('Invalid response format. Expected { properties: [] }, got:', data);
                    setProperties([]);
                    setTotalPages(1);
                    return;
                }

                // Map backend fields to frontend expectations
                const mapped = data.properties.map((p: any) => ({
                    id: (p.id || '').toString(),
                    title: p.title || 'Untitled Property',
                    location: p.location || 'Unknown Location',
                    country: p.country || 'N/A',
                    price_usd: parseFloat(p.valuationUSD || '0'),
                    total_tokens: parseFloat(p.totalSupply || '0') / 10 ** 18,
                    token_price_dinar: (parseFloat(p.valuationUSD || '0')) / (parseFloat(p.totalSupply || '1') / 10 ** 18),
                    yield: parseFloat(p.yield || '0'),
                    golden_visa_eligible: !!p.goldenVisaEligible,
                    type: p.type || 'Residential',
                    images: Array.isArray(p.images) ? p.images : [],
                }));

                console.log('Successfully mapped properties:', mapped.length);
                setProperties(mapped);
                setTotalPages(data.totalPages || 1);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [page, address, activeFilter, searchTerm]);

    const filteredProperties = properties; // Filtering is now done on the server


    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <Header />

            <div className="pt-32 pb-24 container mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
                    <div>
                        <span className="text-[#DC143C] font-bold tracking-widest uppercase text-sm mb-2 block">Available Opportunities</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1929] mb-2">Marketplace</h1>
                        <p className="text-gray-500 text-lg">Discover and own premium fractional real estate.</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] w-full md:w-80 shadow-sm font-bold"
                            />
                        </div>
                        <button className="p-4 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-[#DC143C] hover:border-[#DC143C] transition-all shadow-sm">
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters / Tags */}
                <div className="flex space-x-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {['All Properties', 'Golden Visa', 'High Yield (>8%)', 'Residential', 'Commercial'].map((tag, i) => (
                        <button
                            key={i}
                            onClick={() => { setActiveFilter(tag); setPage(1); }}
                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeFilter === tag ? 'bg-[#0A1929] text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Hide Invested Toggle */}
                {address && (
                    <div className="flex items-center space-x-3 mb-8 bg-white p-4 rounded-2xl border border-gray-100 w-fit shadow-sm">
                        <button
                            onClick={() => setHideInvested(!hideInvested)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${hideInvested ? 'bg-[#DC143C]' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${hideInvested ? 'left-5' : 'left-1'}`} />
                        </button>
                        <span className="text-sm font-bold text-[#0A1929]">Hide properties I already invested in</span>
                    </div>
                )}

                {/* Property Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DC143C]"></div>
                    </div>
                ) : properties.length > 0 ? (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {properties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-16 flex justify-center items-center space-x-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-6 py-3 rounded-xl bg-white border border-gray-200 font-bold disabled:opacity-50 hover:border-[#DC143C] transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <span className="font-bold text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-6 py-3 rounded-xl bg-white border border-gray-200 font-bold disabled:opacity-50 hover:border-[#DC143C] transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-600">No properties found</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
