"use client";
import { useEffect, useState, useCallback, useRef, useId } from "react";
import { useSocket } from "@/app/components/SocketProvider";
import { useSelector, useDispatch } from "react-redux";
import { setActiveUsers } from "../redux/authSlice";

export const useRealTimeMessaging = (conversationId) => {
  const { socket, isConnected, joinConversation, leaveConversation } =
    useSocket();

  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // Add message OLD to the list
  const addMessage = useCallback((messages) => {
    console.warn("Loading messages!");
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
    console.warn("newMessage added!");
    setMessages((prev) => [...prev, message]);
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
  const removeMessage = useCallback(async (messageId) => {
    try {
      const response = await fetch("/api/messages/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", messageId: messageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit message");
      }

      const result = await response.json();
      if (result && result.message) {
        console.warn("Message Deleted SuccessFully");
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== messageId && msg.id !== messageId)
        );
        return;
      }
    } catch (error) {
      console.error("Error while Deleting the message:", error);
      return
    }
  }, []);

  // Toggle a reaction on a message (optimistic update + persist via API)
  const reactToMessage = useCallback(
    async (conversationId, messageId, emoji) => {
      if (!messageId || !emoji) return;

      const currentUserId = String(user?.id || "");
      if (!currentUserId) return;

      // Keep snapshot for rollback on failure
      let previousMessagesSnapshot = null;

      setMessages((prev) => {
        previousMessagesSnapshot = prev;
        return prev.map((msg) => {
          const msgId = msg._id || msg.id;
          if (msgId !== messageId) return msg;

          const existingReactions = (msg.metadata?.reactions || []).map(
            (r) => ({
              ...r,
              users: (r.users || []).map((u) => String(u)),
            })
          );

          // Find any previous reaction by this user
          const prevIdx = existingReactions.findIndex((r) =>
            r.users.includes(currentUserId)
          );
          const clickedIdx = existingReactions.findIndex(
            (r) => r.emoji === emoji
          );

          // If user clicked the same emoji they already have, toggle it off
          if (prevIdx > -1 && existingReactions[prevIdx].emoji === emoji) {
            const r = { ...existingReactions[prevIdx] };
            r.users = r.users.filter((u) => u !== currentUserId);
            r.count = r.users.length;
            const next = [...existingReactions];
            if (r.count === 0) {
              next.splice(prevIdx, 1);
            } else {
              next[prevIdx] = r;
            }
            const updatedMetadata = {
              ...(msg.metadata || {}),
              reactions: next,
            };
            return { ...msg, metadata: updatedMetadata };
          }

          // Otherwise, remove user's previous reaction (if any), and add to the new emoji
          let trimmed = existingReactions
            .map((r) => ({
              ...r,
              users: r.users.filter((u) => u !== currentUserId),
            }))
            .filter((r) => r.users.length > 0);

          // Add to clicked reaction
          const idxAfterTrim = trimmed.findIndex((r) => r.emoji === emoji);
          if (idxAfterTrim > -1) {
            const r = { ...trimmed[idxAfterTrim] };
            r.users = [...r.users, currentUserId];
            r.count = r.users.length;
            trimmed[idxAfterTrim] = r;
          } else {
            trimmed.push({ emoji, users: [currentUserId], count: 1 });
          }

          const updatedMetadata = {
            ...(msg.metadata || {}),
            reactions: trimmed,
          };
          return { ...msg, metadata: updatedMetadata };
        });
      });

      try {
        const response = await fetch("/api/messages/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "react", messageId, emoji }),
        });

        if (!response.ok) {
          throw new Error("Failed to update reaction");
        }

        const result = await response.json();
        const updatedFromServer = result?.data;
        if (updatedFromServer) {
          setMessages((prev) =>
            prev.map((m) => {
              const mId = m._id || m.id;
              return mId === (updatedFromServer._id || updatedFromServer.id)
                ? { ...m, ...updatedFromServer }
                : m;
            })
          );
        }
      } catch (error) {
        console.error("Reaction update failed; reverting. Reason:", error);
        if (previousMessagesSnapshot) {
          setMessages(previousMessagesSnapshot);
        }
      }
    },
    [user]
  );

  // Join/leave conversation when component mounts/unmounts
  useEffect(() => {
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
      return;
    }
    // Handle new messages
    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
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
          // setTypingUsers((prev) =>
          //   prev.filter((name) => name !== data.username)
          // );
          // TODO:
          setTypingUsers([]);
        }
      }
    };

    // Handle initial online users list
    const handleOnlineUsersList = (userIds) => {
      console.log("Hook: Received online users list:", userIds);
      // TODO: adding online users into the redux
      const onlineSet = new Set(userIds.map((id) => String(id)));
      setOnlineUsers(onlineSet);
      dispatch(setActiveUsers(Array.from(onlineSet)));
    };

    // Handle user online status
    const handleUserOnline = (userId) => {
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
        console.log(
          "Updating message read status:",
          data.messageId,
          "for user:",
          data.userId
        );
        console.log("Current messages:", messages);
        setMessages((prev) => {
          const updated = prev.map((msg) => {
            const matches =
              msg._id === data.messageId || msg.id === data.messageId;
            console.log(
              `Message ${msg._id || msg.id} matches ${data.messageId}:`,
              matches
            );
            return matches
              ? {
                  ...msg,
                  readBy: [...(msg.readBy || []), data.userId].filter(
                    (id, index, arr) => arr.indexOf(id) === index
                  ), // Remove duplicates
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
        setMessages((prev) => {
          const updated = prev.map((msg) => {
            const matches =
              msg._id === data.messageId || msg.id === data.messageId;
            console.log(
              `Message ${msg._id || msg.id} matches ${data.messageId}:`,
              matches
            );
            return matches
              ? {
                  ...msg,
                  metadata: {
                    ...msg.metadata,
                    isDelivered: true,
                  },
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
    reactToMessage,
  };
};
