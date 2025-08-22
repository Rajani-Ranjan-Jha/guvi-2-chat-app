"use client";
import React, { useState, useEffect, useRef } from 'react';
import { SendHorizonal, Paperclip, Smile, EditIcon } from 'lucide-react';
import { useSocket } from './SocketProvider';
import CustomEmojiPicker from './EmojiPicker';

const RealTimeMessageInput = ({
  conversationId,
  onSendMessage,
  onEditMessage,
  initialMessage = '',
  haveToEdit = false,
  placeholder = "Type a message...",
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessage('');
    if (haveToEdit && initialMessage) {
      setMessage(initialMessage);
    } else if (!haveToEdit) {
      setMessage('');
    }
  }, [initialMessage, haveToEdit, disabled]);


  useEffect(() => {
    if (message.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        startTyping(conversationId);
      }
      

    } else {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(conversationId);
      }
    }


  }, [message, isTyping, conversationId, startTyping, stopTyping]);


  useEffect(() => {
    return () => {

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
      if (haveToEdit) {
        // If editing a message, call the edit handler
        await onEditMessage(messageData.content);
      }
      // If sending a new message, call the send handler
      else {
        await onSendMessage(messageData);
      }
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

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + emoji + message.substring(end);
      // const newMessage = message + emoji; 
      // console.warn("New message with emoji:", newMessage);
      setMessage(newMessage);

      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024;
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

      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">

        {/* Emoji button */}
        <button
          type="button"
          className="p-2 rounded-full text-gray-100 hover:text-gray-400 hover:bg-white/50 cursor-pointer transition-colors relative"
          disabled={disabled}
          onClick={() => setShowEmojiPicker(prev => prev == false ? !prev : null)}
        >
          <Smile className="w-5 h-5" />
        </button>
        
        {/* File upload button */}
        <label className="p-2 rounded-full text-gray-100 hover:text-gray-400 hover:bg-white/50 cursor-pointer transition-colors">
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
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full disabled:cursor-not-allowed resize-none border-0 focus:ring-0 focus:outline-none p-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
          />

          {showEmojiPicker && (
            <CustomEmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-white/50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {haveToEdit ?
            <EditIcon className="w-5 h-5" /> : <SendHorizonal className="w-5 h-5" />
          }
        </button>
      </form>


    </div>
  );
};

export default RealTimeMessageInput;
