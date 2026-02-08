'use client';

import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { Shield, Zap, Globe, Lock, ArrowRight, CheckCircle, TrendingUp, Key } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(220, 20, 60, 0.15)" }}
    className="flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-[#DC143C]/20 transition-all duration-300 group relative z-10 overflow-hidden"
  >
    {/* Subtle Background Pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent -z-10 group-hover:from-[#DC143C]/5" />

    <div className="w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-[#DC143C]/10 to-transparent flex items-center justify-center text-[#DC143C] group-hover:bg-[#DC143C] group-hover:text-white transition-all duration-500 shadow-md transform group-hover:rotate-12">
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-10 h-10" })}
    </div>
    <h3 className="text-2xl font-bold text-[#0A1929] mb-4 group-hover:text-[#DC143C] transition-colors">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-lg font-light">{desc}</p>
  </motion.div>
);

const AnimatedStat = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tighter">{value}</div>
    <div className="text-sm font-bold text-[#DC143C] uppercase tracking-widest">{label}</div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Logos Strip */}
      <section className="py-16 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Trusted Infrastructure Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-40 hover:opacity-100 transition-opacity duration-700 filter grayscale hover:grayscale-0">
            {/* Text-based logos for simplicity but styled beautifully */}
            {['Kortana', 'Consensys', 'Chainlink', 'OpenZeppelin', 'Coinbase'].map((partner) => (
              <span key={partner} className="text-2xl md:text-3xl font-extrabold text-[#0A1929] cursor-default">{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition / Features */}
      <section className="py-32 bg-white relative">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-gray-100 to-transparent rounded-full blur-[100px] -z-10 opacity-60"></div>

        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-extrabold text-[#0A1929] mb-8 leading-tight tracking-tight"
            >
              Real Estate Investing, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#E11D48]">Reimagined & Democratized.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-xl md:text-2xl leading-relaxed font-light"
            >
              We've dismantled the barriers. No paperwork mountains, no illiquidity, no hidden fees. Just pure, fractional ownership powered by the Kortana blockchain.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <FeatureCard
              icon={<Shield />}
              title="Legally Secure"
              desc="Every property is held by a dedicated SPV. Your tokens represent legally enforceable ownership shares."
              delay={0}
            />
            <FeatureCard
              icon={<Zap />}
              title="Instant Liquidity"
              desc="Need cash? Sell your property tokens instantly on our secondary marketplace directly for Dinar."
              delay={0.1}
            />
            <FeatureCard
              icon={<Globe />}
              title="Border-less"
              desc="Invest in high-growth markets like Lisbon, Athens, and Dubai from anywhere in the world."
              delay={0.2}
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Automated Yields"
              desc="Small contracts automatically collect rent and distribute it to your wallet daily. Passive income on autopilot."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Immersive Image Section - "The Global Portfolio" */}
      <section className="py-40 bg-[#0A1929] text-white relative overflow-hidden">
        {/* Background Parallax Image */}
        <div className="absolute inset-0 opacity-20 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
            alt="City Skyline"
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929] via-[#0A1929]/90 to-transparent z-0"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-[#DC143C]/10 border border-[#DC143C]/20 text-[#DC143C] font-bold rounded-lg text-sm uppercase tracking-widest mb-8">
                Global Access
              </span>
              <h2 className="text-5xl md:text-7xl font-extrabold mb-10 leading-none tracking-tight">
                Your Portfolio <br /> Without Borders.
              </h2>
              <p className="text-xl text-gray-400 mb-12 font-light leading-relaxed">
                Access exclusive real estate deals previously reserved for institutional investors. From luxury villas in Portugal to high-rise apartments in Dubai.
              </p>

              <ul className="space-y-6 mb-12">
                {['Direct Ownership via SPV', 'Daily Rental Payouts in DNR', '24/7 Secondary Market Liquidity'].map((item, i) => (
                  <li key={i} className="flex items-center text-lg font-medium">
                    <CheckCircle className="text-[#00E676] mr-4" size={24} />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/marketplace" className="inline-flex items-center justify-center px-10 py-5 bg-white text-[#0A1929] font-bold text-lg rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-xl shadow-white/10">
                Explore Properties <ArrowRight className="ml-2" />
              </Link>
            </div>

            <div className="relative">
              {/* Floating Cards Composition */}
              <motion.div
                initial={{ rotate: -6, y: 50, opacity: 0 }}
                whileInView={{ rotate: -3, y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/5"
              >
                <img
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2670&auto=format&fit=crop"
                  alt="Modern House"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">New Listing</p>
                      <p className="text-white font-bold text-xl">Villa Paraiso</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#00E676] font-bold text-xl">12.5%</p>
                      <p className="text-white/60 text-xs">Proj. Yield</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DC143C] rounded-full blur-[100px] opacity-30 z-0"></div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 border-t border-white/10 pt-16">
            <AnimatedStat value="$125M+" label="Total Volume" />
            <AnimatedStat value="18K+" label="Active Investors" />
            <AnimatedStat value="150+" label="Properties Funded" />
            <AnimatedStat value="24/7" label="Market Uptime" />
          </div>
        </div>
      </section>

      {/* Knowledge Hub Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <span className="text-[#DC143C] font-bold tracking-widest uppercase text-sm mb-2 block">Empowering Investors</span>
              <h2 className="text-4xl font-extrabold text-[#0A1929] mb-4">Knowledge is Profit.</h2>
              <p className="text-gray-500 text-lg">We believe in full transparency. Understand our mission and get answers to all your questions.</p>
            </div>
            <Link href="/faq" className="mt-6 md:mt-0 text-[#DC143C] font-bold flex items-center hover:translate-x-2 transition-transform">
              Visit Help Center <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/about" className="group relative overflow-hidden rounded-[2.5rem] h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
                alt="Our Mission"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <h3 className="text-3xl font-bold text-white mb-2">Our Mission</h3>
                <p className="text-gray-300 mb-6 max-w-md">Learn how we are democratizing access to global real estate wealth for everyone.</p>
                <span className="text-white font-bold underline decoration-[#DC143C] decoration-2 underline-offset-4 group-hover:text-[#DC143C] transition-colors">Read Story</span>
              </div>
            </Link>

            <Link href="/faq" className="group relative overflow-hidden rounded-[2.5rem] h-[400px]">
              <div className="absolute inset-0 bg-[#0A1929] transition-colors duration-500 group-hover:bg-[#0f243a]"></div>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Key size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Investor FAQ</h3>
                <p className="text-gray-400 mb-8 max-w-md">Everything you need to know about dividends, legal ownership, and Golden Visa eligibility.</p>
                <div className="bg-white text-[#0A1929] px-8 py-3 rounded-full font-bold group-hover:bg-[#DC143C] group-hover:text-white transition-all">
                  Get Answers
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#F5F7FA] relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-[#DC143C] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-[#DC143C]/20"
          >
            {/* Abstract Lines */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-none">Ready to start earning?</h2>
              <p className="text-white/90 text-xl md:text-2xl mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
                Join specific high-yield opportunities from as little as 100 DNR. Start building your legacy today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/marketplace" className="w-full sm:w-auto bg-white text-[#DC143C] px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  View Marketplace
                </Link>
                <Link href="/how-it-works" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#B22222] text-white border border-white/20 px-12 py-6 rounded-full font-bold text-xl hover:bg-[#901d1d] transition-all">
                  <span>How It Works</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
