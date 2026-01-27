"""
Fan Model
Represents fans who register for VIP tickets
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Fan(Base):
    """
    Fan table - stores fan registration information
    """
    __tablename__ = "fans"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Registration Details
    registration_code = Column(String(50), unique=True, nullable=True)  # Unique code for fan
    
    # Status
    is_verified = Column(Boolean, default=False)  # Email verification status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    selections = relationship("FanSelection", back_populates="fan", cascade="all, delete-orphan")
    consent = relationship("Consent", back_populates="fan", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Fan(id={self.id}, email='{self.email}', name='{self.name}')>"
    
    @property
    def selections_count(self) -> int:
        """Get number of tour selections"""
        return len(self.selections) if self.selections else 0
    
    @property
    def has_completed_consent(self) -> bool:
        """Check if fan has completed consent form"""
        return self.consent is not None and self.consent.agreed
    
    @property
    def can_select_more_tours(self) -> bool:
        """Check if fan can select more tours (max 5)"""
        from app.config import settings
        return self.selections_count < settings.MAX_TOURS_PER_FAN
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "registration_code": self.registration_code,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "registered_at": self.registered_at.isoformat() if self.registered_at else None,
            "selections_count": self.selections_count,
            "has_completed_consent": self.has_completed_consent,
            "can_select_more_tours": self.can_select_more_tours,
        }