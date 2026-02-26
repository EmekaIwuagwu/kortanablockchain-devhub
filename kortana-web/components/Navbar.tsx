'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-deep-space/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 transition-all group-hover:scale-110 group-hover:rotate-3 duration-500">
                <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src="/logo.png"
                  alt="Kortana Logo"
                  fill
                  className="object-contain relative z-10"
                  priority
                />
              </div>
              <span className="font-black text-2xl tracking-[0.1em] text-white font-sans group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                KORTANA
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLink href="/technology">Technology</NavLink>
              <NavLink href="/developers">Developers</NavLink>
              <NavLink href="/docs">Docs Hub</NavLink>
              <NavLink href="/community">Community</NavLink>
            </div>
          </div>
          <div className="hidden md:block">
            <button
              onClick={async () => {
                const { connectWallet } = await import('@/lib/wallet');
                await connectWallet();
              }}
              className="bg-white text-deep-space px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]"
            >
              Launch App <ChevronRight size={14} />
            </button>
          </div>
          <div className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-400 hover:text-white relative group text-xs font-black uppercase tracking-widest transition-colors">
      {children}
      <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-cyan-400 theme-transition group-hover:w-full transition-all duration-300"></span>
    </Link>
  )
}
