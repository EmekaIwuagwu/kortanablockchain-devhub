'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    ShieldCheck,
    ShieldAlert,
    MoreHorizontal,
    Wallet,
    DollarSign,
    Filter,
    Clock,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, VERIFIED

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/users');
            const data = await response.json();
            setUsers(data.users || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleKycUpdate = async (address: string, status: string) => {
        try {
            await fetch(`http://localhost:3001/api/users/${address}/kyc`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchUsers(); // Refresh
        } catch (error) {
            console.error('Error updating KYC:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === 'ALL' ? true : user.kycStatus === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-[#0A1929] mb-2 tracking-tight">Investor Registry</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Compliance & Identity Management</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Wallet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-[#0A1929] outline-none focus:border-[#DC143C] transition-colors w-64 shadow-sm"
                        />
                    </div>
                    <div className="flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                        {['ALL', 'PENDING', 'APPROVED'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#0A1929] text-white shadow-md' : 'text-gray-400 hover:text-[#DC143C]'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-[#0A1929] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8 w-20">#</th>
                                <th className="p-8">Investor Identity</th>
                                <th className="p-8">Investments</th>
                                <th className="p-8">KYC Status</th>
                                <th className="p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold">Loading Registry...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold">No investors found matching criteria.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, i) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-8 font-mono text-gray-300 font-bold">{i + 1}</td>
                                        <td className="p-8">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0A1929] font-mono text-sm">{user.walletAddress}</div>
                                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center space-x-6">
                                                <div>
                                                    <div className="text-[10px] text-gray-400 font-black uppercase">Assets</div>
                                                    <div className="font-bold text-[#0A1929]">{user.investments?.length || 0} Owned</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-400 font-black uppercase">Value</div>
                                                    <div className="font-bold text-[#00E676]">$0.00</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            {user.kycStatus === 'APPROVED' ? (
                                                <div className="inline-flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100">
                                                    <ShieldCheck size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                                </div>
                                            ) : user.kycStatus === 'REJECTED' ? (
                                                <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100">
                                                    <ShieldAlert size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Rejected</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100">
                                                    <Clock size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {user.kycStatus !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleKycUpdate(user.walletAddress, 'APPROVED')}
                                                        className="p-2 hover:bg-green-50 text-gray-300 hover:text-green-600 rounded-lg transition-colors" title="Approve KYC">
                                                        <ShieldCheck size={18} />
                                                    </button>
                                                )}
                                                {user.kycStatus !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleKycUpdate(user.walletAddress, 'REJECTED')}
                                                        className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-600 rounded-lg transition-colors" title="Reject KYC">
                                                        <ShieldAlert size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => window.location.href = `/admin/messages?partner=${user.walletAddress}`}
                                                    className="p-2 hover:bg-gray-100 text-gray-300 hover:text-[#DC143C] rounded-lg transition-colors" title="Message User">
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 text-gray-300 hover:text-[#0A1929] rounded-lg transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


