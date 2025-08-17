import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request) {
  try {
    // console.log("Cookies received:", request.cookies.getAll());
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      console.log("did not get any token [/api/auth/get-token]");
      return NextResponse.json(
        { message: "Didn't get the token" },
        { status: 401 }
      );
    }
    
    // console.log("got the token [/api/auth/get-token]", token);
    
    // TODO:Extract the actual JWT token string from the request cookies
    // const jwtToken = request.cookies.get('next-auth.session-token')?.value || 
    //                  request.cookies.get('__Secure-next-auth.session-token')?.value ||
    //                  request.cookies.get('next-auth.session-token')?.value;
    
    // if (!jwtToken) {
    //   console.log("No JWT token found in cookies [/api/auth/get-token]");
    //   return NextResponse.json(
    //     { message: "No JWT token found" },
    //     { status: 401 }
    //   );
    // }
    
    return NextResponse.json(
      { 
        message: "Token received successfully!", 
        user: token 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in api/auth/get-token", error);
    console.error(error.stack);
    return NextResponse.json(
      { error: "Internal Server error api/auth/get-token" },
      { status: 500 }
    );
  }
}
