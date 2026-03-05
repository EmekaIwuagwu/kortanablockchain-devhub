'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Send, Settings, LogOut,
    ExternalLink, Copy, Zap, ArrowLeft,
    LayoutGrid, Layers, ArrowDownLeft, Menu, X, Shapes
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { ComplianceModal } from './ComplianceModal';
import { RegisterTokenModal } from './RegisterTokenModal';
import { providerService } from '@/lib/ProviderService';
import { tokenService } from '@/lib/TokenService';

import { priceService } from '@/lib/PriceService';

// Import Views
import { HomeView } from './views/HomeView';
import { TransactView } from './views/TransactView';
import { SettingsView } from './views/SettingsView';
import { TransactionsView } from './views/TransactionsView';
import { ReceiveView } from './views/ReceiveView';
import { ArtifactsView } from './views/ArtifactsView';
import {
    ComplianceView, ESGView, RiskAIView,
    SubNetView, StableView
} from './views/FeatureViews';

const NAV_ITEMS = [
    { id: 'home', icon: LayoutGrid, label: 'Home' },
    { id: 'transact', icon: Send, label: 'Send' },
    { id: 'receive', icon: ArrowDownLeft, label: 'Receive' },
    { id: 'artifacts', icon: Shapes, label: 'Artifacts' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

export const Dashboard: React.FC = () => {
    const {
        address, balance, network, tokens, lastInteraction,
        setBalance, setTokens, setLocked, updateLastInteraction,
        showNotification
    } = useWalletStore();

    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auto-Lock Logic (5 minute timeout)
    useEffect(() => {
        const checkLock = () => {
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            if (now - lastInteraction > fiveMinutes) {
                setLocked(true);
            }
        };
        const interval = setInterval(checkLock, 10000);
        window.addEventListener('mousemove', updateLastInteraction);
        window.addEventListener('click', updateLastInteraction);
        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', updateLastInteraction);
            window.removeEventListener('click', updateLastInteraction);
        };
    }, [lastInteraction]);

    // Auto-refresh balance, tokens, and prices
    useEffect(() => {
        if (address) {
            refreshAll();
            const interval = setInterval(refreshAll, 15000);
            return () => clearInterval(interval);
        }
    }, [address, network]);

    const refreshAll = async () => {
        if (!address) return;

        // Parallelized Protocol Refresh
        const [newBalance, _] = await Promise.all([
            providerService.getBalance(address, network),
            priceService.refreshAllPrices()
        ]);

        setBalance(newBalance);
        const defaultTokenAddresses = tokenService.getDefaultTokens(network);
        const tokenPromises = defaultTokenAddresses.map(addr =>
            tokenService.getTokenData(addr, address, network)
        );
        const tokenResults = await Promise.all(tokenPromises);
        setTokens(tokenResults.filter(t => t !== null));
    };

    const handleLogout = () => setLocked(true);

    const handleFeatureClick = (id: string) => {
        setActiveTab(id);
        setSidebarOpen(false);
    };

    const copyAddress = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        showNotification('Address copied to clipboard', 'success');
    };


    const isSubView = ['compliance', 'esg', 'stable', 'risk', 'subnet', 'transact', 'receive', 'history', 'settings', 'artifacts'].includes(activeTab);

    return (
        <div className="flex h-screen w-full bg-deep-space text-white overflow-hidden relative font-sans">
            {/* Cinematic Backgrounds */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] nebula-purple opacity-30 animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] nebula-cyan opacity-20 animate-pulse" />
                <div className="grainy-overlay" />
            </div>

            {/* ===== DESKTOP SIDEBAR (FLEX INTEGRATED) ===== */}
            <aside className="hidden md:flex flex-col sticky top-0 h-screen w-20 lg:w-64 glass-panel border-r-0 rounded-none bg-deep-space/60 backdrop-blur-3xl px-3 lg:px-5 py-8 z-20 transition-all duration-300 shrink-0">

                {/* Logo */}
                <div className="mb-8 flex items-center justify-center lg:justify-start gap-3 lg:px-2">
                    <img src="/images/logo.png" alt="K" className="w-8 h-8 lg:w-10 lg:h-10 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0" />
                    <div className="hidden lg:block min-w-0">
                        <h2 className="font-black text-xl tracking-tighter leading-none uppercase text-white truncate">Kortana</h2>
                        <p className="text-[9px] font-bold tracking-[0.3em] text-cyan-400 uppercase mt-0.5">Poseidon</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all duration-200 group
                                ${activeTab === item.id ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            title={item.label}
                        >
                            <item.icon strokeWidth={activeTab === item.id ? 2.5 : 2} className={`size-4.5 shrink-0 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                            <span className="hidden lg:block font-bold text-xs uppercase tracking-widest truncate">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Lock */}
                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                        title="Lock Enclave"
                    >
                        <LogOut className="size-4.5 shrink-0" />
                        <span className="hidden lg:block text-[10px] uppercase tracking-[0.2em]">Lock Enclave</span>
                    </button>
                </div>
            </aside>

            {/* ===== MOBILE TOP BAR ===== */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-deep-space/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="K" className="w-7 h-7 object-contain" />
                    <span className="font-black text-sm tracking-tighter uppercase text-white">Kortana</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 border text-[8px] font-black uppercase tracking-wider
                        ${network === 'mainnet' ? 'border-cyan-400/40 text-cyan-400' : 'border-purple-400/40 text-purple-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${network === 'mainnet' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                        {network}
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
                        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* ===== MOBILE SLIDE-OUT MENU ===== */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-56 z-50 bg-deep-space/95 backdrop-blur-3xl border-l border-white/10 flex flex-col pt-16 pb-6 px-4 md:hidden"
                        >
                            <nav className="flex-1 space-y-1 mt-4">
                                {NAV_ITEMS.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                                            ${activeTab === item.id ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <item.icon strokeWidth={activeTab === item.id ? 2.5 : 2} className={`size-4 shrink-0 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                                        <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 p-3 rounded-xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                            >
                                <LogOut className="size-4 shrink-0" />
                                <span className="text-[10px] uppercase tracking-[0.2em]">Lock Enclave</span>
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ===== MOBILE BOTTOM NAV ===== */}
            <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-deep-space/90 backdrop-blur-3xl border-t border-white/5 px-1 py-2 flex justify-around items-center z-30">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 min-w-0
                            ${activeTab === item.id ? 'text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        <item.icon strokeWidth={activeTab === item.id ? 2.5 : 2} className="size-5 shrink-0" />
                        <span className="text-[7px] font-black uppercase tracking-widest truncate">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-6 relative z-10 w-full transition-all duration-500 scroll-smooth">
                <div className="max-w-[440px] md:max-w-2xl lg:max-w-5xl xl:max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-12 py-6 md:py-10 lg:py-16 xl:py-20">



                    {/* Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-16 lg:mb-24 pt-2">
                        <div className="space-y-2 md:space-y-4 min-w-0">
                            <div className="flex items-center gap-3 md:gap-5">
                                {isSubView && (
                                    <button onClick={() => setActiveTab('home')} className="p-2 md:p-3 hover:bg-white/10 glass-panel rounded-2xl transition-all shrink-0 hover:scale-110 active:scale-95">
                                        <ArrowLeft className="size-5 md:size-7 text-cyan-400" />
                                    </button>
                                )}
                                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-white uppercase font-heading leading-none drop-shadow-2xl">
                                    {network === 'mainnet' ? 'ZEUS' : 'POSEIDON'} <span className="text-gradient-kortana">ENCLAVE</span>
                                </h1>
                            </div>
                            <div
                                className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2.5 bg-white/5 rounded-2xl md:rounded-3xl w-fit cursor-pointer hover:bg-white/10 transition-all border border-white/5 shadow-inner group"
                                onClick={copyAddress}
                            >
                                <span className="font-mono text-[9px] md:text-xs lg:text-sm text-gray-500 group-hover:text-cyan-400 transition-colors tracking-widest font-bold">
                                    {address?.slice(0, 10)}...{address?.slice(-8)}
                                </span>
                                <div className="w-px h-3 md:h-4 bg-white/10 mx-1" />
                                <Copy className="size-3 md:size-4 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className={`px-5 lg:px-6 py-2.5 lg:py-3 glass-panel rounded-2xl lg:rounded-3xl flex items-center gap-3 border-opacity-30 border-2 ${network === 'mainnet' ? 'border-cyan-400 bg-cyan-400/5 shadow-cyan-400/20' : 'border-purple-400 bg-purple-400/5 shadow-purple-400/20'} shadow-2xl`}>
                                <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full animate-ping ${network === 'mainnet' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                                <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] ${network === 'mainnet' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                    {network.toUpperCase()} SYNC
                                </span>
                            </div>
                            <button onClick={refreshAll} className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl lg:rounded-3xl glass-panel flex items-center justify-center hover:scale-110 active:scale-90 transition-all cursor-pointer text-cyan-400 border-2 border-white/10 hover:border-cyan-400/50 shadow-2xl">
                                <Zap className="size-5 lg:size-6" />
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && <HomeView key="home" onFeatureClick={handleFeatureClick} onRegisterToken={() => setIsRegisterOpen(true)} />}
                        {activeTab === 'transact' && <TransactView key="transact" />}
                        {activeTab === 'receive' && <ReceiveView key="receive" />}
                        {activeTab === 'history' && <TransactionsView key="history" />}
                        {activeTab === 'settings' && <SettingsView key="settings" />}
                        {activeTab === 'artifacts' && <ArtifactsView key="artifacts" />}
                        {activeTab === 'compliance' && <ComplianceView key="compliance" />}
                        {activeTab === 'esg' && <ESGView key="esg" />}
                        {activeTab === 'stable' && <StableView key="stable" />}
                        {activeTab === 'risk' && <RiskAIView key="risk" />}
                        {activeTab === 'subnet' && <SubNetView key="subnet" />}
                    </AnimatePresence>
                </div>
            </main>

            <ComplianceModal isOpen={isComplianceOpen} onClose={() => setIsComplianceOpen(false)} />
            <RegisterTokenModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        </div>
    );
};
