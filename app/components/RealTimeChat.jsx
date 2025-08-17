"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from './SocketProvider';
import RealTimeMessageList from './RealTimeMessageList';
import RealTimeMessageInput from './RealTimeMessageInput';
import { Phone, Video, MoreVertical, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RealTimeChat = ({ 
  conversationId, 
  conversationData,
  onBack 
}) => {

  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user.user);
  // TODO: online users
  const active = useSelector((state) => state.user.ActiveUsers);
  // console.warn("Active users in RealTimeChat:", conversationData.participants);


  const { socket, sendMessage, markMessageAsRead, joinConversation, leaveConversation } = useSocket();
  const router = useRouter();

  // Join conversation when component mounts
  useEffect(() => {
    if (conversationId && socket) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId && socket) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, socket, joinConversation, leaveConversation]);

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) {
      console.log('No conversationId provided to RealTimeChat');
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('RealTimeChat: Error fetching messages:', err);
        setError(err.message);
        // Set empty messages array on error instead of failing completely
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);


  // Handle sending messages
  const handleSendMessage = async (messageData) => {
    if (!conversationId || !user) return;

    try {
      // Optimistically add message to local state
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversation: conversationId,
        sender: user.id,
        content: messageData.content,
        attachments: messageData.attachments,
        timestamp: messageData.timestamp,
        senderName: user.name || user.username,
        readBy:[],
        metadata: {
          isDelivered: false,
          isRead: false
        }
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // Send message through Socket.IO for real-time delivery
      sendMessage(conversationId, optimisticMessage);

      // Also send to API for persistence
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: messageData.content,
          messageType: 'text',
          attachments: messageData.attachments
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Update the optimistic message with the real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === optimisticMessage._id ? result.data : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => 
        prev.filter(msg => msg._id !== optimisticMessage._id)
      );
      
      // You could show a toast notification here
      alert('Failed to send message. Please try again!');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {conversationData?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="font-semibold">
                {conversationData?.name || 'Chat'}
              </h2>
              <p className="text-sm">
                {conversationData?.participants?.length > 1 ? `${conversationData?.participants?.length} participants` : 
                `${active.includes(conversationData?.participants[0]) ? 'Online' : 'Offline'}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto handle-scroll border-orange-500">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : (
          <RealTimeMessageList
            conversationId={conversationId}
            initialMessages={messages}
          />
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <RealTimeMessageInput
          conversationId={conversationId}
          onSendMessage={handleSendMessage}
          placeholder="Type a message..."
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default RealTimeChat;
