"""
Fan Pydantic Schemas
Request/Response models for Fan endpoints
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import re

if TYPE_CHECKING:
    from app.schemas.selection import SelectionWithTour


class FanBase(BaseModel):
    """Base Fan schema with common attributes"""
    email: EmailStr = Field(..., description="Fan email address")
    name: str = Field(..., min_length=2, max_length=200, description="Fan full name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")


class FanCreate(FanBase):
    """Schema for fan registration"""
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        """Validate phone number format (basic validation)"""
        if v is not None and v.strip():
            # Remove common formatting characters
            cleaned = re.sub(r'[\s\-\(\)\+]', '', v)
            if not re.match(r'^\d{10,15}$', cleaned):
                raise ValueError('Phone number must contain 10-15 digits')
        return v
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        """Ensure name has at least first and last name"""
        if len(v.strip().split()) < 2:
            raise ValueError('Please provide your full name (first and last name)')
        return v.strip()


class FanUpdate(BaseModel):
    """Schema for updating fan information"""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)


class FanResponse(FanBase):
    """Schema for fan responses"""
    id: int
    registration_code: Optional[str]
    is_verified: bool
    is_active: bool
    registered_at: datetime
    selections_count: int
    has_completed_consent: bool
    can_select_more_tours: bool
    
    class Config:
        from_attributes = True


class FanWithSelections(FanResponse):
    """Fan response with their tour selections included"""
    selections: List['SelectionWithTour'] = []
    
    class Config:
        from_attributes = True


class FanRegistrationResponse(BaseModel):
    """Response after successful fan registration"""
    fan: FanResponse
    message: str = "Registration successful"
    registration_code: str