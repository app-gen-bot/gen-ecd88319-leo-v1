import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@aitenantlegal.com';
const FROM_NAME = process.env.FROM_NAME || 'AI Tenant Rights Advisor';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { type, email, name, token } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      );
    }

    let subject = '';
    let html = '';
    let text = '';

    switch (type) {
      case 'verification':
        const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
        subject = 'Verify your email - AI Tenant Rights Advisor';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to AI Tenant Rights Advisor!</h1>
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Or copy and paste this link: ${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `;
        text = `Welcome! Please verify your email by visiting: ${verifyUrl}`;
        break;

      case 'reset-password':
        const resetUrl = `${APP_URL}/reset-password?token=${token}`;
        subject = 'Reset your password - AI Tenant Rights Advisor';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Reset Request</h1>
            <p>Hi ${name || 'there'},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link: ${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `;
        text = `Reset your password by visiting: ${resetUrl}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // In development, just log the email
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('📧 Email would be sent:');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('Content:', text);
      
      // Return success in development
      return NextResponse.json({ success: true, message: 'Email logged (dev mode)' });
    }

    // Send actual email in production
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}