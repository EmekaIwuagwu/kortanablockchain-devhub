'use client';

import React from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function About() {
    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <Header />

            <section className="pt-40 pb-20 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <span className="text-[#DC143C] font-bold tracking-widest uppercase text-sm mb-2 block">Our Mission</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1929] mb-6">Democratizing Global Real Estate</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">AETHER is pioneering the future of property investment by combining blockchain transparency with prime real estate opportunities worldwide.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0A1929] mb-6">Who We Are</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Founded in 2026, AETHER was built on a simple premise: Real estate should generate wealth for everyone, not just the ultra-wealthy. By leveraging the Kortana blockchain, we tokenize high-yield properties into fractions, allowing anyone globally to invest with as little as 50 DNR.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Our team consists of seasoned real estate developers, blockchain architects, and legal experts specializing in EU residency programs. Together, we ensure every asset on our platform is vetted, compliant, and poised for growth.
                        </p>
                    </div>
                    <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                            alt="AETHER Team Office"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 py-12 border-t border-gray-200">
                    <div className="text-center p-6">
                        <div className="text-4xl font-extrabold text-[#DC143C] mb-2">$120M+</div>
                        <div className="text-gray-500 font-bold uppercase text-sm tracking-wider">Assets Under Management</div>
                    </div>
                    <div className="text-center p-6 border-l border-r border-gray-100">
                        <div className="text-4xl font-extrabold text-[#DC143C] mb-2">15k+</div>
                        <div className="text-gray-500 font-bold uppercase text-sm tracking-wider">Active Investors</div>
                    </div>
                    <div className="text-center p-6">
                        <div className="text-4xl font-extrabold text-[#DC143C] mb-2">12</div>
                        <div className="text-gray-500 font-bold uppercase text-sm tracking-wider">Global Locations</div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
