"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState({});

  const userX = useSelector((state) => state.user.user);
  
  // console.log("User in SocketProvider:", userX);

  useEffect(() => {
    if (userX) {
      setUser(userX);
    }
  }, [userX]);

  useEffect(() => {
    if (!user?.id) {
      // console.log('User ID not available, skipping socket connection.');
      return;
    }

    // Create socket connection
    // console.log('Creating socket connection for user:', user.id);
    const newSocket = io(process.env.NODE_ENV === 'production'
      ? 'https://yourdomain.com'
      : 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: true
    });

    // Connection events
    newSocket.on('connect', () => {
      // console.log('Socket connected with ID:', newSocket.id);
      setIsConnected(true);
      // Emit online status when connected
      if (user.id) {
        console.log(`User ${user.id} connected to Provider and ONLINE`);
        // Small delay to ensure socket is fully ready
        setTimeout(() => {
          newSocket.emit('set-online', user.id);
        }, 100);
      }
    });

    newSocket.on('disconnect', () => {
      console.log(`User ${user.id} DISconnected to Socket.IO Provider`);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, user?.id]);

  // Join conversation room when user enters a chat
  const joinConversation = (conversationId) => {
    // console.log('Joining conversation:', conversationId);
    if (socket && isConnected) {
      socket.emit('join-conversation', conversationId);
    }
  };

  // Leave conversation room when user exits a chat
  const leaveConversation = (conversationId) => {
    // console.log('Leaving conversation:', conversationId);
    if (socket && isConnected) {
      socket.emit('leave-conversation', conversationId);
    }
  };

  // Send message through socket
  const sendMessage = (conversationId, message) => {
    console.log('Sending message(provider):', message);
    if (socket && isConnected) {
      socket.emit('send-message', { conversationId, message });
    }
  };

  // Mark message as read
  const markMessageAsRead = (conversationId, messageId) => {
    if (socket && isConnected) {
      socket.emit('mark-read', { conversationId, messageId, userId: user.id });
    }
  };

  // Start typing indicator
  const startTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { 
        conversationId, 
        userId: user.id, 
        username: user.name || user.username 
      });
    }
  };

  // Stop typing indicator
  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { conversationId, userId: user.id });
    }
  };

  const value = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
