'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Image as ImageIcon,
    Building2,
    MapPin,
    Coins,
    TrendingUp,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AddProperty() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        symbol: '',
        address: '',
        location: '',
        country: '',
        valuationUSD: '',
        totalSupply: '',
        yield: '',
        type: 'Residential',
        goldenVisaEligible: false,
        metadataURI: '',
        images: [''] // Array for multiple image URLs
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for backend (Images as JSON string)
            const payload = {
                ...formData,
                valuationUSD: parseFloat(formData.valuationUSD),
                yield: parseFloat(formData.yield),
                totalSupply: (parseFloat(formData.totalSupply) * 10 ** 18).toString(), // Convert to Wei-like format
                images: JSON.stringify(formData.images.filter(img => img.trim() !== ''))
            };

            const response = await fetch('http://localhost:3001/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/admin/dashboard'), 2000);
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to add property. Check server console.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-[#00E676]/10 text-[#00E676] rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-extrabold text-[#0A1929] mb-4">Asset Onboarded Successfully</h2>
                <p className="text-gray-400 max-w-md">The property has been minted in the database and is now available for fractional investment on the marketplace.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-32">
            <div className="flex items-center justify-between mb-16">
                <div className="flex items-center space-x-6">
                    <Link href="/admin/dashboard" className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#DC143C] transition-all shadow-sm hover:shadow-md">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-[#0A1929] tracking-tight">Onboard New Asset</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Registry Protocol 4.0 // Kortana Network</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                    <span className="text-xs font-black text-[#0A1929] uppercase tracking-widest">Network Secure</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Form Fields */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[4rem] -z-10 opacity-50"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                    <Building2 size={12} className="mr-2 text-[#DC143C]" /> Legal Title
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Skyline Luxury Penthouse"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-[#0A1929] font-black focus:outline-none focus:border-[#DC143C] focus:ring-4 focus:ring-[#DC143C]/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                    <Coins size={12} className="mr-2 text-[#DC143C]" /> Asset Symbol
                                </label>
                                <input
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleChange}
                                    placeholder="e.g. SLP"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-[#0A1929] font-black focus:outline-none focus:border-[#DC143C] focus:ring-4 focus:ring-[#DC143C]/5 transition-all uppercase"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                <FileText size={12} className="mr-2 text-[#DC143C]" /> Smart Registry Address
                            </label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="0x..."
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-[#0A1929] font-mono text-sm focus:outline-none focus:border-[#DC143C] focus:ring-4 focus:ring-[#DC143C]/5 transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Metropolitan Area</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Dubai"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-[#0A1929] font-black focus:outline-none focus:border-[#DC143C] focus:ring-4 focus:ring-[#DC143C]/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Jurisdiction</label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g. UAE"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-[#0A1929] font-black focus:outline-none focus:border-[#DC143C] focus:ring-4 focus:ring-[#DC143C]/5 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                <Globe size={12} className="mr-2 text-[#DC143C]" /> Metadata Bridge (IPFS)
                            </label>
                            <input
                                name="metadataURI"
                                value={formData.metadataURI}
                                onChange={handleChange}
                                placeholder="ipfs://..."
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-[#0A1929] font-mono text-xs focus:outline-none focus:border-[#DC143C] focus:ring-4 focus:ring-[#DC143C]/5 transition-all opacity-60"
                            />
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-[#0A1929] flex items-center">
                                    <ImageIcon size={20} className="mr-3 text-[#DC143C]" /> Visual Documentation
                                </h3>
                                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">High-resolution property images</p>
                            </div>
                            <button
                                type="button"
                                onClick={addImageField}
                                className="bg-[#0A1929] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#DC143C] transition-all shadow-md active:scale-95"
                            >
                                + Add Asset
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.images.map((img, index) => (
                                <div key={index} className="space-y-3 group">
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={img}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] text-[10px] font-bold focus:outline-none focus:border-[#DC143C] transition-all"
                                            required={index === 0}
                                        />
                                        {img && (
                                            <div className="mt-4 aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Quick Specs */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#0A1929] p-10 rounded-[3.5rem] text-white space-y-10 shadow-2xl shadow-[#0A1929]/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                        <h3 className="text-xl font-black flex items-center relative z-10">
                            <TrendingUp size={20} className="mr-3 text-[#DC143C]" /> Economic Core
                        </h3>

                        <div className="space-y-3 relative z-10">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Asset Valuation (USD)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DC143C] font-black text-2xl">$</span>
                                <input
                                    name="valuationUSD"
                                    type="number"
                                    value={formData.valuationUSD}
                                    onChange={handleChange}
                                    placeholder="0,000"
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pl-12 text-white font-black text-3xl focus:outline-none focus:border-[#DC143C] transition-all placeholder:text-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Token Supply</label>
                            <input
                                name="totalSupply"
                                type="number"
                                value={formData.totalSupply}
                                onChange={handleChange}
                                placeholder="Base units"
                                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-black text-3xl focus:outline-none focus:border-[#DC143C] transition-all placeholder:text-white/10"
                                required
                            />
                        </div>

                        <div className="space-y-3 relative z-10">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Projected APY (%)</label>
                            <div className="relative">
                                <input
                                    name="yield"
                                    type="number"
                                    step="0.1"
                                    value={formData.yield}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-[#00E676] font-black text-4xl focus:outline-none focus:border-[#DC143C] transition-all placeholder:text-[#00E676]/10"
                                    required
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00E676] font-black text-xl">%</span>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 relative z-10">
                            <label className="flex items-center space-x-4 cursor-pointer group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-[#DC143C]/50 transition-all">
                                <input
                                    type="checkbox"
                                    name="goldenVisaEligible"
                                    checked={formData.goldenVisaEligible}
                                    onChange={handleChange}
                                    className="w-6 h-6 rounded-lg bg-white/10 border-none checked:bg-[#DC143C] transition-all"
                                />
                                <span className="text-xs font-black text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">Golden Visa Protocol</span>
                            </label>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Sector Taxonomy</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black focus:outline-none focus:border-[#DC143C] appearance-none cursor-pointer uppercase tracking-widest text-xs"
                                >
                                    <option value="Residential" className="bg-[#0A1929]">Residential Complex</option>
                                    <option value="Commercial" className="bg-[#0A1929]">Commercial Facility</option>
                                    <option value="High Yield" className="bg-[#0A1929]">High Yield Portfolio</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#DC143C] text-white py-8 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-[#DC143C]/30 hover:bg-[#B22222] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-4 group"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>INITIALIZE ASSET</span>
                                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
