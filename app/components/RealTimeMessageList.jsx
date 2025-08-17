"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRealTimeMessaging } from '@/app/hooks/useRealTimeMessaging';
import { useSelector } from 'react-redux';
import { Check, CheckCheck, Clock, User } from 'lucide-react';

const RealTimeMessageList = ({
  conversationId,
  initialMessages = [],
}) => {
  const messagesEndRef = useRef(null);
  const initialMessagesAddedRef = useRef(false);
  const user = useSelector((state) => state.user.user);

  // TODO: use real-time messaging hook
  // const [messages, setMessages] = useState([]);

  // TODO: to handle the typing animation
  const [isTyping, setIsTyping] = useState(false);


  const {
    messages,
    typingUsers,
    onlineUsers,
    addMessage,
    updateMessage,
    removeMessage,
    isUserOnline,
    isConnected
  } = useRealTimeMessaging(conversationId);

  // Initialize messages with initial data (only once)
  useEffect(() => {
    // console.log("Initial messages in RealTimeMessageList:", initialMessages);
    if (initialMessages.length > 0 && !initialMessagesAddedRef.current) {
      // initialMessages.forEach(msg => addMessage(msg));
      // setMessages(initialMessages);
      addMessage(initialMessages);

      initialMessagesAddedRef.current = true;
    }
  }, [initialMessages, addMessage]);

  // Reset the ref when conversation changes
  useEffect(() => {
    initialMessagesAddedRef.current = false;
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // console.log("Messages updated in RealTimeMessageList:", messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up typing indicator
  useEffect(() => {
    if (typingUsers.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [typingUsers]);



  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render individual message
  const renderMessage = (message) => {
    // console.log("Rendering message:", message.content);
    const isOwnMessage = message.sender === user?.id || message.sender?._id === user?.id;
    const senderName = message.senderName || message.sender?.name || 'Unknown User';
    const senderId = message.sender?._id || message.sender;
    const isOnline = senderId && isUserOnline(senderId);
    const messageId = message._id || message.id;

    return (
      <div
        key={messageId}
        data-message-id={messageId}
        data-message-sender={senderId}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {/* Sender info for group chats */}
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <User className="w-4 h-4 text-gray-500" />
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="text-xs text-gray-500">{senderName}</span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2 ${isOwnMessage
              ? 'bg-green-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
          >
            {/* Message content */}
            <div className="break-words">
              {message.content}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="bg-white/20 rounded p-2">
                    <span className="text-sm">{attachment.name || attachment}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Message metadata */}
            <div className={`flex items-center justify-between mt-2 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
              }`}>
              <span>{formatTime(message.timestamp || message.createdAt)}</span>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1  p-4 space-y-4">
      {/* Connection status */}
      {!isConnected && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Connecting...
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => renderMessage(message))
        // messagesHook && renderMessage(messagesHook)
      )}

      {/* Typing indicators */}
      {isTyping && (
        <div className="flex justify-start mb-4">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.0s', animationIterationCount: "infinite" }}></div>
                  <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationIterationCount: "infinite" }}></div>
                  <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationIterationCount: "infinite" }}></div>
                </div>
                {typingUsers.length > 1 &&
                  (<span className="text-sm text-gray-600">{typingUsers.join(', ')}</span>)
                }

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default RealTimeMessageList;
