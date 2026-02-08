'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Send, User, MoreHorizontal, Bell } from 'lucide-react';

export default function Messages() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to AETHER! How can we help you today?", isUser: false, time: '10:00 AM' },
        { id: 2, text: "I have a question about the Golden Visa process.", isUser: true, time: '10:05 AM' },
        { id: 3, text: "Sure! Our legal team is ready to assist. What specific country are you interested in?", isUser: false, time: '10:07 AM' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, isUser: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setInput('');

        // Mock reply
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Thanks for reaching out! An agent will be with you shortly.", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <Header />

            <div className="pt-32 pb-20 container mx-auto px-6 h-screen flex flex-col">
                <div className="flex-1 bg-white rounded-[2rem] shadow-xl overflow-hidden flex border border-gray-100 mb-8">
                    {/* Sidebar */}
                    <div className="w-80 bg-gray-50 border-r border-gray-100 hidden md:flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-[#0A1929]">Messages</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {['Support Team', 'Legal Advisor', 'Property Manager'].map((contact, i) => (
                                <div key={i} className={`p-4 hover:bg-white cursor-pointer transition-colors border-b border-gray-100 flex items-center space-x-4 ${i === 0 ? 'bg-white border-l-4 border-l-[#DC143C]' : ''}`}>
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                        {contact[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0A1929]">{contact}</div>
                                        <div className="text-xs text-gray-400 truncate w-32">Last active: 2m ago</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-white relative">
                        {/* Chat Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-[#DC143C] text-white rounded-full flex items-center justify-center font-bold">S</div>
                                <div>
                                    <h3 className="font-bold text-[#0A1929]">Support Team</h3>
                                    <span className="text-xs text-[#00E676] flex items-center">● Online</span>
                                </div>
                            </div>
                            <div className="flex space-x-4 text-gray-400">
                                <Bell size={20} className="hover:text-[#DC143C] cursor-pointer" />
                                <MoreHorizontal size={20} className="hover:text-[#0A1929] cursor-pointer" />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${msg.isUser ? 'bg-[#0A1929] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                        <p className="mb-1">{msg.text}</p>
                                        <div className={`text-[10px] ${msg.isUser ? 'text-gray-400' : 'text-gray-400'} text-right`}>{msg.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C]"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-[#DC143C] text-white p-3 rounded-xl hover:bg-[#B22222] transition-colors shadow-lg shadow-[#DC143C]/20"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
