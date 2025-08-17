"use client";
import React, { useState, useEffect, useRef } from 'react';
import { SendHorizonal, Paperclip, Smile } from 'lucide-react';
import { useSocket } from './SocketProvider';

const RealTimeMessageInput = ({ 
  conversationId, 
  onSendMessage, 
  placeholder = "Type a message...",
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const { startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef(null);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        startTyping(conversationId);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(conversationId);
      }, 1000);
    } else {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(conversationId);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, conversationId, startTyping, stopTyping]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        stopTyping(conversationId);
      }
    };
  }, [conversationId, isTyping, stopTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    
    const messageData = {
      content: message.trim(),
      attachments,
      timestamp: new Date().toISOString()
    };

    try {
      await onSendMessage(messageData);
      setMessage('');
      setAttachments([]);
      
      // Stop typing indicator
      setIsTyping(false);
      stopTyping(conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full rounded-lg shadow-sm border">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-2 py-1 rounded border">
                <span className="text-sm text-gray-600 truncate max-w-32">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
        {/* File upload button */}
        <label className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Paperclip className="w-5 h-5" />
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            disabled={disabled}
          />
        </label>

        {/* Message input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none border-0 focus:ring-0 focus:outline-none p-2 min-h-[40px] max-h-32"
            rows={1}
          />
        </div>

        {/* Emoji button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={disabled}
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </form>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>typing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMessageInput;
