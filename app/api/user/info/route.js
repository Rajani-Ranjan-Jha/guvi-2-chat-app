import ConnectToDB from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";

// to get the informations of a user
export async function GET(request) {
  try {
    await ConnectToDB();
    
    // Get user ID from URL search parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/user/info:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
