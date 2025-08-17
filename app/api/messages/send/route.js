import { NextResponse } from "next/server";
import Message from "@/models/message";
import Conversation from "@/models/conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";

export async function POST(request) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { conversationId, content, messageType = 'text', replyTo, attachments } = await request.json();
    
    // Validate input
    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: "Conversation ID and content are required" },
        { status: 400 }
      );
    }

    if (content.trim().length > 10000) {
      return NextResponse.json(
        { error: "Message content too long (max 10000 characters)" },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
      .select('participants type metadata')
      .lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === currentUserId.toString()
    );
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: "User is not part of this conversation" },
        { status: 403 }
      );
    }

    // Validate reply message if provided
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo)
        .select('conversation isDeleted')
        .lean();
      
      if (!replyMessage || replyMessage.conversation.toString() !== conversationId || replyMessage.isDeleted) {
        return NextResponse.json(
          { error: "Invalid reply message" },
          { status: 400 }
        );
      }
    }

    // Create the message
    const message = new Message({
      conversation: conversationId,
      sender: currentUserId,
      content: content.trim(),
      messageType,
      replyTo,
      attachments: attachments || [],
      // TODO:
      readBy: [],
      metadata: {
        isDelivered: false,
        isRead: false,
        readBy: [],
        reactions: []
      }
    });

    await message.save();
    
    // Populate sender information
    await message.populate('sender', 'username name email profilePic');
    
    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
      $inc: { 'metadata.totalMessages': 1 },
      $set: { 'metadata.lastActivity': new Date() }
    });

    // Update unread count for other participants
    const otherParticipants = conversation.participants.filter(p => p.toString() !== currentUserId);
    if (otherParticipants.length > 0) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $inc: otherParticipants.reduce((acc, participantId) => {
          acc[`metadata.unreadCount.${participantId}`] = 1;
          return acc;
        }, {})
      });
    }

    return NextResponse.json({
      message: "Message sent successfully",
      data: message
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
