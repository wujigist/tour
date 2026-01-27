"""
PDF Service
Handles PDF generation for VIP tickets
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
from io import BytesIO
import os
from typing import Optional


class PDFService:
    """Service for generating PDF tickets"""
    
    def __init__(self):
        """Initialize PDF service"""
        self.page_size = letter
        self.margin = 0.75 * inch
        
        # VIP Color scheme
        self.primary_color = HexColor("#D4AF37")  # Gold
        self.secondary_color = HexColor("#1a1a1a")  # Dark
        self.accent_color = HexColor("#ffffff")  # White
    
    def create_ticket_pdf(
        self,
        filepath: str,
        ticket_data: dict,
        qr_code_base64: Optional[str] = None
    ) -> bool:
        """
        Create a VIP ticket PDF
        
        Args:
            filepath: Path to save PDF
            ticket_data: Dictionary containing ticket information
            qr_code_base64: Base64 encoded QR code image
            
        Returns:
            bool: True if created successfully
        """
        try:
            # Create canvas
            c = canvas.Canvas(filepath, pagesize=self.page_size)
            width, height = self.page_size
            
            # Draw VIP ticket design
            self._draw_ticket_background(c, width, height)
            self._draw_ticket_header(c, width, height)
            self._draw_ticket_info(c, ticket_data, width, height)
            
            if qr_code_base64:
                self._draw_qr_code(c, qr_code_base64, width, height)
            
            self._draw_footer(c, width, height)
            
            # Save PDF
            c.save()
            return True
            
        except Exception as e:
            print(f"Error creating PDF: {e}")
            return False
    
    def _draw_ticket_background(self, c: canvas.Canvas, width: float, height: float):
        """Draw ticket background design"""
        # Gold border
        c.setStrokeColor(self.primary_color)
        c.setLineWidth(3)
        c.rect(self.margin, self.margin, width - 2*self.margin, height - 2*self.margin)
        
        # Inner border
        c.setStrokeColor(self.secondary_color)
        c.setLineWidth(1)
        c.rect(
            self.margin + 0.1*inch, 
            self.margin + 0.1*inch, 
            width - 2*self.margin - 0.2*inch, 
            height - 2*self.margin - 0.2*inch
        )
    
    def _draw_ticket_header(self, c: canvas.Canvas, width: float, height: float):
        """Draw ticket header with VIP branding"""
        # VIP Title
        c.setFillColor(self.primary_color)
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(width / 2, height - 1.5*inch, "VIP TICKET")
        
        # Subtitle
        c.setFillColor(self.secondary_color)
        c.setFont("Helvetica", 14)
        c.drawCentredString(width / 2, height - 1.9*inch, "Exclusive Access Pass")
        
        # Decorative line
        c.setStrokeColor(self.primary_color)
        c.setLineWidth(2)
        c.line(2*inch, height - 2.2*inch, width - 2*inch, height - 2.2*inch)
    
    def _draw_ticket_info(self, c: canvas.Canvas, ticket_data: dict, width: float, height: float):
        """Draw ticket information"""
        y_position = height - 3*inch
        
        # Ticket ID
        c.setFillColor(self.secondary_color)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin + 0.5*inch, y_position, "Ticket ID:")
        c.setFont("Helvetica", 12)
        c.drawString(self.margin + 1.5*inch, y_position, ticket_data.get('ticket_id', 'N/A'))
        
        y_position -= 0.5*inch
        
        # Fan Name
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin + 0.5*inch, y_position, "Name:")
        c.setFont("Helvetica", 12)
        c.drawString(self.margin + 1.5*inch, y_position, ticket_data.get('fan_name', 'N/A'))
        
        y_position -= 0.7*inch
        
        # Tour Details Header
        c.setFillColor(self.primary_color)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(self.margin + 0.5*inch, y_position, "TOUR DETAILS")
        
        y_position -= 0.5*inch
        
        # Tour Title
        c.setFillColor(self.secondary_color)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(self.margin + 0.5*inch, y_position, ticket_data.get('tour_title', 'N/A'))
        
        y_position -= 0.4*inch
        
        # Artists
        c.setFont("Helvetica", 12)
        c.drawString(self.margin + 0.5*inch, y_position, f"Artists: {ticket_data.get('artists', 'N/A')}")
        
        y_position -= 0.4*inch
        
        # Date
        c.drawString(self.margin + 0.5*inch, y_position, f"Date: {ticket_data.get('date', 'N/A')}")
        
        y_position -= 0.4*inch
        
        # Venue
        c.drawString(self.margin + 0.5*inch, y_position, f"Venue: {ticket_data.get('venue', 'N/A')}")
        
        y_position -= 0.4*inch
        
        # City
        c.drawString(self.margin + 0.5*inch, y_position, f"City: {ticket_data.get('city', 'N/A')}")
    
    def _draw_qr_code(self, c: canvas.Canvas, qr_code_base64: str, width: float, height: float):
        """Draw QR code on ticket"""
        try:
            # Remove data URL prefix if present
            if qr_code_base64.startswith('data:image'):
                qr_code_base64 = qr_code_base64.split(',')[1]
            
            import base64
            qr_bytes = base64.b64decode(qr_code_base64)
            qr_buffer = BytesIO(qr_bytes)
            
            # Draw QR code
            qr_size = 2*inch
            x_position = width - self.margin - qr_size - 0.5*inch
            y_position = 2*inch
            
            c.drawImage(ImageReader(qr_buffer), x_position, y_position, qr_size, qr_size)
            
            # QR Code label
            c.setFillColor(self.secondary_color)
            c.setFont("Helvetica", 10)
            c.drawCentredString(x_position + qr_size/2, y_position - 0.3*inch, "Scan for Verification")
            
        except Exception as e:
            print(f"Error adding QR code to PDF: {e}")
    
    def _draw_footer(self, c: canvas.Canvas, width: float, height: float):
        """Draw ticket footer"""
        y_position = self.margin + 0.5*inch
        
        c.setFillColor(self.secondary_color)
        c.setFont("Helvetica", 9)
        c.drawCentredString(width / 2, y_position, "This is your official VIP access pass. Please present this ticket at the venue.")
        
        y_position -= 0.25*inch
        c.setFont("Helvetica", 8)
        c.drawCentredString(width / 2, y_position, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    def create_ticket_pdf_buffer(
        self,
        ticket_data: dict,
        qr_code_base64: Optional[str] = None
    ) -> BytesIO:
        """
        Create ticket PDF in memory buffer
        
        Args:
            ticket_data: Dictionary containing ticket information
            qr_code_base64: Base64 encoded QR code image
            
        Returns:
            BytesIO: PDF buffer
        """
        buffer = BytesIO()
        
        c = canvas.Canvas(buffer, pagesize=self.page_size)
        width, height = self.page_size
        
        self._draw_ticket_background(c, width, height)
        self._draw_ticket_header(c, width, height)
        self._draw_ticket_info(c, ticket_data, width, height)
        
        if qr_code_base64:
            self._draw_qr_code(c, qr_code_base64, width, height)
        
        self._draw_footer(c, width, height)
        
        c.save()
        buffer.seek(0)
        
        return buffer


# Create singleton instance
pdf_service = PDFService()