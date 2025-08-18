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
    if (!message.conversation.participants.map(id => String(id)).includes(String(currentUserId))) {
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

      case 'react': {
        if (!emoji) {
          return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
        }

        const currentId = String(currentUserId);
        const existing = Array.isArray(message.metadata?.reactions) ? message.metadata.reactions.map(r => ({
          emoji: r.emoji,
          users: (r.users || []).map(u => String(u)),
          count: Number(r.count || (r.users ? r.users.length : 0))
        })) : [];

        // Enforce single reaction per user
        const alreadyIdx = existing.findIndex(r => r.users.includes(currentId));
        // If user clicked the same emoji they already have -> toggle off
        if (alreadyIdx > -1 && existing[alreadyIdx].emoji === emoji) {
          const r = { ...existing[alreadyIdx] };
          r.users = r.users.filter(u => u !== currentId);
          r.count = r.users.length;
          const next = [...existing];
          if (r.count === 0) {
            next.splice(alreadyIdx, 1);
          } else {
            next[alreadyIdx] = r;
          }
          updateData = { $set: { 'metadata.reactions': next } };
        } else {
          // Remove previous reaction (if any) then add to new emoji
          let trimmed = existing.map(r => ({
            ...r,
            users: r.users.filter(u => u !== currentId)
          })).filter(r => r.users.length > 0);

          const idx = trimmed.findIndex(r => r.emoji === emoji);
          if (idx > -1) {
            const r = { ...trimmed[idx] };
            r.users = [...r.users, currentId];
            r.count = r.users.length;
            trimmed[idx] = r;
          } else {
            trimmed.push({ emoji, users: [currentId], count: 1 });
          }
          updateData = { $set: { 'metadata.reactions': trimmed } };
        }
        break;
      }

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
