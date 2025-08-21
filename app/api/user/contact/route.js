import ConnectToDB from "@/utils/connect.js";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/user";
import Conversation from "@/models/conversation";
import Message from "@/models/message";

export async function GET(request) {
  try {
    await ConnectToDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const currentUserId = session.user.id;

    // Fetch user with contacts
    const user = await User.findOne({ email: userEmail })
      .select('username name email profilePic bio contacts createdAt')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch conversations where user is a participant with proper population and sorting
    const conversations = await Conversation.find({
      participants: currentUserId,
      isDeleted: { $ne: true }
    })
    .populate('participants', 'username name email profilePic bio')
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt',
      populate: {
        path: 'sender',
        select: 'username name email profilePic'
      }
    })
    .sort({ updatedAt: -1 }) // Sort by most recent activity
    .lean();

    // Process conversations to get complete contact info
    const contacts = conversations.map(conv => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(p => p._id.toString() !== currentUserId);
      
      // Get the last message content for display
      let lastMessage = "No messages yet";
      let lastMessageTime = conv.updatedAt;
      let lastMessageSender = "No User"
      
      if (conv.lastMessage) {
        lastMessage = conv.lastMessage || "No last message";
        lastMessageTime = conv.lastMessage.createdAt;
        lastMessageSender = conv.lastMessage.sender;
      }

      return {
        conversationId: conv._id,
        type: conv.type,
        groupName: conv.groupName,
        updatedAt: conv.updatedAt,
        lastMessageTime: lastMessageTime,
        lastMessage: lastMessage,
        lastMessageSender: lastMessageSender,
        // Contact user information
        contactUser: {
          id: otherParticipant?._id,
          username: otherParticipant?.username,
          status: otherParticipant?.status,
          name: otherParticipant?.name,
          email: otherParticipant?.email,
          profilePic: otherParticipant?.profilePic || null,
          bio: otherParticipant?.bio
        },
        // Conversation metadata
        isGroup: conv.type === 'group',
        participantCount: conv.participants.length,
        participants: conv.participants,
        // Unread count (if available)
        unreadCount: conv.metadata?.unreadCount?.get?.(currentUserId) || 0
      };
    });

    // Sort contacts by last activity (most recent first)
    contacts.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    console.log("contacts:",contacts)

    return NextResponse.json({
      message: "Contacts retrieved successfully",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio
      },
      contacts,
      totalContacts: contacts.length,
      // Add metadata for frontend use
      metadata: {
        sortedBy: "lastActivity",
        sortOrder: "descending",
        lastUpdated: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/user/contact:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
