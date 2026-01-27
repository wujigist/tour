"""
Tour Model
Represents concert tours available for VIP selection
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Tour(Base):
    """
    Tour table - stores information about available concert tours
    """
    __tablename__ = "tours"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Tour Details
    title = Column(String(200), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    city = Column(String(100), nullable=False)
    venue = Column(String(200), nullable=False)
    
    # Artists (comma-separated or JSON string)
    artists = Column(Text, nullable=False)  # e.g., "Artist1, Artist2, Artist3"
    
    # Ticket Management
    ticket_limit = Column(Integer, default=100)  # Max VIP tickets available
    tickets_claimed = Column(Integer, default=0)  # Number of tickets claimed
    
    # Status
    is_active = Column(Boolean, default=True)  # Can fans still select this tour?
    
    # Additional Info
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    fan_selections = relationship("FanSelection", back_populates="tour", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Tour(id={self.id}, title='{self.title}', city='{self.city}', date={self.date})>"
    
    @property
    def is_available(self) -> bool:
        """Check if tour still has tickets available"""
        return self.is_active and self.tickets_claimed < self.ticket_limit
    
    @property
    def tickets_remaining(self) -> int:
        """Calculate remaining tickets"""
        return max(0, self.ticket_limit - self.tickets_claimed)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "title": self.title,
            "date": self.date.isoformat() if self.date else None,
            "city": self.city,
            "venue": self.venue,
            "artists": self.artists,
            "ticket_limit": self.ticket_limit,
            "tickets_claimed": self.tickets_claimed,
            "tickets_remaining": self.tickets_remaining,
            "is_active": self.is_active,
            "is_available": self.is_available,
            "description": self.description,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }