import { NextResponse } from "next/server";



export async function middleware(request) {
  try {
    console.log("middleware is running...");

    // Use the correct endpoint for token retrieval
    const url = new URL("/api/auth/get-token", request.url);
    const res = await fetch(url.toString(), {
        headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        });


    if (!res.ok) {
      console.log("Unable to get the token from the server. redicet: /login");
      return NextResponse.redirect( new URL('/login', request.url))
      // return NextResponse.next();
    }


    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/chat/:path*"],
};
