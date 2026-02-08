'use client';

import React from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { useState } from 'react';

import { useState, useEffect } from 'react';

export default function Marketplace() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Properties');
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/properties');
                const data = await response.json();

                // Map backend fields to frontend expectations
                const mapped = data.properties.map((p: any) => ({
                    id: p.id.toString(),
                    title: p.title,
                    location: p.location,
                    country: p.country,
                    price_usd: parseFloat(p.valuationUSD),
                    total_tokens: parseFloat(p.totalSupply) / 10 ** 18,
                    token_price_dinar: parseFloat(p.valuationUSD) / (parseFloat(p.totalSupply) / 10 ** 18),
                    yield: parseFloat(p.yield),
                    golden_visa_eligible: p.goldenVisaEligible,
                    type: p.type,
                    images: p.images,
                }));

                setProperties(mapped);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const filteredProperties = properties.filter(p => {
        const matchesSearch = p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.title.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (activeFilter === 'Golden Visa') matchesFilter = p.golden_visa_eligible;
        else if (activeFilter === 'High Yield (>8%)') matchesFilter = p.yield > 8;
        else if (activeFilter === 'Residential') matchesFilter = ['Residential', 'High Yield'].includes(p.type || '');
        else if (activeFilter === 'Commercial') matchesFilter = p.type === 'Commercial';

        return matchesSearch && matchesFilter;
    });

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
                                className="pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] w-full md:w-80 shadow-sm"
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
                            onClick={() => setActiveFilter(tag)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeFilter === tag ? 'bg-[#0A1929] text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Property Grid */}
                {filteredProperties.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map(property => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
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
