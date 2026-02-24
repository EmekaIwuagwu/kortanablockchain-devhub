"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Globe, Wallet, Calendar, Search, Download, Trash2, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/presale/admin/registrations');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadCSV = () => {
        const headers = ['FullName', 'Email', 'Phone', 'Country', 'Wallet', 'Tier', 'Date'];
        const rows = users.map(u => [
            u.fullName,
            u.email,
            u.phone,
            u.country,
            u.walletAddress,
            u.tier,
            new Date(u.createdAt).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "kortana_investors.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="bg-deep-space min-h-screen text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="text-indigo-500" size={20} />
                            <h1 className="text-3xl font-black font-space">Presale Admin</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Monitor and manage whitelist registrations</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition"
                        >
                            <Download size={18} /> Export CSV
                        </button>
                        <button
                            onClick={fetchUsers}
                            className="px-6 py-3 bg-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
                        >
                            Refresh Data
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Users className="text-indigo-400 mb-4" size={24} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Investors</p>
                        <p className="text-2xl font-black">{users.length}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Globe className="text-emerald-400 mb-4" size={24} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Countries</p>
                        <p className="text-2xl font-black">{new Set(users.map(u => u.country)).size}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Mail className="text-amber-400 mb-4" size={24} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Last 24 Hours</p>
                        <p className="text-2xl font-black">{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 86400000)).length}</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search investors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-indigo-500 text-sm transition"
                        />
                    </div>
                </div>

                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                <th className="px-6 py-4">Investor</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Tier</th>
                                <th className="px-6 py-4">Wallet Address</th>
                                <th className="px-6 py-4">Date Joined</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredUsers.map((user, idx) => (
                                <tr key={user._id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-white">{user.fullName}</p>
                                        <p className="text-xs text-indigo-400">{user.country}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">
                                        <p>{user.email}</p>
                                        <p>{user.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                                                user.tier === 'professional' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {user.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {loading && (
                        <div className="p-20 text-center text-gray-500 animate-pulse">
                            Loading registration data...
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="p-20 text-center text-gray-500 italic">
                            No investors found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
