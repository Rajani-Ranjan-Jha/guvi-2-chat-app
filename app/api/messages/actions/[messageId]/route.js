import { NextResponse } from "next/server";
import Message from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";

export async function PATCH(request, { params }) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    const { action, userId } = await request.json();
    const currentUserId = session.user.id;

    if (!messageId || !action) {
      return NextResponse.json(
        { error: "Message ID and action are required" },
        { status: 400 }
      );
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await message.populate('conversation');
    if (!conversation.conversation.participants.includes(currentUserId)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    let updateData = {};

    switch (action) {
      case 'mark-read':
        if (!userId) {
          return NextResponse.json(
            { error: "User ID is required for mark-read action" },
            { status: 400 }
          );
        }
        
        // Add user to readBy array if not already there
        if (!message.readBy || !message.readBy.includes(userId)) {
          updateData = {
            $addToSet: { readBy: userId },
            'metadata.isRead': true,
            'metadata.readAt': new Date()
          };
        }
        break;

      case 'mark-delivered':
        updateData = {
          'metadata.isDelivered': true,
          'metadata.deliveredAt': new Date()
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (Object.keys(updateData).length > 0) {
      await Message.findByIdAndUpdate(messageId, updateData);
    }

    return NextResponse.json({
      message: "Action completed successfully",
      data: { messageId, action }
    }, { status: 200 });

  } catch (error) {
    console.error("Error performing message action:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
