"""
Email Service
Handles sending emails for ticket delivery and notifications
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import List, Optional
import os

from app.config import settings


class EmailService:
    """Service for sending emails"""
    
    def __init__(self):
        """Initialize email service with SMTP settings"""
        self.smtp_server = settings.MAIL_SERVER
        self.smtp_port = settings.MAIL_PORT
        self.username = settings.MAIL_USERNAME
        self.password = settings.MAIL_PASSWORD
        self.from_email = settings.MAIL_FROM
        self.from_name = settings.MAIL_FROM_NAME
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """
        Send an email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body_html: HTML email body
            body_text: Plain text email body (optional)
            attachments: List of file paths to attach
            
        Returns:
            bool: True if sent successfully
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text version
            if body_text:
                part1 = MIMEText(body_text, 'plain')
                msg.attach(part1)
            
            # Add HTML version
            part2 = MIMEText(body_html, 'html')
            msg.attach(part2)
            
            # Add attachments
            if attachments:
                for filepath in attachments:
                    if os.path.exists(filepath):
                        with open(filepath, 'rb') as f:
                            attachment = MIMEApplication(f.read(), _subtype="pdf")
                            attachment.add_header(
                                'Content-Disposition',
                                'attachment',
                                filename=os.path.basename(filepath)
                            )
                            msg.attach(attachment)
            
            # Send email
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_server,
                port=self.smtp_port,
                username=self.username,
                password=self.password,
                start_tls=True
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    async def send_registration_email(self, to_email: str, fan_name: str, registration_code: str) -> bool:
        """
        Send registration confirmation email
        
        Args:
            to_email: Fan's email
            fan_name: Fan's name
            registration_code: Registration code
            
        Returns:
            bool: True if sent successfully
        """
        subject = "Welcome to VIP Tickets!"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #D4AF37;">Welcome, {fan_name}!</h1>
                    <p>Thank you for registering for VIP tickets.</p>
                    <p>Your registration code is: <strong style="color: #D4AF37; font-size: 18px;">{registration_code}</strong></p>
                    <p>Next steps:</p>
                    <ol>
                        <li>Select up to 5 tours you'd like to attend</li>
                        <li>Complete the consent form</li>
                        <li>Download your VIP tickets</li>
                    </ol>
                    <p>We're excited to see you at the shows!</p>
                    <hr style="border: 1px solid #D4AF37; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Welcome, {fan_name}!
        
        Thank you for registering for VIP tickets.
        
        Your registration code is: {registration_code}
        
        Next steps:
        1. Select up to 5 tours you'd like to attend
        2. Complete the consent form
        3. Download your VIP tickets
        
        We're excited to see you at the shows!
        """
        
        return await self.send_email(to_email, subject, html_body, text_body)
    
    async def send_ticket_email(
        self,
        to_email: str,
        fan_name: str,
        tour_title: str,
        ticket_pdf_path: str
    ) -> bool:
        """
        Send ticket delivery email with PDF attachment
        
        Args:
            to_email: Fan's email
            fan_name: Fan's name
            tour_title: Tour title
            ticket_pdf_path: Path to ticket PDF
            
        Returns:
            bool: True if sent successfully
        """
        subject = f"Your VIP Ticket for {tour_title}"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #D4AF37;">Your VIP Ticket is Ready!</h1>
                    <p>Hi {fan_name},</p>
                    <p>Congratulations! Your VIP ticket for <strong>{tour_title}</strong> is attached to this email.</p>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>Present this ticket at the venue entrance</li>
                        <li>The QR code will be scanned for verification</li>
                        <li>Arrive early to enjoy your VIP experience</li>
                    </ul>
                    <p>See you at the show!</p>
                    <hr style="border: 1px solid #D4AF37; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Your VIP Ticket is Ready!
        
        Hi {fan_name},
        
        Congratulations! Your VIP ticket for {tour_title} is attached to this email.
        
        Important:
        - Present this ticket at the venue entrance
        - The QR code will be scanned for verification
        - Arrive early to enjoy your VIP experience
        
        See you at the show!
        """
        
        return await self.send_email(
            to_email,
            subject,
            html_body,
            text_body,
            attachments=[ticket_pdf_path]
        )
    
    async def send_all_tickets_email(
        self,
        to_email: str,
        fan_name: str,
        ticket_paths: List[str]
    ) -> bool:
        """
        Send email with all tickets for a fan
        
        Args:
            to_email: Fan's email
            fan_name: Fan's name
            ticket_paths: List of ticket PDF paths
            
        Returns:
            bool: True if sent successfully
        """
        ticket_count = len(ticket_paths)
        subject = f"Your {ticket_count} VIP Ticket{'s' if ticket_count > 1 else ''}"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #D4AF37;">Your VIP Tickets are Ready!</h1>
                    <p>Hi {fan_name},</p>
                    <p>Congratulations! Your {ticket_count} VIP ticket{'s are' if ticket_count > 1 else ' is'} attached to this email.</p>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>Present each ticket at the respective venue entrance</li>
                        <li>The QR code will be scanned for verification</li>
                        <li>Arrive early to enjoy your VIP experience</li>
                    </ul>
                    <p>See you at the shows!</p>
                    <hr style="border: 1px solid #D4AF37; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Your VIP Tickets are Ready!
        
        Hi {fan_name},
        
        Congratulations! Your {ticket_count} VIP ticket{'s are' if ticket_count > 1 else ' is'} attached to this email.
        
        Important:
        - Present each ticket at the respective venue entrance
        - The QR code will be scanned for verification
        - Arrive early to enjoy your VIP experience
        
        See you at the shows!
        """
        
        return await self.send_email(
            to_email,
            subject,
            html_body,
            text_body,
            attachments=ticket_paths
        )
    
    async def send_consent_confirmation_email(self, to_email: str, fan_name: str) -> bool:
        """
        Send consent form confirmation email
        
        Args:
            to_email: Fan's email
            fan_name: Fan's name
            
        Returns:
            bool: True if sent successfully
        """
        subject = "Consent Form Received - Tickets Unlocked!"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #D4AF37;">Consent Form Confirmed!</h1>
                    <p>Hi {fan_name},</p>
                    <p>Thank you for completing the consent form.</p>
                    <p>Your VIP tickets are now unlocked and ready to download!</p>
                    <p>Log in to your account to download your tickets or wait for them to arrive via email.</p>
                    <p>We can't wait to see you at the shows!</p>
                    <hr style="border: 1px solid #D4AF37; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Consent Form Confirmed!
        
        Hi {fan_name},
        
        Thank you for completing the consent form.
        
        Your VIP tickets are now unlocked and ready to download!
        
        Log in to your account to download your tickets or wait for them to arrive via email.
        
        We can't wait to see you at the shows!
        """
        
        return await self.send_email(to_email, subject, html_body, text_body)


# Create singleton instance
email_service = EmailService()