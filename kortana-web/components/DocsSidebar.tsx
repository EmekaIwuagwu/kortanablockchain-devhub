'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Book, Code, Terminal, Activity, Shield, Layers, Rocket, Settings, Info } from 'lucide-react';

const docGroups = [
    {
        title: "Learn",
        items: [
            { label: "Introduction", href: "/docs/introduction", icon: <Info size={14} /> },
            { label: "Consensus (DPoH)", href: "/docs/consensus", icon: <Shield size={14} /> },
            { label: "Architecture", href: "/docs/architecture", icon: <Layers size={14} /> },
            { label: "Tokenomics", href: "/docs/tokenomics", icon: <Activity size={14} /> },
        ]
    },
    {
        title: "Build",
        items: [
            { label: "Quick Start", href: "/docs/quick-start", icon: <Rocket size={14} /> },
            { label: "Network Config", href: "/docs/network", icon: <Settings size={14} /> },
            { label: "Standards", href: "/docs/standards", icon: <Book size={14} /> },
        ]
    },
    {
        title: "Reference",
        items: [
            { label: "JSON-RPC API", href: "/docs/api", icon: <Terminal size={14} /> },
            { label: "Rust SDK", href: "/docs/rust-sdk", icon: <Code size={14} /> },
            { label: "CLI Reference", href: "/docs/cli", icon: <Terminal size={14} /> },
        ]
    }
];

export default function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-64 shrink-0 h-fit lg:sticky lg:top-32 space-y-8">
            {docGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-2">{group.title}</h4>
                    <nav className="space-y-1">
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between group px-4 py-2.5 rounded-xl transition-all ${pathname === item.href
                                        ? "bg-white/5 border border-white/10 text-white"
                                        : "text-gray-500 hover:text-white hover:bg-white/[0.02]"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`${pathname === item.href ? 'text-cyan-400' : 'text-gray-700 group-hover:text-gray-400'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                                </div>
                                {pathname === item.href && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
            ))}
        </aside>
    );
}
