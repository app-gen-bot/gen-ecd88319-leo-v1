import { Resend } from 'resend';

// Initialize Resend with API key (if available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text } = options;

  // If Resend is not configured, log the email instead
  if (!resend) {
    console.log('Email service not configured. Email details:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', text || html);
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Tenant Rights <noreply@aitenantights.com>',
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export function generateVerificationEmail(name: string, verificationUrl: string): EmailOptions {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Tenant Rights Advisor</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 0.9em;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Tenant Rights Advisor. All rights reserved.</p>
            <p>Powered by PlanetScale</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${name},

Thanks for signing up for AI Tenant Rights Advisor! Please verify your email address by visiting the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
AI Tenant Rights Advisor Team

Powered by PlanetScale
  `;

  return {
    to: name,
    subject: 'Verify your email - AI Tenant Rights Advisor',
    html,
    text,
  };
}

export function generatePasswordResetEmail(name: string, resetUrl: string): EmailOptions {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Tenant Rights Advisor</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 0.9em;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password won't be changed.</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Tenant Rights Advisor. All rights reserved.</p>
            <p>Powered by PlanetScale</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${name},

We received a request to reset your password for your AI Tenant Rights Advisor account.

Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email. Your password won't be changed.

Best regards,
AI Tenant Rights Advisor Team

Powered by PlanetScale
  `;

  return {
    to: name,
    subject: 'Reset your password - AI Tenant Rights Advisor',
    html,
    text,
  };
}