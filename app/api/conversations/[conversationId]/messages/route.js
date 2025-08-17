import { NextResponse } from "next/server";
import Message from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";
import Conversation from "@/models/conversation";

export async function GET(request, { params }) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const currentUserId = session.user.id;

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
      .select('participants type')
      .lean();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Fetch messages with pagination
    const [messages, total] = await Promise.all([
      Message.find({ 
        conversation: conversationId,
        isDeleted: { $ne: true }
      })
        .populate('sender', 'username name email profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ 
        conversation: conversationId,
        isDeleted: { $ne: true }
      })
    ]);

    // Mark messages as read for current user
    if (messages.length > 0) {
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: currentUserId },
          readBy: { $ne: currentUserId },
          isDeleted: { $ne: true }
        },
        {
          $addToSet: { readBy: currentUserId },
          $set: {
            'metadata.isRead': true,
            'metadata.readAt': new Date()
          }
        }
      );
    }

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages: total,
        hasNextPage,
        hasPrevPage,
        limit
      },
      conversation: {
        id: conversation._id,
        type: conversation.type
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
