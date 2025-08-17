import { NextResponse } from "next/server";
import { setAuth, setToken } from '@/app/redux/authSlice';
import { store } from '@/app/redux/store';


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

    const data = await res.json();
    store.dispatch(setAuth(data));
    
    // console.log("Token data received:", data);
    
    // if (data.token) {
    //   // console.log("Setting token in cookies:", data.token);
      
    //   // Set token as cookie in response
    //   const response = NextResponse.next();
      
    //   // Set the actual JWT token string
    //   response.cookies.set('auth-token', data.token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'lax',
    //     maxAge: 60 * 60 * 24 * 7 // 7 days
    //   });
      
    //   // Also set a non-httpOnly cookie for client-side access
    //   response.cookies.set('client-token', data.token, {
    //     httpOnly: false,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'lax',
    //     maxAge: 60 * 60 * 24 * 7 // 7 days
    //   });
      
    //   return response;
    // }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/chat/:path*"],
};
