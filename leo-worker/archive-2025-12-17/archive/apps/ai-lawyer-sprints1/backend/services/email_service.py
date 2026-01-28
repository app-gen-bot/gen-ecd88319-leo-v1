"""Email service for sending transactional emails"""
import os
import logging
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP or AWS SES"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@aitenantlegal.com')
        self.from_name = os.getenv('FROM_NAME', 'AI Tenant Rights Advisor')
        self.app_url = os.getenv('APP_URL', 'http://localhost:3000')
        
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using configured SMTP settings"""
        if not self.smtp_user or not self.smtp_password:
            logger.warning("Email not configured - skipping email send")
            # In development, just log the email content
            logger.info(f"Would send email to {to_email}:")
            logger.info(f"Subject: {subject}")
            logger.info(f"Content: {text_content or 'HTML content'}")
            return True
            
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = formataddr((self.from_name, self.from_email))
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_email(self, to_email: str, token: str, name: str) -> bool:
        """Send email verification email"""
        verify_url = f"{self.app_url}/verify-email?token={token}"
        
        subject = "Verify your email - AI Tenant Rights Advisor"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #2563eb;">Welcome to AI Tenant Rights Advisor!</h1>
                    <p>Hi {name},</p>
                    <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verify_url}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p>Or copy and paste this link:</p>
                    <p style="word-break: break-all; color: #2563eb;">{verify_url}</p>
                    <p>This link will expire in 24 hours.</p>
                    <hr style="border: 1px solid #eee; margin: 40px 0;">
                    <p style="font-size: 12px; color: #666;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Welcome to AI Tenant Rights Advisor!
        
        Hi {name},
        
        Thanks for signing up! Please verify your email address by visiting:
        
        {verify_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_password_reset_email(self, to_email: str, token: str, name: str) -> bool:
        """Send password reset email"""
        reset_url = f"{self.app_url}/reset-password?token={token}"
        
        subject = "Reset your password - AI Tenant Rights Advisor"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #2563eb;">Password Reset Request</h1>
                    <p>Hi {name},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link:</p>
                    <p style="word-break: break-all; color: #2563eb;">{reset_url}</p>
                    <p>This link will expire in 1 hour.</p>
                    <p><strong>Important:</strong> If you didn't request this password reset, 
                       please ignore this email. Your password won't be changed.</p>
                    <hr style="border: 1px solid #eee; margin: 40px 0;">
                    <p style="font-size: 12px; color: #666;">
                        For security reasons, this link will expire in 1 hour. 
                        If you need to reset your password again, please visit the login page.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hi {name},
        
        We received a request to reset your password. Visit the link below to create a new password:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        Important: If you didn't request this password reset, please ignore this email. 
        Your password won't be changed.
        
        For security reasons, this link will expire in 1 hour. 
        If you need to reset your password again, please visit the login page.
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_mfa_code_email(self, to_email: str, code: str, name: str) -> bool:
        """Send MFA verification code via email"""
        subject = "Your verification code - AI Tenant Rights Advisor"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #2563eb;">Verification Code</h1>
                    <p>Hi {name},</p>
                    <p>Your verification code is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                                     color: #2563eb; background: #f3f4f6; padding: 20px 40px; 
                                     border-radius: 8px; display: inline-block;">
                            {code}
                        </span>
                    </div>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style="border: 1px solid #eee; margin: 40px 0;">
                    <p style="font-size: 12px; color: #666;">
                        For your security, never share this code with anyone.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Verification Code
        
        Hi {name},
        
        Your verification code is: {code}
        
        This code will expire in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        
        For your security, never share this code with anyone.
        """
        
        return self.send_email(to_email, subject, html_content, text_content)


# Create singleton instance
email_service = EmailService()