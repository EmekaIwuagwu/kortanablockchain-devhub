'use client';

import React from 'react';

export const Logo = ({ className = "w-10 h-10", isLightMode = true }: { className?: string, isLightMode?: boolean }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="crimsonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC143C" />
                <stop offset="100%" stopColor="#B22222" />
            </linearGradient>
        </defs>
        {/* Abstract A shape formed by rising pillars/blocks */}
        <path d="M50 10L90 90H70L60 70H40L30 90H10L50 10Z" fill="url(#crimsonGradient)" />
        <path d="M40 70H60L50 50L40 70Z" fill={isLightMode ? "white" : "#0A1929"} />
        {/* Blockchain nodes/connection points */}
        <circle cx="10" cy="90" r="6" fill={isLightMode ? "#0A1929" : "white"} />
        <circle cx="90" cy="90" r="6" fill={isLightMode ? "#0A1929" : "white"} />
        <circle cx="50" cy="10" r="6" fill={isLightMode ? "#0A1929" : "white"} />
    </svg>
);

export const LogoText = ({ isLightMode = true }: { isLightMode?: boolean }) => (
    <div className="flex items-center space-x-2">
        <Logo isLightMode={isLightMode} />
        <span className={`text-2xl font-extrabold tracking-tight ${isLightMode ? 'text-[#0A1929]' : 'text-white'}`}>
            AETHER
        </span>
    </div>
);
