'use client'
import React, { useState, useEffect } from 'react'
import Image from "next/image";
import {
    ArrowLeftIcon,
    LucideVideo,
    MessageSquarePlus,
    MoreVertical,
    Phone,
    Plus,
    SendHorizonal,
    Settings,
} from "lucide-react";
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'

const ChatTemplate = () => {
    const { conversationId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load conversation and messages
    useEffect(() => {
        if (conversationId) {
            loadConversation();
            loadMessages();
        }
    }, [conversationId]);

    const loadConversation = async () => {
        try {
            const res = await axios.get(`/api/conversation/${conversationId}`);
            setConversation(res.data);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const loadMessages = async () => {
        try {
            const res = await axios.get(`/api/messages/${conversationId}`);
            setMessages(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading messages:', error);
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post('/api/messages/send', {
                conversationId,
                content: newMessage,
                messageType: 'text'
            });
            
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    return (
        <div className="relative w-full h-full flex flex-col gap-0">
            {/* Header */}
            <div className="sticky top-0 w-full h-16 p-2 flex justify-between items-center bg-black/50">
                <div className="flex justify-center items-center gap-2">
                    <button 
                        className="p-2 rounded-full hover:bg-white/50 cursor-pointer"
                        onClick={handleBack}
                    >
                        <ArrowLeftIcon />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {conversation?.participants?.[0]?.username || 'Loading...'}
                            </h2>
                            <p className="text-xs text-gray-400">Online</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-white/50 cursor-pointer">
                        <Phone />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/50 cursor-pointer">
                        <LucideVideo />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/50 cursor-pointer">
                        <MoreVertical />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className={`flex ${message.sender === 'currentUser' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'currentUser' 
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="absolute bottom-0 w-full h-16 bg-black/50 rounded-2xl py-2 px-4 flex justify-between items-center">
                <button type="button" className="hover:bg-white/50 cursor-pointer px-2 rounded-full">
                    <Plus />
                </button>

                <input
                    className="text-left w-full focus:outline-none bg-transparent"
                    type="text"
                    placeholder="Enter your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />

                <button type="submit" className="hover:bg-white/50 cursor-pointer px-2 rounded-full">
                    <SendHorizonal />
                </button>
            </form>
        </div>
    )
}

export default ChatTemplate
