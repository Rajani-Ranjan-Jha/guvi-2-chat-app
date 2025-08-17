import ConnectToDB from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";

export async function GET(request, { params }) {
  try {
    await ConnectToDB();
    const { userId } = await params;
    // console.log('USER ID',userId)

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { message: "No users available" },
        { status: 403 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    console.error(error.stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
