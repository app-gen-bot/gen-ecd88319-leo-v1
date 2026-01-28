import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Use Better Auth's verify email functionality
    await auth.api.verifyEmail({
      query: { token },
      asResponse: false,
    });

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}