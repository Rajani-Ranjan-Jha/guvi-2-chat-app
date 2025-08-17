import { NextResponse } from "next/server";
import Message from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";
import Conversation from "@/models/conversation";

// Handle message actions (edit, reactions, status updates, delete)
export async function POST(request) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { action, messageId, content, emoji } = await request.json();

    if (!action || !messageId) {
      return NextResponse.json(
        { error: "Action and message ID are required" },
        { status: 400 }
      );
    }

    const message = await Message.findById(messageId)
      .populate('conversation', 'participants')
      .lean();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is part of the conversation
    if (!message.conversation.participants.includes(currentUserId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let updateData = {};

    switch (action) {
      case 'edit':
        // Only sender can edit message
        if (message.sender.toString() !== currentUserId) {
          return NextResponse.json({ error: "Only sender can edit message" }, { status: 403 });
        }
        
        if (!content || content.trim().length === 0) {
          return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
        }

        updateData = {
          content: content.trim(),
          'metadata.isEdited': true,
          'metadata.editedAt': new Date(),
          $push: {
            'metadata.editHistory': {
              content: message.content,
              editedAt: new Date()
            }
          }
        };
        break;

      case 'react':
        if (!emoji) {
          return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
        }

        // Find existing reaction
        const existingReaction = message.metadata?.reactions?.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // Toggle user's reaction
          const userIndex = existingReaction.users.indexOf(currentUserId);
          if (userIndex > -1) {
            // Remove reaction
            existingReaction.users.splice(userIndex, 1);
            existingReaction.count = Math.max(0, existingReaction.count - 1);
          } else {
            // Add reaction
            existingReaction.users.push(currentUserId);
            existingReaction.count += 1;
          }
        } else {
          // Create new reaction
          if (!updateData.$push) updateData.$push = {};
          if (!updateData.$push['metadata.reactions']) updateData.$push['metadata.reactions'] = [];
          
          updateData.$push['metadata.reactions'].push({
            emoji,
            users: [currentUserId],
            count: 1
          });
        }
        break;

      case 'mark_read':
        updateData = {
          $push: {
            'metadata.readBy': {
              user: currentUserId,
              readAt: new Date()
            }
          },
          'metadata.isRead': true,
          'metadata.readAt': new Date()
        };
        break;

      case 'delete':
        // Only sender can delete message
        if (message.sender.toString() !== currentUserId) {
          return NextResponse.json({ error: "Only sender can delete message" }, { status: 403 });
        }

        // Soft delete
        updateData = {
          'metadata.isDeleted': true,
          'metadata.deletedAt': new Date(),
          'metadata.deletedBy': currentUserId,
          isDeleted: true,
          deletedAt: new Date()
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true, runValidators: true }
    ).populate('sender', 'username name email profilePic');

    return NextResponse.json({
      message: "Message updated successfully",
      data: updatedMessage
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// Get message details
export async function GET(request) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    const currentUserId = session.user.id;

    const message = await Message.findById(messageId)
      .populate('sender', 'username name email profilePic')
      .populate('conversation', 'participants type')
      .lean();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is part of the conversation
    if (!message.conversation.participants.includes(currentUserId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ message: message }, { status: 200 });

  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}
