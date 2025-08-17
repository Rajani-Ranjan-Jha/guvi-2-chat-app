import { NextResponse } from "next/server";
import { Server } from "socket.io";

let io;

if (!io) {
  io = new Server({
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? ["https://yourdomain.com"] 
        : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("User connected(route):", socket.id);

    // Join a conversation room
    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.id} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on("send-message", (data) => {
      const { conversationId, message } = data;
      // Broadcast message to all users in the conversation (except sender)
      socket.to(conversationId).emit("new-message", {
        conversationId,
        message
      });
      console.log(`Message sent to conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on("typing-start", (data) => {
      const { conversationId, userId, username } = data;
      socket.to(conversationId).emit("user-typing", {
        conversationId,
        userId,
        username,
        isTyping: true
      });
    });

    socket.on("typing-stop", (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit("user-typing", {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Handle online status
    socket.on("set-online", (userId) => {
      socket.userId = userId;
      socket.broadcast.emit("user-online", userId);
    });

    // Handle read receipts
    socket.on("mark-read", (data) => {
      const { conversationId, messageId, userId } = data;
      socket.to(conversationId).emit("message-read", {
        conversationId,
        messageId,
        userId
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.userId) {
        socket.broadcast.emit("user-offline", socket.userId);
      }
      console.log("User disconnected:", socket.id);
    });
  });
}

export async function GET() {
  return NextResponse.json({ message: "Socket.IO server is running" });
}

export async function POST() {
  return NextResponse.json({ message: "Socket.IO server is running" });
}

// Export the io instance for use in other parts of the app
export { io };
