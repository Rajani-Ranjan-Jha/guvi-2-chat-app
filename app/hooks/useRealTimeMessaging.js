"use client";
import { useEffect, useState, useCallback, useRef, useId } from "react";
import { useSocket } from "@/app/components/SocketProvider";
import { useSelector } from "react-redux";

export const useRealTimeMessaging = (conversationId) => {
  const { socket, isConnected, joinConversation, leaveConversation } =
    useSocket();

  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const user = useSelector((state) => state.user.user);

  // Add message OLD to the list
  const addMessage = useCallback((messages) => {
    console.warn("1 is runninG");
    if (Array.isArray(messages)) {
      setMessages(messages);
    } else {
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some(
          (msg) => msg._id === messages._id || msg.id === messages.id
        );
        if (exists) return prev;
        return [...prev, messages];
      });
    }
  }, []);

  // TODO: add new messages to the list
  const addNewMessage = useCallback((message) => {
    console.warn("2 is runninG");
    setMessages((prev) => {
      // Check if message already exists
      const exists = prev.some(
        (msg) => msg._id === message._id || msg.id === message.id
      );
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  // Update existing message
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId || msg.id === messageId
          ? { ...msg, ...updates }
          : msg
      )
    );
  }, []);

  // Remove message
  const removeMessage = useCallback((messageId) => {
    setMessages((prev) =>
      prev.filter((msg) => msg._id !== messageId && msg.id !== messageId)
    );
  }, []);

  // Join/leave conversation when component mounts/unmounts
  useEffect(() => {
    // if (user && isConnected) {
    //   let userId = user.id;
    //   if (!userId) {
    //     // console.log("Didn't get any userID(hook)");
    //     return;
    //   }
    //   const id = String(userId);
    //   setOnlineUsers((prev) => {
    //     const next = new Set(prev);
    //     next.add(id);
    //     return next;
    //   });
    // }

    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [user, conversationId, isConnected, joinConversation, leaveConversation]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      // console.error("SOCKET IS NOT ACTIVE IN HOOK");
      return;
    }
    // console.warn(`SOCKET ID in HOOK: ${socket.id}`);

    // Handle new messages
    const handleNewMessage = (data) => {
      console.log("New message received in HOOK:", data);
      if (data.conversationId === conversationId) {
        // addMessage(data.message);
        // TODO:
        addNewMessage(data.message);
      }
    };

    // Handle user typing
    const handleUserTyping = (data) => {
      if (data.conversationId === conversationId) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) =>
            prev.filter((name) => name !== data.username)
          );
        }
      }
    };

    // Handle initial online users list
    const handleOnlineUsersList = (userIds) => {
      console.log("Hook: Received online users list:", userIds);
      const onlineSet = new Set(userIds.map((id) => String(id)));
      setOnlineUsers(onlineSet);
    };

    // Handle user online status
    const handleUserOnline = (userId) => {
      // console.log("user online function is running...");
      if (!userId) {
        // console.log("Didn't get any userID(hook)");
        return;
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
        // console.log("Didn't get any userID(hook)");
        return;
      }
      const id = String(userId);
      console.log(`${id} is offline 😒`);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    };

    // Handle message read receipts
    const handleMessageRead = (data) => {
      console.warn("handleMessageRead RUN", data);

      if (data.conversationId === conversationId) {
        console.log("Updating message read status:", data.messageId, "for user:", data.userId);
        console.log("Current messages:", messages);
        setMessages(prev => {
          const updated = prev.map(msg => {
            const matches = msg._id === data.messageId || msg.id === data.messageId;
            console.log(`Message ${msg._id || msg.id} matches ${data.messageId}:`, matches);
            return matches
              ? { 
                  ...msg, 
                  readBy: [
                    ...(msg.readBy || []),
                    data.userId
                  ].filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
                }
              : msg;
          });
          console.log("Updated messages after read:", updated);
          return updated;
        });
      }
    };

    // Handle message delivery confirmation
    const handleMessageDelivered = (data) => {
      console.warn("handleMessageDelivered RUN", data);
      if (data.conversationId === conversationId) {
        console.log("Updating message delivery status:", data.messageId);
        console.log("Current messages:", messages);
        setMessages(prev => {
          const updated = prev.map(msg => {
            const matches = msg._id === data.messageId || msg.id === data.messageId;
            console.log(`Message ${msg._id || msg.id} matches ${data.messageId}:`, matches);
            return matches
              ? { 
                  ...msg, 
                  metadata: { 
                    ...msg.metadata, 
                    isDelivered: true 
                  } 
                }
              : msg;
          });
          console.log("Updated messages after delivery:", updated);
          return updated;
        });
      }
    };

    // Attach event listeners
    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("online-users-list", handleOnlineUsersList);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);
    socket.on("message-read", handleMessageRead);
    socket.on("message-delivered", handleMessageDelivered);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("online-users-list", handleOnlineUsersList);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
      socket.off("message-read", handleMessageRead);
      socket.off("message-delivered", handleMessageDelivered);
    };
  }, [socket, conversationId, addMessage, updateMessage]);

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      const id = String(userId);
      const onlineStatus = onlineUsers.has(id);
      // console.log("Online Users:",onlineUsers)
      // console.log("Online status check for", id, ":", onlineStatus);
      return onlineStatus;
    },
    [onlineUsers]
  );

  return {
    messages,
    typingUsers,
    onlineUsers,
    addMessage,
    updateMessage,
    removeMessage,
    isUserOnline,
    isConnected,
  };
};
