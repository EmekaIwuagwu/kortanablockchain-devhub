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
    CheckCircle2
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
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center space-x-4 mb-10">
                <Link href="/admin/dashboard" className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-[#DC143C] transition-colors shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0A1929]">Tokenize New Property</h1>
                    <p className="text-gray-400 font-medium">Register physical assets on the Kortana blockchain</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Form Fields */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                    <Building2 size={14} className="mr-2" /> Property Title
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Skyline Luxury Penthouse"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] font-bold focus:outline-none focus:border-[#DC143C]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                    <Coins size={14} className="mr-2" /> Asset Symbol
                                </label>
                                <input
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleChange}
                                    placeholder="e.g. SLP"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] font-bold focus:outline-none focus:border-[#DC143C]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <MapPin size={14} className="mr-2" /> Smart Contract Address (Deployed Token)
                            </label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="0x..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] font-mono text-sm focus:outline-none focus:border-[#DC143C]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location (City)</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Dubai"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] font-bold focus:outline-none focus:border-[#DC143C]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Country</label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g. UAE"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] font-bold focus:outline-none focus:border-[#DC143C]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <FileText size={14} className="mr-2" /> Property Metadata URI (IPFS)
                            </label>
                            <input
                                name="metadataURI"
                                value={formData.metadataURI}
                                onChange={handleChange}
                                placeholder="ipfs://..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[#0A1929] font-mono text-xs focus:outline-none focus:border-[#DC143C]"
                            />
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#0A1929] flex items-center">
                                <ImageIcon size={20} className="mr-2 text-[#DC143C]" /> Visual Assets
                            </h3>
                            <button
                                type="button"
                                onClick={addImageField}
                                className="text-[#DC143C] font-bold text-sm bg-[#DC143C]/5 px-4 py-2 rounded-xl border border-[#DC143C]/10 hover:bg-[#DC143C] hover:text-white transition-all"
                            >
                                + Add URL
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="flex space-x-4">
                                    <input
                                        type="url"
                                        value={img}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-[#0A1929] text-xs focus:outline-none focus:border-[#DC143C]"
                                        required={index === 0}
                                    />
                                    {img && (
                                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Quick Specs */}
                <div className="space-y-8">
                    <div className="bg-[#0A1929] p-10 rounded-[2.5rem] text-white space-y-8 shadow-xl">
                        <h3 className="text-xl font-bold flex items-center">
                            <TrendingUp size={20} className="mr-2 text-[#DC143C]" /> Economics
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Asset Valuation (USD)</label>
                            <input
                                name="valuationUSD"
                                type="number"
                                value={formData.valuationUSD}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-extrabold text-2xl focus:outline-none focus:border-[#DC143C]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Total Token Supply</label>
                            <input
                                name="totalSupply"
                                type="number"
                                value={formData.totalSupply}
                                onChange={handleChange}
                                placeholder="e.g. 1000"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-extrabold text-2xl focus:outline-none focus:border-[#DC143C]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Expected APY (%)</label>
                            <input
                                name="yield"
                                type="number"
                                step="0.1"
                                value={formData.yield}
                                onChange={handleChange}
                                placeholder="0.0"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#00E676] font-extrabold text-2xl focus:outline-none focus:border-[#DC143C]"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="goldenVisaEligible"
                                    checked={formData.goldenVisaEligible}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded bg-white/5 border-white/10 checked:bg-[#DC143C]"
                                />
                                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Golden Visa Eligible</span>
                            </label>

                            <div className="space-y-2 pt-4">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Property Category</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-[#DC143C] appearance-none"
                                >
                                    <option value="Residential" className="bg-[#0A1929]">Residential</option>
                                    <option value="Commercial" className="bg-[#0A1929]">Commercial</option>
                                    <option value="High Yield" className="bg-[#0A1929]">High Yield</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#DC143C] text-white py-6 rounded-3xl font-extrabold text-xl shadow-2xl shadow-[#DC143C]/30 hover:bg-[#B22222] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Initializing Asset...' : 'Deploy Property'}
                    </button>
                </div>
            </form>
        </div>
    );
}
