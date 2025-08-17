import { NextResponse } from "next/server";
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
    const { participants, type = 'direct', groupName, groupDescription } = await request.json();
    
    // Validate input
    if (!participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { error: "Participants must be an array" },
        { status: 400 }
      );
    }

    // Ensure participants is an array and add current user
    const allParticipants = [currentUserId, ...participants];
    
    // Filter out any null/undefined values and ensure uniqueness
    const validParticipants = [...new Set(allParticipants.filter(id => id && id.toString().trim()))];
    
    // Validate participants
    if (validParticipants.length < 2) {
      return NextResponse.json(
        { error: "At least two participants are required" },
        { status: 400 }
      );
    }
    
    // For direct conversations, check if one already exists
    if (type === 'direct' && validParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: validParticipants, $size: 2 },
        isDeleted: { $ne: true }
      }).populate('participants', 'username name email profilePic');

      if (existingConversation) {
        return NextResponse.json({
          message: "Conversation already exists",
          conversation: existingConversation
        }, { status: 200 });
      }
    }

    // Validate group conversation
    if (type === 'group') {
      if (!groupName || groupName.trim().length < 2) {
        return NextResponse.json(
          { error: "Group name is required and must be at least 2 characters" },
          { status: 400 }
        );
      }
      
      if (validParticipants.length < 3) {
        return NextResponse.json(
          { error: "Group conversations require at least 3 participants" },
          { status: 400 }
        );
      }
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: validParticipants,
      type,
      groupName: type === 'group' ? groupName.trim() : undefined,
      groupDescription: type === 'group' ? groupDescription?.trim() : undefined,
      admins: type === 'group' ? [currentUserId] : undefined,
      metadata: {
        totalMessages: 0,
        unreadCount: new Map(),
        lastActivity: new Date()
      }
    });

    // Initialize unread count for all participants
    validParticipants.forEach(participantId => {
      conversation.metadata.unreadCount.set(participantId.toString(), 0);
    });

    await conversation.save();
    
    // Populate participants for response
    await conversation.populate('participants', 'username name email profilePic');

    return NextResponse.json({
      message: "Conversation created successfully",
      conversation
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
