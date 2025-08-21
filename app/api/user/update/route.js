import ConnectToDB from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";

// to update(edit) the profile details
export async function PUT(request) {
  try {
    await ConnectToDB();
    const { id, name,username, bio, email } = await request.json();

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: name,
        username: username,
        bio: bio,
        email: email
      },
      { new: true }
    ).select('-password');;
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/user/update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
