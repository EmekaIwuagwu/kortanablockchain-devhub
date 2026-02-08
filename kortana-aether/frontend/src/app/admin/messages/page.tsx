'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare, MoreHorizontal, Bell, ShieldCheck, CheckCheck } from 'lucide-react';
import AdminLayout from '@/app/admin/layout';

interface Message {
    id: number;
    senderAddress: string;
    receiverAddress: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface Conversation {
    partner: string;
    partnerName: string;
    partnerRole: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activePartner, setActivePartner] = useState<string | null>(null);
    const [activePartnerData, setActivePartnerData] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const adminAddress = '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9';

    // Authentic WhatsApp Tail Styling
    const whatsappStyles = (
        <style>{`
            .whatsapp-bubble-sent::before {
                content: '';
                position: absolute;
                top: 0;
                right: -8px;
                width: 0;
                height: 0;
                border: 8px solid transparent;
                border-top-color: #d9fdd3;
                border-left-color: #d9fdd3;
            }
            .whatsapp-bubble-received::before {
                content: '';
                position: absolute;
                top: 0;
                left: -8px;
                width: 0;
                height: 0;
                border: 8px solid transparent;
                border-top-color: #ffffff;
                border-right-color: #ffffff;
            }
        `}</style>
    );

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activePartner) {
            fetchMessages(activePartner);
            fetchPartnerData(partnerAddress => {
                const isAdmin = partnerAddress.toLowerCase() === adminAddress;
                return {
                    name: isAdmin ? 'Platform Admin' : 'User',
                    role: isAdmin ? 'ADMIN' : 'USER'
                };
            });
            const interval = setInterval(() => fetchMessages(activePartner), 3000);
            return () => clearInterval(interval);
        }
    }, [activePartner]);

    const fetchConversations = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages?address=${adminAddress}`);
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (partnerAddress: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages/history?user1=${adminAddress}&user2=${partnerAddress}`);
            const data = await response.json();
            setMessages(data.messages || []);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchPartnerData = async (cb: (addr: string) => any) => {
        if (!activePartner) return;
        try {
            const response = await fetch(`http://localhost:3001/api/users/${activePartner}`);
            const data = await response.json();
            setActivePartnerData(data.user);
        } catch (error) {
            setActivePartnerData(cb(activePartner));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim() || !activePartner) return;

        const newMessage = {
            senderAddress: adminAddress,
            receiverAddress: activePartner,
            content: input.trim()
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
        <AdminLayout>
            <div className="h-[calc(100vh-160px)] flex flex-col font-outfit">
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
                                filteredConversations.map((conv, i) => {
                                    const isAdmin = conv.partner.toLowerCase() === adminAddress.toLowerCase();
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setActivePartner(conv.partner)}
                                            className={`p-8 hover:bg-white cursor-pointer transition-all border-b border-gray-50 flex items-center space-x-4 ${activePartner === conv.partner ? 'bg-white shadow-lg z-10 scale-[1.02]' : ''}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-lg ${isAdmin ? 'bg-[#DC143C]' : 'bg-[#0A1929]'}`}>
                                                {isAdmin ? 'AD' : 'US'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="font-black text-[#0A1929] text-sm truncate uppercase tracking-tight">
                                                        {isAdmin ? 'Platform Admin' : 'User'}
                                                    </div>
                                                    <div className="text-[9px] font-black text-gray-400">{new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isAdmin ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        {isAdmin ? 'Admin' : 'User'}
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
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Hub */}
                    <div className="flex-1 flex flex-col relative bg-white">
                        {activePartner ? (
                            <>
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#f0f2f5] z-10">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg ${activePartner.toLowerCase() === adminAddress.toLowerCase() ? 'bg-[#DC143C]' : 'bg-[#0A1929]'}`}>
                                            {activePartner.toLowerCase() === adminAddress.toLowerCase() ? 'AD' : 'US'}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-[#111b21] uppercase tracking-tighter">
                                                {activePartner.toLowerCase() === adminAddress.toLowerCase() ? 'Platform Admin' : 'User'}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 font-mono font-bold tracking-widest">{activePartner}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-6 text-[#54656f]">
                                        <MoreHorizontal size={24} className="hover:text-[#0A1929] cursor-pointer transition-colors" />
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-4 font-outfit relative"
                                    style={{ backgroundColor: '#efeae2', backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}>
                                    {whatsappStyles}
                                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"></div>
                                    {messages.map((msg, i) => {
                                        const isMe = msg.senderAddress.toLowerCase() === adminAddress.toLowerCase();
                                        return (
                                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10`}>
                                                <div className={`max-w-[75%] p-3 px-4 rounded-xl shadow-sm relative ${isMe
                                                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none whatsapp-bubble-sent'
                                                    : 'bg-white text-[#111b21] rounded-tl-none whatsapp-bubble-received'
                                                    }`}>
                                                    <p className="text-[14.5px] leading-relaxed mb-1 font-medium">{msg.content}</p>
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

                                {/* Admin Control Bar */}
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
        </AdminLayout>
    );
}
