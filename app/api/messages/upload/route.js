import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";
import Message from "@/models/message";
import Conversation from "@/models/conversation";

export async function POST(request) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const formData = await request.formData();
    
    const conversationId = formData.get('conversationId');
    const messageType = formData.get('messageType') || 'file';
    const caption = formData.get('caption') || '';
    const file = formData.get('file');

    if (!conversationId || !file) {
      return NextResponse.json(
        { error: "Conversation ID and file are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large (max 10MB)" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = {
      'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'video': ['video/mp4', 'video/webm', 'video/ogg'],
      'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      'file': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    };

    const fileType = file.type;
    const isValidType = Object.values(allowedTypes).flat().includes(fileType);
    
    if (!isValidType) {
      return NextResponse.json(
        { error: "File type not supported" },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
      .select('participants type')
      .lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (!conversation.participants.includes(currentUserId)) {
      return NextResponse.json(
        { error: "User is not part of this conversation" },
        { status: 403 }
      );
    }

    // In a production app, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll simulate file upload and store metadata
    const fileName = file.name;
    const fileSize = file.size;
    const mimeType = file.type;
    
    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Simulate file URL (replace with actual cloud storage URL)
    const fileUrl = `/uploads/${uniqueFileName}`;
    
    // Determine message type based on file type
    let finalMessageType = messageType;
    if (messageType === 'file') {
      if (allowedTypes.image.includes(mimeType)) finalMessageType = 'image';
      else if (allowedTypes.video.includes(mimeType)) finalMessageType = 'video';
      else if (allowedTypes.audio.includes(mimeType)) finalMessageType = 'audio';
    }

    // Create the message with file attachment
    const message = new Message({
      conversation: conversationId,
      sender: currentUserId,
      content: caption || `Sent a ${finalMessageType}`,
      messageType: finalMessageType,
      attachments: [{
        type: finalMessageType,
        url: fileUrl,
        filename: fileName,
        size: fileSize,
        mimeType: mimeType
      }],
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
      message: "File uploaded successfully",
      data: {
        messageId: message._id,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        messageType: finalMessageType
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
