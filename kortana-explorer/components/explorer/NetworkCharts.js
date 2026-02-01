'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const data = [
    { name: '00:00', tps: 2.4, gas: 1.2 },
    { name: '04:00', tps: 5.6, gas: 1.5 },
    { name: '08:00', tps: 12.8, gas: 2.1 },
    { name: '12:00', tps: 8.4, gas: 1.8 },
    { name: '16:00', tps: 15.2, gas: 2.4 },
    { name: '20:00', tps: 9.1, gas: 1.9 },
    { name: '23:59', tps: 4.5, gas: 1.4 },
];

const NetworkCharts = () => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div style={{ height: '350px', marginTop: '2rem' }}></div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            <div className="glass-card" style={{ height: '350px' }}>
                <h3 className="font-heading mb-6" style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>TRANSACTIONS PER SECOND (24H)</h3>
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-light)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary-light)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--primary-light)' }}
                        />
                        <Area type="monotone" dataKey="tps" stroke="var(--primary-light)" fillOpacity={1} fill="url(#colorTps)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ height: '350px' }}>
                <h3 className="font-heading mb-6" style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>GAS PRICE TREND (GWEI)</h3>
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--accent)' }}
                        />
                        <Line type="monotone" dataKey="gas" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default NetworkCharts;
