"""
Consent Model
Represents fan consent forms and agreements
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Consent(Base):
    """
    Consent table - stores fan consent form submissions
    """
    __tablename__ = "consents"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Key
    fan_id = Column(Integer, ForeignKey("fans.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Consent Agreements
    agreed_to_terms = Column(Boolean, default=False, nullable=False)
    agreed_to_privacy = Column(Boolean, default=False, nullable=False)
    agreed_to_marketing = Column(Boolean, default=False)  # Optional marketing consent
    
    # Age Verification
    age_verified = Column(Boolean, default=False, nullable=False)  # Must be 18+
    date_of_birth = Column(DateTime, nullable=True)  # Optional DOB for verification
    
    # Personal Information Confirmation
    confirmed_name = Column(String(200), nullable=False)
    confirmed_email = Column(String(255), nullable=False)
    confirmed_phone = Column(String(20), nullable=True)
    
    # Photo ID Upload (Optional)
    photo_id_path = Column(String(500), nullable=True)  # Path to uploaded ID
    photo_id_uploaded = Column(Boolean, default=False)
    
    # Digital Signature
    signature_data = Column(Text, nullable=True)  # Base64 encoded signature image
    signature_name = Column(String(200), nullable=True)  # Typed name as signature
    ip_address = Column(String(50), nullable=True)  # IP address of submission
    
    # Overall Status
    agreed = Column(Boolean, default=False, nullable=False)  # All required consents given
    ticket_unlocked = Column(Boolean, default=False)  # Tickets unlocked after consent
    
    # Timestamps
    signed_at = Column(DateTime, nullable=True)  # When consent was fully completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    fan = relationship("Fan", back_populates="consent")
    
    def __repr__(self):
        return f"<Consent(id={self.id}, fan_id={self.fan_id}, agreed={self.agreed}, signed_at={self.signed_at})>"
    
    @property
    def is_complete(self) -> bool:
        """Check if all required consent items are completed"""
        return (
            self.agreed_to_terms and
            self.agreed_to_privacy and
            self.age_verified and
            self.agreed
        )
    
    @property
    def can_unlock_tickets(self) -> bool:
        """Check if consent is sufficient to unlock tickets"""
        return self.is_complete and not self.ticket_unlocked
    
    def complete_consent(self, ip_address: str = None):
        """
        Mark consent as complete and signed
        
        Args:
            ip_address: IP address of the user submitting consent
        """
        if self.is_complete:
            self.agreed = True
            self.signed_at = datetime.utcnow()
            if ip_address:
                self.ip_address = ip_address
    
    def unlock_tickets(self):
        """Mark tickets as unlocked after consent completion"""
        if self.is_complete:
            self.ticket_unlocked = True
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "fan_id": self.fan_id,
            "agreed_to_terms": self.agreed_to_terms,
            "agreed_to_privacy": self.agreed_to_privacy,
            "agreed_to_marketing": self.agreed_to_marketing,
            "age_verified": self.age_verified,
            "confirmed_name": self.confirmed_name,
            "confirmed_email": self.confirmed_email,
            "confirmed_phone": self.confirmed_phone,
            "photo_id_uploaded": self.photo_id_uploaded,
            "agreed": self.agreed,
            "ticket_unlocked": self.ticket_unlocked,
            "is_complete": self.is_complete,
            "signed_at": self.signed_at.isoformat() if self.signed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }