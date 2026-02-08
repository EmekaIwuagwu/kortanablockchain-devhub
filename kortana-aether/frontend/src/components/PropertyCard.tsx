'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

interface PropertyCardProps {
    property: {
        id: string;
        title: string;
        location: string;
        price_usd: number;
        token_price_dinar: number;
        yield: number;
        images: string[];
        golden_visa_eligible: boolean;
    };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:border-[#DC143C]/20 transition-all duration-300 transform-gpu"
        >
            <div className="relative h-72 overflow-hidden">
                <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                {property.golden_visa_eligible && (
                    <div className="absolute top-4 left-4 bg-[#00E676] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                        Golden Visa
                    </div>
                )}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-[#0A1929] shadow-lg">
                    {property.token_price_dinar} DNR / token
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center text-gray-400 text-sm mb-3">
                    <MapPin size={16} className="mr-1 text-[#DC143C]" />
                    {property.location}
                </div>
                <h3 className="text-xl font-bold text-[#0A1929] mb-6 truncate group-hover:text-[#DC143C] transition-colors">{property.title}</h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center text-gray-500 text-xs mb-1 uppercase tracking-wider font-bold">
                            <TrendingUp size={12} className="mr-1" />
                            Exp. Yield
                        </div>
                        <div className="text-[#00E676] font-extrabold text-lg">{property.yield}% APY</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center text-gray-500 text-xs mb-1 uppercase tracking-wider font-bold">
                            <Users size={12} className="mr-1" />
                            Value
                        </div>
                        <div className="text-[#0A1929] font-extrabold text-lg">${(property.price_usd / 1000000).toFixed(1)}M</div>
                    </div>
                </div>

                <Link
                    href={`/property/${property.id}`}
                    className="block w-full text-center py-4 bg-[#0A1929] text-white font-bold rounded-xl hover:bg-[#DC143C] transition-colors shadow-lg active:scale-[0.98]"
                >
                    View Opportunity
                </Link>
            </div>
        </motion.div>
    );
};

export default PropertyCard;
