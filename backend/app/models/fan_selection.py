"""
FanSelection Model
Represents the many-to-many relationship between fans and tours
Tracks which tours each fan has selected
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class SelectionStatus(str, Enum):
    """Status of a fan's tour selection"""
    PENDING = "pending"  # Selected but consent not completed
    CONFIRMED = "confirmed"  # Consent completed, ticket generated
    CANCELLED = "cancelled"  # Selection cancelled
    EXPIRED = "expired"  # Selection expired (if applicable)


class FanSelection(Base):
    """
    FanSelection table - junction table linking fans to their selected tours
    """
    __tablename__ = "fan_selections"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    fan_id = Column(Integer, ForeignKey("fans.id", ondelete="CASCADE"), nullable=False, index=True)
    tour_id = Column(Integer, ForeignKey("tours.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Selection Details
    status = Column(SQLEnum(SelectionStatus), default=SelectionStatus.PENDING, nullable=False)
    
    # Ticket Information (populated after consent)
    ticket_id = Column(String(100), unique=True, nullable=True)  # Unique ticket identifier
    ticket_qr_code = Column(String(500), nullable=True)  # QR code data
    ticket_pdf_path = Column(String(500), nullable=True)  # Path to generated PDF
    ticket_generated_at = Column(DateTime, nullable=True)
    
    # Timestamps
    selected_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    fan = relationship("Fan", back_populates="selections")
    tour = relationship("Tour", back_populates="fan_selections")
    
    def __repr__(self):
        return f"<FanSelection(id={self.id}, fan_id={self.fan_id}, tour_id={self.tour_id}, status='{self.status}')>"
    
    @property
    def has_ticket(self) -> bool:
        """Check if ticket has been generated"""
        return self.ticket_id is not None and self.ticket_pdf_path is not None
    
    @property
    def is_confirmed(self) -> bool:
        """Check if selection is confirmed"""
        return self.status == SelectionStatus.CONFIRMED
    
    def confirm_selection(self):
        """Mark selection as confirmed"""
        self.status = SelectionStatus.CONFIRMED
        self.confirmed_at = datetime.utcnow()
    
    def cancel_selection(self):
        """Cancel this selection"""
        self.status = SelectionStatus.CANCELLED
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "fan_id": self.fan_id,
            "tour_id": self.tour_id,
            "status": self.status.value if isinstance(self.status, SelectionStatus) else self.status,
            "ticket_id": self.ticket_id,
            "has_ticket": self.has_ticket,
            "is_confirmed": self.is_confirmed,
            "selected_at": self.selected_at.isoformat() if self.selected_at else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
            "ticket_generated_at": self.ticket_generated_at.isoformat() if self.ticket_generated_at else None,
        }