"""
Consent Pydantic Schemas
Request/Response models for Consent endpoints
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, date
from typing import Optional


class ConsentBase(BaseModel):
    """Base Consent schema with common attributes"""
    agreed_to_terms: bool = Field(..., description="Agreed to terms and conditions")
    agreed_to_privacy: bool = Field(..., description="Agreed to privacy policy")
    agreed_to_marketing: bool = Field(default=False, description="Agreed to marketing communications (optional)")
    age_verified: bool = Field(..., description="Confirmed 18+ years old")
    confirmed_name: str = Field(..., min_length=2, max_length=200, description="Confirmed full name")
    confirmed_email: EmailStr = Field(..., description="Confirmed email address")
    confirmed_phone: Optional[str] = Field(None, max_length=20, description="Confirmed phone number")


class ConsentCreate(ConsentBase):
    """Schema for creating/submitting a consent form"""
    fan_id: int = Field(..., description="Fan ID")
    date_of_birth: Optional[date] = Field(None, description="Date of birth (optional)")
    signature_name: Optional[str] = Field(None, max_length=200, description="Typed signature name")
    signature_data: Optional[str] = Field(None, description="Base64 encoded signature image")
    
    @field_validator('agreed_to_terms')
    @classmethod
    def terms_must_be_agreed(cls, v):
        """Ensure terms are agreed to"""
        if not v:
            raise ValueError('You must agree to the terms and conditions')
        return v
    
    @field_validator('agreed_to_privacy')
    @classmethod
    def privacy_must_be_agreed(cls, v):
        """Ensure privacy policy is agreed to"""
        if not v:
            raise ValueError('You must agree to the privacy policy')
        return v
    
    @field_validator('age_verified')
    @classmethod
    def age_must_be_verified(cls, v):
        """Ensure age is verified"""
        if not v:
            raise ValueError('You must be 18 years or older')
        return v
    
    @field_validator('date_of_birth')
    @classmethod
    def validate_age(cls, v):
        """Validate that user is 18+ if DOB is provided"""
        if v:
            today = date.today()
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 18:
                raise ValueError('You must be at least 18 years old')
        return v


class ConsentUpdate(BaseModel):
    """Schema for updating consent (partial updates allowed)"""
    agreed_to_marketing: Optional[bool] = None
    confirmed_phone: Optional[str] = Field(None, max_length=20)
    signature_name: Optional[str] = Field(None, max_length=200)
    signature_data: Optional[str] = None


class ConsentResponse(ConsentBase):
    """Schema for consent responses"""
    id: int
    fan_id: int
    photo_id_uploaded: bool
    agreed: bool
    ticket_unlocked: bool
    is_complete: bool
    signed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConsentWithPhotoUpload(ConsentCreate):
    """Schema for consent with photo ID upload"""
    # In practice, photo upload would be handled separately via multipart/form-data
    # This schema is for reference
    pass


class ConsentSubmitResponse(BaseModel):
    """Response after consent submission"""
    consent: ConsentResponse
    message: str = "Consent submitted successfully"
    tickets_unlocked: bool