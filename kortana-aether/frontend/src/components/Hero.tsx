'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax-like effect */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop"
                    alt="Luxury Real Estate"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                {/* sophisticated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1929]/95 via-[#0A1929]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929] via-transparent to-transparent"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="max-w-3xl"
                >
                    <div className="flex items-center space-x-2 mb-6">
                        <span className="w-12 h-[2px] bg-[#DC143C]"></span>
                        <span className="text-[#DC143C] font-bold tracking-[0.2em] uppercase text-sm">The Future of Ownership</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                        Invest in the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#FF4D6D]">Extraordinary.</span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light max-w-xl">
                        Own premium fractional real estate across the globe. Powered by the security and speed of the Kortana blockchain.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link href="/marketplace" className="group relative px-8 py-4 bg-[#DC143C] text-white font-bold text-lg rounded-full overflow-hidden shadow-lg shadow-[#DC143C]/40 hover:shadow-xl hover:shadow-[#DC143C]/60 transition-all duration-300">
                            <span className="relative z-10 flex items-center">
                                Start Investing <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </span>
                            <div className="absolute inset-0 bg-[#B22222] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                        </Link>

                        <button className="flex items-center space-x-3 text-white font-medium hover:text-[#DC143C] transition-colors group px-6 py-4 rounded-full border border-white/10 hover:border-[#DC143C]/50 hover:bg-white/5 backdrop-blur-sm">
                            <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                            <span>Watch Showreel</span>
                        </button>
                    </div>

                    <div className="mt-12 flex items-center space-x-8 text-sm text-gray-400">
                        <div>
                            <p className="text-2xl font-bold text-white mb-1">12%+</p>
                            <p>Avg. APY</p>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-700"></div>
                        <div>
                            <p className="text-2xl font-bold text-white mb-1">$25M+</p>
                            <p>Asset Value</p>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-700"></div>
                        <div>
                            <p className="text-2xl font-bold text-white mb-1">2.5k+</p>
                            <p>Investors</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right side interactive/glass element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hidden md:block relative self-center"
                >
                    {/* Glass Card */}
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#DC143C] rounded-full blur-[80px] opacity-40"></div>
                        <div className="relative z-10 rounded-2xl overflow-hidden h-[400px]">
                            <img
                                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
                                alt="Featured Property"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex justify-between items-end text-white">
                                    <div>
                                        <p className="text-xs font-bold text-[#DC143C] uppercase tracking-wider mb-1">Featured Asset</p>
                                        <p className="text-xl font-bold">Acropolis View One</p>
                                        <p className="text-sm opacity-80">Athens, Greece</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#00E676]">7.2%</p>
                                        <p className="text-xs opacity-80">Yield</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
            >
                <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
                    <div className="w-1 h-3 bg-current rounded-full"></div>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
