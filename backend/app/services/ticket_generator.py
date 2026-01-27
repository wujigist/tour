"""
Ticket Generator Service
Orchestrates ticket generation including QR codes and PDFs
"""

import os
from datetime import datetime
from typing import Optional, Dict
from sqlalchemy.orm import Session

from app.models.fan import Fan
from app.models.tour import Tour
from app.models.fan_selection import FanSelection
from app.services.qr_service import qr_service
from app.services.pdf_service import pdf_service
from app.utils.validators import generate_ticket_id, sanitize_filename
from app.config import settings


class TicketGenerator:
    """Service for generating complete tickets with QR codes and PDFs"""
    
    def __init__(self):
        """Initialize ticket generator"""
        self.ticket_dir = settings.TICKET_DIR
        self._ensure_ticket_directory()
    
    def _ensure_ticket_directory(self):
        """Ensure ticket directory exists"""
        os.makedirs(self.ticket_dir, exist_ok=True)
    
    def generate_ticket(
        self,
        db: Session,
        fan: Fan,
        tour: Tour,
        selection: FanSelection
    ) -> Dict[str, str]:
        """
        Generate complete ticket with QR code and PDF
        
        Args:
            db: Database session
            fan: Fan object
            tour: Tour object
            selection: FanSelection object
            
        Returns:
            dict: Ticket information including paths and IDs
        """
        # Generate unique ticket ID
        ticket_id = generate_ticket_id(fan.id, tour.id)
        
        # Generate QR code
        qr_code_base64 = qr_service.generate_ticket_qr_code(ticket_id)
        
        # Prepare ticket data for PDF
        ticket_data = self._prepare_ticket_data(fan, tour, ticket_id)
        
        # Generate PDF filename
        pdf_filename = self._generate_pdf_filename(fan, tour, ticket_id)
        pdf_path = os.path.join(self.ticket_dir, pdf_filename)
        
        # Create PDF
        success = pdf_service.create_ticket_pdf(
            filepath=pdf_path,
            ticket_data=ticket_data,
            qr_code_base64=qr_code_base64
        )
        
        if not success:
            raise Exception("Failed to generate ticket PDF")
        
        # Update selection with ticket info
        selection.ticket_id = ticket_id
        selection.ticket_qr_code = qr_code_base64
        selection.ticket_pdf_path = pdf_path
        selection.ticket_generated_at = datetime.utcnow()
        selection.confirm_selection()
        
        # Increment tour tickets claimed
        tour.tickets_claimed += 1
        
        db.commit()
        
        return {
            "ticket_id": ticket_id,
            "qr_code": qr_code_base64,
            "pdf_path": pdf_path,
            "pdf_filename": pdf_filename,
            "generated_at": selection.ticket_generated_at.isoformat()
        }
    
    def generate_tickets_for_fan(
        self,
        db: Session,
        fan: Fan
    ) -> list[Dict[str, str]]:
        """
        Generate tickets for all of a fan's confirmed selections
        
        Args:
            db: Database session
            fan: Fan object
            
        Returns:
            list: List of ticket information dictionaries
        """
        tickets = []
        
        for selection in fan.selections:
            if selection.status.value == "confirmed" or selection.status.value == "pending":
                tour = selection.tour
                
                # Skip if ticket already generated
                if selection.has_ticket:
                    tickets.append({
                        "ticket_id": selection.ticket_id,
                        "pdf_path": selection.ticket_pdf_path,
                        "already_generated": True
                    })
                    continue
                
                # Generate new ticket
                try:
                    ticket_info = self.generate_ticket(db, fan, tour, selection)
                    ticket_info["already_generated"] = False
                    tickets.append(ticket_info)
                except Exception as e:
                    print(f"Error generating ticket for selection {selection.id}: {e}")
                    continue
        
        return tickets
    
    def _prepare_ticket_data(self, fan: Fan, tour: Tour, ticket_id: str) -> Dict[str, str]:
        """
        Prepare ticket data dictionary for PDF generation
        
        Args:
            fan: Fan object
            tour: Tour object
            ticket_id: Unique ticket identifier
            
        Returns:
            dict: Ticket data
        """
        return {
            "ticket_id": ticket_id,
            "fan_name": fan.name,
            "fan_email": fan.email,
            "tour_title": tour.title,
            "artists": tour.artists,
            "date": tour.date.strftime("%A, %B %d, %Y at %I:%M %p"),
            "venue": tour.venue,
            "city": tour.city,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def _generate_pdf_filename(self, fan: Fan, tour: Tour, ticket_id: str) -> str:
        """
        Generate sanitized PDF filename
        
        Args:
            fan: Fan object
            tour: Tour object
            ticket_id: Ticket ID
            
        Returns:
            str: Sanitized filename
        """
        # Create base filename
        fan_name = sanitize_filename(fan.name)
        tour_title = sanitize_filename(tour.title)
        filename = f"VIP_Ticket_{fan_name}_{tour_title}_{ticket_id}.pdf"
        
        return filename
    
    def get_ticket_path(self, ticket_id: str) -> Optional[str]:
        """
        Get the file path for a ticket by its ID
        
        Args:
            ticket_id: Ticket ID
            
        Returns:
            str: File path if exists, None otherwise
        """
        # Search for file in ticket directory
        for filename in os.listdir(self.ticket_dir):
            if ticket_id in filename:
                return os.path.join(self.ticket_dir, filename)
        return None
    
    def verify_ticket(self, ticket_id: str, db: Session) -> Optional[FanSelection]:
        """
        Verify a ticket exists and is valid
        
        Args:
            ticket_id: Ticket ID to verify
            db: Database session
            
        Returns:
            FanSelection: Selection if valid, None otherwise
        """
        selection = db.query(FanSelection).filter(
            FanSelection.ticket_id == ticket_id
        ).first()
        
        return selection
    
    def regenerate_ticket(
        self,
        db: Session,
        selection_id: int
    ) -> Dict[str, str]:
        """
        Regenerate a ticket (e.g., if lost or corrupted)
        
        Args:
            db: Database session
            selection_id: Selection ID
            
        Returns:
            dict: New ticket information
        """
        selection = db.query(FanSelection).filter(
            FanSelection.id == selection_id
        ).first()
        
        if not selection:
            raise ValueError("Selection not found")
        
        fan = selection.fan
        tour = selection.tour
        
        # Delete old PDF if exists
        if selection.ticket_pdf_path and os.path.exists(selection.ticket_pdf_path):
            os.remove(selection.ticket_pdf_path)
        
        # Generate new ticket
        return self.generate_ticket(db, fan, tour, selection)


# Create singleton instance
ticket_generator = TicketGenerator()