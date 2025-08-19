"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRealTimeMessaging } from '@/app/hooks/useRealTimeMessaging';
import { useSelector } from 'react-redux';
import { Check, CheckCheck, Clock, EditIcon, Trash2, User } from 'lucide-react';

const RealTimeMessageList = ({
  conversationId,
  initialMessages = [],
  ProvideMessageToEdit,
  isAGroup = false

}) => {
  const messagesEndRef = useRef(null);
  const initialMessagesAddedRef = useRef(false);
  const user = useSelector((state) => state.user.user);

  // TODO: use real-time messaging hook
  // const [messages, setMessages] = useState([]);

  // TODO: to handle the typing animation
  const [isTyping, setIsTyping] = useState(false);

  // to manage message action menu visibility per message
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // to manage the grouping of message based on date
  const [AlreadyUsed, setAlreadyUsed] = useState('');


  const {
    messages,
    typingUsers,
    onlineUsers,
    addMessage,
    updateMessage,
    removeMessage,
    isUserOnline,
    isConnected,
    reactToMessage
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getDateGroup = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDeleteMessage = useCallback((messageId) => {
    // if (!window.confirm("Are you sure you want to delete this message?")) return;
    removeMessage(messageId);
  }, [removeMessage]);

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp || message.createdAt);
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
  };

  // Render message group with date header
  const renderMessageGroup = (dateKey, messages) => {
    const dateGroup = getDateGroup(messages[0].timestamp || messages[0].createdAt);
    
    return (
      <div key={dateKey} className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white/20 text-xs px-2 py-1 rounded-md">
            {dateGroup}
          </div>
        </div>
        {messages.map(message => renderMessage(message))}
      </div>
    );
  };

  // Render individual message
  const renderMessage = (message) => {
    const isOwnMessage = message.sender === user?.id || message.sender?._id === user?.id;
    const senderName = message.senderName || message.sender?.name || 'Unknown User';
    const senderId = message.sender?._id || message.sender;
    const isOnline = senderId && isUserOnline(senderId);
    const messageId = message._id || message.id;
    const reactions = message.metadata?.reactions || [];
    const myId = user?.id ? String(user.id) : null;

    return (
      <div
        key={messageId}
        data-message-id={messageId}
        data-message-sender={senderId}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`relative max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}
          onMouseEnter={() => setHoveredMessageId(messageId)}
          onMouseLeave={() => setHoveredMessageId((prev) => (prev === messageId ? null : prev))}
        >
          {/* Sender info for group chats */}
          {!isOwnMessage && isAGroup && (
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <User className="w-4 h-4 text-gray-500" />
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-200">{senderName}</span>
            </div>
          )}
          
          {/* Floating action bar */}
          {hoveredMessageId === messageId && (
            <div className={`absolute -top-4 ${isOwnMessage ? 'right-0' : 'left-0'} z-100`}>
              <div className="rounded-full blur-1 shadow px-2 py-1 border border-gray-200">
                <ul className="flex gap-0.5 text-base select-none justify-center items-center">
                  {['👍', '🩷', '😂', '😯', '😢', '🙏'].map((emoji) => (
                    <li key={emoji}>
                      <button
                        type="button"
                        className="hover:scale-120 z-100 transition-transform"
                        onClick={() => reactToMessage(conversationId, messageId, emoji)}
                        aria-label={`React ${emoji}`}
                      >
                        {emoji}
                      </button>
                    </li>
                  ))}
                  <li className='ml-2'>
                    <button
                      type="button"
                      className="hover:scale-120 transition-transform cursor-pointer"
                      onClick={() => { isOwnMessage ? ProvideMessageToEdit(message) : null }}
                      aria-label='edit message'
                    >
                      <EditIcon className="w-4 h-4 text-gray-200" />
                    </button>
                  </li>
                  <li className='ml-2'>
                    <button
                      type="button"
                      className="hover:scale-110 transition-transform cursor-pointer"
                      onClick={() => handleDeleteMessage(messageId)}
                      aria-label='delete message'
                    >
                      <Trash2 className="w-4 h-4 text-gray-200" />
                    </button>
                  </li>
                </ul>
              </div>
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

            {/* Reactions display */}
            {reactions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {reactions.map((r) => {
                  const youReacted = myId && (r.users || []).map(String).includes(String(myId));
                  return (
                    <span
                      key={r.emoji}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border ${youReacted ? 'bg-white/20 border-white/40' : 'bg-black/10 border-black/10'} `}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count || (r.users ? r.users.length : 0)}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Message metadata */}
            <div className={`flex items-center justify-between mt-2 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
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
        groupMessagesByDate(messages).map(([dateKey, messages]) => 
          renderMessageGroup(dateKey, messages)
        )
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
