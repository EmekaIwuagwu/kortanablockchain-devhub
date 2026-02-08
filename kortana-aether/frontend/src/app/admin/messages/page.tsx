'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Send, User, MessageSquare, Bell, Search, MoreVertical, CheckCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AdminMessagesContent() {
    const adminAddress = '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9'; // In real app, get from auth context
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activePartner, setActivePartner] = useState<string | null>(searchParams.get('partner'));
    const [activePartnerData, setActivePartnerData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activePartner) {
            fetchMessages(activePartner);
            const interval = setInterval(() => fetchMessages(activePartner), 5000);

            const existing = conversations.find(c => c.partner.toLowerCase() === activePartner.toLowerCase());
            if (existing) {
                setActivePartnerData({
                    name: existing.partnerName,
                    role: existing.partnerRole
                });
            } else {
                fetchPartnerProfile(activePartner);
            }

            return () => clearInterval(interval);
        }
    }, [activePartner, conversations]);

    const fetchPartnerProfile = async (partnerAddress: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/${partnerAddress}`);
            if (response.ok) {
                const data = await response.json();
                setActivePartnerData({
                    name: data.user.name || 'Anonymous User',
                    role: data.user.role
                });
            } else {
                setActivePartnerData({
                    name: partnerAddress.substring(0, 8) + '...',
                    role: 'USER'
                });
            }
        } catch (error) {
            console.error('Error fetching partner profile:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages?address=${adminAddress}`);
            const data = await response.json();
            setConversations(data.conversations || []);
            if (!activePartner && data.conversations?.length > 0) {
                setActivePartner(data.conversations[0].partner);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (partnerAddress: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages/${partnerAddress}?userAddress=${adminAddress}`);
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !activePartner) return;

        const newMessage = {
            senderAddress: adminAddress,
            receiverAddress: activePartner,
            content: input
        };

        try {
            const response = await fetch('http://localhost:3001/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage)
            });

            if (response.ok) {
                setInput('');
                fetchMessages(activePartner);
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-[#0A1929] mb-2 tracking-tight">Communication Hub</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Intercept & Manage Network Direct Messages</p>
            </div>

            <div className="flex-1 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden flex">
                {/* Sidebar */}
                <div className="w-96 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <div className="p-8 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-[#0A1929] outline-none focus:border-[#DC143C] transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-20 text-center text-gray-400 italic font-bold">No active terminals...</div>
                        ) : (
                            filteredConversations.map((conv, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActivePartner(conv.partner)}
                                    className={`p-8 hover:bg-white cursor-pointer transition-all border-b border-gray-50 flex items-center space-x-4 ${activePartner === conv.partner ? 'bg-white shadow-lg z-10 scale-[1.02]' : ''}`}
                                >
                                    <div className="w-12 h-12 bg-[#0A1929] text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg">
                                        UA
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-black text-[#0A1929] text-sm truncate uppercase tracking-tight">
                                                {conv.partnerName}
                                            </div>
                                            <div className="text-[9px] font-black text-gray-400">{new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${conv.partnerRole === 'SELLER' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                {conv.partnerRole}
                                            </span>
                                            <div className="text-xs text-gray-400 truncate font-medium flex-1">{conv.lastMessage}</div>
                                        </div>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="w-6 h-6 bg-[#DC143C] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-[#DC143C]/20">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Hub */}
                <div className="flex-1 flex flex-col relative bg-white">
                    {activePartner ? (
                        <>
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                                <div className="flex items-center space-x-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#0A1929] to-[#1a2e44] rounded-2xl flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-xl">
                                        UA
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[#0A1929] text-lg uppercase tracking-tight flex items-center space-x-3">
                                            <span>{activePartnerData?.name || 'Loading Terminal...'}</span>
                                            {activePartnerData && (
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${activePartnerData.role === 'SELLER' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {activePartnerData.role}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-[10px] text-[#DC143C] font-black tracking-widest">{activePartner}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#DC143C] transition-colors"><Bell size={18} /></button>
                                    <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#0A1929] transition-colors"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-4 font-outfit relative"
                                style={{ backgroundColor: '#efeae2', backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}>
                                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"></div>
                                {messages.map((msg, i) => {
                                    const isMe = msg.senderAddress.toLowerCase() === adminAddress.toLowerCase();
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10`}>
                                            <div className={`max-w-[75%] p-2 px-4 rounded-xl shadow-sm relative ${isMe
                                                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                                                    : 'bg-white text-[#111b21] rounded-tl-none'
                                                }`}>
                                                <p className="text-[14.5px] leading-relaxed mb-1">{msg.content}</p>
                                                <div className="flex items-center justify-end space-x-2 opacity-60">
                                                    <span className="text-[10px] text-[#667781]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isMe && <span className="text-[#53bdeb] font-bold text-xs leading-none">✓✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-8 bg-white border-t border-gray-100">
                                <div className="flex items-center space-x-4 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 focus-within:border-[#DC143C] focus-within:ring-4 focus-within:ring-[#DC143C]/5 transition-all">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Admin directive to user account..."
                                        className="flex-1 bg-transparent border-none px-6 py-4 text-sm font-black text-[#0A1929] outline-none placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="bg-[#DC143C] text-white p-5 rounded-[1.5rem] hover:bg-[#B22222] transition-all shadow-xl shadow-[#DC143C]/20 hover:scale-[1.05] active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-gray-50/30">
                            <div className="w-32 h-32 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center relative">
                                <MessageSquare size={64} className="text-[#DC143C] opacity-20" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#DC143C] rounded-full animate-ping opacity-20"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-[#0A1929] uppercase tracking-tighter">Encrypted Message Center</h3>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Select a user packet to intercept communication</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminMessages() {
    return (
        <Suspense fallback={<div>Loading Secure Hub...</div>}>
            <AdminMessagesContent />
        </Suspense>
    );
}
