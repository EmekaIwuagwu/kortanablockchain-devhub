"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Mail, Globe, Wallet, Calendar, Search, Download, Trash2, Shield, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        checkAuth();
        fetchUsers();
    }, []);

    const checkAuth = async () => {
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(row => row.startsWith('presale_admin_auth='));

        if (!authCookie) {
            router.push('/presale/admin/login');
            return false;
        }
        return true;
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/presale/admin/registrations');

            if (res.status === 401) {
                router.push('/presale/admin/login');
                return;
            }

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
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadCSV = () => {
        const headers = ['FullName', 'Email', 'Phone', 'Country', 'Wallet', 'Tier', 'TxHash', 'Status', 'Date'];
        const rows = users.map(u => [
            u.fullName,
            u.email,
            u.phone,
            u.country,
            u.walletAddress,
            u.tier,
            u.transactionHash || 'N/A',
            u.paymentStatus || 'Awaiting',
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
                            <h1 className="text-3xl font-black font-space">Presale Management</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Real-time payment verification & whitelist control</p>
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
                        <Shield className="text-emerald-400 mb-4" size={24} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Paid/Pending</p>
                        <p className="text-2xl font-black">{users.filter(u => u.transactionHash).length}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Globe className="text-amber-400 mb-4" size={24} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Countries</p>
                        <p className="text-2xl font-black">{new Set(users.map(u => u.country)).size}</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Name, Wallet, or TX..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-indigo-500 text-sm transition"
                        />
                    </div>
                </div>

                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/10 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                <th className="px-6 py-5">Investor Info</th>
                                <th className="px-6 py-5">Requested Tokens</th>
                                <th className="px-6 py-5">Tier & Payment</th>
                                <th className="px-6 py-5">On-Chain Receipt</th>
                                <th className="px-6 py-5">Registered Wallet</th>
                                <th className="px-6 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition group">
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-white">{user.fullName}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-[10px] text-indigo-400 mt-1">{user.country}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <p className="font-black text-white text-base">{(user.tokenAmount || 0).toLocaleString()} <span className="text-[10px] text-gray-500">DNR</span></p>
                                            <p className="text-xs font-bold text-green-500">${(user.usdCost || 0).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-2">
                                            <span className={`w-fit px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                                                user.tier === 'professional' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {user.tier}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.paymentStatus === 'confirmed' ? 'bg-green-500' :
                                                    user.paymentStatus === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-gray-600'
                                                    }`} />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {user.paymentStatus === 'pending' ? 'VERIFICATION PENDING' :
                                                        user.paymentStatus === 'confirmed' ? 'PAYMENT VERIFIED' : 'AWAITING PAYMENT'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-mono text-xs">
                                        {user.transactionHash ? (
                                            <a
                                                href={
                                                    user.transactionHash.startsWith('http') ? user.transactionHash :
                                                        user.paymentMethod?.toLowerCase().includes('trc') ? `https://tronscan.org/#/transaction/${user.transactionHash}` :
                                                            user.paymentMethod?.toLowerCase().includes('polygon') ? `https://polygonscan.com/tx/${user.transactionHash}` :
                                                                `https://etherscan.io/tx/${user.transactionHash}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
                                            >
                                                <span className="truncate max-w-[120px]">{user.transactionHash}</span>
                                                <ExternalLink size={14} />
                                            </a>
                                        ) : (
                                            <span className="text-gray-600 italic">No receipt submitted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 font-mono text-xs text-gray-500">
                                        {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Confirm payment for this investor?')) {
                                                        await fetch('/api/presale/admin/users', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ userId: user._id, status: 'confirmed' }),
                                                        });
                                                        fetchUsers();
                                                    }
                                                }}
                                                disabled={user.paymentStatus === 'confirmed'}
                                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition uppercase ${user.paymentStatus === 'confirmed' ? 'bg-gray-500/10 text-gray-500' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    }`}
                                            >
                                                {user.paymentStatus === 'confirmed' ? 'Verified' : 'Confirm'}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete this registration?')) {
                                                        await fetch('/api/presale/admin/users', {
                                                            method: 'DELETE',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ userId: user._id }),
                                                        });
                                                        fetchUsers();
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {loading && (
                        <div className="p-20 text-center text-gray-500 animate-pulse font-space uppercase tracking-[0.2em] text-xs">
                            Synchronizing with Blockchain Data...
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="p-20 text-center text-gray-500 italic">
                            No matching records found in the database.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
