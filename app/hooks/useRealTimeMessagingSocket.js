"use client";
import { useEffect, useState, useCallback, useRef, useId } from "react";
import { useSocket } from "@/app/components/SocketProvider";
import { useSelector } from "react-redux";

export const useRealTimeMessaging = (conversationId) => {
  const { socket, isConnected, joinConversation, leaveConversation } =
    useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // TODO:
  const user = useSelector((state) => state.user.user);
  // console.warn("User in HOOK:", user);

  // Use ref to store latest messages to avoid closure issues
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Join conversation when component mounts
  useEffect(() => {
    if (user && isConnected) {
      let userId = user.id;
      if (!userId) {
        console.log("Didn't get any userID(hook)");
      }
      const id = String(userId);
      // console.log(`${id} is online(effect) 😊`);

      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }

    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [user, conversationId, isConnected, joinConversation, leaveConversation]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) {
      console.error("SOCKET IS NOT ACTIVE IN HOOK")
      return
    };

    console.warn(`SOCKET ID in HOOK: ${socket.id}`)

    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        // Check if message already exists to prevent duplicates
        setMessages((prev) => {
          const messageExists = prev.some(
            (msg) =>
              msg._id === data.message._id ||
              (msg.id === data.message.id &&
                msg.content === data.message.content)
          );
          if (messageExists) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.username);
          } else {
            newSet.delete(data.username);
          }
          return newSet;
        });
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
              : msg
          )
        );
      }
    };

    const handleUserOnline = (userId) => {
      console.log("useroneline function is running...");
      if (!userId) {
        console.log("Didn't get any userID(hook)");
      }
      const id = String(userId);
      console.log(`${id} is online 😊`);

      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };

    const handleUserOffline = (userId) => {
      if (!userId) {
        console.log("Didn't get any userID(hook)");
      }
      const id = String(userId);
      console.log(`${id} is offline 😊`);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    };

    // Attach event listeners
    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("message-read", handleMessageRead);
    socket.on("user-online", handleUserOnline);

    // Cleanup event listeners
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("message-read", handleMessageRead);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, [socket, conversationId]);

  // Add a new message to the local state
  const addMessage = useCallback((message) => {
    setMessages((prev) => {
      // Check if message already exists to prevent duplicates
      const messageExists = prev.some(
        (msg) =>
          msg._id === message._id ||
          (msg.id === message.id && msg.content === message.content)
      );
      if (messageExists) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // Update a message in the local state
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  // Remove a message from the local state
  const removeMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  }, []);

  // Check if a user is typing
  const isUserTyping = useCallback(
    (username) => {
      return typingUsers.has(username);
    },
    [typingUsers]
  );

  // Check if a user is online
  const isUserOnline = useCallback(
    (userId) => {
      const id = String(userId);
      const onlineStatus = onlineUsers.has(id);
      console.log("Online status:", onlineUsers);
      return onlineStatus;
    },
    [onlineUsers]
  );

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    onlineUsers: Array.from(onlineUsers),
    addMessage,
    updateMessage,
    removeMessage,
    isUserTyping,
    isUserOnline,
    isConnected,
  };
};
