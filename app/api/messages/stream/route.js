import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";
import Message from "@/models/message";
import Conversation from "@/models/conversation";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const lastMessageId = searchParams.get('lastMessageId');

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    // Verify user is part of the conversation
    await ConnectToDB();
    const conversation = await Conversation.findById(conversationId)
      .select('participants')
      .lean();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const currentUserId = session.user.id;
    if (!conversation.participants.includes(currentUserId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Set up Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection message
          const initialMessage = `data: ${JSON.stringify({
            type: 'connected',
            message: 'Real-time connection established',
            timestamp: new Date().toISOString()
          })}\n\n`;
          
          controller.enqueue(encoder.encode(initialMessage));

          // Set up polling for new messages
          const pollInterval = setInterval(async () => {
            try {
              const query = { conversation: conversationId };
              if (lastMessageId) {
                query._id = { $gt: lastMessageId };
              }

              const newMessages = await Message.find(query)
                .populate('sender', 'username name email profilePic')
                .sort({ createdAt: 1 })
                .lean();

              if (newMessages.length > 0) {
                for (const message of newMessages) {
                  const messageData = `data: ${JSON.stringify({
                    type: 'new_message',
                    message: message,
                    timestamp: new Date().toISOString()
                  })}\n\n`;
                  
                  controller.enqueue(encoder.encode(messageData));
                }
              }

              // Send heartbeat to keep connection alive
              const heartbeat = `data: ${JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
              })}\n\n`;
              
              controller.enqueue(encoder.encode(heartbeat));

            } catch (error) {
              console.error('Error polling messages:', error);
              const errorMessage = `data: ${JSON.stringify({
                type: 'error',
                error: 'Failed to fetch messages',
                timestamp: new Date().toISOString()
              })}\n\n`;
              
              controller.enqueue(encoder.encode(errorMessage));
            }
          }, 2000); // Poll every 2 seconds

          // Clean up on close
          request.signal.addEventListener('abort', () => {
            clearInterval(pollInterval);
            controller.close();
          });

        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage = `data: ${JSON.stringify({
            type: 'error',
            error: 'Stream initialization failed',
            timestamp: new Date().toISOString()
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error("Error in message stream:", error);
    return NextResponse.json(
      { error: "Failed to establish stream" },
      { status: 500 }
    );
  }
}
