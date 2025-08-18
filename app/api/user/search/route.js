
import ConnectToDB from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/user";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    await ConnectToDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await User.find({}).select('-password');
    // console.log(users)
    if (users && users.length > 0) {
      const filteredUsers = users.filter(
        (user) => user.email != session.user.email
      );
      return NextResponse.json(filteredUsers, { status: 200 });
    }

    return NextResponse.json(
      { message: "No users available" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/search:", error);
    console.error(error.stack);
    return NextResponse.json(
      { error: "Internal Server Error ASHDFHAS" },
      { status: 500 }
    );
  }
}
