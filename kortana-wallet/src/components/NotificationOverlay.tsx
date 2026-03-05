'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';

export const NotificationOverlay: React.FC = () => {
    const { notification } = useWalletStore();

    if (!notification) return null;

    const icons = {
        success: <CheckCircle2 className="text-emerald-400" size={20} />,
        error: <AlertCircle className="text-rose-400" size={20} />,
        info: <Info className="text-cyan-400" size={20} />,
    };

    const bgs = {
        success: 'bg-emerald-500/10 border-emerald-500/20',
        error: 'bg-rose-500/10 border-rose-500/20',
        info: 'bg-cyan-500/10 border-cyan-500/20',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
            >
                <div className={`
                    min-w-[280px] max-w-sm glass-panel py-3 px-4 rounded-2xl border flex items-center gap-3 
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl pointer-events-auto
                    ${bgs[notification.type]}
                `}>
                    <div className="shrink-0">
                        {icons[notification.type]}
                    </div>
                    <p className="text-sm font-medium text-white flex-1 leading-tight">
                        {notification.message}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
