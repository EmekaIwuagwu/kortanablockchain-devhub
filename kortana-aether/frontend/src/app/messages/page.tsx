'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Send, User, MoreHorizontal, Bell, MessageSquare, ShieldCheck, Search, X } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';

function MessagesContent() {
    const { address } = useAccount();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activePartner, setActivePartner] = useState<string | null>(searchParams.get('partner'));
    const [activePartnerData, setActivePartnerData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [searchAddress, setSearchAddress] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const handleNewChat = () => {
        if (!searchAddress.startsWith('0x') || searchAddress.length !== 42) {
            alert('Please enter a valid wallet address');
            return;
        }
        setActivePartner(searchAddress.toLowerCase());
        setIsNewChatModalOpen(false);
        setSearchAddress('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (address) {
            fetchConversations();
        }
    }, [address]);

    useEffect(() => {
        if (address && activePartner) {
            fetchMessages(activePartner);
            const interval = setInterval(() => fetchMessages(activePartner), 5000);

            // Fetch partner data if not in current conversations
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
    }, [address, activePartner, conversations]);

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
                const isAdmin = partnerAddress.toLowerCase() === '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9';
                setActivePartnerData({
                    name: isAdmin ? 'Platform Admin' : 'User',
                    role: isAdmin ? 'ADMIN' : 'USER'
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
            const response = await fetch(`http://localhost:3001/api/messages?address=${address}`);
            const data = await response.json();
            setConversations(data.conversations || []);
            // Set first conversation as active if none selected
            if (!activePartner && data.conversations?.length > 0) {
                setActivePartner(data.conversations[0].partner);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (partnerAddress: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages/${partnerAddress}?userAddress=${address}`);
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !address || !activePartner) return;

        const newMessage = {
            senderAddress: address,
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

    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <Header />

            <div className="pt-32 pb-20 container mx-auto px-6 h-screen flex flex-col">
                <div className="flex-1 bg-white rounded-[2rem] shadow-xl overflow-hidden flex border border-gray-100 mb-8">
                    {/* Sidebar */}
                    <div className="w-80 bg-gray-50 border-r border-gray-100 hidden md:flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#0A1929]">Conversations</h2>
                            <button
                                onClick={() => setIsNewChatModalOpen(!isNewChatModalOpen)}
                                className={`p-2 rounded-lg transition-all ${isNewChatModalOpen ? 'bg-[#DC143C] text-white rotate-45' : 'bg-white text-[#DC143C] hover:bg-gray-100 shadow-sm border border-gray-100'}`}
                                title="Start New Conversation"
                            >
                                {isNewChatModalOpen ? <X size={18} /> : <MessageSquare size={18} />}
                            </button>
                        </div>

                        {isNewChatModalOpen && (
                            <div className="p-4 bg-white border-b border-gray-100 shadow-sm animate-in slide-in-from-top duration-300">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Receiver Address</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="0x..."
                                                value={searchAddress}
                                                onChange={(e) => setSearchAddress(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-[#DC143C] outline-none transition-colors"
                                            />
                                        </div>
                                        <button
                                            onClick={handleNewChat}
                                            className="bg-[#0A1929] text-white p-2.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-[#0A1929]/20 active:scale-95"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-10 text-center text-gray-400">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-sm font-bold mb-4">No active threads</p>
                                    <button
                                        onClick={() => setIsNewChatModalOpen(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] hover:underline"
                                    >
                                        Start a New Chat
                                    </button>
                                </div>
                            ) : (
                                conversations.map((conv, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActivePartner(conv.partner)}
                                        className={`p-4 hover:bg-white cursor-pointer transition-colors border-b border-gray-100 flex items-center space-x-4 ${activePartner === conv.partner ? 'bg-white border-l-4 border-l-[#DC143C]' : ''}`}
                                    >
                                        <div className={`w-10 h-10 ${conv.partnerRole === 'ADMIN' ? 'bg-[#DC143C]' : 'bg-[#0A1929]'} text-white rounded-[0.8rem] flex items-center justify-center font-bold shadow-lg shrink-0`}>
                                            {conv.partnerRole === 'ADMIN' ? 'AD' : 'US'}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <div className="font-bold text-[#0A1929] truncate w-24">
                                                    {conv.partnerName}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${conv.partnerRole === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                                    'bg-green-100 text-green-600'
                                                    }`}>
                                                    {conv.partnerRole === 'ADMIN' ? 'Admin' : 'User'}
                                                </span>
                                                <div className="text-xs text-gray-400 truncate flex-1">{conv.lastMessage}</div>
                                            </div>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="w-5 h-5 bg-[#DC143C] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <button
                                onClick={() => setActivePartner('0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9')}
                                className="w-full flex items-center justify-center space-x-2 bg-[#0A1929] text-white py-3 rounded-xl hover:bg-black transition-colors shadow-lg"
                            >
                                <ShieldCheck size={16} className="text-[#DC143C]" />
                                <span className="text-sm font-bold">Contact Support</span>
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-white relative">
                        {activePartner ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 ${activePartnerData?.role === 'ADMIN' ? 'bg-[#DC143C]' : 'bg-[#0A1929]'} text-white rounded-[0.8rem] flex items-center justify-center font-bold shadow-lg`}>
                                            {activePartnerData?.role === 'ADMIN' ? 'AD' : 'US'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0A1929] flex items-center space-x-2">
                                                <span>{activePartnerData?.name || 'Loading Terminal...'}</span>
                                                {activePartnerData && (
                                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${activePartnerData.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                                        'bg-green-100 text-green-600'
                                                        }`}>
                                                        {activePartnerData.role === 'ADMIN' ? 'Admin' : 'User'}
                                                    </span>
                                                )}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 font-mono italic">{activePartner}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 text-gray-400">
                                        <Bell size={20} className="hover:text-[#DC143C] cursor-pointer" />
                                        <MoreHorizontal size={20} className="hover:text-[#0A1929] cursor-pointer" />
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-4 font-outfit relative"
                                    style={{ backgroundColor: '#efeae2', backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}>
                                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"></div>
                                    {messages.map((msg, i) => {
                                        const isMe = msg.senderAddress.toLowerCase() === address?.toLowerCase();
                                        return (
                                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10`}>
                                                <div className={`max-w-[75%] p-2 px-4 rounded-xl shadow-sm relative ${isMe
                                                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                                                    : 'bg-white text-[#111b21] rounded-tl-none'
                                                    }`}>
                                                    <p className="text-[14.5px] leading-relaxed mb-1">{msg.content}</p>
                                                    <div className="flex items-center justify-end space-x-1 opacity-60">
                                                        <span className="text-[10px] text-[#667781]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMe && <span className="text-[#53bdeb] font-bold text-xs">✓✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-6 bg-white border-t border-gray-100">
                                    <div className="flex space-x-4">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Secure message endpoint..."
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] text-sm font-bold"
                                        />
                                        <button
                                            onClick={handleSend}
                                            className="bg-[#DC143C] text-white p-3 rounded-xl hover:bg-[#B22222] transition-colors shadow-lg shadow-[#DC143C]/20"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <MessageSquare size={64} className="opacity-10" />
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-[#0A1929]">Encrypted Messaging</h3>
                                    <p className="text-sm font-medium">Select a thread to begin secure communication</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

export default function Messages() {
    return (
        <Suspense fallback={<div>Loading conversations...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
