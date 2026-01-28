import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Use Better Auth's reset password functionality
    await auth.api.resetPassword({
      body: { 
        token, 
        newPassword 
      },
      asResponse: false,
    });

    return NextResponse.json({
      message: 'Password reset successful',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}