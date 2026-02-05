import React from 'react';

const SplashScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#050608] overflow-hidden">
            <div className="relative flex flex-col items-center animate-fade-in max-w-2xl px-8">
                {/* Visual Image Container */}
                <div className="relative group transition-transform duration-700 hover:scale-105">
                    {/* Atmospheric Glow */}
                    <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-[80px] opacity-40 animate-pulse-slow"></div>
                    <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-3xl blur-2xl opacity-30"></div>

                    <img
                        src="/logo.png"
                        alt="Kortana Studio"
                        className="relative w-full max-h-[60vh] object-contain drop-shadow-[0_0_30px_rgba(99,102,241,0.3)] rounded-2xl"
                    />
                </div>

                {/* Advanced Progress bar */}
                <div className="mt-12 w-80 relative">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-vscode-muted/40 uppercase tracking-[0.4em] text-[8px] font-bold">System Status</span>
                        <span className="text-indigo-400 font-mono text-[9px]">v1.0.4-LATEST</span>
                    </div>
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-full animate-loading-bar"></div>
                    </div>

                    <div className="mt-6 flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-2 text-vscode-muted font-medium text-[10px] tracking-wider">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span>Synchronizing Blockchain Node...</span>
                        </div>
                        <p className="text-white/10 text-[9px] uppercase tracking-widest">Kortana Distributed Environment</p>
                    </div>
                </div>
            </div>

            {/* Matrix-like decorative grain/noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-200 grayscale mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Corner Info */}
            <div className="fixed bottom-8 left-8 flex items-center space-x-4 opacity-20">
                <div className="w-12 h-[1px] bg-white/30" />
                <span className="text-[10px] text-white tracking-[0.5em] uppercase font-light">Advanced Agency</span>
            </div>
        </div>
    );
};

export default SplashScreen;
