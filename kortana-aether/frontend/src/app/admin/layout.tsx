'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    PieChart,
    PlusCircle,
    Bell,
    Search,
    FileText
} from 'lucide-react';
import { LogoText } from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const adminAddress = '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9';

    useEffect(() => {
        setIsMounted(true);
        const token = localStorage.getItem('admin_token');
        if (!token && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [pathname, router]);

    if (!isMounted) return null;
    if (pathname === '/admin/login') return <>{children}</>;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users / Investors', href: '/admin/users', icon: Users },
        { name: 'Transactions', href: '/admin/transactions', icon: FileText },
        { name: 'Onboard Asset', href: '/admin/properties/add', icon: PlusCircle },
        { name: 'Analytics', href: '#', icon: PieChart },
        { name: 'Settings', href: '#', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
            {/* Sidebar */}
            <aside className="w-80 bg-[#0A1929] text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20">
                <div className="p-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#DC143C] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[#DC143C]/20">A</div>
                        <span className="text-2xl font-black tracking-tighter">AETHER<span className="text-[#DC143C]">.</span></span>
                    </div>
                    <div className="mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] pl-1">Management OS v2.0</div>
                </div>

                <nav className="flex-1 px-6 space-y-1 mt-6">
                    <div className="px-6 mb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Main Menu</div>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm group ${pathname === item.href
                                ? 'bg-[#DC143C] text-white shadow-xl shadow-[#DC143C]/20 translate-x-1'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-gray-500 group-hover:text-[#DC143C] transition-colors'} />
                            <div className="flex-1 flex justify-between items-center">
                                <span>{item.name}</span>
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-8">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">System Health</div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-300">Nodes</span>
                            <span className="text-xs font-bold text-[#00E676]">Active</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#00E676] h-full w-[94%] shadow-[0_0_10px_#00E676]"></div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-4 px-6 py-4 w-full rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm mt-6"
                    >
                        <LogOut size={20} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen max-w-[calc(100vw-320px)]">
                {/* Header */}
                <header className="h-28 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-10 shadow-sm">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{pathname.split('/').pop()?.replace('-', ' ')}</h2>
                        <div className="text-2xl font-black text-[#0A1929]">{pathname === '/admin/dashboard' ? 'Overview' : 'Asset Management'}</div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="relative hidden xl:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Global search..."
                                className="w-80 bg-gray-100/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#DC143C]/20 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center space-x-6">
                            <button className="relative p-3.5 text-gray-400 hover:text-[#DC143C] transition-all bg-gray-100 rounded-2xl group">
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#DC143C] rounded-full border-2 border-white animate-pulse"></span>
                            </button>
                            <div className="flex items-center space-x-5 pl-8 border-l border-gray-100">
                                <div className="text-right">
                                    <div className="text-sm font-black text-[#0A1929]">Administrator</div>
                                    <div className="text-[10px] text-[#DC143C] font-black uppercase tracking-widest">Key Holder</div>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-[#0A1929] to-[#1a2e44] rounded-2xl flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-xl">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-12 flex-1 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
