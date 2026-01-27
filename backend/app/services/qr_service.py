"""
QR Code Service
Handles QR code generation for tickets
"""

import qrcode
from qrcode.image.pil import PilImage
from io import BytesIO
import base64
from typing import Optional


class QRCodeService:
    """Service for generating QR codes for tickets"""
    
    def __init__(self):
        """Initialize QR code service"""
        self.box_size = 10
        self.border = 4
        self.fill_color = "black"
        self.back_color = "white"
    
    def generate_qr_code(
        self, 
        data: str, 
        size: int = 10,
        border: int = 4
    ) -> PilImage:
        """
        Generate a QR code image
        
        Args:
            data: Data to encode in QR code (e.g., ticket ID)
            size: Size of each box in pixels
            border: Border size in boxes
            
        Returns:
            PilImage: QR code image
        """
        qr = qrcode.QRCode(
            version=1,  # Auto-adjust version based on data
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
            box_size=size,
            border=border,
        )
        
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color=self.fill_color, back_color=self.back_color)
        return img
    
    def generate_qr_code_base64(
        self, 
        data: str, 
        size: int = 10,
        border: int = 4
    ) -> str:
        """
        Generate a QR code and return as base64 string
        
        Args:
            data: Data to encode in QR code
            size: Size of each box in pixels
            border: Border size in boxes
            
        Returns:
            str: Base64 encoded QR code image
        """
        img = self.generate_qr_code(data, size, border)
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
    
    def save_qr_code(
        self, 
        data: str, 
        filepath: str,
        size: int = 10,
        border: int = 4
    ) -> bool:
        """
        Generate and save QR code to file
        
        Args:
            data: Data to encode in QR code
            filepath: Path to save the QR code image
            size: Size of each box in pixels
            border: Border size in boxes
            
        Returns:
            bool: True if saved successfully
        """
        try:
            img = self.generate_qr_code(data, size, border)
            img.save(filepath)
            return True
        except Exception as e:
            print(f"Error saving QR code: {e}")
            return False
    
    def generate_ticket_qr_code(self, ticket_id: str) -> str:
        """
        Generate QR code specifically for ticket verification
        
        Args:
            ticket_id: Unique ticket identifier
            
        Returns:
            str: Base64 encoded QR code
        """
        # You can encode additional data in JSON format if needed
        # For now, just encode the ticket ID
        return self.generate_qr_code_base64(ticket_id)
    
    def generate_verification_qr_code(self, ticket_id: str, fan_id: int) -> str:
        """
        Generate QR code with verification data
        
        Args:
            ticket_id: Unique ticket identifier
            fan_id: Fan ID for additional verification
            
        Returns:
            str: Base64 encoded QR code
        """
        # Create verification string
        verification_data = f"{ticket_id}|{fan_id}"
        return self.generate_qr_code_base64(verification_data)


# Create singleton instance
qr_service = QRCodeService()