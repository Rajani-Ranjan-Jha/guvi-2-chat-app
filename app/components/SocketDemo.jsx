"use client";
import React, { useState } from 'react';
import { useSocket } from './SocketProvider';

const SocketDemo = () => {
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const { socket, isConnected, sendMessage, joinConversation, leaveConversation } = useSocket();

  console.log('Attempting to send message:', message);
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const messageData = {
      content: message,
      timestamp: new Date().toISOString(),
      sender: 'demo-user'
    };

    // Send through Socket.IO
    sendMessage(conversationId, messageData);

    // TODO: Handle message sending errors
    socket.on("receive-message", (data) => {
      console.warn("Received message:", data);
      setMessages(prev => [...prev, messageData]);
      setMessage('');
    });

    // Add to local state
    // setMessages(prev => [...prev, messageData]);
  };

  console.log('Joining conversation with ID:', conversationId);
  const handleJoinConversation = () => {
    joinConversation(conversationId);
  };

  console.log('Leaving conversation with ID:', conversationId);
  const handleLeaveConversation = () => {
    leaveConversation(conversationId);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Socket.IO Demo</h2>

      {/* Connection Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isConnected ? 'Connected to Socket.IO' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Conversation Controls */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Conversation ID"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleJoinConversation}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Join
          </button>
          <button
            onClick={handleLeaveConversation}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="p-2 bg-gray-100 rounded-lg">
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Socket Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Socket Information</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>Socket ID: {socket?.id || 'Not connected'}</p>
          <p>Transport: {socket?.io?.engine?.transport?.name || 'Unknown'}</p>
          <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default SocketDemo;
