'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { LogoText } from '@/components/Logo';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simple hardcoded check for demo, can be expanded to API call
        // In a real scenario, this would call /api/admin/login
        if (username === 'admin' && password === 'kortana2026') {
            localStorage.setItem('admin_token', 'session_active_' + Date.now());
            router.push('/admin/dashboard');
        } else {
            setError('Invalid credentials. Access denied.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0A1929] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#DC143C]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DC143C]/20 text-[#DC143C] rounded-2xl mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">Admin Terminal</h1>
                        <p className="text-gray-400">Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#DC143C] transition-colors"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#DC143C] transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#DC143C] text-white py-4 rounded-xl font-extrabold flex items-center justify-center space-x-2 hover:bg-[#B22222] transition-colors shadow-lg shadow-[#DC143C]/20 active:scale-[0.98]"
                        >
                            <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <Link href="/" className="text-gray-500 text-sm hover:text-white transition-colors">
                            Return to Public Site
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

import Link from 'next/link';
