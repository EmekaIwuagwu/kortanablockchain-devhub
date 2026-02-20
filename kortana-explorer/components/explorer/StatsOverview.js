import React from 'react';
import { Box, Activity, Users, Zap } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, suffix }) => (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'var(--primary)',
            filter: 'blur(60px)',
            opacity: '0.1',
            zIndex: 0
        }}></div>
        <div className="flex items-center justify-between mb-4" style={{ position: 'relative', zIndex: 1 }}>
            <span className="text-dim text-small font-heading" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(157, 78, 221, 0.15)', color: 'var(--primary-light)', boxShadow: '0 0 15px rgba(157, 78, 221, 0.1)' }}>
                <Icon size={20} />
            </div>
        </div>
        <div className="flex items-end gap-2" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '700', letterSpacing: '-0.02em' }}>{value}</h2>
            {suffix && <span className="text-dim mb-1 font-heading" style={{ fontSize: '0.8rem' }}>{suffix}</span>}
        </div>

        {change && (
            <div className="text-small mt-2 flex items-center gap-1" style={{ color: change.startsWith('+') ? 'var(--success)' : 'var(--error)', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{change}</span>
                <span className="text-dim" style={{ fontSize: '0.75rem' }}>last 24h</span>
            </div>
        )}
    </div>
);

const StatsOverview = ({ stats }) => {
    return (
        <div className="stats-grid">
            <StatCard
                title="DNR PRICE"
                value="$1.24"
                icon={Zap}
                change="+5.2%"
            />
            <StatCard
                title="TRANSACTIONS"
                value="45.2M"
                icon={Activity}
                suffix="TXNS"
            />
            <StatCard
                title="LATEST BLOCK"
                value={stats?.latestBlock || '1,245,678'}
                icon={Box}
            />
            <StatCard
                title="ACTIVE VALIDATORS"
                value="50"
                icon={Users}
                suffix="/ 50"
            />
        </div>
    );
};

export default StatsOverview;
