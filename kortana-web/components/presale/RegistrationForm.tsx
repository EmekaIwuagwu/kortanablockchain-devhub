"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Mail, User, Phone, Globe, ShieldCheck, Copy, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, ExternalLink, Info, Smartphone, Plus } from 'lucide-react';

interface RegistrationFormProps {
    selectedTier: string;
    onSuccess: (data: any) => void;
}

const KORTANA_MAINNET_INFO = {
    name: 'Kortana Mainnet',
    rpc: 'https://mainnet.kortana.network',
    chainId: '9002',
    symbol: 'DNR',
    explorer: 'https://explorer.kortana.network'
};

const PAYMENT_PLATFORMS = [
    { id: 'eth', name: 'Ethereum (ERC-20)', symbol: 'USDT', token: 'USDT', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', address: '0x7a5E98C721A0F2d5856B73E366127394E2bDa789' },
    { id: 'bnb', name: 'BSC (BEP-20)', symbol: 'USDT', token: 'USDT', icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', address: '0x7a5E98C721A0F2d5856B73E366127394E2bDa789' },
    { id: 'sol', name: 'Solana Network', symbol: 'USDC', token: 'USDC', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', address: 'BfXm7S7c... (Awaiting Your SOL Address)' },
    { id: 'polygon', name: 'Polygon', symbol: 'USDT', token: 'USDT', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', address: '0x7a5E98C721A0F2d5856B73E366127394E2bDa789' },
    { id: 'trc20', name: 'TRON (TRC-20)', symbol: 'USDT', token: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', address: 'TX5tekNYLZXaVtje6QUMKjEsx9RxteSzC4' },
];

export default function RegistrationForm({ selectedTier: initialTier, onSuccess }: RegistrationFormProps) {
    const [step, setStep] = useState(1);
    const [selectedPlatform, setSelectedPlatform] = useState<typeof PAYMENT_PLATFORMS[0] | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [tokenAmount, setTokenAmount] = useState<number>(20000);
    const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({
        eth: 2800,
        bnb: 380,
        sol: 110,
        polygon: 0.8,
        trc20: 0.12
    });

    // Fetch live prices
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,solana,matic-network,tron&vs_currencies=usd');
                const data = await res.json();
                setCryptoPrices({
                    eth: data.ethereum.usd,
                    bnb: data.binancecoin.usd,
                    sol: data.solana.usd,
                    polygon: data['matic-network'].usd,
                    trc20: data.tron.usd
                });
            } catch (err) {
                console.error("Price fetch error:", err);
            }
        };
        fetchPrices();
    }, []);

    const getPricePerToken = () => {
        if (formData.tier?.toLowerCase() === 'enterprise') return 0.03;
        if (formData.tier?.toLowerCase() === 'professional') return 0.04;
        return 0.05;
    };

    const calculateCost = () => {
        const usdTotal = tokenAmount * getPricePerToken();
        // Since we are using USDT/USDC across all platforms, it's 1:1
        return {
            usd: usdTotal,
            crypto: usdTotal
        };
    };

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        walletAddress: '',
        tier: initialTier,
        txReceipt: '',
        terms: false
    });

    // Sync from parent tier selection
    useEffect(() => {
        if (initialTier && initialTier !== formData.tier) {
            setFormData(prev => ({ ...prev, tier: initialTier }));
            setStep(2);
        }
    }, [initialTier]);

    const [referralData, setReferralData] = useState<{ link: string; code: string } | null>(null);

    const handleTierSelection = (tier: string) => {
        setFormData({ ...formData, tier });
        setStep(2);
        // Scroll to component top
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.terms) {
            setError('Please accept the terms to continue.');
            return;
        }

        setStatus('loading');
        setError('');

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const referralCode = urlParams.get('ref');

            const response = await fetch('/api/presale/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tokenAmount,
                    usdCost: calculateCost().usd,
                    referralCode,
                    transactionHash: formData.txReceipt,
                    paymentMethod: selectedPlatform?.name
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setReferralData({ link: data.referralLink, code: data.referralCode });
                onSuccess(data);
            } else {
                setStatus('error');
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setError('A network error occurred. Please check your connection.');
        }
    };

    const addNetworkToMetamask = async () => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
                await (window as any).ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x232A', // 9002 in hex
                        chainName: KORTANA_MAINNET_INFO.name,
                        nativeCurrency: { name: 'Dinar', symbol: 'DNR', decimals: 18 },
                        rpcUrls: [KORTANA_MAINNET_INFO.rpc],
                        blockExplorerUrls: [KORTANA_MAINNET_INFO.explorer]
                    }]
                });
            } catch (err) {
                console.error('Failed to add network', err);
            }
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    };

    if (status === 'success' && referralData) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl space-y-10"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-5 bg-green-500/20 text-green-500 rounded-full">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-white font-space">Welcome to Kortana, {formData.fullName.split(' ')[0]}!</h2>
                    <p className="text-gray-400 max-w-lg">Your registration is complete. Your transaction is now being verified on-chain.</p>
                </div>

                <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="text-indigo-400" />
                        <h3 className="text-xl font-bold text-white font-space">Crucial: Setup Your Wallet</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">To view and manage your <strong>Dinar (DNR)</strong> tokens, you must add the Kortana Mainnet to your wallet. You can do this automatically below:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={addNetworkToMetamask}
                            className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition group"
                        >
                            <Plus size={20} /> Add to MetaMask
                        </button>
                        <div className="bg-deep-space/50 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Chain ID</p>
                            <p className="text-sm font-bold text-indigo-400">9002 (Mainnet)</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-black mb-2">Manual Settings</p>
                        <ul className="text-xs space-y-1 font-mono text-gray-400">
                            <li>RPC: {KORTANA_MAINNET_INFO.rpc}</li>
                            <li>Symbol: {KORTANA_MAINNET_INFO.symbol}</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Share Your Referral Link & Earn 10%</p>
                    <div className="w-full flex gap-3">
                        <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-indigo-400 font-mono text-xs truncate">
                            {referralData.link}
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(referralData.link)}
                            className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-12">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'
                            }`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-white/10'}`} />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step1"
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-black text-white font-space mb-2">Step 1: Choose Your Tier</h2>
                            <p className="text-gray-400">Select the contribution level that fits your investment strategy.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['starter', 'professional', 'enterprise'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleTierSelection(t)}
                                    className={`p-6 rounded-3xl border text-left transition-all ${formData.tier === t
                                        ? 'bg-indigo-600/20 border-indigo-500 shadow-xl shadow-indigo-500/10'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">{t}</p>
                                    <p className="text-xl font-black text-white mb-4">
                                        {t === 'starter' ? '$1,000' : t === 'professional' ? '$5,000' : '$10,000'}+
                                    </p>
                                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                                        Select <ArrowRight size={14} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step2"
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-white font-space mb-2">Step 2: Configure & Pay</h2>
                                <p className="text-gray-400">Total tokens and preferred payment network.</p>
                            </div>
                            <button onClick={prevStep} className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-2 pb-2">
                                <ArrowLeft size={14} /> Change Tier
                            </button>
                        </div>

                        {/* Token Calculator */}
                        <div className="bg-indigo-600/5 border border-indigo-600/20 p-8 rounded-[32px] space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex justify-between">
                                    <span>Purchase Amount (DNR)</span>
                                    <span className="text-indigo-400">Yield Price: ${getPricePerToken()}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tokenAmount}
                                        onChange={(e) => setTokenAmount(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none focus:border-indigo-500 text-3xl font-black text-white transition font-space"
                                        placeholder="Enter Amount"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold uppercase tracking-widest">DNR</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Valuation (USD)</p>
                                    <p className="text-2xl font-black text-white font-space">${calculateCost().usd.toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-indigo-600/10 rounded-2xl border border-indigo-600/20">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Investor Status</p>
                                    <p className="text-2xl font-black text-indigo-400 font-space uppercase italic">{formData.tier}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Choose Payment Network</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {PAYMENT_PLATFORMS.map((platform) => (
                                    <button
                                        key={platform.id}
                                        onClick={() => setSelectedPlatform(platform)}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center ${selectedPlatform?.id === platform.id
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/5'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <img src={platform.icon} alt={platform.name} className="w-8 h-8 rounded-full shadow-lg" />
                                        <p className="text-[10px] font-bold text-white uppercase tracking-tighter">{platform.symbol}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedPlatform && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-deep-space p-8 rounded-[32px] border border-white/5 space-y-6"
                            >
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <img src={selectedPlatform.icon} className="w-6 h-6 rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount to Send</p>
                                            <p className="text-2xl font-black text-indigo-400 font-space">
                                                {calculateCost().crypto.toFixed(selectedPlatform.id === 'eth' || selectedPlatform.id === 'sol' ? 4 : 2)} {selectedPlatform.symbol}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Market Price</p>
                                        <p className="text-xs font-bold text-white font-mono">${cryptoPrices[selectedPlatform.id]?.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Deposit Address</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl text-indigo-400 font-mono text-sm break-all leading-relaxed">
                                            {selectedPlatform.address}
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(selectedPlatform.address)}
                                            className="bg-indigo-600 px-6 rounded-2xl hover:bg-indigo-700 transition"
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                                    <AlertTriangle className="text-amber-500 shrink-0" />
                                    <p className="text-xs text-amber-500/80 font-bold leading-relaxed">Ensure you have sent the payment on-chain before clicking the button below. You will need your Transaction Hash/Link in the next step.</p>
                                </div>

                                <button
                                    onClick={nextStep}
                                    className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition"
                                >
                                    I Have Sent The Payment <ArrowRight className="inline ml-2" />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step3"
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-white font-space mb-2">Step 3: Personal Details</h2>
                                <p className="text-gray-400">Complete your registration and provide payment proof.</p>
                            </div>
                            <button onClick={prevStep} className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-2 pb-2">
                                <ArrowLeft size={14} /> Back to Payment
                            </button>
                        </div>

                        {/* Investment Summary Table */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                            <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Investment Summary</span>
                                <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-[9px] font-black rounded uppercase">{formData.tier}</span>
                            </div>
                            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Tokens</p>
                                    <p className="text-lg font-black text-white">{(tokenAmount || 0).toLocaleString()} DNR</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Cost</p>
                                    <p className="text-lg font-black text-white">${calculateCost().usd.toLocaleString()} USDT</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Price/Token</p>
                                    <p className="text-lg font-black text-indigo-400">${getPricePerToken()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Network</p>
                                    <p className="text-lg font-black text-white">{selectedPlatform?.name.split(' ')[0]}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                        <User size={12} /> Full Name
                                    </label>
                                    <input required type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-white"
                                        value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                        <Mail size={12} /> Email Address
                                    </label>
                                    <input required type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-white"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                    <ExternalLink size={12} /> Full Explorer URL Receipt
                                </label>
                                <input required type="text" placeholder="https://etherscan.io/tx/... or https://tronscan.org/#/transaction/..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none border-indigo-500/50 p-4 rounded-xl text-white font-mono text-xs transition"
                                    value={formData.txReceipt} onChange={(e) => setFormData({ ...formData, txReceipt: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                        <Wallet size={12} /> Receiver Wallet Address (To get DNR)
                                    </label>
                                    <input required type="text" placeholder="0x..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-white font-mono"
                                        value={formData.walletAddress} onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                        <Globe size={12} /> Country
                                    </label>
                                    <input required type="text" placeholder="Your Country" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-white"
                                        value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input required type="checkbox" className="w-5 h-5 rounded bg-white/10 border-white/20 checked:bg-indigo-600 transition"
                                    checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} />
                                <span className="text-[10px] text-gray-500 group-hover:text-gray-400">I confirm that the transmitted transaction receipt is authentic and belongs to me.</span>
                            </label>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex gap-2">
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition flex justify-center items-center"
                            >
                                {status === 'loading' ? 'Verifying...' : 'Finalize Whitelist Registration'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
