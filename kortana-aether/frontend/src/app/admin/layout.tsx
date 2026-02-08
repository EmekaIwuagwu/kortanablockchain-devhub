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
    Search
} from 'lucide-react';
import { LogoText } from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

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
        { name: 'Manage Properties', href: '/admin/dashboard', icon: Building2 }, // Reusing dashboard for list for now
        { name: 'Add Property', href: '/admin/properties/add', icon: PlusCircle },
        { name: 'Users / Investors', href: '#', icon: Users },
        { name: 'Analytics', href: '#', icon: PieChart },
        { name: 'Settings', href: '#', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex">
            {/* Sidebar */}
            <aside className="w-80 bg-[#0A1929] text-white flex flex-col h-screen sticky top-0">
                <div className="p-8">
                    <LogoText isLightMode={false} />
                    <div className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Management Suite</div>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${pathname === item.href
                                    ? 'bg-[#DC143C] text-white shadow-lg shadow-[#DC143C]/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-4 px-6 py-4 w-full rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search assets, transactions..."
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#DC143C]/20"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-3 text-gray-400 hover:text-[#0A1929] transition-colors bg-gray-50 rounded-xl">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#DC143C] rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
                            <div className="text-right">
                                <div className="text-sm font-extrabold text-[#0A1929]">Admin Station</div>
                                <div className="text-xs text-[#DC143C] font-bold">System Manager</div>
                            </div>
                            <div className="w-12 h-12 bg-[#0A1929] rounded-xl flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-10 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
