import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/utils/connect";
import User from "@/models/user";

// Update user status (online, away, busy, etc.)
export async function POST(request) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { status, customStatus, isTyping, conversationId } = await request.json();

    // Validate status
    const validStatuses = ['online', 'away', 'busy', 'offline'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
      updateData.lastSeen = status === 'offline' ? new Date() : undefined;
    }

    if (customStatus !== undefined) {
      updateData.customStatus = customStatus;
    }

    // Update user status
    await User.findByIdAndUpdate(currentUserId, updateData);

    // If typing status is provided, store it temporarily
    if (isTyping !== undefined && conversationId) {
      // In a real-time app, you'd use Redis or similar for typing indicators
      // For now, we'll store it in the user document temporarily
      await User.findByIdAndUpdate(currentUserId, {
        $set: {
          [`typingStatus.${conversationId}`]: {
            isTyping,
            timestamp: new Date()
          }
        }
      });
    }

    return NextResponse.json({
      message: "Status updated successfully",
      status: status || 'online',
      customStatus,
      isTyping,
      timestamp: new Date()
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

// Get user status
export async function GET(request) {
  try {
    await ConnectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIds = searchParams.get('userIds');

    if (!userIds) {
      return NextResponse.json({ error: "User IDs required" }, { status: 400 });
    }

    const userIdArray = userIds.split(',').filter(id => id.trim());

    if (userIdArray.length === 0) {
      return NextResponse.json({ error: "Valid user IDs required" }, { status: 400 });
    }

    // Get status for multiple users
    const users = await User.find({
      _id: { $in: userIdArray }
    })
    .select('username name email profilePic status customStatus lastSeen typingStatus')
    .lean();

    const statusData = users.map(user => ({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      status: user.status || 'offline',
      customStatus: user.customStatus,
      lastSeen: user.lastSeen,
      isOnline: user.status === 'online',
      typingStatus: user.typingStatus || {}
    }));

    return NextResponse.json({
      users: statusData
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status" },
      { status: 500 }
    );
  }
}
