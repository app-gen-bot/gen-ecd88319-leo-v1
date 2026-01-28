import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Check demo credentials
    if (email === "demo@example.com" && password === "DemoRocks2025!") {
      // Create a simple session cookie
      cookies().set("auth-session", JSON.stringify({
        user: {
          id: "demo_user_123",
          email: "demo@example.com",
          name: "Demo User",
        },
        sessionId: `session_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 60, // 30 minutes
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: "demo_user_123",
          email: "demo@example.com",
          name: "Demo User",
        }
      });
    }
    
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}