import { NextResponse } from "next/server";

import Conversation from "@/models/conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";


export async function GET(request, { params }) {
  try {
    await ConnectToDB();

    // Getting the session from the server and then using the email
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id || session.user.sub;

    const { id } = await params;
    console.log("conversation id recieved from params:", id);
    console.log("current user ID:", currentUserId);

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if user is part of the conversation
    if (!conversation.participants.some(p => p._id.toString() === currentUserId)) {
      return NextResponse.json({ error: `Access denied for this user: ${currentUserId} which is not a part of participants: ${conversation.participants}` }, { status: 403 });
    }

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
