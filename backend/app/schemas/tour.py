"""
Tour Pydantic Schemas
Request/Response models for Tour endpoints
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from typing import Optional, List


class TourBase(BaseModel):
    """Base Tour schema with common attributes"""
    title: str = Field(..., min_length=1, max_length=200, description="Tour title")
    date: datetime = Field(..., description="Tour date and time")
    city: str = Field(..., min_length=1, max_length=100, description="City name")
    venue: str = Field(..., min_length=1, max_length=200, description="Venue name")
    artists: str = Field(..., min_length=1, description="Artists performing (comma-separated)")
    ticket_limit: int = Field(default=100, ge=1, description="Maximum VIP tickets available")
    description: Optional[str] = Field(None, description="Tour description")
    image_url: Optional[str] = Field(None, max_length=500, description="Image URL")


class TourCreate(TourBase):
    """Schema for creating a new tour"""
    is_active: bool = Field(default=True, description="Is tour active for selection?")
    
    @field_validator('date')
    @classmethod
    def date_must_be_future(cls, v):
        """Ensure tour date is in the future"""
        # Handle both timezone-aware and timezone-naive datetimes
        if v.tzinfo is not None:
            now = datetime.now(timezone.utc)
        else:
            now = datetime.now()
        
        if v < now:
            raise ValueError('Tour date must be in the future')
        return v


class TourUpdate(BaseModel):
    """Schema for updating a tour (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    date: Optional[datetime] = None
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    venue: Optional[str] = Field(None, min_length=1, max_length=200)
    artists: Optional[str] = Field(None, min_length=1)
    ticket_limit: Optional[int] = Field(None, ge=1)
    tickets_claimed: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)


class TourResponse(TourBase):
    """Schema for tour responses"""
    id: int
    tickets_claimed: int
    tickets_remaining: int
    is_active: bool
    is_available: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Allows creating from ORM models


class TourListResponse(BaseModel):
    """Schema for list of tours"""
    tours: List[TourResponse]
    total: int
    active_only: bool = False


class TourSummary(BaseModel):
    """Minimal tour information for selection displays"""
    id: int
    title: str
    date: datetime
    city: str
    venue: str
    artists: str
    is_available: bool
    tickets_remaining: int
    
    class Config:
        from_attributes = True