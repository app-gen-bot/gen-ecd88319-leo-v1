import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use Better Auth's forgot password functionality
    await auth.api.forgetPassword({
      body: { 
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
      },
      asResponse: false,
    });

    return NextResponse.json({
      message: 'Password reset email sent',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reset email' },
      { status: 500 }
    );
  }
}