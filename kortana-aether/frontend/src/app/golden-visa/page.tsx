'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Upload,
    FileCheck,
    Plane,
    Globe,
    CheckCircle2,
    Lock,
    X,
    Loader2,
    Download,
    User,
    Mail,
    Briefcase,
    Wallet2,
    ArrowRight,
    ShoppingBag,
    History,
    TrendingUp,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import Link from 'next/link';

import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

interface CountryEligibility {
    name: string;
    threshold: number;
    current: number;
    eligible: boolean;
}

type AppStatus = 'ELIGIBILITY' | 'PROFILE' | 'DOCUMENTS' | 'SUBMITTED' | 'PROCESSING' | 'APPROVED_IN_PRINCIPLE' | 'COMPLETED';

export default function GoldenVisa() {
    const { address, isConnected } = useAccount();
    const [status, setStatus] = useState<AppStatus>('ELIGIBILITY');
    const [appData, setAppData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [investments, setInvestments] = useState<any[]>([]);
    const [userDocuments, setUserDocuments] = useState<any[]>([]);
    const [residencyDeposits, setResidencyDeposits] = useState<any[]>([]);
    const [allApplications, setAllApplications] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        nationality: '',
        occupation: '',
        wealthSource: '',
        investmentBudget: '',
        summary: ''
    });

    const [eligibility, setEligibility] = useState<CountryEligibility[]>([
        { name: 'Portugal', threshold: 500000, current: 0, eligible: false },
        { name: 'Greece', threshold: 250000, current: 0, eligible: false },
        { name: 'Montenegro', threshold: 450000, current: 0, eligible: false },
    ]);

    useEffect(() => {
        if (isConnected && address) {
            initData();
        } else {
            setLoading(false);
        }
    }, [address, isConnected]);

    const initData = async () => {
        setLoading(true);
        try {
            await fetchApplicationsList();
            await fetchApplication();
            await fetchInvestments();
            await fetchUserDocuments();
        } catch (error) {
            console.error('Init error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationsList = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/golden-visa/list/${address}`);
            const data = await res.json();
            setAllApplications(data.applications || []);
        } catch (err) {
            console.error('Error fetching applications list:', err);
        }
    };

    const startNewApplication = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/golden-visa/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: address })
            });
            if (res.ok) {
                await initData();
            }
        } catch (err) {
            console.error('Error starting new application:', err);
        } finally {
            setLoading(false);
        }
    };

    const switchApplication = (app: any) => {
        setAppData(app);
        setStatus(app.status);
        const deposits = app.goldenVisaDeposits || [];
        setResidencyDeposits(deposits);
        setFormData({
            firstName: app.firstName || '',
            lastName: app.lastName || '',
            email: app.email || '',
            nationality: app.nationality || '',
            occupation: app.occupation || '',
            wealthSource: app.wealthSource || '',
            investmentBudget: app.investmentBudget || '',
            summary: app.summary || ''
        });
        updateEligibility(investments, deposits);
    };

    const fetchApplication = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/golden-visa/${address}`);
            const data = await res.json();
            if (data.application) {
                switchApplication(data.application);
            }
        } catch (error) {
            console.error('App fetch error:', error);
        }
    };

    const updateEligibility = (invs: any[], deposits: any[]) => {
        setEligibility(prev => prev.map(country => {
            const totalInCountry = invs
                .filter((inv: any) => inv.property?.country?.toLowerCase() === country.name.toLowerCase())
                .reduce((sum: number, inv: any) => {
                    const amount = parseFloat(inv.tokenAmount);
                    const valuation = parseFloat(inv.property?.valuationUSD || 0);
                    const supply = parseFloat(inv.property?.totalSupply || 1) / 10 ** 18;
                    const tokenValue = amount * (valuation / (supply || 1));
                    return sum + tokenValue;
                }, 0);

            const totalDeposits = deposits
                .filter((dep: any) => dep.property?.country?.toLowerCase() === country.name.toLowerCase())
                .reduce((sum: number, dep: any) => sum + parseFloat(dep.amount), 0);

            return {
                ...country,
                current: totalInCountry + totalDeposits,
                eligible: (totalInCountry + totalDeposits) >= country.threshold
            };
        }));
    };

    const fetchUserDocuments = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/upload/user/${address}`);
            const data = await response.json();
            setUserDocuments(data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const fetchInvestments = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/investments/user/${address}`);
            const data = await response.json();
            const invs = data.investments || [];
            setInvestments(invs);
            updateEligibility(invs, residencyDeposits);
        } catch (error) {
            console.error('Error fetching investments:', error);
        }
    };

    const updateStatus = async (newStatus: AppStatus) => {
        if (!appData?.id) return;
        try {
            const res = await fetch(`http://localhost:3001/api/golden-visa/id/${appData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setStatus(newStatus);
                setAppData((prev: any) => prev ? { ...prev, status: newStatus } : null);
                await fetchApplicationsList();
            }
        } catch (error) {
            console.error('Status update error:', error);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appData?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/golden-visa/id/${appData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: 'DOCUMENTS' })
            });
            if (res.ok) {
                setStatus('DOCUMENTS');
                const updated = await res.json();
                if (updated.application) {
                    setAppData(updated.application);
                }
                await fetchApplicationsList();
            }
        } catch (error) {
            console.error('Form submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                headers: { 'x-user-address': address as string },
                body: fd,
            });
            if (response.ok) {
                fetchUserDocuments();
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const finalizeSubmission = async () => {
        setLoading(true);
        await updateStatus('SUBMITTED');
        setTimeout(() => updateStatus('PROCESSING'), 2000);
        setLoading(false);
    };

    const renderStepContent = () => {
        switch (status) {
            case 'ELIGIBILITY':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                        <div className="w-24 h-24 bg-[#DC143C]/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShieldCheck size={40} className="text-[#DC143C]" />
                        </div>
                        <h3 className="text-2xl font-black text-[#0A1929] mb-4">Initial Assessment</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed font-medium">
                            We begin by scanning your portfolio. You can proceed to the application even while your investments are in progress.
                        </p>
                        <button
                            onClick={() => updateStatus('PROFILE')}
                            className="bg-[#0A1929] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Start Application <ArrowRight className="inline-block ml-2" size={16} />
                        </button>
                    </motion.div>
                );

            case 'PROFILE':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-2xl font-black text-[#0A1929] mb-6">Tell us about yourself</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">First Name</label>
                                    <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#DC143C] transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Last Name</label>
                                    <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#DC143C] transition-all font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#DC143C] transition-all font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Nationality</label>
                                    <input type="text" required value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#DC143C] transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Investment Budget (€)</label>
                                    <input type="text" placeholder="e.g. 500,000" value={formData.investmentBudget} onChange={e => setFormData({ ...formData, investmentBudget: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#DC143C] transition-all font-bold" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-[#0A1929] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#DC143C] transition-all">
                                Save & Continue
                            </button>
                        </form>
                    </motion.div>
                );

            case 'DOCUMENTS':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-[#0A1929] mb-4">Document Vault</h3>
                            <p className="text-gray-400 text-sm mb-10 font-medium">Please upload your Passport, Proof of Funds, and Bank Statements.</p>
                        </div>
                        <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center bg-gray-50/30">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6">
                                {uploading ? <Loader2 className="animate-spin text-[#DC143C]" /> : <Upload className="text-[#0A1929]" />}
                            </div>
                            <input type="file" id="fileInp" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                            <button onClick={() => document.getElementById('fileInp')?.click()} className="px-8 py-4 bg-[#0A1929] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#DC143C] transition-all">
                                Select File
                            </button>
                        </div>

                        {userDocuments.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uploaded Files ({userDocuments.length})</h4>
                                {userDocuments.map((doc, i) => (
                                    <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center">
                                        <span className="text-xs font-bold text-[#0A1929]">{doc.fileName}</span>
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    </div>
                                ))}
                                <button onClick={finalizeSubmission} className="w-full py-5 bg-[#DC143C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl mt-6">
                                    Submit for Legal Review
                                </button>
                            </div>
                        )}
                    </motion.div>
                );

            case 'SUBMITTED':
            case 'PROCESSING':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Loader2 className="animate-spin text-amber-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[#0A1929] mb-4">Application Pending</h3>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed font-medium">
                            Your application is currently under **Legal Review**. Our compliance team is verifying your documentation against EU standards.
                        </p>

                        <div className="flex flex-col items-center space-y-6 mt-10">
                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl inline-flex items-center space-x-3">
                                <History size={20} className="text-amber-500" />
                                <span className="text-xs font-black uppercase text-amber-600 tracking-widest">Expected Turnaround: 24-48 Hours</span>
                            </div>

                            {/* Dev/Demo Bypass */}
                            <button
                                onClick={() => updateStatus('APPROVED_IN_PRINCIPLE')}
                                className="text-[10px] font-black text-gray-300 hover:text-[#DC143C] transition-colors border border-dashed border-gray-200 px-4 py-2 rounded-lg"
                            >
                                [DEV] SIMULATE LEGAL APPROVAL
                            </button>
                        </div>
                    </motion.div>
                );

            case 'APPROVED_IN_PRINCIPLE':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <div className="bg-green-50 p-10 rounded-[3rem] border border-green-100 text-center relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200/20 blur-3xl rounded-full"></div>
                            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                                <FileCheck size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-green-600 mb-2">Approved in Principle</h3>
                            <p className="text-green-700/70 font-medium max-w-xs mx-auto mb-6">Congratulations! Your eligibility has been verified. You may now proceed with your final investment to secure your residency.</p>

                            {residencyDeposits.length > 0 && (
                                <div className="bg-white/50 p-6 rounded-2xl border border-green-200 inline-block text-left w-full max-w-sm">
                                    <h4 className="text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">Linked Assets ({residencyDeposits.length})</h4>
                                    <div className="space-y-2">
                                        {residencyDeposits.map((dep, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs font-bold text-green-700">
                                                <span>{dep.property?.title}</span>
                                                <span>€{dep.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/marketplace">
                            <button className="w-full py-6 bg-[#0A1929] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-[#DC143C] transition-all flex items-center justify-center space-x-4 group">
                                <ShoppingBag size={20} />
                                <span>Go to Marketplace</span>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-[#F8FAFC]">
                <Header />
                <div className="pt-40 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-gray-400" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0A1929] mb-4">Connect Wallet Required</h1>
                    <p className="text-gray-500 font-medium">Access the private residency concierge by connecting your secure wallet.</p>
                </div>
            </main>
        );
    }

    const steps = [
        { id: 'ELIGIBILITY', label: 'Eligibility', icon: ShieldCheck },
        { id: 'PROFILE', label: 'Your Profile', icon: User },
        { id: 'DOCUMENTS', label: 'Documents', icon: Upload },
        { id: 'PROCESSING', label: 'Processing', icon: Loader2 },
        { id: 'APPROVED_IN_PRINCIPLE', label: 'Approval', icon: CheckCircle2 }
    ];

    const currentStatus = (status.includes('SUBMITTED') || status.includes('PROCESSING')) ? 'PROCESSING' : status;
    const currentStepIndex = steps.findIndex(s => s.id === currentStatus);

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Header />
            <div className="pt-40 pb-20 max-w-7xl mx-auto px-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-[#DC143C]/10 text-[#DC143C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Globe size={12} />
                            <span>Aether Residency Ecosystem</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#0A1929] tracking-tight leading-none mb-4">
                            Global Mobility <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#0A1929]">Dashboard</span>
                        </h1>
                    </div>

                    <div className="flex bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                        {steps.map((s, i) => {
                            const isPast = i < currentStepIndex;
                            const isCurrent = i === currentStepIndex;
                            return (
                                <div key={s.id} className="flex items-center">
                                    <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl transition-all duration-500 ${isCurrent ? 'bg-[#0A1929] text-white shadow-lg' : isPast ? 'text-green-500' : 'text-gray-300'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-white/10' : isPast ? 'bg-green-50' : 'bg-gray-50'}`}>
                                            <s.icon size={16} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{s.label}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="mx-2 text-gray-100 flex items-center">
                                            <ArrowRight size={14} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl p-12 relative overflow-hidden min-h-[600px] flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-[100px] -z-10 opacity-50"></div>
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <Loader2 className="animate-spin text-[#DC143C]" size={40} />
                                    <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Synchronizing Application...</p>
                                </div>
                            ) : renderStepContent()}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Application History */}
                        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black text-[#0A1929] uppercase tracking-widest flex items-center">
                                    <Globe size={14} className="mr-2 text-[#DC143C]" />
                                    Application History ({allApplications.length})
                                </h3>
                                <button
                                    onClick={startNewApplication}
                                    className="p-2 bg-gray-50 rounded-full hover:bg-[#DC143C] hover:text-white transition-all group"
                                    title="Start New Application"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                                {allApplications.map((app, i) => (
                                    <div
                                        key={app.id}
                                        onClick={() => switchApplication(app)}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${appData?.id === app.id ? 'bg-[#0A1929] border-[#0A1929] text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-[#DC143C]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                                                {app.status.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[8px] opacity-60 font-bold uppercase">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-bold truncate">
                                            {app.firstName ? `${app.firstName} ${app.lastName}` : `Draft Application #${app.id}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Financial Progress Section */}
                        <section className="bg-[#0A1929] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#DC143C]/20 blur-[60px] rounded-full -mr-20 -mt-20"></div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">Residency Capital</h3>
                            <div className="space-y-6">
                                {eligibility.map(country => (
                                    <div key={country.name} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-gray-400">{country.name}</span>
                                            <span className={country.eligible ? 'text-green-400' : 'text-[#DC143C]'}>
                                                €{country.current.toLocaleString()} / €{country.threshold.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (country.current / country.threshold) * 100)}%` }}
                                                className={`h-full ${country.eligible ? 'bg-green-500' : 'bg-[#DC143C]'}`}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[8px] font-bold text-gray-500 uppercase">
                                            <span>Remaining</span>
                                            <span>€{Math.max(0, country.threshold - country.current).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Payment Ledger */}
                        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-[#0A1929] uppercase tracking-widest mb-6 flex items-center">
                                <History size={14} className="mr-2 text-[#DC143C]" />
                                Payment Ledger
                            </h3>
                            <div className="space-y-4">
                                {residencyDeposits.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-[10px] font-bold text-gray-300 uppercase">No deposits recorded yet</p>
                                    </div>
                                ) : (
                                    residencyDeposits.map((dep, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#DC143C]">
                                                    <TrendingUp size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-[#0A1929] mb-0.5">{dep.property?.title || 'Property Deposit'}</div>
                                                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(dep.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black text-[#00E676]">€{dep.amount.toLocaleString()}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
