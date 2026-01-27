"""
Selection Pydantic Schemas
Request/Response models for FanSelection endpoints
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from app.schemas.tour import TourSummary
    from app.schemas.fan import FanResponse


class SelectionStatusEnum(str, Enum):
    """Status options for fan selections"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SelectionBase(BaseModel):
    """Base Selection schema"""
    fan_id: int = Field(..., description="Fan ID")
    tour_id: int = Field(..., description="Tour ID")


class SelectionCreate(BaseModel):
    """Schema for creating a new selection"""
    tour_id: int = Field(..., description="Tour ID to select")


class SelectionBulkCreate(BaseModel):
    """Schema for creating multiple selections at once (max 5)"""
    tour_ids: List[int] = Field(..., min_items=1, max_items=5, description="List of tour IDs (max 5)")


class SelectionStatusUpdate(BaseModel):
    """Schema for updating selection status"""
    status: SelectionStatusEnum = Field(..., description="New status")


class SelectionResponse(BaseModel):
    """Schema for selection responses"""
    id: int
    fan_id: int
    tour_id: int
    status: SelectionStatusEnum
    ticket_id: Optional[str]
    has_ticket: bool
    is_confirmed: bool
    selected_at: datetime
    confirmed_at: Optional[datetime]
    ticket_generated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class SelectionWithTour(SelectionResponse):
    """Selection response with tour details included"""
    tour: 'TourSummary'
    
    class Config:
        from_attributes = True


class SelectionWithFan(SelectionResponse):
    """Selection response with fan details included"""
    fan: 'FanResponse'
    
    class Config:
        from_attributes = True


class SelectionListResponse(BaseModel):
    """Schema for list of selections"""
    selections: List[SelectionResponse]
    total: int


class TicketResponse(BaseModel):
    """Schema for ticket information"""
    ticket_id: str
    fan_name: str
    tour_title: str
    tour_date: datetime
    tour_city: str
    tour_venue: str
    qr_code: Optional[str]
    pdf_path: Optional[str]
    generated_at: datetime