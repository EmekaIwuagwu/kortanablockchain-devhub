'use client'

import React from 'react'
import { Hero } from '@/components/home/Hero'
import { Advantage } from '@/components/home/Advantage'
import { EcosystemPreview } from '@/components/home/EcosystemPreview'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#020408]">
            <Hero />
            <Advantage />
            <EcosystemPreview />

            {/* Footer Simple (Full footer to come in next phase) */}
            <footer className="py-20 border-t border-white/5 text-center">
                <div className="container mx-auto">
                    <p className="text-white/20 font-mono text-sm">© 2026 KORTANA FOUNDATION</p>
                </div>
            </footer>
        </main>
    )
}
