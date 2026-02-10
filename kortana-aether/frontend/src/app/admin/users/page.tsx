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
    FileText,
    ExternalLink,
    X,
    Eye,
    CheckCircle2,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, VERIFIED
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showDocs, setShowDocs] = useState(false);

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
                                                    {user.goldenVisa && (
                                                        <div className="text-[10px] font-black text-[#DC143C] uppercase tracking-widest mt-1">
                                                            GV Application: {user.goldenVisa.status}
                                                        </div>
                                                    )}
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
                                            <div className="space-y-2">
                                                {user.kycStatus === 'APPROVED' ? (
                                                    <div className="inline-flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 w-full justify-center">
                                                        <ShieldCheck size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
                                                    </div>
                                                ) : user.kycStatus === 'REJECTED' ? (
                                                    <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 w-full justify-center">
                                                        <ShieldAlert size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Identity Rejected</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 w-full justify-center">
                                                        <Clock size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Identity Pending</span>
                                                    </div>
                                                )}

                                                {user.goldenVisa && (
                                                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border w-full justify-center ${user.goldenVisa.status === 'APPROVED_IN_PRINCIPLE'
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                            : 'bg-gray-50 text-gray-400 border-gray-100'
                                                        }`}>
                                                        <Globe size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            Residency: {user.goldenVisa.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowDocs(true); }}
                                                    className="p-2 hover:bg-blue-50 text-gray-300 hover:text-blue-600 rounded-lg transition-colors" title="View Application"
                                                >
                                                    <Eye size={18} />
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

            {/* Document Verification Modal */}
            <AnimatePresence>
                {showDocs && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDocs(false)}
                            className="absolute inset-0 bg-[#0A1929]/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-[#0A1929]">Investor Application</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Verification for {selectedUser.walletAddress.substring(0, 10)}...</p>
                                        {selectedUser.goldenVisa && (
                                            <span className="text-[8px] font-black bg-[#0A1929] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                {selectedUser.goldenVisa.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setShowDocs(false)} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-10 overflow-y-auto flex-1">
                                {selectedUser.goldenVisa && (
                                    <section className="mb-10 space-y-4">
                                        <h4 className="text-[10px] font-black text-[#DC143C] uppercase tracking-widest">Tell Us About Yourself Data</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl text-xs">
                                                <div className="text-gray-400 font-black uppercase mb-1">Full Name</div>
                                                <div className="font-bold">{selectedUser.goldenVisa.firstName} {selectedUser.goldenVisa.lastName}</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl text-xs">
                                                <div className="text-gray-400 font-black uppercase mb-1">Nationality</div>
                                                <div className="font-bold">{selectedUser.goldenVisa.nationality}</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl text-xs col-span-2">
                                                <div className="text-gray-400 font-black uppercase mb-1">Email</div>
                                                <div className="font-bold">{selectedUser.goldenVisa.email}</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl text-xs">
                                                <div className="text-gray-400 font-black uppercase mb-1">Occupation</div>
                                                <div className="font-bold">{selectedUser.goldenVisa.occupation}</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl text-xs">
                                                <div className="text-gray-400 font-black uppercase mb-1">Budget</div>
                                                <div className="font-bold">€{selectedUser.goldenVisa.investmentBudget}</div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {selectedUser.documents && selectedUser.documents.length > 0 ? (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-[#DC143C] uppercase tracking-widest">Uploaded Evidence</h4>
                                        {selectedUser.documents.map((doc: any) => (
                                            <div key={doc.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-4 bg-white rounded-2xl text-[#DC143C] shadow-sm">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#0A1929]">{doc.fileName}</div>
                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <a
                                                        href={`http://localhost:3001${doc.fileUrl}`}
                                                        target="_blank"
                                                        className="p-3 bg-white hover:bg-gray-50 text-gray-400 hover:text-[#0A1929] rounded-xl border border-gray-100 transition-all shadow-sm"
                                                        title="Local Link"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                    {doc.ipfsHash && (
                                                        <a
                                                            href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`}
                                                            target="_blank"
                                                            className="px-6 py-3 bg-[#0A1929] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#DC143C] transition-all shadow-md"
                                                        >
                                                            IPFS CID
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldAlert size={32} className="text-gray-300" />
                                        </div>
                                        <h4 className="text-xl font-black text-[#0A1929] mb-2">Vault Empty</h4>
                                        <p className="text-gray-400 font-medium">This investor has not uploaded any identity documents yet.</p>
                                    </div>
                                )}

                                <div className="mt-12 flex space-x-4">
                                    <button
                                        onClick={() => { handleKycUpdate(selectedUser.walletAddress, 'APPROVED'); setShowDocs(false); }}
                                        className="flex-1 bg-white border border-gray-100 text-[#00E676] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-50 transition-all disabled:opacity-50"
                                        disabled={selectedUser.kycStatus === 'APPROVED'}
                                    >
                                        {selectedUser.kycStatus === 'APPROVED' ? 'Identity Verified' : 'Verify Identity'}
                                    </button>

                                    {selectedUser.goldenVisa?.status === 'APPROVED_IN_PRINCIPLE' ? (
                                        <div className="flex-1 bg-green-50 text-green-600 border border-green-100 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2">
                                            <CheckCircle2 size={16} />
                                            <span>Residency Approved</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                const res = await fetch(`http://localhost:3001/api/golden-visa/${selectedUser.walletAddress}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: 'APPROVED_IN_PRINCIPLE' })
                                                });
                                                if (res.ok) {
                                                    await fetchUsers();
                                                    setShowDocs(false);
                                                } else {
                                                    alert('Failed to update residency status');
                                                }
                                            }}
                                            className="flex-1 bg-[#0A1929] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#DC143C] transition-all"
                                        >
                                            Approve Residency
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
